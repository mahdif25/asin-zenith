import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Activity, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

export const PerformanceWidget: React.FC = () => {
  const { metrics, isLoading, getHealthColor, getHealthPercentage } = usePerformanceMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Overview
        </CardTitle>
        <CardDescription>
          System health and tracking performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Health */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">System Health</span>
            <Badge 
              variant="outline" 
              className={`capitalize ${getHealthColor(metrics.systemHealth)}`}
            >
              {metrics.systemHealth}
            </Badge>
          </div>
          <Progress 
            value={getHealthPercentage(metrics.systemHealth)} 
            className="h-2"
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Keywords</span>
            </div>
            <p className="text-lg font-bold">{metrics.totalKeywords}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Active Jobs</span>
            </div>
            <p className="text-lg font-bold">{metrics.activeJobs}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-muted-foreground">Top Rankings</span>
            </div>
            <p className="text-lg font-bold text-success">{metrics.topRankings}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg Position</span>
            </div>
            <p className="text-lg font-bold">
              {metrics.averagePosition > 0 ? `#${metrics.averagePosition}` : '-'}
            </p>
          </div>
        </div>

        {/* Trend Distribution */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Trend Distribution</span>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs">Improving</span>
              </div>
              <span className="text-xs font-medium">{metrics.improvingKeywords}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-xs">Declining</span>
              </div>
              <span className="text-xs font-medium">{metrics.decliningKeywords}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">Stable</span>
              </div>
              <span className="text-xs font-medium">{metrics.stableKeywords}</span>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last updated: {metrics.lastUpdateTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};