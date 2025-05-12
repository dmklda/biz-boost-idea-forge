
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
import { toast } from "../ui/sonner";

const languages = {
  pt: "Português",
  en: "English",
  es: "Español",
  ja: "日本語",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    // Atualiza o estado quando i18n.language muda
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (code: string) => {
    console.log("Changing language to:", code);
    if (code === currentLang) {
      console.log("Language already set to", code);
      return;
    }
    
    // Alterando o idioma programaticamente
    i18n.changeLanguage(code);
    
    // Armazenando a preferência do usuário
    localStorage.setItem("i18nextLng", code);
    
    // Atualizando o estado local
    setCurrentLang(code);
    
    // Mostrar confirmação ao invés de recarregar a página
    toast.success(`Idioma alterado para ${languages[code as keyof typeof languages]}`);
  };

  // Função auxiliar para verificar se o código de idioma corresponde ao idioma atual
  const isCurrentLanguage = (code: string): boolean => {
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
