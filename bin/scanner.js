/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail(); // Ouvre la fenêtre de log pour le monitoring
    
    const network = new Set(["home"]);
    const hosts = ["home"];

    ns.print("\x1b[38;5;51m--- NeonWeaver Network Scanner v1.0 ---");

    for (let i = 0; i < hosts.length; i++) {
        const current = hosts[i];
        const scanResults = ns.scan(current);
        
        for (const target of scanResults) {
            if (!network.has(target)) {
                network.add(target);
                hosts.push(target);
                
                // Analyse de base
                const server = ns.getServer(target);
                const color = server.hasAdminRights ? "\x1b[38;5;118m" : "\x1b[38;5;196m";
                ns.print(`${color}[🔗] ${target} (Ports: ${server.numOpenPortsRequired} | RAM: ${server.maxRam}GB)`);
            }
        }
    }

    ns.print(`\x1b[38;5;220mTotal serveurs découverts : ${network.size}`);
    
    // Sauvegarde dans notre état persistant
    const worldState = JSON.parse(ns.read("/state/world-state.json"));
    worldState.lastScan = new Date().toISOString();
    worldState.knownHosts = Array.from(network);
    ns.write("/state/world-state.json", JSON.stringify(worldState, null, 2), "w");
}