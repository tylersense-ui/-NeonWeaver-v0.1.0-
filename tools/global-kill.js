/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.print("\x1b[38;5;196m[⚠️] PROTOCOLE DE PURGE TOTALE ACTIVÉ...");

    const scanServer = (node = "home", visited = new Set()) => {
        visited.add(node);
        ns.scan(node).forEach(next => { if (!visited.has(next)) scanServer(next, visited); });
        return Array.from(visited);
    };

    const servers = scanServer();
    for (const server of servers) {
        if (server === "home") {
            // Sur Home, on ne tue que les processus qui ne sont pas ce script ou le dashboard
            ns.ps().forEach(proc => {
                if (proc.filename !== "/util/global-kill.js" && proc.filename !== "/core/dashboard.js" && proc.filename !== "neonweaver-update.js") {
                    ns.kill(proc.pid);
                }
            });
        } else {
            ns.killall(server);
        }
    }
    ns.print("\x1b[38;5;118m[✔️] Réseau nettoyé. Tous les processus ont été terminés.");
}