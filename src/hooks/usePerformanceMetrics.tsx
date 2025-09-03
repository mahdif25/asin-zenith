import { useState, useEffect } from 'react';
import { useKeywordRankings } from './usePositionHistory';
import { useTrackingJobs } from './useTrackingJobs';

interface PerformanceMetrics {
  totalKeywords: number;
  activeJobs: number;
  averagePosition: number;
  topRankings: number;
  improvingKeywords: number;
  decliningKeywords: number;
  stableKeywords: number;
  lastUpdateTime: Date;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalKeywords: 0,
    activeJobs: 0,
    averagePosition: 0,
    topRankings: 0,
    improvingKeywords: 0,
    decliningKeywords: 0,
    stableKeywords: 0,
    lastUpdateTime: new Date(),
    systemHealth: 'good'
  });
  
  const { data: rankings, isLoading: rankingsLoading } = useKeywordRankings();
  const { trackingJobs, isLoading: jobsLoading } = useTrackingJobs();

  useEffect(() => {
    if (rankingsLoading || jobsLoading || !rankings || !trackingJobs) return;

    const totalKeywords = rankings.length;
    const activeJobs = trackingJobs.filter(job => job.status === 'active').length;
    const improvingKeywords = rankings.filter(r => r.trend === 'up').length;
    const decliningKeywords = rankings.filter(r => r.trend === 'down').length;
    const stableKeywords = rankings.filter(r => r.trend === 'stable').length;
    const topRankings = rankings.filter(r => 
      (r.organicPosition && r.organicPosition <= 10) || 
      (r.sponsoredPosition && r.sponsoredPosition <= 5)
    ).length;

    // Calculate average position (organic positions only)
    const organicPositions = rankings
      .filter(r => r.organicPosition)
      .map(r => r.organicPosition!);
    const averagePosition = organicPositions.length > 0 
      ? Math.round(organicPositions.reduce((sum, pos) => sum + pos, 0) / organicPositions.length)
      : 0;

    // Determine system health based on various factors
    let systemHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    
    const healthScore = (
      (topRankings / Math.max(totalKeywords, 1)) * 40 +  // 40% weight for top rankings
      (improvingKeywords / Math.max(totalKeywords, 1)) * 30 +  // 30% weight for improving
      (activeJobs / Math.max(trackingJobs.length, 1)) * 20 +  // 20% weight for active jobs
      (averagePosition > 0 ? Math.max(0, (50 - averagePosition) / 50) : 0) * 10  // 10% weight for avg position
    ) * 100;

    if (healthScore >= 80) systemHealth = 'excellent';
    else if (healthScore >= 60) systemHealth = 'good';
    else if (healthScore >= 40) systemHealth = 'fair';
    else systemHealth = 'poor';

    setMetrics({
      totalKeywords,
      activeJobs,
      averagePosition,
      topRankings,
      improvingKeywords,
      decliningKeywords,
      stableKeywords,
      lastUpdateTime: new Date(),
      systemHealth
    });
  }, [rankings, trackingJobs, rankingsLoading, jobsLoading]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthPercentage = (health: string) => {
    switch (health) {
      case 'excellent': return 95;
      case 'good': return 75;
      case 'fair': return 55;
      case 'poor': return 25;
      default: return 50;
    }
  };

  return {
    metrics,
    isLoading: rankingsLoading || jobsLoading,
    getHealthColor,
    getHealthPercentage
  };
};