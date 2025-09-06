import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Receipt, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface InvoiceGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  invoice_number: string;
  issue_date: string;
  due_date: string;
  company_info: {
    name: string;
    address: string;
    tax_id: string;
    contact: string;
  };
  client_info: {
    name: string;
    address: string;
    tax_id: string;
    contact: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  payment_terms: string;
  notes: string;
  html_template: string;
}

export const InvoiceGeneratorModal = ({
  open,
  onOpenChange,
}: InvoiceGeneratorModalProps) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<InvoiceData | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_tax_id: '',
    company_contact: '',
    client_name: '',
    client_address: '',
    client_tax_id: '',
    client_contact: '',
    services: '',
    payment_terms: '',
    tax_rate: '',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!authState.user) {
      toast.error("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    if (!formData.company_name.trim() || !formData.client_name.trim()) {
      toast.error("Por favor, preencha pelo menos o nome da empresa e do cliente");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Fatura gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      toast.error("Erro ao gerar fatura. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      company_name: '',
      company_address: '',
      company_tax_id: '',
      company_contact: '',
      client_name: '',
      client_address: '',
      client_tax_id: '',
      client_contact: '',
      services: '',
      payment_terms: '',
      tax_rate: '',
      notes: ''
    });
  };

  const handleDownload = () => {
    if (!results?.html_template) return;

    const blob = new Blob([results.html_template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fatura_${results.invoice_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Fatura baixada com sucesso!");
  };

  const handlePreview = () => {
    if (!results?.html_template) return;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(results.html_template);
      newWindow.document.close();
    }
  };

  const cost = 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Gerador de Faturas
          </DialogTitle>
          <DialogDescription>
            Crie faturas profissionais em HTML para o seu negócio.
            <Badge variant="secondary" className="ml-2">{cost} créditos</Badge>
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Informações da Empresa</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa *</Label>
                  <Input
                    id="company_name"
                    placeholder="Nome da sua empresa"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">Endereço</Label>
                  <Textarea
                    id="company_address"
                    placeholder="Endereço completo da empresa"
                    value={formData.company_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_tax_id">CNPJ/CPF</Label>
                  <Input
                    id="company_tax_id"
                    placeholder="CNPJ ou CPF da empresa"
                    value={formData.company_tax_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_tax_id: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_contact">Contato</Label>
                  <Input
                    id="company_contact"
                    placeholder="Email e telefone"
                    value={formData.company_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_contact: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Informações do Cliente</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="client_name">Nome do Cliente *</Label>
                  <Input
                    id="client_name"
                    placeholder="Nome do cliente"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_address">Endereço</Label>
                  <Textarea
                    id="client_address"
                    placeholder="Endereço completo do cliente"
                    value={formData.client_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_tax_id">CNPJ/CPF</Label>
                  <Input
                    id="client_tax_id"
                    placeholder="CNPJ ou CPF do cliente"
                    value={formData.client_tax_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_tax_id: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_contact">Contato</Label>
                  <Input
                    id="client_contact"
                    placeholder="Email e telefone"
                    value={formData.client_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_contact: e.target.value }))}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold">Detalhes da Fatura</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="services">Serviços/Produtos</Label>
                  <Textarea
                    id="services"
                    placeholder="Descreva os serviços ou produtos com valores. Ex: Consultoria (10h x R$ 100/h), Produto A (2 unidades x R$ 50)"
                    value={formData.services}
                    onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Condições de Pagamento</Label>
                    <Input
                      id="payment_terms"
                      placeholder="Ex: 30 dias, À vista"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Taxa de Imposto (%)</Label>
                    <Input
                      id="tax_rate"
                      placeholder="Ex: 10"
                      type="number"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Input
                      id="notes"
                      placeholder="Observações adicionais"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.company_name.trim() || !formData.client_name.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Fatura...
                </>
              ) : (
                `Gerar Fatura (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Fatura Gerada</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar HTML
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Nova Fatura
                </Button>
              </div>
            </div>

            {/* Resumo da Fatura */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo da Fatura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Dados da Empresa:</h5>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>{results.company_info?.name}</strong></p>
                      <p>{results.company_info?.address}</p>
                      <p>CNPJ/CPF: {results.company_info?.tax_id}</p>
                      <p>{results.company_info?.contact}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Dados do Cliente:</h5>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>{results.client_info?.name}</strong></p>
                      <p>{results.client_info?.address}</p>
                      <p>CNPJ/CPF: {results.client_info?.tax_id}</p>
                      <p>{results.client_info?.contact}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium text-sm mb-2">Detalhes da Fatura:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Número:</span>
                      <p className="font-medium">{results.invoice_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data de Emissão:</span>
                      <p className="font-medium">{results.issue_date}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vencimento:</span>
                      <p className="font-medium">{results.due_date}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium text-lg">R$ {results.total?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {results.items?.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-sm mb-2">Itens:</h5>
                    <div className="space-y-2">
                      {results.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            <p className="text-muted-foreground">
                              {item.quantity} x R$ {item.unit_price?.toFixed(2)}
                            </p>
                          </div>
                          <div className="font-medium">
                            R$ {item.total?.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>R$ {results.subtotal?.toFixed(2)}</span>
                      </div>
                      {results.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span>Impostos ({results.tax_rate}%):</span>
                          <span>R$ {results.tax_amount?.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-base border-t pt-2">
                        <span>Total:</span>
                        <span>R$ {results.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {results.payment_terms && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-sm mb-1">Condições de Pagamento:</h5>
                    <p className="text-sm text-muted-foreground">{results.payment_terms}</p>
                  </div>
                )}

                {results.notes && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-sm mb-1">Observações:</h5>
                    <p className="text-sm text-muted-foreground">{results.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};