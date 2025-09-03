import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { 
  Heart, 
  Activity, 
  Shield, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';

export const SystemHealthWidget: React.FC = () => {
  const { metrics, isLoading, refetch } = useSystemHealth();

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return <Heart className="h-4 w-4 text-success" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-info" />;
      case 'fair':
        return <Activity className="h-4 w-4 text-warning" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-info';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSessionHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <Shield className="h-3 w-3 text-success" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-warning" />;
      case 'critical': return <AlertTriangle className="h-3 w-3 text-destructive" />;
      default: return <Shield className="h-3 w-3 text-muted-foreground" />;
    }
  };

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
          {getHealthIcon(metrics.overallHealth)}
          System Health
        </CardTitle>
        <CardDescription>
          Comprehensive system monitoring and health status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health */}
        <div className="text-center space-y-2">
          <Badge 
            variant="outline" 
            className={`text-lg px-4 py-2 ${getHealthColor(metrics.overallHealth)}`}
          >
            {metrics.overallHealth.charAt(0).toUpperCase() + metrics.overallHealth.slice(1)}
          </Badge>
        </div>

        {/* Health Metrics */}
        <div className="space-y-4">
          {/* API Health */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">API Performance</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {metrics.apiRequestHealth.successRate}% success
              </span>
            </div>
            <Progress value={metrics.apiRequestHealth.successRate} className="h-2" />
          </div>

          <Separator />

          {/* Tracking Health */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Active Jobs</span>
              </div>
              <p className="text-lg font-bold">{metrics.trackingHealth.activeJobs}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                <span className="text-xs text-muted-foreground">Failed Jobs</span>
              </div>
              <p className="text-lg font-bold text-destructive">{metrics.trackingHealth.failedJobs}</p>
            </div>
          </div>

          <Separator />

          {/* Anti-Detection Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSessionHealthIcon(metrics.antiDetectionHealth.sessionHealth)}
                <span className="text-sm font-medium">Detection Evasion</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.antiDetectionHealth.captchaRate}% CAPTCHA rate
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">UA Rotations</span>
                </div>
                <p className="text-sm font-bold">{metrics.antiDetectionHealth.userAgentRotations}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Avg Time</span>
                </div>
                <p className="text-sm font-bold">{metrics.apiRequestHealth.avgResponseTime}ms</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {metrics.recommendations.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium">Recommendations</span>
                </div>
                <div className="space-y-1">
                  {metrics.recommendations.slice(0, 2).map((rec, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Last Update */}
          {metrics.trackingHealth.lastSuccessfulRun && (
            <>
              <Separator />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Last successful run: {new Date(metrics.trackingHealth.lastSuccessfulRun).toLocaleString()}
                </span>
              </div>
            </>
          )}

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="w-full mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};