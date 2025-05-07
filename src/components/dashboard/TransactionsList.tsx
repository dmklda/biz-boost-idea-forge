
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type Transaction = {
  id: string;
  amount: number;
  created_at: string;
  description: string;
};

export const TransactionsList = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!authState.user) return;
      
      try {
        const { data, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', authState.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [authState.user]);

  const getTransactionType = (amount: number) => {
    return amount > 0 ? t('credits.transactions.purchase') : t('credits.transactions.usage');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('credits.transactions.title')}</CardTitle>
        <CardDescription>{t('credits.transactions.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 rounded-full border-2 border-brand-purple border-t-transparent animate-spin"></div>
            <p className="ml-3 text-sm text-muted-foreground">{t('credits.transactions.loading')}</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">{t('credits.transactions.date')}</th>
                  <th className="px-4 py-3 text-left">{t('credits.transactions.type')}</th>
                  <th className="px-4 py-3 text-left">{t('credits.transactions.details')}</th>
                  <th className="px-4 py-3 text-right">{t('credits.transactions.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted">
                    <td className="px-4 py-3 text-left">
                      {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-left">
                      {getTransactionType(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-left">{transaction.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center p-4 text-muted-foreground">{t('credits.transactions.noTransactions')}</p>
        )}
      </CardContent>
    </Card>
  );
};
