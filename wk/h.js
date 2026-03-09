/**
 * @module  Worker-Hack
 * @author  BitCodeBurnerGamer / NeonWeaver Corp.
 * @version 1.0.0
 * @desc    Exécute un Hack avec délai millimétré pour le batching.
 */
export async function main(ns) {
    const [target, delay, id] = ns.args;
    if (delay > 0) await ns.sleep(delay);
    await ns.hack(target);
}