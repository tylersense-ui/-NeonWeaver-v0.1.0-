/**
 * @module  Orchestrator-HWGW
 * @author  BitCodeBurnerGamer
 * @version 1.0.1
 * @desc    Batcher continu avec phase de préparation. Superpose les vagues.
 */
import { getBatchTimings } from "/lib/lib-batch.js";

export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix";
    const spacer = 50; 
    let batchId = 0;

    ns.print(`\x1b[38;5;13m[🛰️] NeonWeaver Orchestrator HWGW v1.0.1 en ligne...\x1b[0m`);

    while (true) {
        let sec = ns.getServerSecurityLevel(target);
        let minSec = ns.getServerMinSecurityLevel(target);
        let money = ns.getServerMoneyAvailable(target);
        let maxMoney = ns.getServerMaxMoney(target);

        // --- PHASE 1 : Nivellement (Prep) ---
        if (sec > minSec || money < maxMoney) {
            ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;208mPREPARATION (Nivellement)\x1b[0m"}), "w");
            ns.print(`\x1b[38;5;208m[⚠️] Niveau de la cible imparfait. Déploiement du Nivellement...\x1b[0m`);
            
            // On calcule combien de Weaken/Grow il faut pour réparer
            let wThreads = Math.ceil((sec - minSec) / 0.05) || 1;
            let gThreads = Math.ceil(ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), maxMoney)) || 1;
            
            const servers = getServers(ns);
            for (const host of servers) {
                let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
                if (host === "home") freeRam -= 64;
                
                let maxW = Math.floor(freeRam / ns.getScriptRam("/wk/w.js"));
                if (maxW > 0 && sec > minSec) {
                    let t = Math.min(maxW, wThreads);
                    if (host !== "home") ns.scp("/wk/w.js", host, "home");
                    ns.exec("/wk/w.js", host, t, target, 0, Math.random());
                    sec -= t * 0.05; // Simulation pour la boucle
                } else if (maxW > 0 && money < maxMoney) {
                    let t = Math.min(maxW, gThreads);
                    if (host !== "home") ns.scp("/wk/g.js", host, "home");
                    ns.exec("/wk/g.js", host, t, target, 0, Math.random());
                    money = maxMoney; // Simulation pour la boucle
                }
            }
            // On attend la fin de l'opération la plus longue
            await ns.sleep(ns.getWeakenTime(target) + 500);
            continue; // On revérifie l'état
        }

        // --- PHASE 2 : BATCHING CONTINU ---
        ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;118mHWGW BATCHING CONTINU\x1b[0m"}), "w");
        
        const t = getBatchTimings(ns, target);
        const w2Delay = 150;
        const gDelay = t.wTime + 100 - t.gTime;
        const w1Delay = 50;
        const hDelay = t.wTime + 0 - t.hTime;

        const servers = getServers(ns);
        let deployed = deployBatch(ns, servers, target, t, hDelay, w1Delay, gDelay, w2Delay, batchId);

        if (deployed) {
            batchId++;
            // LE SECRET DU BATCHING : On n'attend pas la fin du script ! 
            // On attend juste l'espace de sécurité entre deux batchs (200ms) !
            await ns.sleep(spacer * 4); 
        } else {
            // S'il n'y a plus de RAM sur le réseau, on attend qu'un batch se termine
            ns.print(`\x1b[38;5;196m[-] Réseau saturé. Attente de libération RAM...\x1b[0m`);
            await ns.sleep(1000);
        }
    }
}

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

function deployBatch(ns, servers, target, t, hD, w1D, gD, w2D, id) {
    for (const host of servers) {
        let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        if (host === "home") freeRam -= 128; // Plus grosse marge sur Home
        
        const totalRam = (t.hThreads*1.7) + (t.w1Threads*1.75) + (t.gThreads*1.75) + (t.w2Threads*1.75); 
        
        if (freeRam >= totalRam) {
            if (host !== "home") ns.scp(["/wk/h.js", "/wk/g.js", "/wk/w.js"], host, "home");
            ns.exec("/wk/h.js", host, t.hThreads, target, hD, id + "-h");
            ns.exec("/wk/w.js", host, t.w1Threads, target, w1D, id + "-w1");
            ns.exec("/wk/g.js", host, t.gThreads, target, gD, id + "-g");
            ns.exec("/wk/w.js", host, t.w2Threads, target, w2D, id + "-w2");
            return true;
        }
    }
    return false;
}