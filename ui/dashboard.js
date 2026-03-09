/**
 * @module  Dashboard
 * @author  BitCodeBurnerGamer
 * @version 1.0.1
 * @desc    Interface de contrôle visuelle haute fidélité.
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
        ns.print(`║ \x1b[38;5;208m[Lv.${ns.getHackingLevel()}]\x1b[38;5;255m  NEONWEAVER v1.0.1  \x1b[38;5;244mUP: ${ns.tFormat(uptime, true)}\x1b[38;5;51m ║`);
        ns.print(`╚══════════════════════════════════════════════════════╝\x1b[0m`);

        history.shift(); history.push(income);
        const maxH = Math.max(...history) || 1;
        const minH = Math.min(...history);
        const range = maxH - minH || 1;
        const spark = history.map(v => `\x1b[38;5;${Math.floor(((v - minH) / range) * 7) + 39}m${sparklines[Math.floor(((v - minH) / range) * 7)]}\x1b[0m`).join("");

        ns.print(` \x1b[38;5;121m💰 $${ns.formatNumber(income)}/s \x1b[38;5;220m[REC: $${ns.formatNumber(record)}]\x1b[0m`);
        ns.print(` \x1b[38;5;244m📈 [${spark}]\x1b[0m`);

        // --- CIBLE & SPOOLER (RESTAURÉ) ---
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

        const hUsed = ns.getServerUsedRam("home"), hMax = ns.getServerMaxRam("home");
        ns.print(`\n \x1b[38;5;51m🏠 HOME RAM \x1b[0m [${"█".repeat(Math.round((hUsed/hMax)*10))}${"░".repeat(10-Math.round((hUsed/hMax)*10))}] ${((hUsed/hMax)*100).toFixed(1)}%`);

        await ns.sleep(1000);
    }
}