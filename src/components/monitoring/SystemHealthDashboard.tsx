import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Activity, AlertTriangle, CheckCircle, Clock, Server, Shield, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export const SystemHealthDashboard = () => {
  const { metrics, isLoading } = useSystemHealth();

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthPercentage = (health: string) => {
    switch (health) {
      case 'excellent': return 95;
      case 'good': return 80;
      case 'fair': return 60;
      case 'poor': return 30;
      default: return 0;
    }
  };

  const getSessionHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall System Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold capitalize">{metrics.overallHealth}</span>
                <Badge className={getHealthColor(metrics.overallHealth)}>
                  {getHealthPercentage(metrics.overallHealth)}%
                </Badge>
              </div>
              <Progress value={getHealthPercentage(metrics.overallHealth)} className="w-full" />
            </div>
            <div className="text-right">
              {metrics.overallHealth === 'excellent' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {metrics.overallHealth === 'good' && <Activity className="h-8 w-8 text-blue-600" />}
              {metrics.overallHealth === 'fair' && <Clock className="h-8 w-8 text-yellow-600" />}
              {metrics.overallHealth === 'poor' && <AlertTriangle className="h-8 w-8 text-red-600" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* API Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Requests</span>
                <span className="font-semibold">{metrics.apiRequestHealth.totalRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Success Rate</span>
                <div className="flex items-center space-x-2">
                  <Progress value={metrics.apiRequestHealth.successRate} className="w-16 h-2" />
                  <span className="text-sm font-medium">{metrics.apiRequestHealth.successRate}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">{metrics.apiRequestHealth.avgResponseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Recent Errors</span>
                <Badge variant={metrics.apiRequestHealth.recentErrors > 5 ? "destructive" : "secondary"}>
                  {metrics.apiRequestHealth.recentErrors}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracking Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Jobs</span>
                <Badge variant="default">{metrics.trackingHealth.activeJobs}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Failed Jobs</span>
                <Badge variant={metrics.trackingHealth.failedJobs > 0 ? "destructive" : "secondary"}>
                  {metrics.trackingHealth.failedJobs}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm">Last Successful Run</span>
                <p className="text-xs text-muted-foreground">
                  {metrics.trackingHealth.lastSuccessfulRun 
                    ? new Date(metrics.trackingHealth.lastSuccessfulRun).toLocaleString()
                    : 'No successful runs yet'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anti-Detection Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anti-Detection</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">CAPTCHA Rate</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={Math.min(metrics.antiDetectionHealth.captchaRate, 100)} 
                    className="w-16 h-2" 
                  />
                  <span className="text-sm font-medium">{metrics.antiDetectionHealth.captchaRate}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">User Agent Rotations</span>
                <span className="text-sm font-medium">{metrics.antiDetectionHealth.userAgentRotations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Session Health</span>
                <Badge className={getSessionHealthColor(metrics.antiDetectionHealth.sessionHealth)}>
                  {metrics.antiDetectionHealth.sessionHealth}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Recommendations */}
      {metrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>System Recommendations</span>
            </CardTitle>
            <CardDescription>
              Suggestions to improve your system performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Recommendation {index + 1}</AlertTitle>
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};