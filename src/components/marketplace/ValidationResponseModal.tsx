import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ValidationRequest } from "@/hooks/useMarketplace";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Award, Timer } from "lucide-react";

interface ValidationResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validation: ValidationRequest | null;
  onSubmit: (responseData: any, feedback: string, rating: number) => Promise<void>;
}

export const ValidationResponseModal = ({ 
  open, 
  onOpenChange, 
  validation, 
  onSubmit 
}: ValidationResponseModalProps) => {
  const { authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState<any>({});
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState([5]);
  const [timeSpent, setTimeSpent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation || !authState.user) return;

    if (feedback.trim().length < 50) {
      toast.error('O feedback deve ter pelo menos 50 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullResponseData = {
        ...responseData,
        timeSpent: timeSpent ? parseInt(timeSpent) : null,
        validation_type: validation.validation_type,
        submitted_at: new Date().toISOString()
      };

      await onSubmit(fullResponseData, feedback.trim(), rating[0]);
      
      // Reset form
      setResponseData({});
      setFeedback('');
      setRating([5]);
      setTimeSpent('');
      onOpenChange(false);
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderValidationTypeFields = () => {
    if (!validation) return null;

    switch (validation.validation_type) {
      case 'feedback':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Primeira impressão sobre a ideia</Label>
              <RadioGroup
                value={responseData.first_impression}
                onValueChange={(value) => setResponseData(prev => ({ ...prev, first_impression: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_positive" id="very_positive" />
                  <Label htmlFor="very_positive">Muito positiva - adorei a ideia!</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive" id="positive" />
                  <Label htmlFor="positive">Positiva - tem potencial</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral">Neutra - precisa de mais informações</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="negative" id="negative" />
                  <Label htmlFor="negative">Negativa - vejo problemas</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Você usaria este produto/serviço?</Label>
              <RadioGroup
                value={responseData.would_use}
                onValueChange={(value) => setResponseData(prev => ({ ...prev, would_use: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="definitely" id="definitely" />
                  <Label htmlFor="definitely">Definitivamente sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="probably" id="probably" />
                  <Label htmlFor="probably">Provavelmente sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maybe" id="maybe" />
                  <Label htmlFor="maybe">Talvez</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="probably_not" id="probably_not" />
                  <Label htmlFor="probably_not">Provavelmente não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="definitely_not" id="definitely_not" />
                  <Label htmlFor="definitely_not">Definitivamente não</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'survey':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Relevância do problema abordado (1-10)</Label>
              <div className="px-3">
                <Slider
                  value={[responseData.problem_relevance || 5]}
                  onValueChange={(value) => setResponseData(prev => ({ ...prev, problem_relevance: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Irrelevante</span>
                  <span>Valor: {responseData.problem_relevance || 5}</span>
                  <span>Muito relevante</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Facilidade de uso esperada (1-10)</Label>
              <div className="px-3">
                <Slider
                  value={[responseData.ease_of_use || 5]}
                  onValueChange={(value) => setResponseData(prev => ({ ...prev, ease_of_use: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Difícil</span>
                  <span>Valor: {responseData.ease_of_use || 5}</span>
                  <span>Muito fácil</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Qual preço você pagaria por este produto/serviço?</Label>
              <RadioGroup
                value={responseData.price_range}
                onValueChange={(value) => setResponseData(prev => ({ ...prev, price_range: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free">Gratuito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-50" id="0-50" />
                  <Label htmlFor="0-50">R$ 0-50</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50-100" id="50-100" />
                  <Label htmlFor="50-100">R$ 50-100</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100-500" id="100-500" />
                  <Label htmlFor="100-500">R$ 100-500</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="500+" id="500+" />
                  <Label htmlFor="500+">Acima de R$ 500</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'interview':
        return (
          <div className="space-y-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Para entrevistas, o empreendedor entrará em contato com você diretamente para agendar uma conversa.
                  Forneça suas informações de contato e disponibilidade abaixo.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Label>Melhor forma de contato</Label>
              <RadioGroup
                value={responseData.contact_preference}
                onValueChange={(value) => setResponseData(prev => ({ ...prev, contact_preference: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">E-mail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone">Telefone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video_call" id="video_call" />
                  <Label htmlFor="video_call">Videochamada (Google Meet/Zoom)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Disponibilidade para entrevista</Label>
              <RadioGroup
                value={responseData.availability}
                onValueChange={(value) => setResponseData(prev => ({ ...prev, availability: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">Manhã (8h-12h)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon">Tarde (13h-18h)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">Noite (19h-22h)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Horário flexível</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'prototype_test':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Você conseguiu completar a tarefa principal?</Label>
              <RadioGroup
                value={responseData.task_completion}
                onValueChange={(value) => setResponseData(prev => ({ ...prev, task_completion: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed_easily" id="completed_easily" />
                  <Label htmlFor="completed_easily">Sim, facilmente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed_difficulty" id="completed_difficulty" />
                  <Label htmlFor="completed_difficulty">Sim, mas com dificuldade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partially_completed" id="partially_completed" />
                  <Label htmlFor="partially_completed">Parcialmente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not_completed" id="not_completed" />
                  <Label htmlFor="not_completed">Não consegui completar</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Avaliação da interface/usabilidade (1-10)</Label>
              <div className="px-3">
                <Slider
                  value={[responseData.usability_rating || 5]}
                  onValueChange={(value) => setResponseData(prev => ({ ...prev, usability_rating: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Muito ruim</span>
                  <span>Valor: {responseData.usability_rating || 5}</span>
                  <span>Excelente</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Principal problema encontrado</Label>
              <RadioGroup
                value={responseData.main_issue}
                onValueChange={(value) => setResponseData(prev => ({ ...prev, main_issue: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_issues" id="no_issues" />
                  <Label htmlFor="no_issues">Nenhum problema</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confusing_navigation" id="confusing_navigation" />
                  <Label htmlFor="confusing_navigation">Navegação confusa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slow_loading" id="slow_loading" />
                  <Label htmlFor="slow_loading">Carregamento lento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unclear_features" id="unclear_features" />
                  <Label htmlFor="unclear_features">Funcionalidades não claras</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bugs" id="bugs" />
                  <Label htmlFor="bugs">Bugs/erros técnicos</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!validation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Responder Validação
          </DialogTitle>
          <DialogDescription>
            Forneça feedback detalhado sobre: <strong>{validation.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Info Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{validation.title}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {validation.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{validation.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">{validation.reward_points}pts</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Validation Type Specific Fields */}
          {renderValidationTypeFields()}

          {/* Time Spent */}
          <div className="space-y-2">
            <Label htmlFor="timeSpent" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Tempo gasto na validação (minutos)
              <span className="text-sm text-slate-500">(Opcional)</span>
            </Label>
            <input
              id="timeSpent"
              type="number"
              placeholder="30"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              min="1"
            />
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">
              Feedback Detalhado *
              <span className="text-sm text-slate-500 ml-1">(Mínimo 50 caracteres)</span>
            </Label>
            <Textarea
              id="feedback"
              placeholder="Compartilhe seus insights, sugestões de melhoria, pontos fortes e fracos que identificou..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              required
            />
            <div className="text-xs text-slate-500">
              {feedback.length}/1000 caracteres
            </div>
          </div>

          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Avaliação Geral (1-5)
            </Label>
            <div className="px-3">
              <Slider
                value={rating}
                onValueChange={setRating}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Muito ruim</span>
                <span>Avaliação: {rating[0]} estrela{rating[0] > 1 ? 's' : ''}</span>
                <span>Excelente</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || feedback.trim().length < 50}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Enviando...' : `Enviar Resposta (+${validation.reward_points} pontos)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};