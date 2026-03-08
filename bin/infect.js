/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail(); // Correction API
    ns.print("\x1b[38;5;196m[☠️] Lancement du protocole d'Infection NeonWeaver v0.3.1...\x1b[0m");

    const getNetworkNodes = () => {
        const visited = new Set();
        const stack = ["home"];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!visited.has(node)) {
                visited.add(node);
                const neighbors = ns.scan(node);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) stack.push(neighbor);
                }
            }
        }
        return Array.from(visited);
    };

    const servers = getNetworkNodes();
    const payload = "/bin/worker.js";
    const target = "n00dles"; 
    let totalThreads = 0;

    for (const server of servers) {
        // Crack & Nuke
        let portsRequired = ns.getServerNumPortsRequired(server);
        let portsOpened = 0;
        if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(server); portsOpened++; }
        if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(server); portsOpened++; }
        
        if (portsOpened >= portsRequired && !ns.hasRootAccess(server)) {
            ns.nuke(server);
        }

        // Déploiement
        if (ns.hasRootAccess(server)) {
            const isHome = (server === "home");
            const reservedRam = isHome ? 32 : 0; // On garde 32GB sur home pour nos scripts
            const maxRam = ns.getServerMaxRam(server);
            const usedRam = ns.getServerUsedRam(server);
            const availableRam = maxRam - (isHome ? Math.max(usedRam, reservedRam) : usedRam);
            
            const threads = Math.floor(availableRam / ns.getScriptRam(payload));
            
            if (threads > 0) {
                if (!isHome) {
                    await ns.scp(payload, server, "home");
                    ns.killall(server);
                }
                ns.exec(payload, server, threads, target);
                ns.print(`\x1b[38;5;51m[EXEC] ${server} : ${threads} threads sur ${target}`);
                totalThreads += threads;
            }
        }
    }
    ns.print(`\x1b[38;5;220mPuissance totale : ${totalThreads} threads.`);
}