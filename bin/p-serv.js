/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    // Noms Cyberpunk pour le style (demandé par l'opérateur)
    const coolNames = ["Wintermute", "Neuromancer", "Shodan", "Glados", "Hal9000", "Nexus", "Matrix", "Zion", "Skynet", "Cortana", "Legion", "Oracle", "Motoko", "Tachikoma", "Batty", "Deckard", "Tyrell", "Ono-Sendai", "Black-ICE", "Daedalus", "Icarus", "Gibson", "Avalon", "Yggdrasil", "Midgard"];
    
    let currentRam = 8; // La RAM de tes serveurs actuels
    const targetRam = 64; // On vise 64GB pour la prochaine upgrade

    ns.print(`\x1b[38;5;208m[🖥️] Gestionnaire de serveurs personnels (Mode Upgrade) activé...`);

    while (true) {
        let servers = ns.getPurchasedServers();
        
        // 1. Upgrade des serveurs existants
        for (let i = 0; i < servers.length; i++) {
            const serv = servers[i];
            if (ns.getServerMaxRam(serv) < targetRam) {
                const cost = ns.getPurchasedServerUpgradeCost(serv, targetRam);
                if (ns.getServerMoneyAvailable("home") > cost) {
                    ns.upgradePurchasedServer(serv, targetRam);
                    ns.print(`\x1b[38;5;51m[💽] Serveur ${serv} upgradé à ${targetRam}GB !`);
                }
            }
        }

        // 2. Achat de nouveaux serveurs avec des noms cool s'il reste de la place (si on augmente la limite ou pour les prochaines runs)
        if (servers.length < ns.getPurchasedServerLimit()) {
            if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(targetRam)) {
                let name = coolNames[servers.length] || `Node-${servers.length}`;
                let hostname = ns.purchaseServer(name, targetRam);
                ns.print(`\x1b[38;5;118m[+] Nouveau serveur acheté : ${hostname} (${targetRam}GB)`);
            }
        }

        await ns.sleep(10000); // Check toutes les 10 sec
    }
}