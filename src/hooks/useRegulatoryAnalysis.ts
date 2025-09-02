import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RegulatoryAnalysisResult {
  requirements: any[];
  riskAssessment: {
    overallRisk: string;
    riskFactors: string[];
    mitigationStrategies: string[];
  };
  costs: {
    initialCompliance: number;
    annualCompliance: number;
    breakdown: any[];
  };
  roadmap: {
    phases: any[];
    totalTimeframe: string;
  };
  recommendations: string[];
  contacts: any[];
}

interface RegulatoryAnalysis {
  id: string;
  business_name: string;
  business_sector: string;
  business_description: string;
  target_audience?: string;
  business_model?: string;
  location: string;
  analysis_results: any; // Using any to handle JSON type from database
  idea_id?: string;
  created_at: string;
  updated_at: string;
}

export const useRegulatoryAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<RegulatoryAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runRegulatoryAnalysis = async (formData: {
    businessName: string;
    businessSector: string;
    businessDescription: string;
    targetAudience?: string;
    businessModel?: string;
    location: string;
    ideaId?: string;
  }): Promise<RegulatoryAnalysisResult | null> => {
    setIsAnalyzing(true);
    
    try {
      console.log('Iniciando análise regulatória:', formData);
      
      const { data, error } = await supabase.functions.invoke('regulatory-analysis', {
        body: formData
      });

      if (error) {
        console.error('Erro na análise regulatória:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da análise');
      }

      console.log('Análise concluída:', data);

      // Salvar a análise no banco
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: saveError } = await supabase
          .from('regulatory_analyses')
          .insert({
            user_id: user.id,
            idea_id: formData.ideaId || null,
            business_name: formData.businessName,
            business_sector: formData.businessSector,
            business_description: formData.businessDescription,
            target_audience: formData.targetAudience,
            business_model: formData.businessModel,
            location: formData.location,
            analysis_results: data
          });

        if (saveError) {
          console.error('Erro ao salvar análise:', saveError);
          toast.error('Análise concluída, mas não foi possível salvá-la');
        } else {
          toast.success('Análise regulatória concluída e salva!');
        }
      }

      return data;
    } catch (error: any) {
      console.error('Erro na análise regulatória:', error);
      toast.error(error.message || 'Erro ao realizar análise regulatória');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadAnalyses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('regulatory_analyses')
        .select(`
          *,
          ideas!left (
            title,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar análises:', error);
        toast.error('Erro ao carregar análises anteriores');
        return;
      }

      setAnalyses(data || []);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast.error('Erro ao carregar análises anteriores');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('regulatory_analyses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir análise:', error);
        toast.error('Erro ao excluir análise');
        return;
      }

      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      toast.success('Análise excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir análise:', error);
      toast.error('Erro ao excluir análise');
    }
  };

  return {
    runRegulatoryAnalysis,
    loadAnalyses,
    deleteAnalysis,
    analyses,
    isAnalyzing,
    isLoading
  };
};