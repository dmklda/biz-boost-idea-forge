
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { useEffect, useState } from "react";

const languages = {
  pt: "Português",
  en: "English",
  es: "Español",
  ja: "日本語",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  useEffect(() => {
    // Update state when i18n.language changes
    setCurrentLang(i18n.language || 'en');
  }, [i18n.language]);

  const handleLanguageChange = (code: string) => {
    console.log("Changing language to:", code);
    if (code === currentLang) {
      console.log("Language already set to", code);
      return;
    }
    
    // Changing the language programmatically
    i18n.changeLanguage(code);
    
    // Storing user preference
    localStorage.setItem("i18nextLng", code);
    
    // Updating local state
    setCurrentLang(code);
    
    // Reloading the page to ensure all translations are applied
    window.location.reload();
  };

  // Helper function to check if language code matches current language
  const isCurrentLanguage = (code: string): boolean => {
    if (!currentLang) return code === 'en'; // Default to English if no language set
    return currentLang.startsWith(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={isCurrentLanguage(code) ? "bg-accent" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
