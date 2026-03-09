/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();

    const sparklines = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    let history = Array(15).fill(0);
    let recordIncome = 0;

    // Chargement du record précédent si existant
    if (ns.fileExists("/state/records.json")) {
        recordIncome = JSON.parse(ns.read("/state/records.json")).record;
    }

    while (true) {
        ns.clearLog();
        const now = new Date();
        const playtime = ns.tFormat(ns.getTimeSinceLastAug(), true);
        
        // --- HEADER ---
        ns.print(`\x1b[38;5;51m╔══════════════════════════════════════════════════════╗`);
        ns.print(`║ \x1b[38;5;208m[Lv.${ns.getHackingLevel()}]\x1b[38;5;51m   NEONWEAVER OVERSEER v0.6.0   \x1b[38;5;244m${now.toLocaleTimeString()}\x1b[38;5;51m ║`);
        ns.print(`║ \x1b[38;5;13mBN: ${ns.getResetInfo().currentNode}\x1b[38;5;51m                                     \x1b[38;5;13mRT:${ns.formatNumber(ns.getResetInfo().lastAugReset, 0)}ms\x1b[38;5;51m ║`);
        ns.print(`╚══════════════════════════════════════════════════════╝\x1b[0m`);

        // --- ECONOMIE ---
        const currentIncome = ns.getTotalScriptIncome()[0];
        if (currentIncome > recordIncome) {
            recordIncome = currentIncome;
            ns.write("/state/records.json", JSON.stringify({ record: recordIncome }), "w");
        }

        history.shift(); history.push(currentIncome);
        const maxHist = Math.max(...history) || 1;
        const sparkLineStr = history.map(val => {
            const index = Math.floor((val / maxHist) * 7);
            return `\x1b[38;5;${index + 46}m${sparklines[index]}\x1b[0m`; // Dégradé de vert
        }).join("");

        ns.print(` \x1b[38;5;118m💸 Revenu Global :\x1b[0m $${ns.formatNumber(currentIncome)}/sec \x1b[38;5;220m[REC: $${ns.formatNumber(recordIncome)}]\x1b[0m`);
        ns.print(` \x1b[38;5;43m📈 Tendance      :\x1b[0m [${sparkLineStr}]`);

        // --- CIBLE & SPOOLER ---
        let spoolerState = { target: "IDLE", action: "IDLE", eta: 0 };
        if (ns.fileExists("/state/spooler-state.json")) spoolerState = JSON.parse(ns.read("/state/spooler-state.json"));

        if (spoolerState.target !== "IDLE") {
            const target = spoolerState.target;
            const moneyPct = (ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target)) * 100;
            const timeRem = Math.max(0, spoolerState.eta - Date.now());
            
            ns.print(`\n \x1b[38;5;208m🎯 TARGET: ${target}\x1b[0m`);
            ns.print(` \x1b[38;5;244m$ : [${"█".repeat(Math.round(moneyPct/10))}${"░".repeat(10-Math.round(moneyPct/10))}] ${moneyPct.toFixed(1)}%\x1b[0m`);
            ns.print(` \x1b[38;5;244m🛡️ : ${ns.getServerSecurityLevel(target).toFixed(2)} (Min: ${ns.getServerMinSecurityLevel(target)})\x1b[0m`);
            
            const actionColors = { "WEAKEN": "\x1b[38;5;220m", "GROW": "\x1b[38;5;43m", "HACK": "\x1b[38;5;196m", "IDLE": "\x1b[38;5;240m" };
            ns.print(` \x1b[38;5;51m⚡ STATUS: ${actionColors[spoolerState.action]}${spoolerState.action}\x1b[38;5;51m (Fin dans ${ns.tFormat(timeRem)})\x1b[0m`);
        }

        // --- RAM MANAGEMENT ---
        const getRamColor = (pct) => pct > 0.9 ? "\x1b[38;5;196m" : (pct > 0.7 ? "\x1b[38;5;220m" : "\x1b[38;5;118m");
        
        // Home
        const hRP = ns.getServerUsedRam("home") / ns.getServerMaxRam("home");
        ns.print(`\n \x1b[38;5;51m🏠 HOME RAM \x1b[0m ${getRamColor(hRP)}[${"█".repeat(Math.round(hRP*15))}${"░".repeat(15-Math.round(hRP*15))}] ${(hRP*100).toFixed(1)}%\x1b[0m`);

        // Global Network
        const pservs = ns.getPurchasedServers();
        let totalMax = 0, totalUsed = 0;
        pservs.forEach(s => { totalMax += ns.getServerMaxRam(s); totalUsed += ns.getServerUsedRam(s); });
        
        const gRP = totalUsed / (totalMax || 1);
        ns.print(` \x1b[38;5;51m🌐 NETW RAM \x1b[0m ${getRamColor(gRP)}[${"█".repeat(Math.round(gRP*15))}${"░".repeat(15-Math.round(gRP*15))}] ${(gRP*100).toFixed(1)}%\x1b[0m`);
        ns.print(` \x1b[38;5;244m(Charge: ${ns.formatRam(totalUsed)} / ${ns.formatRam(totalMax)})\x1b[0m`);

        // --- FOOTER ---
        ns.print(`\n \x1b[38;5;244mRuntime: ${playtime}\x1b[0m`);
        await ns.sleep(1000);
    }
}