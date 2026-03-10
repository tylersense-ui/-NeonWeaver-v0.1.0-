/**
 * @module  Orchestrator-HWGW
 * @author  BitCodeBurnerGamer
 * @version 1.1.0
 * @desc    Batcher distribué. Traite le réseau comme un pool unifié de RAM.
 */
import { getBatchTimings } from "/lib/lib-batch.js";
import { autoNuke } from "/tools/infect.js";

export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix";
    const spacer = 50; 
    let batchId = 0;

    ns.print(`\x1b[38;5;13m[🛰️] NeonWeaver Orchestrator HWGW v1.1.0 en ligne...\x1b[0m`);

    while (true) {
        // 1. Auto-Infect à chaque cycle pour choper les nouveaux serveurs
        autoNuke(ns);

        const srv = ns.getServer(target);
        const player = ns.getPlayer();

        // --- PHASE 1 : NIVELLEMENT ---
        if (srv.hackDifficulty > srv.minDifficulty || srv.moneyAvailable < srv.moneyMax) {
            ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;208mPREP (Nivellement)\x1b[0m"}), "w");
            
            const servers = getServers(ns);
            for (const host of servers) {
                let free = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
                if (host === "home") free -= 128;
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

        // --- PHASE 2 : BATCHING DISTRIBUÉ ---
        ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;118mHWGW BATCHING\x1b[0m"}), "w");
        
        const t = getBatchTimings(ns, target);
        
        // Délais calculés
        const hD = t.wTime - t.hTime;
        const w1D = spacer;
        const gD = t.wTime + (spacer * 2) - t.gTime;
        const w2D = spacer * 3;

        // Les 4 jobs du batch
        const jobs = [
            { script: "/wk/h.js", threads: t.hThreads, delay: hD, id: "-h" },
            { script: "/wk/w.js", threads: t.w1Threads, delay: w1D, id: "-w1" },
            { script: "/wk/g.js", threads: t.gThreads, delay: gD, id: "-g" },
            { script: "/wk/w.js", threads: t.w2Threads, delay: w2D, id: "-w2" }
        ];

        let servers = getServers(ns);
        let batchDeployed = true;

        // On essaie de placer chaque job indépendamment sur le réseau
        for (const job of jobs) {
            let placed = false;
            let ramNeeded = job.threads * ns.getScriptRam(job.script);

            for (const host of servers) {
                let free = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
                if (host === "home") free -= 128; // Marge Home

                if (free >= ramNeeded) {
                    if (host !== "home") ns.scp(job.script, host, "home");
                    ns.exec(job.script, host, job.threads, target, job.delay, batchId + job.id);
                    placed = true;
                    break; // Job placé, on passe au job suivant
                }
            }
            if (!placed) {
                batchDeployed = false; // Pas assez de RAM pour ce job
                break; // On annule le reste du batch
            }
        }

        if (batchDeployed) {
            batchId++;
            await ns.sleep(spacer); // On espace la frappe
        } else {
            // Si on ne peut pas placer un job, c'est que le réseau est plein à 100%
            await ns.sleep(1000); 
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
            if (ns.hasRootAccess(node) && ns.getServerMaxRam(node) > 0) res.push(node); // Filtre anti-zombies
            ns.scan(node).forEach(s => stack.push(s));
        }
    }
    // Tri optionnel : On met Home en dernier pour remplir les pservs d'abord
    return res.sort((a, b) => (a === "home" ? 1 : b === "home" ? -1 : 0));
}