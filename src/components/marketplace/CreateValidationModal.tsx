import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplace, ValidationType } from "@/hooks/useMarketplace";
import { toast } from "@/components/ui/sonner";
import { 
  Target, 
  Users, 
  Clock, 
  Award, 
  Calendar as CalendarIcon,
  Lightbulb,
  MessageSquare,
  FileText,
  TestTube,
  Eye,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface CreateValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaId?: string;
}

interface ValidationFormData {
  title: string;
  description: string;
  category: string;
  target_audience: string;
  validation_type: string;
  reward_points: number;
  max_responses: number;
  requirements: string;
  deadline?: Date;
}

const VALIDATION_TYPES = [
  {
    id: 'feedback',
    name: 'Feedback Geral',
    description: 'Obtenha opiniões gerais sobre sua ideia',
    icon: MessageSquare,
    estimatedTime: '10-15 min',
    suggestedPoints: 25
  },
  {
    id: 'survey',
    name: 'Pesquisa Estruturada',
    description: 'Questionário específico com perguntas direcionadas',
    icon: FileText,
    estimatedTime: '15-20 min',
    suggestedPoints: 40
  },
  {
    id: 'interview',
    name: 'Entrevista',
    description: 'Conversa detalhada sobre sua ideia',
    icon: Users,
    estimatedTime: '30-45 min',
    suggestedPoints: 75
  },
  {
    id: 'prototype_test',
    name: 'Teste de Protótipo',
    description: 'Teste de usabilidade de protótipo ou mockup',
    icon: TestTube,
    estimatedTime: '20-30 min',
    suggestedPoints: 60
  },
  {
    id: 'usability_test',
    name: 'Teste de Usabilidade',
    description: 'Avaliação da experiência do usuário',
    icon: Eye,
    estimatedTime: '25-35 min',
    suggestedPoints: 65
  }
];

const CATEGORIES = [
  { id: 'fintech', name: 'FinTech', description: 'Tecnologia financeira' },
  { id: 'healthtech', name: 'HealthTech', description: 'Tecnologia em saúde' },
  { id: 'edtech', name: 'EdTech', description: 'Tecnologia educacional' },
  { id: 'sustainability', name: 'Sustentabilidade', description: 'Soluções sustentáveis' },
  { id: 'ecommerce', name: 'E-commerce', description: 'Comércio eletrônico' },
  { id: 'saas', name: 'SaaS', description: 'Software como serviço' },
  { id: 'marketplace', name: 'Marketplace', description: 'Plataformas de marketplace' },
  { id: 'social', name: 'Social', description: 'Redes sociais e comunidades' },
  { id: 'gaming', name: 'Gaming', description: 'Jogos e entretenimento' },
  { id: 'other', name: 'Outros', description: 'Outras categorias' }
];

