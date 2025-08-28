import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

export interface ValidationRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  target_audience: string;
  validation_type: 'feedback' | 'survey' | 'interview' | 'prototype_test';
  reward_points: number;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  entrepreneur_id: string;
  entrepreneur: {
    name: string;
    avatar?: string;
    rating: number;
  };
  responses_count: number;
  max_responses: number;
  requirements?: string;
  deadline?: string;
}

export interface EarlyAdopter {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  interests: string[];
  rating: number;
  completed_validations: number;
  total_points: number;
  expertise_areas: string[];
  availability: 'available' | 'busy' | 'unavailable';
  hourly_rate?: number;
}

export interface ValidationResponse {
  id: string;
  validation_request_id: string;
  adopter_id: string;
  response_data: any;
  rating: number;
  feedback: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface MatchingCriteria {
  category: string;
  target_audience: string;
  validation_type: string;
  expertise_required: string[];
  budget_range?: [number, number];
}

export const useMarketplace = () => {
  const { authState } = useAuth();
  const [validationRequests, setValidationRequests] = useState<ValidationRequest[]>([]);
  const [earlyAdopters, setEarlyAdopters] = useState<EarlyAdopter[]>([]);
  const [myRequests, setMyRequests] = useState<ValidationRequest[]>([]);
  const [myResponses, setMyResponses] = useState<ValidationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all validation requests
  const fetchValidationRequests = async (filters?: {
    category?: string;
    search?: string;
    status?: string;
  }) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('validation_requests')
        .select(`
          *,
          entrepreneur:profiles!entrepreneur_id(
            name:display_name,
            avatar:photo_url
          )
        `)
        .eq('status', 'active');

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate responses count for each request
      const requestsWithCounts = await Promise.all(
        (data || []).map(async (request) => {
          const { count } = await supabase
            .from('validation_responses')
            .select('*', { count: 'exact', head: true })
            .eq('validation_request_id', request.id);

          return {
            ...request,
            responses_count: count || 0,
            entrepreneur: {
              name: request.entrepreneur?.name || 'Usuário',
              avatar: request.entrepreneur?.avatar,
              rating: 4.5 // TODO: Calculate real rating
            }
          };
        })
      );

      setValidationRequests(requestsWithCounts);
    } catch (err) {
      console.error('Error fetching validation requests:', err);
      setError('Erro ao carregar solicitações de validação');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch early adopters with matching algorithm
  const fetchEarlyAdopters = async (criteria?: MatchingCriteria) => {
    try {
      let query = supabase
        .from('early_adopters')
        .select('*')
        .eq('availability', 'available');

      if (criteria?.expertise_required?.length) {
        query = query.overlaps('expertise_areas', criteria.expertise_required);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;

      setEarlyAdopters(data || []);
    } catch (err) {
      console.error('Error fetching early adopters:', err);
      setError('Erro ao carregar early adopters');
    }
  };

  // Create new validation request
  const createValidationRequest = async (requestData: Partial<ValidationRequest>) => {
    try {
      if (!authState.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('validation_requests')
        .insert({
          ...requestData,
          entrepreneur_id: authState.user.id,
          status: 'active',
          responses_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Solicitação de validação criada com sucesso!');
      await fetchMyRequests();
      return data;
    } catch (err) {
      console.error('Error creating validation request:', err);
      toast.error('Erro ao criar solicitação de validação');
      throw err;
    }
  };

  // Join validation as early adopter
  const joinValidation = async (requestId: string) => {
    try {
      if (!authState.user) throw new Error('Usuário não autenticado');

      // Check if user already joined this validation
      const { data: existing } = await supabase
        .from('validation_participants')
        .select('*')
        .eq('validation_request_id', requestId)
        .eq('adopter_id', authState.user.id)
        .single();

      if (existing) {
        toast.info('Você já está participando desta validação');
        return;
      }

      const { error } = await supabase
        .from('validation_participants')
        .insert({
          validation_request_id: requestId,
          adopter_id: authState.user.id,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Você se inscreveu para esta validação! O empreendedor entrará em contato.');
      await fetchValidationRequests();
    } catch (err) {
      console.error('Error joining validation:', err);
      toast.error('Erro ao se inscrever na validação');
    }
  };

  // Submit validation response
  const submitValidationResponse = async (
    requestId: string,
    responseData: any,
    feedback: string,
    rating: number
  ) => {
    try {
      if (!authState.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('validation_responses')
        .insert({
          validation_request_id: requestId,
          adopter_id: authState.user.id,
          response_data: responseData,
          feedback,
          rating,
          status: 'pending'
        });

      if (error) throw error;

      // Award points to the adopter
      await awardPoints(authState.user.id, 50); // Base points for response

      toast.success('Resposta enviada com sucesso! Pontos foram creditados.');
      await fetchMyResponses();
    } catch (err) {
      console.error('Error submitting response:', err);
      toast.error('Erro ao enviar resposta');
    }
  };

  // Award points to user
  const awardPoints = async (userId: string, points: number) => {
    try {
      const { error } = await supabase.rpc('award_marketplace_points', {
        user_id: userId,
        points_amount: points
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error awarding points:', err);
    }
  };

  // Fetch user's own validation requests
  const fetchMyRequests = async () => {
    try {
      if (!authState.user) return;

      const { data, error } = await supabase
        .from('validation_requests')
        .select('*')
        .eq('entrepreneur_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyRequests(data || []);
    } catch (err) {
      console.error('Error fetching my requests:', err);
    }
  };

  // Fetch user's validation responses
  const fetchMyResponses = async () => {
    try {
      if (!authState.user) return;

      const { data, error } = await supabase
        .from('validation_responses')
        .select(`
          *,
          validation_request:validation_requests(*)
        `)
        .eq('adopter_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyResponses(data || []);
    } catch (err) {
      console.error('Error fetching my responses:', err);
    }
  };

  // Smart matching algorithm
  const findMatchingAdopters = async (request: ValidationRequest): Promise<EarlyAdopter[]> => {
    try {
      // Use AI to analyze request and find best matches
      const { data, error } = await supabase.functions.invoke('match-adopters', {
        body: {
          request,
          criteria: {
            category: request.category,
            target_audience: request.target_audience,
            validation_type: request.validation_type
          }
        }
      });

      if (error) throw error;

      return data.matches || [];
    } catch (err) {
      console.error('Error finding matches:', err);
      return [];
    }
  };

  // Get marketplace statistics
  const getMarketplaceStats = async () => {
    try {
      const [requestsCount, adoptersCount, responsesCount] = await Promise.all([
        supabase.from('validation_requests').select('*', { count: 'exact', head: true }),
        supabase.from('early_adopters').select('*', { count: 'exact', head: true }),
        supabase.from('validation_responses').select('*', { count: 'exact', head: true })
      ]);

      return {
        activeValidations: requestsCount.count || 0,
        earlyAdopters: adoptersCount.count || 0,
        totalResponses: responsesCount.count || 0,
        successRate: 94 // TODO: Calculate real success rate
      };
    } catch (err) {
      console.error('Error fetching stats:', err);
      return {
        activeValidations: 0,
        earlyAdopters: 0,
        totalResponses: 0,
        successRate: 0
      };
    }
  };

  useEffect(() => {
    if (authState.user) {
      fetchValidationRequests();
      fetchEarlyAdopters();
      fetchMyRequests();
      fetchMyResponses();
    }
  }, [authState.user]);

  return {
    // State
    validationRequests,
    earlyAdopters,
    myRequests,
    myResponses,
    isLoading,
    error,
    
    // Actions
    fetchValidationRequests,
    fetchEarlyAdopters,
    createValidationRequest,
    joinValidation,
    submitValidationResponse,
    findMatchingAdopters,
    getMarketplaceStats,
    fetchMyRequests,
    fetchMyResponses
  };
};