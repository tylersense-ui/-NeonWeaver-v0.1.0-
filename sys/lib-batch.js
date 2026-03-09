/**
 * @module  Lib-Batch
 * @author  BitCodeBurnerGamer / NeonWeaver Corp.
 * @version 1.0.0
 * @desc    Moteur mathématique utilisant Formulas.exe pour calculer les cycles HWGW.
 */
export function getBatchTimings(ns, target) {
    const srv = ns.getServer(target);
    const player = ns.getPlayer();

    // On simule le serveur dans son état parfait (Sécurité Min, Argent Max)
    srv.hackDifficulty = srv.minDifficulty;
    srv.moneyAvailable = srv.moneyMax;

    // Calcul des temps réels
    const hTime = ns.formulas.hacking.hackTime(srv, player);
    const wTime = ns.formulas.hacking.weakenTime(srv, player);
    const gTime = ns.formulas.hacking.growTime(srv, player);

    // Calcul des threads (On vise 10% de l'argent par batch)
    const hackPct = 0.10;
    const hThreads = Math.max(1, Math.floor(hackPct / ns.formulas.hacking.hackPercent(srv, player)));
    
    // Un hack augmente la sécu de 0.002. Un weaken la baisse de 0.05.
    const w1Threads = Math.max(1, Math.ceil((hThreads * 0.002) / 0.05));
    
    // On simule l'argent après le hack pour calculer le grow
    srv.moneyAvailable = srv.moneyMax * (1 - hackPct);
    const gThreads = Math.max(1, Math.ceil(ns.formulas.hacking.growThreads(srv, player, srv.moneyMax)));
    
    // Un grow augmente la sécu de 0.004.
    const w2Threads = Math.max(1, Math.ceil((gThreads * 0.004) / 0.05));

    return { hTime, wTime, gTime, hThreads, w1Threads, gThreads, w2Threads };
}