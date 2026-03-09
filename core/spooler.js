/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix"; 
    
    ns.print("\x1b[38;5;13m[🛰️] NeonWeaver Orchestrator v0.5.1 (Hotfix) en ligne...");

    while (true) {
        let money = ns.getServerMoneyAvailable(target);
        let maxMoney = ns.getServerMaxMoney(target);
        let sec = ns.getServerSecurityLevel(target);
        let minSec = ns.getServerMinSecurityLevel(target);

        if (sec > minSec + 2) {
            await runEverywhere(ns, "weaken", target);
        } else if (money < maxMoney * 0.9) {
            await runEverywhere(ns, "grow", target);
        } else {
            await runEverywhere(ns, "hack", target);
        }
        await ns.sleep(1000); // Pause courte entre chaque évaluation
    }
}

async function runEverywhere(ns, type, target) {
    const script = `/bin/${type[0]}.js`; 
    
    // SÉCURITÉ : On vérifie que le script existe sur home avant de faire quoi que ce soit
    if (!ns.fileExists(script, "home")) {
        ns.print(`\x1b[38;5;196m[ERREUR] Script manquant : ${script}\x1b[0m`);
        return;
    }

    const scriptRam = ns.getScriptRam(script, "home");
    if (scriptRam === 0) return; // Anti-Infinity crash !

    const scanServer = (node = "home", visited = new Set()) => {
        visited.add(node);
        ns.scan(node).forEach(next => { if (!visited.has(next)) scanServer(next, visited); });
        return Array.from(visited);
    };

    const hosts = scanServer().filter(h => ns.hasRootAccess(h));
    
    for (const host of hosts) {
        let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        if (host === "home") freeRam -= 64; // On garde 64GB pour tes autres scripts
        
        let threads = Math.floor(freeRam / scriptRam);
        
        if (threads > 0) {
            // On s'assure que le fichier est bien copié sur le serveur distant
            if (host !== "home") {
                await ns.scp(script, host, "home");
            }
            // args[1] = Math.random() permet de lancer plusieurs instances distinctes
            ns.exec(script, host, threads, target, Math.random());
        }
    }
}