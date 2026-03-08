/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const ram = 8; // On commence petit (8GB)
    const prefix = "pserv-";
    const target = "n00dles";

    ns.print(`\x1b[38;5;208m[🖥️] Gestionnaire de serveurs personnels activé...`);

    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            let hostname = ns.purchaseServer(prefix + ns.getPurchasedServers().length, ram);
            ns.print(`\x1b[38;5;118m[+] Serveur acheté : ${hostname}`);
            
            // On déploie immédiatement le worker
            await ns.scp("/bin/worker.js", hostname);
            let threads = Math.floor(ram / ns.getScriptRam("/bin/worker.js"));
            ns.exec("/bin/worker.js", hostname, threads, target);
        }
        await ns.sleep(10000); // On vérifie toutes les 10 sec
    }
    ns.print("\x1b[38;5;118m[✔️] Limite de serveurs atteinte.");
}