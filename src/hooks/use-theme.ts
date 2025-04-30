
import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  // Usamos uma função para inicialização para garantir que só execute no cliente
  const [theme, setTheme] = useState<Theme>(() => {
    // Verifica se está no navegador
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return savedTheme || "system";
    }
    return "system";
  });

  // Função para aplicar o tema no DOM
  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    
    root.classList.remove("light", "dark");
    
    if (newTheme === "system") {
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  // Efeito para aplicar o tema quando mudar
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Ouvinte para mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return { theme, setTheme };
}
