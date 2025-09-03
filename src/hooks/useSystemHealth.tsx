import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealthMetrics {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  apiRequestHealth: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    recentErrors: number;
  };
  trackingHealth: {
    activeJobs: number;
    failedJobs: number;
    lastSuccessfulRun: string | null;
  };
  antiDetectionHealth: {
    captchaRate: number;
    userAgentRotations: number;
    sessionHealth: 'good' | 'warning' | 'critical';
  };
  recommendations: string[];
}

export const useSystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics>({
    overallHealth: 'unknown',
    apiRequestHealth: {
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      recentErrors: 0
    },
    trackingHealth: {
      activeJobs: 0,
      failedJobs: 0,
      lastSuccessfulRun: null
    },
    antiDetectionHealth: {
      captchaRate: 0,
      userAgentRotations: 0,
      sessionHealth: 'good'
    },
    recommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSystemHealth();
      const interval = setInterval(fetchSystemHealth, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchSystemHealth = async () => {
    if (!user) return;

    try {
      // Fetch API request data
      const { data: apiRequests } = await supabase
        .from('api_requests')
        .select('success, response_time_ms, created_at, error_message')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      // Fetch tracking jobs
      const { data: trackingJobs } = await supabase
        .from('tracking_jobs')
        .select('status, last_tracked_at')
        .eq('user_id', user.id);

      // Calculate API health
      const totalRequests = apiRequests?.length || 0;
      const successfulRequests = apiRequests?.filter(r => r.success).length || 0;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const avgResponseTime = apiRequests && apiRequests.length > 0
        ? apiRequests
            .filter(r => r.response_time_ms)
            .reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / 
          apiRequests.filter(r => r.response_time_ms).length
        : 0;
      const recentErrors = apiRequests?.filter(r => !r.success).length || 0;

      // Calculate tracking health
      const activeJobs = trackingJobs?.filter(j => j.status === 'active').length || 0;
      const failedJobs = trackingJobs?.filter(j => j.status === 'failed').length || 0;
      const lastSuccessfulRun = trackingJobs && trackingJobs.length > 0
        ? trackingJobs
            .filter(j => j.last_tracked_at)
            .sort((a, b) => new Date(b.last_tracked_at!).getTime() - new Date(a.last_tracked_at!).getTime())[0]?.last_tracked_at || null
        : null;

      // Calculate anti-detection health
      const captchaErrors = apiRequests?.filter(r => 
        r.error_message?.toLowerCase().includes('captcha') || 
        r.error_message?.toLowerCase().includes('robot')
      ).length || 0;
      const captchaRate = totalRequests > 0 ? (captchaErrors / totalRequests) * 100 : 0;
      
      const uniqueUserAgents = new Set(
        apiRequests?.map(r => r.created_at).filter(Boolean)
      ).size; // Simplified proxy for user agent rotations

      let sessionHealth: 'good' | 'warning' | 'critical' = 'good';
      if (captchaRate > 20) sessionHealth = 'critical';
      else if (captchaRate > 10) sessionHealth = 'warning';

      // Generate recommendations
      const recommendations: string[] = [];
      if (successRate < 70) {
        recommendations.push('Consider reducing request frequency to improve success rate');
      }
      if (captchaRate > 10) {
        recommendations.push('High CAPTCHA detection rate - review anti-detection settings');
      }
      if (avgResponseTime > 10000) {
        recommendations.push('Response times are high - check network conditions');
      }
      if (failedJobs > 0) {
        recommendations.push(`${failedJobs} tracking job(s) have errors - review configuration`);
      }
      if (activeJobs === 0) {
        recommendations.push('No active tracking jobs - set up keyword tracking to monitor performance');
      }

      // Calculate overall health
      let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' = 'unknown';
      if (totalRequests === 0) {
        overallHealth = 'unknown';
      } else {
        const healthScore = (
          (successRate / 100) * 40 +  // 40% weight for success rate
          (Math.min(1, (5000 - avgResponseTime) / 5000)) * 20 +  // 20% weight for response time
          (Math.min(1, (100 - captchaRate) / 100)) * 30 +  // 30% weight for anti-detection
          (activeJobs > 0 ? 1 : 0) * 10  // 10% weight for having active jobs
        ) * 100;

        if (healthScore >= 80) overallHealth = 'excellent';
        else if (healthScore >= 65) overallHealth = 'good';
        else if (healthScore >= 45) overallHealth = 'fair';
        else overallHealth = 'poor';
      }

      setMetrics({
        overallHealth,
        apiRequestHealth: {
          totalRequests,
          successRate: Math.round(successRate),
          avgResponseTime: Math.round(avgResponseTime),
          recentErrors
        },
        trackingHealth: {
          activeJobs,
          failedJobs,
          lastSuccessfulRun
        },
        antiDetectionHealth: {
          captchaRate: Math.round(captchaRate),
          userAgentRotations: uniqueUserAgents,
          sessionHealth
        },
        recommendations
      });

    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metrics,
    isLoading,
    refetch: fetchSystemHealth
  };
};