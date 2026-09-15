import { useTheme } from "./theme.context";
import "./theme-toggle.scss";

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`}
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
        >
            <span className="theme-toggle-icon" aria-hidden="true">
                {isDark ? "☀️" : "🌙"}
            </span>
            <span className="theme-toggle-label">{isDark ? "Light" : "Dark"}</span>
        </button>
    );
};

export default ThemeToggle;
