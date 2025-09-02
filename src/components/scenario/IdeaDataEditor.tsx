import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { formatCurrency, getRevenueModelDisplayName } from "@/lib/utils";

interface IdeaData {
  title: string;
  description: string;
  monetization: string;
  target_market_size: number;
  initial_investment: number;
  monthly_costs: number;
  revenue_model: string;
  pricing: number;
}

interface IdeaDataEditorProps {
  ideaData: IdeaData;
  onSave: (data: IdeaData) => void;
  isCustomSimulation?: boolean;
  allowEdit?: boolean;
}

const IdeaDataEditor = ({ ideaData, onSave, isCustomSimulation = false, allowEdit = true }: IdeaDataEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<IdeaData>(ideaData);

  // Atualiza editData quando ideaData muda
  useEffect(() => {
    setEditData(ideaData);
  }, [ideaData]);

  const handleSave = () => {
    // Validações
    if (!editData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (editData.initial_investment <= 0) {
      toast.error('Investimento inicial deve ser maior que zero');
      return;
    }
    
    if (editData.monthly_costs <= 0) {
      toast.error('Custos mensais devem ser maiores que zero');
      return;
    }
    
    if (editData.pricing <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    onSave(editData);
    setIsEditing(false);
    toast.success('Dados atualizados com sucesso!');
  };

  const handleCancel = () => {
    setEditData(ideaData);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{ideaData.title}</CardTitle>
              <CardDescription>Dados da simulação</CardDescription>
            </div>
            {allowEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Investimento Inicial
              </Label>
              <p className="text-lg font-semibold">{formatCurrency(ideaData.initial_investment)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Custos Mensais
              </Label>
              <p className="text-lg font-semibold">{formatCurrency(ideaData.monthly_costs)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Preço do Produto
              </Label>
              <p className="text-lg font-semibold">{formatCurrency(ideaData.pricing)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tamanho do Mercado
              </Label>
              <p className="text-lg font-semibold">{ideaData.target_market_size.toLocaleString()}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Descrição
            </Label>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              {ideaData.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Modelo de Receita
              </Label>
              <p className="text-sm font-medium">{getRevenueModelDisplayName(ideaData.revenue_model)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Monetização
              </Label>
              <p className="text-sm font-medium">{ideaData.monetization}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Editar Dados da Simulação</CardTitle>
            <CardDescription>Ajuste os parâmetros financeiros</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Título da Ideia</Label>
          <Input
            id="title"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Digite o título da ideia"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Descreva sua ideia de negócio"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="initial_investment">Investimento Inicial (R$)</Label>
            <Input
              id="initial_investment"
              type="number"
              value={editData.initial_investment}
              onChange={(e) => setEditData({ ...editData, initial_investment: parseFloat(e.target.value) || 0 })}
              placeholder="100000"
            />
          </div>
          <div>
            <Label htmlFor="monthly_costs">Custos Mensais (R$)</Label>
            <Input
              id="monthly_costs"
              type="number"
              value={editData.monthly_costs}
              onChange={(e) => setEditData({ ...editData, monthly_costs: parseFloat(e.target.value) || 0 })}
              placeholder="10000"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pricing">Preço do Produto (R$)</Label>
            <Input
              id="pricing"
              type="number"
              value={editData.pricing}
              onChange={(e) => setEditData({ ...editData, pricing: parseFloat(e.target.value) || 0 })}
              placeholder="99"
            />
          </div>
          <div>
            <Label htmlFor="target_market_size">Tamanho do Mercado</Label>
            <Input
              id="target_market_size"
              type="number"
              value={editData.target_market_size}
              onChange={(e) => setEditData({ ...editData, target_market_size: parseFloat(e.target.value) || 0 })}
              placeholder="1000000"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="revenue_model">Modelo de Receita</Label>
            <Select 
              value={editData.revenue_model} 
              onValueChange={(value) => setEditData({ ...editData, revenue_model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscription">Assinatura</SelectItem>
                <SelectItem value="one_time">Pagamento único</SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="advertising">Publicidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="monetization">Estratégia de Monetização</Label>
            <Input
              id="monetization"
              value={editData.monetization}
              onChange={(e) => setEditData({ ...editData, monetization: e.target.value })}
              placeholder="SaaS, E-commerce, etc."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaDataEditor;