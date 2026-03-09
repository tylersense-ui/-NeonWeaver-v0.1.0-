/**
 * @module  PServManager
 * @author  BitCodeBurnerGamer
 * @version 1.0.0
 * @desc    Gère l'achat et l'upgrade automatique du parc de serveurs.
 */
export async function main(ns) {
    const prefix = "NW-NODE-"; // Nom propre pour ton botnet
    const limit = ns.getPurchasedServerLimit();
    
    ns.disableLog("ALL");
    ns.print("Initialisation du Manager de Serveurs...");

    while (true) {
        let maxRam = ns.getPurchasedServerMaxRam();
        
        for (let i = 0; i < limit; i++) {
            let sName = `${prefix}${i}`;
            
            if (!ns.serverExists(sName)) {
                let cost = ns.getPurchasedServerCost(64); // On commence à 64GB
                if (ns.getServerMoneyAvailable("home") > cost) {
                    ns.purchaseServer(sName, 64);
                    ns.print(`[+] Serveur ${sName} acheté.`);
                }
            } else {
                let currentRam = ns.getServerMaxRam(sName);
                if (currentRam < maxRam) {
                    let upgradeCost = ns.getPurchasedServerUpgradeCost(sName, currentRam * 2);
                    if (ns.getServerMoneyAvailable("home") > upgradeCost) {
                        ns.upgradePurchasedServer(sName, currentRam * 2);
                        ns.print(`[^] ${sName} upgradé à ${currentRam * 2}GB.`);
                    }
                }
            }
        }
        await ns.sleep(5000);
    }
}