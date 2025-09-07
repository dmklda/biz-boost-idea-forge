import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface ToolModalBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon: ReactNode;
  isLoading?: boolean;
  isGenerating?: boolean;
  generatingText?: string;
  actionText?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  resetText?: string;
  onReset?: () => void;
  showReset?: boolean;
  creditCost?: number;
  children: ReactNode;
  maxWidth?: string;
  showCreditWarning?: boolean;
}

export const ToolModalBase: React.FC<ToolModalBaseProps> = ({
  open,
  onOpenChange,
  title,
  icon,
  isLoading = false,
  isGenerating = false,
  generatingText,
  actionText = "Gerar",
  onAction,
  actionDisabled = false,
  resetText = "Resetar",
  onReset,
  showReset = false,
  creditCost = 0,
  children,
  maxWidth = "4xl",
  showCreditWarning = true,
}) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const user = authState.user;
  const hasEnoughCredits = user && user.credits >= creditCost;
  
  // Set default value for generatingText using translation
  const defaultGeneratingText = t("tools.generating", "Gerando...");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-[95vw] max-w-${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t("common.loading", "Carregando...")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {children}

            {onAction && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={onAction}
                  disabled={actionDisabled || isGenerating || (creditCost > 0 && !hasEnoughCredits)}
                  className="flex-1 sm:flex-none flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {generatingText || defaultGeneratingText}
                    </>
                  ) : (
                    <>
                      {icon}
                      {actionText}
                      {creditCost > 0 && ` (${creditCost} créditos)`}
                    </>
                  )}
                </Button>

                {showReset && onReset && (
                  <Button
                    variant="outline"
                    onClick={onReset}
                    className="flex-1 sm:flex-none"
                  >
                    {resetText}
                  </Button>
                )}
              </div>
            )}

            {creditCost > 0 && showCreditWarning && (
              <Card className="border-brand-purple/20 mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-brand-purple">💳</span>
                    {t("tools.toolCost", "Custo da Ferramenta")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: t("tools.toolCostDescription", "Esta ferramenta consome <strong>{{cost}} créditos</strong> por uso. Você possui <strong>{{available}} créditos</strong> disponíveis.", {
                        cost: creditCost,
                        available: user?.credits || 0
                      })
                    }}
                  />

                  {!hasEnoughCredits && (
                    <div className="mt-2">
                      <p className="text-sm text-destructive">
                        {t("tools.notEnoughCredits", "Créditos insuficientes.")}{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-sm"
                          onClick={() => window.location.href = "/dashboard/configuracoes?tab=credits"}
                        >
                          {t("tools.buyMoreCredits", "Comprar mais créditos")}
                        </Button>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};