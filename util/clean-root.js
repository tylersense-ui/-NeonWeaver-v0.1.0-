/** * Framework NeonWeaver - Root Cleaner
 * Utilitaire de purge pour maintenir une architecture propre.
 * @param {NS} ns 
 */
export async function main(ns) {
    ns.tprint("\x1b[38;5;208m[🧹] Lancement du protocole de nettoyage de la racine...\x1b[0m");
    
    const allFiles = ns.ls("home");
    let deletedCount = 0;

    // Fichiers intouchables à la racine
    const protectedFiles = [
        "neonweaver-update.js" // Notre lien de synchronisation vital
    ];

    for (const file of allFiles) {
        // On cible uniquement les fichiers sans '/' (donc à la racine) et qui sont des scripts
        if (!file.includes("/") && (file.endsWith(".js") || file.endsWith(".script") || file.endsWith(".ns"))) {
            if (!protectedFiles.includes(file)) {
                ns.rm(file, "home");
                ns.tprint(`\x1b[38;5;196m  [-] Fichier purgé : ${file}\x1b[0m`);
                deletedCount++;
            }
        }
    }

    if (deletedCount === 0) {
        ns.tprint(`\x1b[38;5;118m[✨] La racine est déjà propre. Aucun fichier supprimé.\x1b[0m`);
    } else {
        ns.tprint(`\x1b[38;5;118m[✔️] Nettoyage terminé. ${deletedCount} fichier(s) désintégré(s).\x1b[0m`);
    }
}