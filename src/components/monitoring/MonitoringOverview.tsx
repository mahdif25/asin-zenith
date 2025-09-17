import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealthDashboard } from './SystemHealthDashboard';
import { PerformanceMonitor } from './PerformanceMonitor';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Activity, BarChart3, Monitor, RefreshCw, Shield, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export const MonitoringOverview = () => {
  const { metrics: systemMetrics, isLoading: systemLoading, refetch: refetchSystem } = useSystemHealth();
  const { metrics: performanceMetrics, isLoading: performanceLoading } = usePerformanceMetrics();

  const handleRefresh = () => {
    refetchSystem();
  };

  if (systemLoading || performanceLoading) {
    return <Skeleton className="h-96" />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'good': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'fair': return <Monitor className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <Shield className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance monitoring
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(systemMetrics.overallHealth)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(systemMetrics.overallHealth)}>
                {systemMetrics.overallHealth}
              </Badge>
              <span className="text-sm text-muted-foreground">Overall Health</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tracking</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.trackingHealth.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.totalKeywords} total keywords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.apiRequestHealth.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.apiRequestHealth.avgResponseTime}ms avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anti-Detection</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{100 - systemMetrics.antiDetectionHealth.captchaRate}%</div>
            <p className="text-xs text-muted-foreground">
              Evasion success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="health" className="space-y-4">
          <SystemHealthDashboard />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <PerformanceMonitor />
        </TabsContent>
      </Tabs>

      {/* Active Alerts */}
      {systemMetrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Active System Alerts</span>
              <Badge variant="destructive">{systemMetrics.recommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemMetrics.recommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>{recommendation}</span>
                </div>
              ))}
              {systemMetrics.recommendations.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{systemMetrics.recommendations.length - 3} more recommendations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};