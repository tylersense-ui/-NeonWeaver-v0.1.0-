/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail(); // La bonne fonction !
    const GITHUB_USER = "tylersense-ui";
    const REPO = "-NeonWeaver-v0.1.0-";
    const BRANCH = "main";
    const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/${BRANCH}/`;

    ns.print(" \x1b[38;5;208m[🌐] Connexion au dépôt GitHub NeonWeaver...");
    try {
        const manifestRaw = await ns.wget(BASE_URL + "manifest.txt", "manifest_temp.txt");
        if (!manifestRaw) throw new Error("Impossible de lire le manifest.");
        const manifest = ns.read("manifest_temp.txt").split("\n").filter(f => f.trim() !== "");
        for (const file of manifest) {
            ns.print(` \x1b[38;5;33m[📥] Téléchargement : ${file}...`);
            await ns.wget(BASE_URL + file.trim(), file.trim());
        }
        ns.rm("manifest_temp.txt");
        ns.toast("NeonWeaver synchronisé !", "success");
        ns.print(" \x1b[38;5;118m[✔️] Framework synchronisé avec succès.\x1b[0m");
    } catch (e) {
        ns.print(" \x1b[38;5;196m[❌] Erreur de mise à jour : " + e);
    }
}