import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import type { ProgressStep } from '@/hooks/useGenerationProgress';

interface GenerationProgressProps {
  steps: ProgressStep[];
  overallProgress: number;
  currentStep: number;
  className?: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  steps,
  overallProgress,
  currentStep,
  className = ""
}) => {
  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStepBadgeVariant = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'active':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (steps.length === 0) return null;

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progresso da Geração</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                index === currentStep ? 'bg-muted/50' : ''
              }`}
            >
              {getStepIcon(step.status)}
              <span className={`flex-1 text-sm ${
                step.status === 'active' ? 'font-medium' : ''
              }`}>
                {step.title}
              </span>
              <Badge variant={getStepBadgeVariant(step.status)} className="text-xs">
                {step.status === 'pending' && 'Pendente'}
                {step.status === 'active' && 'Em andamento'}
                {step.status === 'completed' && 'Concluído'}
                {step.status === 'error' && 'Erro'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};