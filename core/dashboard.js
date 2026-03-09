/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();

    const sparklines = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    let history = Array(15).fill(0);

    while (true) {
        ns.clearLog();
        
        // Header
        ns.print(`\x1b[38;5;51m╔════════════════════════════════════════════╗`);
        ns.print(`║        \x1b[38;5;220mNEONWEAVER OVERSEER v0.4.0\x1b[38;5;51m          ║`);
        ns.print(`╚════════════════════════════════════════════╝\x1b[0m\n`);

        // Income Metrics
        const currentIncome = ns.getTotalScriptIncome()[0];
        history.shift();
        history.push(currentIncome);
        
        const maxHist = Math.max(...history) || 1;
        const sparkLineStr = history.map(val => sparklines[Math.floor((val / maxHist) * 7)]).join("");

        ns.print(`\x1b[38;5;118m💸 Revenu Global :\x1b[0m $${ns.formatNumber(currentIncome)} / sec`);
        ns.print(`\x1b[38;5;43m📈 Tendance     :\x1b[0m [${sparkLineStr}]`);
        
        // RAM Home Progress Bar
        const maxRam = ns.getServerMaxRam("home");
        const usedRam = ns.getServerUsedRam("home");
        const ramPct = usedRam / maxRam;
        const barLength = 20;
        const filled = Math.round(ramPct * barLength);
        const bar = "█".repeat(filled) + "░".repeat(barLength - filled);
        
        let color = "\x1b[38;5;118m"; // Vert
        if (ramPct > 0.7) color = "\x1b[38;5;220m"; // Jaune
        if (ramPct > 0.9) color = "\x1b[38;5;196m"; // Rouge

        ns.print(`\n\x1b[38;5;208m🖥️ HOME RAM\x1b[0m`);
        ns.print(`${color}[${bar}] ${(ramPct * 100).toFixed(1)}%\x1b[0m (${ns.formatRam(usedRam)} / ${ns.formatRam(maxRam)})`);

        // Serveurs Personnels
        const pServs = ns.getPurchasedServers();
        if (pServs.length > 0) {
            const pRam = ns.getServerMaxRam(pServs[0]);
            ns.print(`\x1b[38;5;13m🤖 Botnet Privé :\x1b[0m ${pServs.length}/25 (RAM: ${ns.formatRam(pRam)}/noeud)`);
        }

        ns.print(`\n\x1b[38;5;240mActualisation: ${new Date().toLocaleTimeString()}\x1b[0m`);
        await ns.sleep(1000);
    }
}
