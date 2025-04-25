
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";

const languages = {
  pt: "Português",
  en: "English",
  es: "Español",
  ja: "日本語",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code: string) => {
    // Alterando o idioma programaticamente
    i18n.changeLanguage(code);
    // Armazenando a preferência do usuário
    localStorage.setItem("i18nextLng", code);
    // Força um reload para garantir que todos os componentes sejam atualizados corretamente
    window.location.reload();
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
            className={i18n.language.startsWith(code) ? "bg-accent" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
