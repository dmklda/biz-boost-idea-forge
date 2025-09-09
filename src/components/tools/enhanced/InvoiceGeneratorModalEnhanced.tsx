import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Receipt, 
  Download, 
  Eye, 
  QrCode,
  FileText,
  CreditCard,
  Calendar,
  Printer,
  Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InvoiceGeneratorModalEnhancedProps {
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
    logo?: string;
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
  qr_code_data?: string;
  payment_link?: string;
  bank_info?: {
    bank_name: string;
    account_number: string;
    branch: string;
    pix_key?: string;
  };
}

export const InvoiceGeneratorModalEnhanced: React.FC<InvoiceGeneratorModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<InvoiceData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("form");
  
  // Formulário com campos adicionais
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_tax_id: '',
    company_contact: '',
    company_logo: '',
    client_name: '',
    client_address: '',
    client_tax_id: '',
    client_contact: '',
    services: '',
    payment_terms: '',
    tax_rate: '',
    notes: '',
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    bank_name: '',
    account_number: '',
    branch: '',
    pix_key: '',
    include_qr_code: true,
    payment_link: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!formData.company_name.trim() || !formData.client_name.trim()) {
      toast.error("Por favor, preencha pelo menos o nome da empresa e do cliente");
      return;
    }

    // Check credits
    if (!hasCredits('invoice-generator')) {
      toast.error(`Você precisa de ${getFeatureCost('invoice-generator')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Deduct credits first
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('invoice-generator'),
        p_feature: 'invoice-generator',
        p_description: `Fatura gerada para: ${formData.client_name}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Generate invoice
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: {
          ...formData,
          include_qr_code: formData.include_qr_code
        }
      });

      if (error) throw error;

      // Se chegou aqui, use os dados reais
      setResults(data);
      setActiveTab("preview");
      toast.success("Fatura gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      toast.error("Erro ao gerar fatura. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setActiveTab("form");
    setFormData({
      company_name: '',
      company_address: '',
      company_tax_id: '',
      company_contact: '',
      company_logo: '',
      client_name: '',
      client_address: '',
      client_tax_id: '',
      client_contact: '',
      services: '',
      payment_terms: '',
      tax_rate: '',
      notes: '',
      due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      bank_name: '',
      account_number: '',
      branch: '',
      pix_key: '',
      include_qr_code: true,
      payment_link: ''
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

  const handlePrint = () => {
    if (!results?.html_template) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(results.html_template);
      printWindow.document.close();
      printWindow.onload = function() {
        printWindow.print();
      };
    }
  };

  const handlePreview = () => {
    if (!results?.html_template) return;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(results.html_template);
      newWindow.document.close();
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  // Icon for the modal
  const invoiceIcon = <Receipt className="h-5 w-5" />;

  // Renderização do formulário
  const renderForm = () => {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="client">Cliente</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="company" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa *</Label>
                <Input
                  id="company_name"
                  placeholder="Nome da sua empresa"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Endereço</Label>
                <Textarea
                  id="company_address"
                  placeholder="Endereço completo da empresa"
                  value={formData.company_address}
                  onChange={(e) => handleInputChange('company_address', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_tax_id">CNPJ/CPF</Label>
                <Input
                  id="company_tax_id"
                  placeholder="CNPJ ou CPF da empresa"
                  value={formData.company_tax_id}
                  onChange={(e) => handleInputChange('company_tax_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_contact">Contato</Label>
                <Input
                  id="company_contact"
                  placeholder="Email e telefone"
                  value={formData.company_contact}
                  onChange={(e) => handleInputChange('company_contact', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_logo">URL do Logo (opcional)</Label>
                <Input
                  id="company_logo"
                  placeholder="https://exemplo.com/logo.png"
                  value={formData.company_logo}
                  onChange={(e) => handleInputChange('company_logo', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="client" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Nome do Cliente *</Label>
                <Input
                  id="client_name"
                  placeholder="Nome do cliente"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_address">Endereço</Label>
                <Textarea
                  id="client_address"
                  placeholder="Endereço completo do cliente"
                  value={formData.client_address}
                  onChange={(e) => handleInputChange('client_address', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_tax_id">CNPJ/CPF</Label>
                <Input
                  id="client_tax_id"
                  placeholder="CNPJ ou CPF do cliente"
                  value={formData.client_tax_id}
                  onChange={(e) => handleInputChange('client_tax_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_contact">Contato</Label>
                <Input
                  id="client_contact"
                  placeholder="Email e telefone"
                  value={formData.client_contact}
                  onChange={(e) => handleInputChange('client_contact', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="services">Serviços/Produtos *</Label>
                <Textarea
                  id="services"
                  placeholder="Descreva os serviços ou produtos com valores. Ex: Consultoria (10h x R$ 100/h), Produto A (2 unidades x R$ 50)"
                  value={formData.services}
                  onChange={(e) => handleInputChange('services', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Taxa de Imposto (%)</Label>
                  <Input
                    id="tax_rate"
                    placeholder="Ex: 10"
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Condições de Pagamento</Label>
                <Input
                  id="payment_terms"
                  placeholder="Ex: 30 dias, À vista"
                  value={formData.payment_terms}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="include_qr_code"
                  checked={formData.include_qr_code}
                  onChange={(e) => handleInputChange('include_qr_code', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="include_qr_code" className="text-sm font-medium">Incluir QR Code para pagamento</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Nome do Banco</Label>
                <Input
                  id="bank_name"
                  placeholder="Ex: Banco do Brasil"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Número da Conta</Label>
                  <Input
                    id="account_number"
                    placeholder="Ex: 12345-6"
                    value={formData.account_number}
                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Agência</Label>
                  <Input
                    id="branch"
                    placeholder="Ex: 1234"
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  placeholder="Ex: email@exemplo.com ou CPF/CNPJ"
                  value={formData.pix_key}
                  onChange={(e) => handleInputChange('pix_key', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_link">Link de Pagamento (opcional)</Label>
                <Input
                  id="payment_link"
                  placeholder="Ex: https://pagseguro.com.br/..."
                  value={formData.payment_link}
                  onChange={(e) => handleInputChange('payment_link', e.target.value)}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  };

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Fatura #{results.invoice_number}</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Visualizar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Baixar</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="items">Itens</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="summary" className="space-y-4 pr-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">{results.company_info?.name}</p>
                      <p className="text-muted-foreground">{results.company_info?.address}</p>
                      <p className="text-muted-foreground">CNPJ/CPF: {results.company_info?.tax_id}</p>
                      <p className="text-muted-foreground">{results.company_info?.contact}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">{results.client_info?.name}</p>
                      <p className="text-muted-foreground">{results.client_info?.address}</p>
                      <p className="text-muted-foreground">CNPJ/CPF: {results.client_info?.tax_id}</p>
                      <p className="text-muted-foreground">{results.client_info?.contact}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detalhes da Fatura</CardTitle>
                </CardHeader>
                <CardContent>
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

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {results.subtotal?.toFixed(2)}</span>
                    </div>
                    {results.tax_amount > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Impostos ({results.tax_rate}%):</span>
                        <span>R$ {results.tax_amount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>R$ {results.total?.toFixed(2)}</span>
                    </div>
                  </div>

                  {results.payment_terms && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium text-sm mb-1">Condições de Pagamento:</h5>
                      <p className="text-sm text-muted-foreground">{results.payment_terms}</p>
                    </div>
                  )}

                  {results.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium text-sm mb-1">Observações:</h5>
                      <p className="text-sm text-muted-foreground">{results.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 pr-4 pt-4">
              {results.items?.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Itens da Fatura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b pb-3">
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
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item encontrado na fatura.
                </div>
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 pr-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Informações de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.bank_info ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Banco:</h5>
                          <p className="text-sm">{results.bank_info.bank_name}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Agência:</h5>
                          <p className="text-sm">{results.bank_info.branch}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-1">Conta:</h5>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{results.bank_info.account_number}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => copyToClipboard(results.bank_info?.account_number || '', 'Número da conta copiado!')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {results.bank_info.pix_key && (
                        <div>
                          <h5 className="font-medium text-sm mb-1">Chave PIX:</h5>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">{results.bank_info.pix_key}</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => copyToClipboard(results.bank_info?.pix_key || '', 'Chave PIX copiada!')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma informação bancária disponível.</p>
                  )}
                  
                  {results.payment_link && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium text-sm mb-2">Link de Pagamento:</h5>
                      <div className="flex items-center gap-2">
                        <a 
                          href={results.payment_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {results.payment_link}
                        </a>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(results.payment_link || '', 'Link de pagamento copiado!')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium text-sm mb-1">Vencimento:</h5>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{results.due_date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qrcode" className="space-y-4 pr-4 pt-4">
              {results.qr_code_data ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      QR Code para Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <img 
                        src={results.qr_code_data} 
                        alt="QR Code para pagamento" 
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground max-w-md">
                      Escaneie o QR Code acima com o aplicativo do seu banco para realizar o pagamento via PIX.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4" 
                      onClick={() => {
                        // Baixar o QR Code como imagem
                        const link = document.createElement('a');
                        link.href = results.qr_code_data || '';
                        link.download = `qrcode_fatura_${results.invoice_number}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar QR Code
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  QR Code não disponível para esta fatura.
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Faturas"
      icon={invoiceIcon}
      isGenerating={isGenerating}
      generatingText="Gerando fatura..."
      actionText="Gerar Fatura"
      onAction={handleGenerate}
      actionDisabled={isGenerating || !formData.company_name.trim() || !formData.client_name.trim() || !hasCredits('invoice-generator')}
      resetText="Nova Fatura"
      onReset={handleReset}
      showReset={!!results}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('invoice-generator')}
    >
      <div className="space-y-6">
        {activeTab === "form" ? (
          <CreditGuard feature="invoice-generator">
            {renderForm()}
          </CreditGuard>
        ) : (
          renderGeneratedContent()
        )}
      </div>
    </ToolModalBase>
  );
};