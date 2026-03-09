/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix"; 
    ns.print("\x1b[38;5;13m[🛰️] NeonWeaver Orchestrator v0.5.2 en ligne...");

    while (true) {
        let money = ns.getServerMoneyAvailable(target);
        let maxMoney = ns.getServerMaxMoney(target);
        let sec = ns.getServerSecurityLevel(target);
        let minSec = ns.getServerMinSecurityLevel(target);

        let action = "";
        let sleepTime = 1000;

        // Logique Séquentielle (Daemon)
        if (sec > minSec + 2) {
            action = "WEAKEN";
            await runEverywhere(ns, "weaken", target);
            sleepTime = ns.getWeakenTime(target) + 200; // +200ms de marge
        } else if (money < maxMoney * 0.9) {
            action = "GROW";
            await runEverywhere(ns, "grow", target);
            sleepTime = ns.getGrowTime(target) + 200;
        } else {
            action = "HACK";
            await runEverywhere(ns, "hack", target);
            sleepTime = ns.getHackTime(target) + 200;
        }

        // Communication avec le Dashboard
        const state = { target, action, eta: Date.now() + sleepTime };
        ns.write("/state/spooler-state.json", JSON.stringify(state), "w");

        ns.print(`\x1b[38;5;51m[JOB] ${action} sur ${target} déployé.\x1b[0m`);
        ns.print(`\x1b[38;5;240m[⏳] Attente de ${ns.tFormat(sleepTime)} avant le prochain cycle...\x1b[0m`);
        
        await ns.sleep(sleepTime);
    }
}

async function runEverywhere(ns, type, target) {
    const script = `/bin/${type[0]}.js`; 
    if (!ns.fileExists(script, "home")) return;
    const scriptRam = ns.getScriptRam(script, "home");
    if (scriptRam === 0) return; 

    const scanServer = (node = "home", visited = new Set()) => {
        visited.add(node);
        ns.scan(node).forEach(next => { if (!visited.has(next)) scanServer(next, visited); });
        return Array.from(visited);
    };

    const hosts = scanServer().filter(h => ns.hasRootAccess(h));
    for (const host of hosts) {
        let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        if (host === "home") freeRam -= 64; 
        
        let threads = Math.floor(freeRam / scriptRam);
        if (threads > 0) {
            if (host !== "home") await ns.scp(script, host, "home");
            ns.exec(script, host, threads, target, Math.random());
        }
    }
}