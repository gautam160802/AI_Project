const STORAGE_KEY = "mindvault-theme";

export function initTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme = stored === "dark" || stored === "light" ? stored : "light";
    document.documentElement.setAttribute("data-theme", theme);
}
