import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
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
import { X, Plus, Lightbulb, Star } from "lucide-react";

interface BecomeAdopterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EXPERTISE_OPTIONS = [
  'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'SaaS', 'IoT',
  'Sustentabilidade', 'Marketing Digital', 'UX/UI', 'Mobile Apps',
  'IA/Machine Learning', 'Blockchain', 'Marketplace', 'Logistics',
  'Real Estate', 'Food Tech', 'Gaming', 'AgriTech'
];

const INTEREST_OPTIONS = [
  'Startups', 'Inovação', 'Tecnologia', 'Negócios', 'Empreendedorismo',
  'Design', 'Marketing', 'Vendas', 'Produto', 'Growth Hacking',
  'Investimentos', 'Mentoria', 'Consultoria', 'Desenvolvimento'
];

export const BecomeAdopterModal = ({ open, onOpenChange, onSuccess }: BecomeAdopterModalProps) => {
  const { authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    expertiseAreas: [] as string[],
    interests: [] as string[],
    portfolioUrl: '',
    linkedinUrl: '',
    hourlyRate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;

    if (formData.expertiseAreas.length === 0) {
      toast.error('Selecione pelo menos uma área de expertise');
      return;
    }

    if (formData.bio.trim().length < 20) {
      toast.error('A biografia deve ter pelo menos 20 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('early_adopters')
        .insert({
          user_id: authState.user.id,
          bio: formData.bio.trim(),
          expertise_areas: formData.expertiseAreas,
          interests: formData.interests,
          portfolio_url: formData.portfolioUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          availability: 'available',
          rating: 5.0,
          completed_validations: 0,
          total_points: 0
        });

      if (error) throw error;

      toast.success('Perfil de Early Adopter criado com sucesso!');
      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setFormData({
        bio: '',
        expertiseAreas: [],
        interests: [],
        portfolioUrl: '',
        linkedinUrl: '',
        hourlyRate: '',
      });
    } catch (err) {
      console.error('Error creating adopter profile:', err);
      toast.error('Erro ao criar perfil. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(expertise)
        ? prev.expertiseAreas.filter(e => e !== expertise)
        : [...prev.expertiseAreas, expertise]
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Torne-se um Early Adopter
          </DialogTitle>
          <DialogDescription>
            Ganhe pontos ajudando empreendedores a validar suas ideias e construa sua reputação no marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Benefits Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                Benefícios de ser Early Adopter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>• Ganhe pontos por cada validação realizada</li>
                <li>• Acesso antecipado a produtos e serviços inovadores</li>
                <li>• Networking com empreendedores e outros early adopters</li>
                <li>• Construa reputação e histórico de validações</li>
                <li>• Contribua para o ecossistema de inovação</li>
              </ul>
            </CardContent>
          </Card>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Biografia *
              <span className="text-sm text-slate-500 ml-1">(Mínimo 20 caracteres)</span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre você, sua experiência e por que quer ser um early adopter..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              required
            />
            <div className="text-xs text-slate-500">
              {formData.bio.length}/500 caracteres
            </div>
          </div>

          {/* Expertise Areas */}
          <div className="space-y-3">
            <Label>
              Áreas de Expertise *
              <span className="text-sm text-slate-500 ml-1">(Selecione pelo menos uma)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((expertise) => (
                <Badge
                  key={expertise}
                  variant={formData.expertiseAreas.includes(expertise) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleExpertise(expertise)}
                >
                  {expertise}
                  {formData.expertiseAreas.includes(expertise) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-slate-500">
              Selecionadas: {formData.expertiseAreas.length}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>
              Interesses
              <span className="text-sm text-slate-500 ml-1">(Opcional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "secondary" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                  {formData.interests.includes(interest) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Portfolio and LinkedIn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio">
                Portfolio/Website
                <span className="text-sm text-slate-500 ml-1">(Opcional)</span>
              </Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://meuportfolio.com"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">
                LinkedIn
                <span className="text-sm text-slate-500 ml-1">(Opcional)</span>
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/seuperfil"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
              />
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">
              Taxa Horária (R$)
              <span className="text-sm text-slate-500 ml-1">(Opcional, para consultorias futuras)</span>
            </Label>
            <Input
              id="hourlyRate"
              type="number"
              placeholder="150"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              min="0"
              step="0.01"
            />
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
              disabled={isSubmitting || formData.expertiseAreas.length === 0 || formData.bio.trim().length < 20}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Criando Perfil...' : 'Criar Perfil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};