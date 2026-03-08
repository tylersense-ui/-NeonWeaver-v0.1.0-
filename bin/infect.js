/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    ns.print("\x1b[38;5;196m[☠️] Lancement du protocole d'Infection NeonWeaver...\x1b[0m");

    // Scanner récursif pour trouver tous les serveurs du jeu
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
    const target = "n00dles"; // Cible universelle pour commencer à faire du cash
    let rootedCount = 0;
    let totalThreads = 0;

    for (const server of servers) {
        if (server === "home") continue; // On ne veut pas s'auto-nuke ni saturer notre RAM pour l'instant

        let portsRequired = ns.getServerNumPortsRequired(server);
        let portsOpened = 0;

        // Exploits
        if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(server); portsOpened++; }
        if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(server); portsOpened++; }
        if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(server); portsOpened++; }
        if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(server); portsOpened++; }
        if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(server); portsOpened++; }

        // Root
        if (portsOpened >= portsRequired && !ns.hasRootAccess(server)) {
            ns.nuke(server);
            ns.print(`\x1b[38;5;118m[ROOT] Système compromis : ${server}\x1b[0m`);
            rootedCount++;
        }

        // Déploiement
        if (ns.hasRootAccess(server)) {
            await ns.scp(payload, server, "home");
            
            // Calcul de la RAM max pour bourrer de threads
            const ramAvailable = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
            const scriptRam = ns.getScriptRam(payload);
            const threads = Math.floor(ramAvailable / scriptRam);
            
            if (threads > 0) {
                ns.killall(server); // Reset des anciens scripts éventuels
                ns.exec(payload, server, threads, target);
                ns.print(`\x1b[38;5;51m[EXEC] Botnet déployé : ${threads} threads sur ${server} (Cible: ${target})\x1b[0m`);
                totalThreads += threads;
            }
        }
    }
    
    ns.print(`\x1b[38;5;220m--- BILAN DE L'OPÉRATION ---`);
    ns.print(`Nouveaux serveurs rootés : ${rootedCount}`);
    ns.print(`Puissance de frappe déployée : ${totalThreads} threads sur ${target}\x1b[0m`);
}