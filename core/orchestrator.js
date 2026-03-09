/**
 * @module  Orchestrator-HWGW
 * @author  BitCodeBurnerGamer
 * @version 1.0.3
 * @desc    Batcher agressif. Remplit tout le réseau de vagues HWGW.
 */
import { getBatchTimings } from "/lib/lib-batch.js";

export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix";
    const spacer = 50; 
    let batchId = 0;

    while (true) {
        const srv = ns.getServer(target);
        const player = ns.getPlayer();

        // --- PHASE 1 : NIVELLEMENT ---
        if (srv.hackDifficulty > srv.minDifficulty || srv.moneyAvailable < srv.moneyMax) {
            ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;208mPREP (Nivellement)\x1b[0m"}), "w");
            
            const servers = getServers(ns);
            for (const host of servers) {
                let free = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
                if (host === "home") free -= 64;
                if (free < 2) continue;

                if (host !== "home") ns.scp(["/wk/w.js", "/wk/g.js"], host, "home");
                
                if (srv.hackDifficulty > srv.minDifficulty) {
                    ns.exec("/wk/w.js", host, Math.floor(free/1.75), target, 0, Math.random());
                } else {
                    ns.exec("/wk/g.js", host, Math.floor(free/1.75), target, 0, Math.random());
                }
            }
            await ns.sleep(ns.getWeakenTime(target) + 500);
            continue;
        }

        // --- PHASE 2 : BATCHING MASSIF ---
        ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;118mHWGW OVERKILL\x1b[0m"}), "w");
        
        const t = getBatchTimings(ns, target);
        const servers = getServers(ns);
        let batchDeployedThisLoop = false;

        for (const host of servers) {
            let free = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
            if (host === "home") free -= 128;

            const batchRam = (t.hThreads*1.7) + (t.w1Threads*1.75) + (t.gThreads*1.75) + (t.w2Threads*1.75);

            // On remplit ce serveur au maximum de sa capacité de batchs
            while (free >= batchRam) {
                if (host !== "home") ns.scp(["/wk/h.js", "/wk/g.js", "/wk/w.js"], host, "home");
                
                const hD = t.wTime - t.hTime;
                const w1D = spacer;
                const gD = t.wTime + (spacer * 2) - t.gTime;
                const w2D = spacer * 3;

                ns.exec("/wk/h.js", host, t.hThreads, target, hD, batchId + "-h");
                ns.exec("/wk/w.js", host, t.w1Threads, target, w1D, batchId + "-w1");
                ns.exec("/wk/g.js", host, t.gThreads, target, gD, batchId + "-g");
                ns.exec("/wk/w.js", host, t.w2Threads, target, w2D, batchId + "-w2");
                
                batchId++;
                free -= batchRam;
                batchDeployedThisLoop = true;
                // On espace les lancements pour ne pas lagger le jeu
                await ns.sleep(spacer); 
            }
        }

        if (!batchDeployedThisLoop) {
            await ns.sleep(1000); // Réseau plein, on attend.
        }
    }
}

function getServers(ns) {
    let res = [];
    let stack = ["home"];
    let visited = {};
    while(stack.length > 0) {
        let node = stack.pop();
        if (!visited[node]) {
            visited[node] = true;
            if (ns.hasRootAccess(node)) res.push(node);
            ns.scan(node).forEach(s => stack.push(s));
        }
    }
    return res;
}