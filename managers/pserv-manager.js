/**
 * @module  PServManager
 * @author  BitCodeBurnerGamer
 * @version 1.0.1
 * @desc    Gère l'achat et l'upgrade automatique du parc de serveurs existant.
 */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    const prefix = "NW-NODE-";
    
    ns.print("\x1b[38;5;51m╔════════════════════════════════════════════╗");
    ns.print("║     \x1b[38;5;208mSERVER MANAGER v1.0.1 (ONLINE)\x1b[38;5;51m         ║");
    ns.print("╚════════════════════════════════════════════╝\x1b[0m\n");

    while (true) {
        let maxRam = ns.getPurchasedServerMaxRam();
        let servers = ns.getPurchasedServers();
        
        // 1. Upgrade des serveurs existants (qu'ils s'appellent pserv ou NW-NODE)
        for (const sName of servers) {
            let currentRam = ns.getServerMaxRam(sName);
            if (currentRam < maxRam) {
                let upgradeCost = ns.getPurchasedServerUpgradeCost(sName, currentRam * 2);
                if (ns.getServerMoneyAvailable("home") > upgradeCost) {
                    ns.upgradePurchasedServer(sName, currentRam * 2);
                    ns.print(`\x1b[38;5;118m[UPGRADE] ${sName} -> ${currentRam * 2}GB\x1b[0m`);
                }
            }
        }

        // 2. Achat de nouveaux serveurs s'il reste de la place
        if (servers.length < ns.getPurchasedServerLimit()) {
            let sName = `${prefix}${servers.length}`;
            let cost = ns.getPurchasedServerCost(64); // Démarre à 64GB
            if (ns.getServerMoneyAvailable("home") > cost) {
                ns.purchaseServer(sName, 64);
                ns.print(`\x1b[38;5;43m[NEW] Serveur ${sName} (64GB) déployé.\x1b[0m`);
            }
        }
        await ns.sleep(5000); // Check toutes les 5 sec
    }
}