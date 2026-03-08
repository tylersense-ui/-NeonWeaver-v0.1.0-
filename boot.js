/** * Framework NeonWeaver v0.1.0 - Script d'Amorçage
 * @param {NS} ns 
 */
export async function main(ns) {
    ns.clearLog();
    const version = "v0.1.0";
    const frameworkName = "NeonWeaver";

    // Un peu de style pour notre console
    const ascii = `
\x1b[38;5;51m     _   _                  _    _
    | \\ | |                | |  | |
    |  \\| | ___  ___  _ __ | |  | | ___  __ ___   _____ _ __
    | . \` |/ _ \\/ _ \\| '_ \\| |/\\| |/ _ \\/ _\` \\ \\ / / _ \\ '__|
    | |\\  |  __/ (_) | | | \\  /\\  /  __/ (_| |\\ V /  __/ |
    \\_| \\_/\\___|\\___/|_| |_|\\/  \\/ \\___|\\__,_| \\_/ \\___|_| \x1b[0m
    `;

    ns.tprint(ascii);
    ns.tprint(`\x1b[38;5;118m[🚀] Séquence de boot de ${frameworkName} ${version} initiée...\x1b[0m`);
    
    // Notification in-game stylée
    ns.toast(`👾 ${frameworkName} ${version} en ligne !`, "success", 5000);

    // Initialisation de la mémoire persistante
    const states = [
        "/state/world-state.json",
        "/state/progress-state.json",
        "/state/telemetry-state.json",
        "/state/strategy-state.json"
    ];

    const initialState = {
        initializedAt: new Date().toISOString(),
        version: version,
        status: "BOOTING"
    };

    ns.tprint(`\x1b[38;5;13m[⚙️] Vérification de l'intégrité de la mémoire persistante...\x1b[0m`);

    for (const file of states) {
        // ns.write en mode "w" crée le fichier ou l'écrase
        if (!ns.fileExists(file)) {
            ns.write(file, JSON.stringify(initialState, null, 2), "w");
            ns.tprint(`\x1b[38;5;14m  [+] Fichier de mémoire créé : ${file}\x1b[0m`);
        } else {
            ns.tprint(`\x1b[38;5;220m  [~] Fichier de mémoire détecté (existant) : ${file}\x1b[0m`);
        }
    }

    ns.tprint(`\x1b[38;5;118m[✔️] Framework initialisé avec succès. En attente de la directive d'infection.\x1b[0m`);
}