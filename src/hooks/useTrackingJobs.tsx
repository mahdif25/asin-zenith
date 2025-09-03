import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface TrackingJob {
  id: string;
  user_id: string;
  asin: string;
  marketplace: string;
  keywords: string[];
  tracking_frequency: string;
  status: string;
  random_delay_min: number;
  random_delay_max: number;
  last_tracked_at: string | null;
  next_tracking_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTrackingJobData {
  asin: string;
  marketplace: string;
  keywords: string[];
  tracking_frequency: string;
  random_delay_min?: number;
  random_delay_max?: number;
}

export const useTrackingJobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: trackingJobs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tracking-jobs', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tracking_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrackingJob[];
    },
    enabled: !!user,
  });

  const createTrackingJobMutation = useMutation({
    mutationFn: async (jobData: CreateTrackingJobData) => {
      if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('tracking_jobs')
          .insert([{
            user_id: user.id,
            asin: jobData.asin,
            marketplace: jobData.marketplace as any,
            keywords: jobData.keywords,
            tracking_frequency: jobData.tracking_frequency as any,
            random_delay_min: jobData.random_delay_min || 20,
            random_delay_max: jobData.random_delay_max || 30,
            status: 'active' as any
          }])
          .select()
          .single();

      if (error) throw error;
      return data as TrackingJob;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-jobs'] });
      toast({
        title: "Success",
        description: `Tracking job created for ASIN: ${data.asin}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tracking job",
        variant: "destructive",
      });
    },
  });

  const updateTrackingJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TrackingJob> }) => {
      const { data, error } = await supabase
        .from('tracking_jobs')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TrackingJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-jobs'] });
      toast({
        title: "Success",
        description: "Tracking job updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tracking job",
        variant: "destructive",
      });
    },
  });

  const deleteTrackingJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tracking_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-jobs'] });
      toast({
        title: "Success",
        description: "Tracking job deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tracking job",
        variant: "destructive",
      });
    },
  });

  const runTrackingJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const job = trackingJobs?.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');

      const response = await supabase.functions.invoke('amazon-scraper', {
        body: {
          asin: job.asin,
          keywords: job.keywords,
          marketplace: job.marketplace,
          trackingJobId: job.id
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['position-history'] });
      toast({
        title: "Success",
        description: "Tracking job executed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to run tracking job",
        variant: "destructive",
      });
    },
  });

  return {
    trackingJobs: trackingJobs || [],
    isLoading,
    error,
    refetch,
    createTrackingJob: createTrackingJobMutation.mutate,
    updateTrackingJob: updateTrackingJobMutation.mutate,
    deleteTrackingJob: deleteTrackingJobMutation.mutate,
    runTrackingJob: runTrackingJobMutation.mutate,
    isCreating: createTrackingJobMutation.isPending,
    isUpdating: updateTrackingJobMutation.isPending,
    isDeleting: deleteTrackingJobMutation.isPending,
    isRunning: runTrackingJobMutation.isPending,
  };
};