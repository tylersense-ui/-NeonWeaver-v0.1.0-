/**
 * @module  Dashboard
 * @author  BitCodeBurnerGamer
 * @version 1.0.3
 * @desc    Interface avec Barre de Charge Réseau Globale.
 */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();

    const sparklines = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    let history = Array(25).fill(0);
    let record = 0;

    while (true) {
        ns.clearLog();
        const uptime = Date.now() - ns.getResetInfo().lastAugReset;
        const income = ns.getTotalScriptIncome()[0];
        if (income > record) record = income;

        ns.print(`\x1b[38;5;51m╔══════════════════════════════════════════════════════╗`);
        ns.print(`║ \x1b[38;5;208m[Lv.${ns.getHackingLevel()}]\x1b[38;5;255m  NEONWEAVER v1.0.3  \x1b[38;5;244mUP: ${ns.tFormat(uptime, true)}\x1b[38;5;51m ║`);
        ns.print(`╚══════════════════════════════════════════════════════╝\x1b[0m`);

        history.shift(); history.push(income);
        const maxH = Math.max(...history) || 1;
        const minH = Math.min(...history);
        const range = maxH - minH || 1;
        const spark = history.map(v => {
            const idx = Math.floor(((v - minH) / range) * 7);
            return `\x1b[38;5;${idx + 39}m${sparklines[idx]}\x1b[0m`;
        }).join("");

        ns.print(` \x1b[38;5;121m💰 $${ns.formatNumber(income)}/s \x1b[38;5;220m[REC: $${ns.formatNumber(record)}]\x1b[0m`);
        ns.print(` \x1b[38;5;244m📈 [${spark}]\x1b[0m`);

        if (ns.fileExists("/db/telemetry-state.json")) {
            const state = JSON.parse(ns.read("/db/telemetry-state.json"));
            const t = state.target;
            const moneyPct = (ns.getServerMoneyAvailable(t) / ns.getServerMaxMoney(t)) * 100;
            const sec = ns.getServerSecurityLevel(t);
            const minSec = ns.getServerMinSecurityLevel(t);

            ns.print(`\n \x1b[38;5;208m🎯 TARGET: ${t}\x1b[0m`);
            ns.print(` \x1b[38;5;244m$ : \x1b[38;5;${moneyPct > 99 ? 118 : 220}m[${"█".repeat(Math.round(moneyPct/5))}${"░".repeat(20-Math.round(moneyPct/5))}] ${moneyPct.toFixed(1)}%\x1b[0m`);
            ns.print(` \x1b[38;5;244m🛡️ : ${sec.toFixed(2)} (Min: ${minSec})\x1b[0m`);
            ns.print(` \x1b[38;5;51m⚡ STATUS: ${state.action}\x1b[0m`);
        }

        // --- RAM SECTION ---
        const hUsed = ns.getServerUsedRam("home"), hMax = ns.getServerMaxRam("home");
        ns.print(`\n \x1b[38;5;51m🏠 HOME RAM \x1b[0m [${"█".repeat(Math.round((hUsed/hMax)*10))}${"░".repeat(10-Math.round((hUsed/hMax)*10))}] ${((hUsed/hMax)*100).toFixed(1)}%`);

        // Scan du réseau pour la barre globale
        let netUsed = 0, netMax = 0;
        let pservs = ns.getPurchasedServers();
        pservs.forEach(s => {
            netMax += ns.getServerMaxRam(s);
            netUsed += ns.getServerUsedRam(s);
        });

        const nPct = (netUsed / netMax) || 0;
        const nColor = nPct > 0.9 ? "\x1b[38;5;196m" : (nPct > 0.5 ? "\x1b[38;5;220m" : "\x1b[38;5;118m");
        ns.print(` \x1b[38;5;51m🌐 NETW RAM \x1b[0m ${nColor}[${"█".repeat(Math.round(nPct*10))}${"░".repeat(10-Math.round(nPct*10))}] ${(nPct*100).toFixed(1)}%\x1b[0m`);
        ns.print(` \x1b[38;5;244m   (Usage: ${ns.formatRam(netUsed)} / ${ns.formatRam(netMax)})\x1b[0m`);

        await ns.sleep(1000);
    }
}