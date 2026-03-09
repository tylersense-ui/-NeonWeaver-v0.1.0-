/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix"; // On reste sur ta cible actuelle pour l'instant
    const HWGW_SCRIPTS = {
        hack: "/bin/h.js",
        grow: "/bin/g.js",
        weaken: "/bin/w.js"
    };

    ns.print("\x1b[38;5;13m[🛰️] NeonWeaver Orchestrator v0.5.0 en ligne...");

    while (true) {
        let money = ns.getServerMoneyAvailable(target);
        let maxMoney = ns.getServerMaxMoney(target);
        let sec = ns.getServerSecurityLevel(target);
        let minSec = ns.getServerMinSecurityLevel(target);

        // Analyse simplifiée pour le Batching
        if (sec > minSec + 2) {
            // Besoin de Weaken
            await runEverywhere(ns, "weaken", target);
        } else if (money < maxMoney * 0.9) {
            // Besoin de Grow
            await runEverywhere(ns, "grow", target);
        } else {
            // Frappe chirurgicale (Hack)
            await runEverywhere(ns, "hack", target);
        }
        await ns.sleep(1000);
    }
}

async function runEverywhere(ns, type, target) {
    const script = `/bin/${type[0]}.js`; // /bin/h.js, /bin/g.js, etc.
    const scanServer = (node = "home", visited = new Set()) => {
        visited.add(node);
        ns.scan(node).forEach(next => { if (!visited.has(next)) scanServer(next, visited); });
        return Array.from(visited);
    };

    const hosts = scanServer().filter(h => ns.hasRootAccess(h));
    for (const host of hosts) {
        let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        if (host === "home") freeRam -= 64; // Réserve
        
        let threads = Math.floor(freeRam / ns.getScriptRam(script));
        if (threads > 0) {
            await ns.scp(script, host, "home");
            ns.exec(script, host, threads, target, Math.random());
        }
    }
}