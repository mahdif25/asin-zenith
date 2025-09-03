import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PositionHistory {
  id: string;
  tracking_job_id: string;
  keyword: string;
  organic_position: number | null;
  sponsored_position: number | null;
  search_volume: number | null;
  competition_level: string;
  tracked_at: string;
  created_at: string;
}

export interface KeywordRanking {
  keyword: string;
  asin: string;
  marketplace: string;
  organicPosition: number | null;
  sponsoredPosition: number | null;
  trend: 'up' | 'down' | 'stable';
  lastChecked: string;
  status: 'tracking' | 'paused' | 'error';
}

export const usePositionHistory = (trackingJobId?: string, keyword?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['position-history', trackingJobId, keyword],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('position_history')
        .select(`
          *,
          tracking_jobs!inner(
            user_id,
            asin,
            marketplace
          )
        `)
        .eq('tracking_jobs.user_id', user.id)
        .order('tracked_at', { ascending: false });

      if (trackingJobId) {
        query = query.eq('tracking_job_id', trackingJobId);
      }

      if (keyword) {
        query = query.eq('keyword', keyword);
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;
      return data as (PositionHistory & { tracking_jobs: { user_id: string; asin: string; marketplace: string } })[];
    },
    enabled: !!user,
  });
};

export const useKeywordRankings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['keyword-rankings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get latest position for each keyword from each tracking job
        const { data: trackingJobs, error: jobsError } = await supabase
          .from('tracking_jobs')
          .select('id, asin, marketplace, keywords, status, last_tracked_at, created_at')
          .eq('user_id', user.id)
          .eq('status', 'active');

      if (jobsError) throw jobsError;
      if (!trackingJobs?.length) return [];

      const rankings: KeywordRanking[] = [];

      for (const job of trackingJobs) {
        for (const keyword of job.keywords) {
          // Get latest position for this keyword
          const { data: latestHistory } = await supabase
            .from('position_history')
            .select('*')
            .eq('tracking_job_id', job.id)
            .eq('keyword', keyword)
            .order('tracked_at', { ascending: false })
            .limit(2);

          if (latestHistory && latestHistory.length > 0) {
            const current = latestHistory[0];
            const previous = latestHistory[1];

            // Calculate trend
            let trend: 'up' | 'down' | 'stable' = 'stable';
            if (previous) {
              const currentPos = current.organic_position || current.sponsored_position || 999;
              const previousPos = previous.organic_position || previous.sponsored_position || 999;
              
              if (currentPos < previousPos - 2) trend = 'up';
              else if (currentPos > previousPos + 2) trend = 'down';
            }

            rankings.push({
              keyword,
              asin: job.asin,
              marketplace: job.marketplace,
              organicPosition: current.organic_position,
              sponsoredPosition: current.sponsored_position,
              trend,
              lastChecked: current.tracked_at,
              status: job.status === 'active' ? 'tracking' : 'paused'
            });
          } else {
            // No history yet
            rankings.push({
              keyword,
              asin: job.asin,
              marketplace: job.marketplace,
              organicPosition: null,
              sponsoredPosition: null,
              trend: 'stable',
              lastChecked: job.last_tracked_at || job.created_at,
              status: 'tracking'
            });
          }
        }
      }

      return rankings;
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
};