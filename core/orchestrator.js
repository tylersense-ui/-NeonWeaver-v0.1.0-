/**
 * @module  Orchestrator-HWGW
 * @author  BitCodeBurnerGamer / NeonWeaver Corp.
 * @version 1.0.0
 * @desc    Batcher centralisé. Synchronise les workers pour un vol continu.
 */
import { getBatchTimings } from "/sys/lib-batch.js";

export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix";
    const spacer = 50; // 50ms entre chaque action
    let batchId = 0;

    ns.print(`\x1b[38;5;13m[🛰️] NeonWeaver Orchestrator HWGW v1.0.0 en ligne...\x1b[0m`);

    // --- PHASE 1 : PRÉPARATION ---
    // Si le serveur n'est pas parfait, on le force à le devenir (Weaken/Grow basique)
    let sec = ns.getServerSecurityLevel(target);
    let minSec = ns.getServerMinSecurityLevel(target);
    let money = ns.getServerMoneyAvailable(target);
    let maxMoney = ns.getServerMaxMoney(target);

    if (sec > minSec || money < maxMoney) {
        ns.print(`\x1b[38;5;208m[⚠️] Préparation du serveur requise. Lancement du nivellement...\x1b[0m`);
        // Note: Dans une version complète on lancerait des scripts ici. 
        // Pour l'instant, assure-toi que ton serveur est déjà à 100% via l'ancien système !
    }

    // --- PHASE 2 : BATCHING CONTINU ---
    while (true) {
        const t = getBatchTimings(ns, target);

        // L'action la plus longue est le Weaken (wTime). On cale tout par rapport à sa fin.
        // Ordre d'arrivée souhaité : H (0ms), W1 (+50ms), G (+100ms), W2 (+150ms).
        const w2Delay = 150;
        const gDelay = t.wTime + 100 - t.gTime;
        const w1Delay = 50;
        const hDelay = t.wTime + 0 - t.hTime;

        // RAM requise pour 1 Batch complet
        const hRam = t.hThreads * ns.getScriptRam("/wk/h.js");
        const w1Ram = t.w1Threads * ns.getScriptRam("/wk/w.js");
        const gRam = t.gThreads * ns.getScriptRam("/wk/g.js");
        const w2Ram = t.w2Threads * ns.getScriptRam("/wk/w.js");
        const totalRamNeeded = hRam + w1Ram + gRam + w2Ram;

        // Déploiement sur le réseau
        const servers = getServers(ns);
        let deployed = deployBatch(ns, servers, target, t, hDelay, w1Delay, gDelay, w2Delay, batchId);

        if (deployed) {
            ns.print(`\x1b[38;5;118m[+] Batch #${batchId} déployé (H:${t.hThreads} W:${t.w1Threads} G:${t.gThreads} W:${t.w2Threads})\x1b[0m`);
            batchId++;
            // On attend la fin du batch + un peu de marge avant de relancer
            await ns.sleep(t.wTime + 200); 
        } else {
            ns.print(`\x1b[38;5;196m[-] RAM insuffisante pour le Batch #${batchId}. Attente...\x1b[0m`);
            await ns.sleep(1000);
        }
    }
}

// Fonction utilitaire pour trouver les serveurs rootés
function getServers(ns) {
    const visited = new Set();
    const stack = ["home"];
    while (stack.length > 0) {
        const node = stack.pop();
        if (!visited.has(node)) {
            visited.add(node);
            ns.scan(node).forEach(n => { if (!visited.has(n)) stack.push(n); });
        }
    }
    return Array.from(visited).filter(s => ns.hasRootAccess(s));
}

// Fonction pour déployer les 4 scripts du batch
function deployBatch(ns, servers, target, t, hD, w1D, gD, w2D, id) {
    // Vérification simplifiée : on cherche un serveur qui a assez de RAM pour TOUT le batch (ex: tes pserv à 64GB)
    for (const host of servers) {
        let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        if (host === "home") freeRam -= 64; // Réserve
        
        const totalRam = (t.hThreads*1.7) + (t.w1Threads*1.75) + (t.gThreads*1.75) + (t.w2Threads*1.75); // RAM approx
        
        if (freeRam >= totalRam) {
            if (host !== "home") {
                ns.scp(["/wk/h.js", "/wk/g.js", "/wk/w.js"], host, "home");
            }
            ns.exec("/wk/h.js", host, t.hThreads, target, hD, id + "-h");
            ns.exec("/wk/w.js", host, t.w1Threads, target, w1D, id + "-w1");
            ns.exec("/wk/g.js", host, t.gThreads, target, gD, id + "-g");
            ns.exec("/wk/w.js", host, t.w2Threads, target, w2D, id + "-w2");
            return true;
        }
    }
    return false;
}