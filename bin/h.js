/** @param {NS} ns */
export async function main(ns) {
    // args[0] = cible, args[1] = id unique (pour éviter que le jeu groupe les threads)
    await ns.hack(ns.args[0]);
}