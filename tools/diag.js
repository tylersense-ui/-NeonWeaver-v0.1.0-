/**
 * @module  Network-Diagnostic
 * @author  BitCodeBurnerGamer
 * @version 1.0.0
 * @desc    Cartographie le réseau et isole les serveurs non utilisés.
 */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.clearLog();

    ns.print("\x1b[38;5;51m╔════════════════════════════════════════════╗");
    ns.print("║     \x1b[38;5;220m🔍 NETWORK DIAGNOSTIC TOOL v1.0\x1b[38;5;51m        ║");
    ns.print("╚════════════════════════════════════════════╝\x1b[0m\n");

    const servers = new Set(["home"]);
    const stack = ["home"];
    
    // Scan complet
    while (stack.length > 0) {
        const current = stack.pop();
        for (const next of ns.scan(current)) {
            if (!servers.has(next)) {
                servers.add(next);
                stack.push(next);
            }
        }
    }

    let total = servers.size;
    let withRam = 0;
    let rooted = 0;
    let noRoot = [];
    let noFreeRam = [];

    for (const host of servers) {
        const maxRam = ns.getServerMaxRam(host);
        const hasRoot = ns.hasRootAccess(host);
        const usedRam = ns.getServerUsedRam(host);
        const freeRam = maxRam - usedRam;

        if (maxRam > 0) {
            withRam++;
            if (hasRoot) {
                rooted++;
                // Check pourquoi l'orchestrateur les ignore (Free RAM < 2GB)
                if (freeRam < 2 && host !== "home") {
                    noFreeRam.push(`${host} (Max: ${maxRam}GB | Utilisé: ${usedRam.toFixed(1)}GB)`);
                }
            } else {
                noRoot.push(`${host} (Ports requis: ${ns.getServerNumPortsRequired(host)})`);
            }
        }
    }

    ns.print(`\x1b[38;5;255m📊 STATISTIQUES GLOBALES :\x1b[0m`);
    ns.print(`Total serveurs dans le jeu : ${total}`);
    ns.print(`Serveurs avec RAM (>0)     : \x1b[38;5;118m${withRam}\x1b[0m`);
    ns.print(`Serveurs Rootés (sur ${withRam})   : \x1b[38;5;43m${rooted}\x1b[0m\n`);

    if (noRoot.length > 0) {
        ns.print(`\x1b[38;5;196m🔒 SERVEURS NON ROOTÉS (${noRoot.length}) :\x1b[0m`);
        noRoot.forEach(s => ns.print(`  - ${s}`));
    }

    if (noFreeRam.length > 0) {
        ns.print(`\n\x1b[38;5;208m⚠️ SERVEURS SATURÉS / IGNORÉS (${noFreeRam.length}) :\x1b[0m`);
        ns.print(`(Ils ont de la RAM, mais moins de 2Go de libre)`);
        noFreeRam.forEach(s => ns.print(`  - ${s}`));
    }
}