
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Mock credit package options
const creditPackages = [
  { id: 1, amount: 5, price: "R$24,90", savings: "" },
  { id: 2, amount: 10, price: "R$44,90", savings: "10% de desconto" },
  { id: 3, amount: 25, price: "R$99,90", savings: "20% de desconto" },
];

// Mock transaction history
const transactions = [
  { id: 1, type: "Compra", amount: 5, date: "2023-05-01" },
  { id: 2, type: "Uso", amount: -1, date: "2023-04-28", idea: "App de entrega de comida saudável" },
  { id: 3, type: "Uso", amount: -1, date: "2023-04-25", idea: "Plataforma de educação online" },
];

const CreditsPage = () => {
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [isLoading, setIsLoading] = useState<number | null>(null);
  
  const handleBuyCredits = (packageId: number, amount: number) => {
    // In a real app, this would redirect to a payment gateway
    // For demo purposes, we'll just add credits directly
    setIsLoading(packageId);
    
    setTimeout(() => {
      if (user) {
        updateUserCredits(user.credits + amount);
        toast.success(`${amount} créditos adicionados com sucesso!`);
      }
      setIsLoading(null);
    }, 1500);
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
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.idea || "-"}</TableCell>
                  <TableCell className={`text-right ${
                    transaction.amount > 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditsPage;
