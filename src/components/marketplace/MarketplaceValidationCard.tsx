import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ValidationRequest } from "@/hooks/useMarketplace";
import { 
  Target, 
  Users, 
  Clock, 
  Award, 
  Calendar,
  MessageSquare,
  Star,
  FileText,
  TestTube,
  Lightbulb
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MarketplaceValidationCardProps {
  validation: ValidationRequest;
  onJoin: (id: string) => void;
  isLoading?: boolean;
}

const validationTypeIcons = {
  feedback: MessageSquare,
  survey: FileText,
  interview: Users,
  prototype_test: TestTube
};

const validationTypeLabels = {
  feedback: 'Feedback',
  survey: 'Pesquisa',
  interview: 'Entrevista', 
  prototype_test: 'Teste de Protótipo'
};

export const MarketplaceValidationCard = ({ 
  validation, 
  onJoin, 
  isLoading = false 
}: MarketplaceValidationCardProps) => {
  const Icon = validationTypeIcons[validation.validation_type] || MessageSquare;
  const typeLabel = validationTypeLabels[validation.validation_type] || validation.validation_type;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{validation.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-3">
              {validation.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {validation.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Entrepreneur Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={validation.entrepreneur.avatar} />
            <AvatarFallback>
              {validation.entrepreneur.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{validation.entrepreneur.name}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{validation.entrepreneur.rating}</span>
            </div>
          </div>
        </div>

        {/* Validation Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon className="w-4 h-4" />
            <span>{typeLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>{validation.reward_points} pontos</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{validation.responses_count}/{validation.max_responses}</span>
          </div>
          {validation.deadline && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(validation.deadline), 'dd/MM', { locale: ptBR })}</span>
            </div>
          )}
        </div>

        {/* Target Audience */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Público-alvo:</span>
          </div>
          <p className="text-sm text-gray-600">{validation.target_audience}</p>
        </div>

        {/* Connected Idea */}
        {validation.idea && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Ideia conectada:</span>
            </div>
            <p className="text-sm text-gray-600">{validation.idea.title}</p>
          </div>
        )}

        {/* Requirements */}
        {validation.requirements && (
          <div className="text-sm">
            <span className="font-medium">Requisitos: </span>
            <span className="text-gray-600">{validation.requirements}</span>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={() => onJoin(validation.id)}
          disabled={isLoading || validation.responses_count >= validation.max_responses}
          className="w-full"
          variant={validation.responses_count >= validation.max_responses ? "secondary" : "default"}
        >
          {validation.responses_count >= validation.max_responses 
            ? "Vagas Preenchidas" 
            : "Participar da Validação"
          }
        </Button>
      </CardContent>
    </Card>
  );
};