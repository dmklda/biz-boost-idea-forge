import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SubscriptionStatus: React.FC = () => {
  const { t } = useTranslation();
  const {
    subscribed,
    subscription_tier,
    subscription_end,
    isLoading,
    checkSubscription,
    createCustomerPortalSession
  } = useSubscription();

  const formatEndDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getTierDisplayName = (tier: string | null) => {
    switch (tier) {
      case 'entrepreneur': return 'Empreendedor';
      case 'business': return 'Empresarial';
      default: return 'Gratuito';
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'entrepreneur': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'business': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>Status da Assinatura</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSubscription}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Gerencie sua assinatura e acesse recursos premium
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plano Atual:</span>
          <Badge 
            variant="secondary" 
            className={`${getTierColor(subscription_tier)} text-white px-3 py-1`}
          >
            {getTierDisplayName(subscription_tier)}
          </Badge>
        </div>

        {subscribed && subscription_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Renovação:</span>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatEndDate(subscription_end)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={subscribed ? "default" : "secondary"}>
            {subscribed ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        <div className="pt-4 space-y-2">
          {subscribed ? (
            <Button 
              onClick={createCustomerPortalSession}
              className="w-full"
              variant="outline"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Gerenciar Assinatura
            </Button>
          ) : (
            <Button asChild className="w-full">
              <a href="/planos">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </a>
            </Button>
          )}
        </div>

        {/* Debug panel for development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Debug Info
            </summary>
            <pre className="text-xs mt-2 p-2 bg-muted rounded">
              {JSON.stringify({ subscribed, subscription_tier, subscription_end }, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};