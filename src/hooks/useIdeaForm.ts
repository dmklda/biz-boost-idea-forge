
import { useState, useEffect } from "react";
import { FormData, FormStep } from "@/types/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const FORM_DATA_KEY = "savedIdeaFormData";
const DRAFT_ID_KEY = "savedDraftId";

const initialFormData: FormData = {
  idea: "",
  audience: "",
  problem: "",
  hasCompetitors: "",
  monetization: "",
  budget: 0,
  location: ""
};

export const useIdeaForm = () => {
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
  const [draftId, setDraftId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(DRAFT_ID_KEY) : null
  );

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  }, [formData]);

  // Save draft ID to localStorage whenever it changes
  useEffect(() => {
    if (draftId) {
      localStorage.setItem(DRAFT_ID_KEY, draftId);
    } else {
      localStorage.removeItem(DRAFT_ID_KEY);
    }
  }, [draftId]);

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
    setDraftId(null);
    localStorage.removeItem(FORM_DATA_KEY);
    localStorage.removeItem(DRAFT_ID_KEY);
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

  const saveAsDraft = async (userId?: string) => {
    try {
      setIsSavingDraft(true);
      
      // Se temos um userId, salvar no supabase como rascunho
      if (userId) {
        const draftData = {
          user_id: userId,
          title: formData.idea || "Rascunho",
          description: formData.idea || "Rascunho",
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
        
        // Se já temos um ID de rascunho, atualizar o rascunho existente
        if (draftId) {
          response = await supabase
            .from('ideas')
            .update(draftData)
            .eq('id', draftId)
            .select('id')
            .single();
        } else {
          // Se não temos um ID de rascunho, criar um novo
          response = await supabase
            .from('ideas')
            .insert(draftData)
            .select('id')
            .single();
        }
        
        if (response.error) {
          throw response.error;
        }
        
        // Salvar o ID do rascunho
        setDraftId(response.data.id);
        return response.data.id;
      }
      
      return null;
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const loadDraft = async (draftId: string) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', draftId)
        .eq('is_draft', true)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const loadedFormData: FormData = {
          idea: data.title || "",
          audience: data.audience || "",
          problem: data.problem || "",
          hasCompetitors: data.has_competitors || "",
          monetization: data.monetization || "",
          budget: data.budget || 0,
          location: data.location || ""
        };
        
        setFormData(loadedFormData);
        setDraftId(draftId);
        return loadedFormData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading draft:", error);
      throw error;
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    setIsSubmitting,
    isSavingDraft,
    draftId,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    resetForm,
    getSavedIdeaData,
    saveAsDraft,
    loadDraft
  };
};
