/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail(); // <-- CORRIGÉ !
    const network = new Set(["home"]);
    const hosts = ["home"];
    ns.print("\x1b[38;5;51m--- NeonWeaver Scanner v1.1 ---");
    for (let i = 0; i < hosts.length; i++) {
        const current = hosts[i];
        const scanResults = ns.scan(current);
        for (const target of scanResults) {
            if (!network.has(target)) {
                network.add(target);
                hosts.push(target);
                const server = ns.getServer(target);
                const color = server.hasAdminRights ? "\x1b[38;5;118m" : "\x1b[38;5;196m";
                ns.print(`${color}[🔗] ${target} (Ports: ${server.numOpenPortsRequired} | RAM: ${server.maxRam}GB)`);
            }
        }
    }
    ns.print(`\x1b[38;5;220mTotal serveurs découverts : ${network.size}`);
}