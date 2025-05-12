
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

// Tipagem para transações
interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  idea?: string;
}

export const TransactionsCard = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  // Buscar histórico de transações
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!authState.isAuthenticated) return;

      try {
        setLoadingTransactions(true);
        
        // Buscar transações do usuário
        const { data: transactionData, error: transactionError } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', authState.user?.id)
          .order('created_at', { ascending: false });
          
        if (transactionError) {
          throw transactionError;
        }

        // Buscar ideias para mapear com as transações
        const { data: ideas, error: ideasError } = await supabase
          .from('ideas')
          .select('id, title')
          .eq('user_id', authState.user?.id);
          
        if (ideasError) {
          console.error("Error fetching ideas:", ideasError);
        }

        // Mapeamento de ideias por ID
        const ideaMap = new Map();
        if (ideas) {
          ideas.forEach((idea) => {
            ideaMap.set(idea.id, idea.title);
          });
        }

        // Formatar transações
        const formattedTransactions: Transaction[] = transactionData.map((transaction) => {
          // Determinar se é uma compra ou uso
          const isPositive = transaction.amount > 0;
          const type = isPositive ? t("credits.transactions.purchase") : t("credits.transactions.usage");
          
          // Tentar associar com uma ideia se for "Uso"
          let ideaInfo = undefined;
          if (!isPositive && transaction.description.includes("Análise de ideia:")) {
            const ideaId = transaction.description.split(":")[1].trim();
            ideaInfo = ideaMap.get(ideaId);
          }

          return {
            id: transaction.id,
            type,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.created_at,
            idea: ideaInfo
          };
        });

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [authState.isAuthenticated, authState.user?.id, t]);

  // Renderização condicional para transações
  const renderTransactions = () => {
    if (loadingTransactions) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            {t("credits.transactions.loading")}
          </TableCell>
        </TableRow>
      );
    }

    if (transactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            {t("credits.transactions.noTransactions")}
          </TableCell>
        </TableRow>
      );
    }

    return transactions.map((transaction) => (
      <TableRow key={transaction.id}>
        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
        <TableCell>{transaction.type}</TableCell>
        <TableCell>{transaction.idea || transaction.description || "-"}</TableCell>
        <TableCell className={`text-right ${
          transaction.amount > 0 ? "text-green-500" : "text-red-500"
        }`}>
          {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
        </TableCell>
      </TableRow>
    ));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("credits.transactions.title")}</CardTitle>
        <CardDescription>
          {t("credits.transactions.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("credits.transactions.date")}</TableHead>
              <TableHead>{t("credits.transactions.type")}</TableHead>
              <TableHead>{t("credits.transactions.details")}</TableHead>
              <TableHead className="text-right">{t("credits.transactions.amount")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTransactions()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
