
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreditConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isReanalyzing?: boolean;
}

export const CreditConfirmModal: React.FC<CreditConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isReanalyzing = false
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('credits.confirmTitle', 'Confirmar uso de créditos')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isReanalyzing
            ? t('credits.confirmReanalyze', 'Esta ação irá deduzir 1 crédito da sua conta. Deseja continuar?')
            : t('credits.confirmBasicAnalysis', 'Esta ação irá deduzir 1 crédito da sua conta (exceto se for sua primeira análise gratuita). Deseja continuar?')}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={onConfirm}>
            {t('common.confirm', 'Confirmar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
