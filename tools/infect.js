/**
 * @module  Infector
 * @author  BitCodeBurnerGamer
 * @version 1.1.1
 * @desc    Outil de nuke automatisé. Peut être importé ou run en standalone.
 */
export async function main(ns) {
    while(true) {
        autoNuke(ns);
        await ns.sleep(60000); // Check toutes les minutes si lancé seul
    }
}

export function autoNuke(ns) {
    const scanAll = () => {
        let s = ["home"], v = new Set();
        while(s.length > 0) {
            let curr = s.pop();
            if (!v.has(curr)) {
                v.add(curr);
                ns.scan(curr).forEach(n => s.push(n));
            }
        }
        return Array.from(v);
    };

    let count = 0;
    for (const host of scanAll()) {
        if (host === "home" || ns.hasRootAccess(host)) continue;

        let openPorts = 0;
        if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(host); openPorts++; }
        if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(host); openPorts++; }
        if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(host); openPorts++; }
        if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(host); openPorts++; }
        if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(host); openPorts++; }

        if (ns.getServerNumPortsRequired(host) <= openPorts) {
            ns.nuke(host);
            count++;
        }
    }
    if (count > 0) ns.toast(`[Infector] ${count} nouveaux serveurs rootés !`, "success");
}