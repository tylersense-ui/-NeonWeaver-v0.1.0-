/**
 * @module  Worker-Grow
 * @author  BitCodeBurnerGamer / NeonWeaver Corp.
 * @version 1.0.0
 * @desc    Exécute un Grow avec délai millimétré pour le batching.
 */
export async function main(ns) {
    const [target, delay, id] = ns.args;
    if (delay > 0) await ns.sleep(delay);
    await ns.grow(target);
}