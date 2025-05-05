
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// Tipagem para pacotes de créditos
interface CreditPackage {
  id: number;
  amount: number;
  price: string;
  savings: string;
}

// Tipagem para transações
interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  idea?: string;
}

// Pacotes de crédito disponíveis
const creditPackages: CreditPackage[] = [
  { id: 1, amount: 5, price: "R$24,90", savings: "" },
  { id: 2, amount: 10, price: "R$44,90", savings: "10% de desconto" },
  { id: 3, amount: 25, price: "R$99,90", savings: "20% de desconto" },
];

const CreditsPage = () => {
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [isLoading, setIsLoading] = useState<number | null>(null);
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
          const type = isPositive ? "Compra" : "Uso";
          
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
        toast.error("Erro ao carregar histórico de transações");
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [authState.isAuthenticated, authState.user?.id]);
  
  const handleBuyCredits = async (packageId: number, amount: number) => {
    if (!user) return;
    
    // Em um app real, isso redirecionaria para um gateway de pagamento
    setIsLoading(packageId);
    
    try {
      // Calcular novo valor de créditos
      const newCredits = user.credits + amount;
      
      // Chamada para atualizar créditos
      updateUserCredits(newCredits);
      
      toast.success(`${amount} créditos adicionados com sucesso!`);
    } catch (error) {
      console.error("Error buying credits:", error);
      toast.error("Erro ao adicionar créditos");
    } finally {
      setIsLoading(null);
    }
  };

  // Renderização condicional para transações
  const renderTransactions = () => {
    if (loadingTransactions) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            Carregando histórico de transações...
          </TableCell>
        </TableRow>
      );
    }

    if (transactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            Nenhuma transação encontrada.
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Créditos</h1>
        <p className="text-muted-foreground">
          Gerencie seus créditos para análise de ideias
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Créditos Disponíveis</CardTitle>
            <CardDescription>
              Seu saldo atual de créditos para análises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-brand-purple/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-brand-purple" />
              </div>
              <div>
                <div className="text-3xl font-bold">{user?.credits || 0}</div>
                <p className="text-sm text-muted-foreground">
                  {user?.plan === "free" 
                    ? "Plano Free (3 créditos/mês)" 
                    : "Plano Pro (créditos ilimitados)"}
                </p>
              </div>
            </div>
          </CardContent>
          {user?.plan === "free" && (
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="/planos">Fazer upgrade para o plano Pro</a>
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Comprar Créditos</CardTitle>
            <CardDescription>
              Adquira mais créditos para análises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {creditPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="flex items-center justify-between p-4 border rounded-md hover:border-brand-purple/50 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium">{pkg.amount} créditos</div>
                  <div className="text-sm text-muted-foreground">{pkg.price}</div>
                  {pkg.savings && (
                    <div className="text-xs text-green-500 mt-1">{pkg.savings}</div>
                  )}
                </div>
                <Button 
                  onClick={() => handleBuyCredits(pkg.id, pkg.amount)}
                  disabled={isLoading === pkg.id}
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  {isLoading === pkg.id ? (
                    "Processando..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Comprar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Seu histórico de compra e uso de créditos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTransactions()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditsPage;