export const CreateValidationModal = ({ open, onOpenChange, ideaId }: CreateValidationModalProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { createValidationRequest, createValidationFromIdea } = useMarketplace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [ideaData, setIdeaData] = useState<any>(null);
  const [formData, setFormData] = useState<ValidationFormData>({
    title: '',
    description: '',
    category: '',
    target_audience: '',
    validation_type: '',
    reward_points: 50,
    max_responses: 20,
    requirements: '',
    deadline: undefined
  });

  // Load idea data if ideaId is provided
  React.useEffect(() => {
    const loadIdeaData = async () => {
      if (ideaId) {
        try {
          const { data: idea, error } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', ideaId)
            .single();

          if (error) throw error;

          setIdeaData(idea);
          // Pre-populate form with idea data
          setFormData(prev => ({
            ...prev,
            title: `Validação: ${idea.title}`,
            description: idea.description,
            target_audience: idea.audience || ''
          }));
        } catch (error) {
          console.error('Error loading idea:', error);
        }
      }
    };

    if (open) {
      loadIdeaData();
    }
  }, [ideaId, open]);

  const selectedValidationType = VALIDATION_TYPES.find(type => type.id === formData.validation_type);
  const selectedCategory = CATEGORIES.find(cat => cat.id === formData.category);

  const handleInputChange = (field: keyof ValidationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleValidationTypeSelect = (typeId: string) => {
    const type = VALIDATION_TYPES.find(t => t.id === typeId);
    if (type) {
      setFormData(prev => ({
        ...prev,
        validation_type: typeId,
        reward_points: type.suggestedPoints
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || 
          !formData.target_audience || !formData.validation_type) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (ideaId) {
        await createValidationFromIdea(ideaId, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          target_audience: formData.target_audience,
          validation_type: formData.validation_type as ValidationType,
          reward_points: formData.reward_points,
          max_responses: formData.max_responses,
          requirements: formData.requirements,
          deadline: formData.deadline?.toISOString()
        });
      } else {
        await createValidationRequest({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          target_audience: formData.target_audience,
          validation_type: formData.validation_type as ValidationType,
          reward_points: formData.reward_points,
          max_responses: formData.max_responses,
          requirements: formData.requirements,
          deadline: formData.deadline?.toISOString()
        });
      }

      toast.success('Solicitação criada! Será exibida na aba "Minhas Solicitações".');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        target_audience: '',
        validation_type: '',
        reward_points: 50,
        max_responses: 20,
        requirements: '',
        deadline: undefined
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating validation request:', error);
      toast.error('Erro ao criar solicitação de validação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.title && formData.description && formData.category;
  const canProceedToStep3 = canProceedToStep2 && formData.target_audience && formData.validation_type;
  const canSubmit = canProceedToStep3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {ideaId ? 'Criar Validação da Ideia' : 'Criar Solicitação de Validação'}
          </DialogTitle>
          <DialogDescription>
            {ideaId ? 'Crie uma validação baseada na sua ideia existente' : 'Conecte-se com early adopters para validar sua ideia de negócio'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Informações Básicas</h3>
              <p className="text-gray-600">
                {ideaId ? 'Personalize os dados da sua ideia para a validação' : 'Descreva sua ideia e escolha a categoria'}
              </p>
              {ideaData && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 Baseando validação na ideia: <strong>{ideaData.title}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Validação *</Label>
                <Input
                  id="title"
                  placeholder="Ex: App de Delivery Sustentável"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva sua ideia, o problema que resolve e como funciona..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label>Categoria *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {CATEGORIES.map((category) => (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.category === category.id 
                          ? 'ring-2 ring-blue-600 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleInputChange('category', category.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <h4 className="font-medium text-sm">{category.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Validation Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Detalhes da Validação</h3>
              <p className="text-gray-600">Defina o público-alvo e tipo de validação</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="target_audience">Público-Alvo *</Label>
                <Input
                  id="target_audience"
                  placeholder="Ex: Millennials urbanos, 25-40 anos, interessados em sustentabilidade"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tipo de Validação *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {VALIDATION_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Card 
                        key={type.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          formData.validation_type === type.id 
                            ? 'ring-2 ring-blue-600 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleValidationTypeSelect(type.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-medium">{type.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {type.estimatedTime}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  {type.suggestedPoints} pts
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos Específicos (Opcional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Descreva requisitos específicos para os participantes (ex: experiência em UX, conhecimento em finanças, etc.)"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToStep3}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Configurações</h3>
              <p className="text-gray-600">Defina recompensas e limites</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Pontos de Recompensa
                  </CardTitle>
                  <CardDescription>
                    Pontos que cada participante receberá
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Pontos: {formData.reward_points}</span>
                        <span className="text-xs text-gray-500">
                          {selectedValidationType?.suggestedPoints && 
                           `Sugerido: ${selectedValidationType.suggestedPoints}`}
                        </span>
                      </div>
                      <Slider
                        value={[formData.reward_points]}
                        onValueChange={(value) => handleInputChange('reward_points', value[0])}
                        max={200}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Mais pontos atraem mais participantes qualificados
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Número de Respostas
                  </CardTitle>
                  <CardDescription>
                    Quantas respostas você deseja receber
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Máximo: {formData.max_responses}</span>
                      </div>
                      <Slider
                        value={[formData.max_responses]}
                        onValueChange={(value) => handleInputChange('max_responses', value[0])}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Recomendamos entre 10-30 respostas para insights significativos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                  Prazo (Opcional)
                </CardTitle>
                <CardDescription>
                  Defina um prazo para a validação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? (
                        format(formData.deadline, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.deadline}
                      onSelect={(date) => handleInputChange('deadline', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Resumo da Validação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Título:</strong> {formData.title}</p>
                  <p><strong>Categoria:</strong> {selectedCategory?.name}</p>
                  <p><strong>Tipo:</strong> {selectedValidationType?.name}</p>
                  <p><strong>Público-alvo:</strong> {formData.target_audience}</p>
                  <p><strong>Recompensa:</strong> {formData.reward_points} pontos por resposta</p>
                  <p><strong>Máximo de respostas:</strong> {formData.max_responses}</p>
                  {formData.deadline && (
                    <p><strong>Prazo:</strong> {format(formData.deadline, "PPP", { locale: ptBR })}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Validação'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateValidationModal;