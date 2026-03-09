/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();

    const sparklines = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    let history = Array(15).fill(0);

    while (true) {
        ns.clearLog();
        
        ns.print(`\x1b[38;5;51m╔════════════════════════════════════════════╗`);
        ns.print(`║        \x1b[38;5;220mNEONWEAVER OVERSEER v0.5.2\x1b[38;5;51m          ║`);
        ns.print(`╚════════════════════════════════════════════╝\x1b[0m\n`);

        // Revenus
        const currentIncome = ns.getTotalScriptIncome()[0];
        history.shift(); history.push(currentIncome);
        const maxHist = Math.max(...history) || 1;
        const sparkLineStr = history.map(val => sparklines[Math.floor((val / maxHist) * 7)]).join("");

        ns.print(`\x1b[38;5;118m💸 Revenu Global :\x1b[0m $${ns.formatNumber(currentIncome)} / sec`);
        ns.print(`\x1b[38;5;43m📈 Tendance     :\x1b[0m [${sparkLineStr}]\n`);
        
        // État du Spooler & Cible
        let spoolerState = { target: "En attente...", action: "IDLE", eta: 0 };
        if (ns.fileExists("/state/spooler-state.json")) {
            spoolerState = JSON.parse(ns.read("/state/spooler-state.json"));
        }

        if (spoolerState.target !== "En attente...") {
            const target = spoolerState.target;
            const money = ns.getServerMoneyAvailable(target);
            const maxMoney = ns.getServerMaxMoney(target);
            const sec = ns.getServerSecurityLevel(target);
            const minSec = ns.getServerMinSecurityLevel(target);
            const timeRemaining = Math.max(0, spoolerState.eta - Date.now());

            ns.print(`\x1b[38;5;208m🎯 CIBLE ACTUELLE : ${target}\x1b[0m`);
            
            // Barre d'argent
            const moneyPct = money / maxMoney;
            const moneyBar = "█".repeat(Math.round(moneyPct * 15)) + "░".repeat(15 - Math.round(moneyPct * 15));
            ns.print(`💵 Argent   : [${moneyBar}] ${(moneyPct*100).toFixed(1)}%`);
            ns.print(`              ($${ns.formatNumber(money)} / $${ns.formatNumber(maxMoney)})`);

            // Barre de sécu
            ns.print(`🛡️ Sécurité : ${sec.toFixed(2)} (Min: ${minSec})`);

            // Action
            const actionColors = { "WEAKEN": "\x1b[38;5;220m", "GROW": "\x1b[38;5;43m", "HACK": "\x1b[38;5;196m", "IDLE": "\x1b[38;5;240m" };
            ns.print(`⚡ Statut   : ${actionColors[spoolerState.action]}${spoolerState.action}\x1b[0m (Fin dans ${ns.tFormat(timeRemaining)})`);
        }

        // RAM Home
        const maxRam = ns.getServerMaxRam("home");
        const usedRam = ns.getServerUsedRam("home");
        const ramPct = usedRam / maxRam;
        const barLength = 20;
        const filled = Math.round(ramPct * barLength);
        const bar = "█".repeat(filled) + "░".repeat(barLength - filled);
        let color = ramPct > 0.9 ? "\x1b[38;5;196m" : (ramPct > 0.7 ? "\x1b[38;5;220m" : "\x1b[38;5;118m");

        ns.print(`\n\x1b[38;5;208m🖥️ HOME RAM\x1b[0m`);
        ns.print(`${color}[${bar}] ${(ramPct * 100).toFixed(1)}%\x1b[0m`);

        ns.print(`\n\x1b[38;5;240mActualisation: ${new Date().toLocaleTimeString()}\x1b[0m`);
        await ns.sleep(1000);
    }
}