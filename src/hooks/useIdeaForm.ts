
import { useState, useEffect } from "react";
import { FormData, FormStep } from "@/types/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

const FORM_DATA_KEY = "savedIdeaFormData";

const initialFormData: FormData = {
  idea: "",
  audience: "",
  problem: "",
  hasCompetitors: "",
  monetization: "",
  budget: 0,
  location: ""
};

export const useIdeaForm = (existingIdeaId?: string) => {
  const { t } = useTranslation();
  
  // Try to load saved data from localStorage on initialization
  const getSavedFormData = (): FormData => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(FORM_DATA_KEY);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error("Failed to parse saved form data:", e);
        }
      }
    }
    return initialFormData;
  };

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>(getSavedFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<string | undefined>(existingIdeaId);

  // Fetch idea data if editing an existing idea
  useEffect(() => {
    const loadExistingIdea = async () => {
      if (existingIdeaId) {
        try {
          const { data, error } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', existingIdeaId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setFormData({
              idea: data.title || "",
              audience: data.audience || "",
              problem: data.problem || "",
              hasCompetitors: data.has_competitors || "",
              monetization: data.monetization || "",
              budget: data.budget || 0,
              location: data.location || ""
            });
            setEditingIdeaId(existingIdeaId);
          }
        } catch (error) {
          console.error("Error loading idea:", error);
          toast.error(t('ideaForm.errorLoading', "Erro ao carregar ideia"));
        }
      }
    };
    
    loadExistingIdea();
  }, [existingIdeaId, t]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    setCurrentStep(prev => (prev + 1) as FormStep);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => (prev - 1) as FormStep);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setEditingIdeaId(undefined);
    localStorage.removeItem(FORM_DATA_KEY);
  };

  const getSavedIdeaData = (): FormData | null => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse saved form data:", e);
      }
    }
    return null;
  };

  const saveAsDraft = async (userId: string) => {
    setIsSavingDraft(true);
    
    try {
      const ideaData = {
        user_id: userId,
        title: formData.idea,
        description: formData.idea,
        audience: formData.audience,
        problem: formData.problem,
        has_competitors: formData.hasCompetitors,
        monetization: formData.monetization,
        budget: formData.budget,
        location: formData.location,
        is_draft: true,
        status: 'draft'
      };
      
      let response;
      
      // Se estiver editando, atualiza o rascunho existente
      if (editingIdeaId) {
        response = await supabase
          .from('ideas')
          .update(ideaData)
          .eq('id', editingIdeaId);
      } else {
        // Senão, cria um novo rascunho
        response = await supabase
          .from('ideas')
          .insert(ideaData)
          .select('id')
          .single();
        
        if (!response.error && response.data) {
          setEditingIdeaId(response.data.id);
        }
      }
      
      if (response.error) throw response.error;
      
      toast.success(t('ideaForm.draftSaved', "Rascunho salvo com sucesso!"));
      return true;
      
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(t('ideaForm.draftError', "Erro ao salvar rascunho"));
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    isSavingDraft,
    editingIdeaId,
    setIsSubmitting,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    resetForm,
    getSavedIdeaData,
    saveAsDraft
  };
};
