/**
 * @module  Dashboard
 * @version 1.0.0
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

        // Header ASCII
        ns.print(`\x1b[38;5;51m╔══════════════════════════════════════════════════════╗`);
        ns.print(`║ \x1b[38;5;208m[Lv.${ns.getHackingLevel()}]\x1b[38;5;255m  NEONWEAVER v1.0.0  \x1b[38;5;244mUP: ${ns.tFormat(uptime, true)}\x1b[38;5;51m ║`);
        ns.print(`╚══════════════════════════════════════════════════════╝\x1b[0m`);

        // Sparkline logic
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

        // RAM & Net
        const hUsed = ns.getServerUsedRam("home"), hMax = ns.getServerMaxRam("home");
        const hPct = (hUsed / hMax) * 100;
        ns.print(`\n \x1b[38;5;51m🏠 HOME RAM \x1b[0m [${"█".repeat(Math.round(hPct/10))}${"░".repeat(10-Math.round(hPct/10))}] ${hPct.toFixed(1)}%`);

        await ns.sleep(1000);
    }
}