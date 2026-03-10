/** @param {NS} ns */
export async function main(ns) {
    const programs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
    
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

    while (true) {
        const targets = scanAll();
        let count = 0;

        for (const host of targets) {
            if (host === "home" || ns.hasRootAccess(host)) continue;

            let openPorts = 0;
            if (ns.fileExists("BruteSSH.exe")) { ns.brutessh(host); openPorts++; }
            if (ns.fileExists("FTPCrack.exe")) { ns.ftpcrack(host); openPorts++; }
            if (ns.fileExists("relaySMTP.exe")) { ns.relaysmtp(host); openPorts++; }
            if (ns.fileExists("HTTPWorm.exe")) { ns.httpworm(host); openPorts++; }
            if (ns.fileExists("SQLInject.exe")) { ns.sqlinject(host); openPorts++; }

            if (ns.getServerNumPortsRequired(host) <= openPorts) {
                ns.nuke(host);
                ns.print(`[+] ROOT acquis sur ${host}`);
                count++;
            }
        }
        
        if (count > 0) ns.toast(`${count} nouveaux serveurs rootés !`, "success");
        await ns.sleep(10000); // Boucle de surveillance toutes les 10s
    }
}