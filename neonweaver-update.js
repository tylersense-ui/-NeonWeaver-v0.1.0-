/** @param {NS} ns */
export async function main(ns) {
    const GITHUB_USER = "tylersense-ui"; // OK
    const REPO = "-NeonWeaver-v0.1.0-";  // OK
    const BRANCH = "main";
    const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/${BRANCH}/`;

    ns.tprint(" \x1b[38;5;208m[🌐] Connexion au dépôt GitHub NeonWeaver...");

    try {
        const manifestRaw = await ns.wget(BASE_URL + "manifest.txt", "manifest_temp.txt");
        if (!manifestRaw) throw new Error("Impossible de lire le manifest.");

        const manifest = ns.read("manifest_temp.txt").split("\n").filter(f => f.trim() !== "");
        
        for (const file of manifest) {
            ns.tprint(` \x1b[38;5;33m[📥] Téléchargement : ${file}...`);
            await ns.wget(BASE_URL + file.trim(), file.trim());
        }

        ns.rm("manifest_temp.txt");
        ns.toast("Mise à jour NeonWeaver terminée !", "success");
        ns.tprint(" \x1b[38;5;118m[✔️] Framework synchronisé avec succès.");
    } catch (e) {
        ns.tprint(" \x1b[38;5;196m[❌] Erreur de mise à jour : " + e);
    }
}