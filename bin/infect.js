/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.print("\x1b[38;5;196m[☠️] Lancement d'Infection NeonWeaver v0.4.0 (Auto-Target)...\x1b[0m");

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
    
    // --- INTELLIGENCE DE CIBLAGE ---
    let bestTarget = "n00dles";
    let bestScore = 0;
    const myHackLevel = ns.getHackingLevel();

    for (const s of servers) {
        if (ns.getServerMaxMoney(s) > 0 && ns.getServerRequiredHackingLevel(s) <= myHackLevel && ns.hasRootAccess(s)) {
            // Un ratio basique pour trouver une cible juteuse mais facile à hacker
            const score = ns.getServerMaxMoney(s) / ns.getServerMinSecurityLevel(s);
            if (score > bestScore) {
                bestScore = score;
                bestTarget = s;
            }
        }
    }
    
    ns.print(`\x1b[38;5;208m[🎯] Nouvelle cible optimale verrouillée : ${bestTarget}\x1b[0m`);

    let totalThreads = 0;

    for (const server of servers) {
        // Crack & Nuke
        let portsRequired = ns.getServerNumPortsRequired(server);
        let portsOpened = 0;
        if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(server); portsOpened++; }
        if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(server); portsOpened++; }
        if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(server); portsOpened++; }
        if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(server); portsOpened++; }
        if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(server); portsOpened++; }
        
        if (portsOpened >= portsRequired && !ns.hasRootAccess(server)) {
            ns.nuke(server);
            ns.print(`\x1b[38;5;118m[ROOT] ${server} compromis.\x1b[0m`);
        }

        // Global Kill & Déploiement
        if (ns.hasRootAccess(server)) {
            const isHome = (server === "home");
            
            // On tue tout (sauf les scripts de gestion sur home)
            if (!isHome) {
                ns.killall(server);
                await ns.scp(payload, server, "home");
            } else {
                // Sur Home, on tue seulement les anciens workers
                const runningScripts = ns.ps("home");
                for (const script of runningScripts) {
                    if (script.filename === payload) ns.kill(script.pid);
                }
            }

            const reservedRam = isHome ? 64 : 0; // On garde 64GB sur home pour tes outils
            const availableRam = ns.getServerMaxRam(server) - (isHome ? reservedRam : ns.getServerUsedRam(server));
            const threads = Math.floor(availableRam / ns.getScriptRam(payload));
            
            if (threads > 0) {
                ns.exec(payload, server, threads, bestTarget);
                totalThreads += threads;
            }
        }
    }
    ns.print(`\x1b[38;5;51m[🔥] L'Essaim a été redéployé : ${totalThreads} threads siphonnent ${bestTarget}.\x1b[0m`);
}