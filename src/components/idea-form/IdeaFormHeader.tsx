
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

type IdeaFormHeaderProps = {
  isReanalyzing?: boolean;
};

export const IdeaFormHeader: React.FC<IdeaFormHeaderProps> = ({ isReanalyzing }) => {
  const { t } = useTranslation();

  return (
    <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-purple rounded-t-lg">
      <CardTitle className="text-white text-2xl font-poppins">
        {isReanalyzing 
          ? t('ideaForm.reanalyzeTitle', "Reanálise de Ideia") 
          : t('ideaForm.title', "Análise de Negócio")}
      </CardTitle>
      <CardDescription className="text-white/80 font-inter">
        {isReanalyzing 
          ? t('ideaForm.reanalyzeSubtitle', "Refine sua ideia para uma nova análise")
          : t('ideaForm.subtitle', "Vamos analisar sua ideia de negócio")}
      </CardDescription>
    </CardHeader>
  );
};
