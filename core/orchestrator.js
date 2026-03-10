/**
 * @module  Orchestrator-HWGW
 * @author  BitCodeBurnerGamer
 * @version 1.1.1
 * @desc    Batcher distribué Anti-Fragmentation & Anti-Overlap. Le métronome parfait.
 */
import { getBatchTimings } from "/lib/lib-batch.js";
import { autoNuke } from "/tools/infect.js";

export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const target = "silver-helix";
    const spacer = 50; // Marge de sécurité entre H, W, G, W
    const batchSpacer = spacer * 4; // 200ms : Espace VITAL entre deux batchs pour éviter le crash
    let batchId = 0;

    ns.print(`\x1b[38;5;13m[🛰️] NeonWeaver Orchestrator HWGW v1.1.1 en ligne...\x1b[0m`);

    while (true) {
        // 1. Détection des nouveaux serveurs en silence (Auto-Infect)
        autoNuke(ns);

        const srv = ns.getServer(target);
        const player = ns.getPlayer();

        // --- PHASE 1 : NIVELLEMENT ---
        if (srv.hackDifficulty > srv.minDifficulty || srv.moneyAvailable < srv.moneyMax) {
            ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;208mPREP (Nivellement)\x1b[0m"}), "w");
            
            let wNeeded = Math.ceil((srv.hackDifficulty - srv.minDifficulty) / 0.05) || 0;
            let gNeeded = Math.ceil(ns.formulas.hacking.growThreads(srv, player, srv.moneyMax)) || 0;

            const servers = getServers(ns);
            for (const host of servers) {
                let free = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
                if (host === "home") free -= 128;
                if (free < 1.75) continue;

                if (srv.hackDifficulty > srv.minDifficulty && wNeeded > 0) {
                    let t = Math.min(Math.floor(free / 1.75), wNeeded);
                    if (host !== "home") ns.scp("/wk/w.js", host, "home");
                    ns.exec("/wk/w.js", host, t, target, 0, Math.random());
                    wNeeded -= t;
                } else if (srv.moneyAvailable < srv.moneyMax && gNeeded > 0) {
                    let t = Math.min(Math.floor(free / 1.75), gNeeded);
                    if (host !== "home") ns.scp("/wk/g.js", host, "home");
                    ns.exec("/wk/g.js", host, t, target, 0, Math.random());
                    gNeeded -= t;
                }
            }
            // On attend patiemment la réparation
            await ns.sleep(ns.getWeakenTime(target) + 500);
            continue;
        }

        // --- PHASE 2 : BATCHING DISTRIBUÉ ---
        ns.write("/db/telemetry-state.json", JSON.stringify({target, action: "\x1b[38;5;118mHWGW BATCHING\x1b[0m"}), "w");
        
        const t = getBatchTimings(ns, target);
        
        // Calcul des retards (Delays) absolus. L'ordre de fin doit être H, W1, G, W2.
        const w1D = 0; // W1 est l'action la plus longue, il part à t=0
        const w2D = spacer * 2;
        const gD = t.wTime + spacer - t.gTime;
        const hD = t.wTime - spacer - t.hTime;

        // On trie les jobs du plus gourmand en RAM au plus petit pour optimiser le placement
        const jobs = [
            { script: "/wk/w.js", threads: t.w1Threads, delay: w1D, id: "-w1" },
            { script: "/wk/w.js", threads: t.w2Threads, delay: w2D, id: "-w2" },
            { script: "/wk/g.js", threads: t.gThreads, delay: gD, id: "-g" },
            { script: "/wk/h.js", threads: t.hThreads, delay: hD, id: "-h" }
        ].sort((a, b) => b.threads - a.threads);

        let servers = getServers(ns);
        let batchDeployed = true;

        // Allocation FRAGMENTÉE : On place chaque script individuellement sur le réseau
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
                    break; // Job casé, on passe au job suivant
                }
            }
            if (!placed) {
                batchDeployed = false; // Réseau saturé, impossible de placer ce composant
                break; // On annule le déploiement du reste du batch
            }
        }

        if (batchDeployed) {
            batchId++;
            // LE SECRET EST ICI : On attend 200ms avant le prochain batch pour isoler les vagues
            await ns.sleep(batchSpacer); 
        } else {
            // Le réseau est plein à craquer. On attend qu'un vieux batch finisse de libérer sa RAM.
            await ns.sleep(1000); 
        }
    }
}

function getServers(ns) {
    let res = [];
    let stack = ["home"];
    let visited = new Set();
    while(stack.length > 0) {
        let node = stack.pop();
        if (!visited.has(node)) {
            visited.add(node);
            // On ne garde que les serveurs rootés qui ont physiquement de la RAM
            if (ns.hasRootAccess(node) && ns.getServerMaxRam(node) > 0) res.push(node);
            ns.scan(node).forEach(s => stack.push(s));
        }
    }
    // On trie les serveurs par taille (Les plus gros d'abord, pour limiter la fragmentation)
    return res.sort((a, b) => {
        if (a === "home") return 1;
        if (b === "home") return -1;
        return ns.getServerMaxRam(b) - ns.getServerMaxRam(a);
    });
}