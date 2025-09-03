import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Activity, Eye } from 'lucide-react';

interface DetectionMetrics {
  totalRequests: number;
  successfulRequests: number;
  captchaDetections: number;
  avgResponseTime: number;
  lastRequestTime: string | null;
  userAgentRotations: number;
  sessionRotations: number;
}

export const AntiDetectionMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<DetectionMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    captchaDetections: 0,
    avgResponseTime: 0,
    lastRequestTime: null,
    userAgentRotations: 0,
    sessionRotations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      // Get API request statistics
      const { data: apiRequests, error } = await supabase
        .from('api_requests')
        .select('success, response_time_ms, created_at, error_message, user_agent')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const totalRequests = apiRequests?.length || 0;
      const successfulRequests = apiRequests?.filter(r => r.success).length || 0;
      const captchaDetections = apiRequests?.filter(r => 
        r.error_message?.toLowerCase().includes('captcha') || 
        r.error_message?.toLowerCase().includes('robot')
      ).length || 0;

      const avgResponseTime = apiRequests && apiRequests.length > 0
        ? apiRequests
            .filter(r => r.response_time_ms)
            .reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / 
          apiRequests.filter(r => r.response_time_ms).length
        : 0;

      const lastRequestTime = apiRequests && apiRequests.length > 0 
        ? apiRequests[0].created_at 
        : null;

      // Count unique user agents (proxy for rotations)
      const uniqueUserAgents = new Set(apiRequests?.map(r => r.user_agent).filter(Boolean)).size;

      setMetrics({
        totalRequests,
        successfulRequests,
        captchaDetections,
        avgResponseTime: Math.round(avgResponseTime),
        lastRequestTime,
        userAgentRotations: uniqueUserAgents,
        sessionRotations: Math.floor(uniqueUserAgents * 0.7) // Estimated
      });

    } catch (error) {
      console.error('Error fetching detection metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (metrics.totalRequests === 0) return { status: 'unknown', color: 'text-muted-foreground' };
    
    const successRate = metrics.successfulRequests / metrics.totalRequests;
    const captchaRate = metrics.captchaDetections / metrics.totalRequests;
    
    if (successRate >= 0.9 && captchaRate <= 0.05) {
      return { status: 'excellent', color: 'text-success' };
    } else if (successRate >= 0.7 && captchaRate <= 0.15) {
      return { status: 'good', color: 'text-info' };
    } else if (successRate >= 0.5 && captchaRate <= 0.3) {
      return { status: 'fair', color: 'text-warning' };
    } else {
      return { status: 'poor', color: 'text-destructive' };
    }
  };

  const healthStatus = getHealthStatus();
  const successRate = metrics.totalRequests > 0 
    ? (metrics.successfulRequests / metrics.totalRequests) * 100 
    : 0;

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
          <Shield className="h-5 w-5" />
          Anti-Detection Status
        </CardTitle>
        <CardDescription>
          Real-time monitoring of scraping detection and evasion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">System Health</span>
          <Badge variant="outline" className={`capitalize ${healthStatus.color}`}>
            <div className="flex items-center gap-1">
              {healthStatus.status === 'excellent' && <CheckCircle className="h-3 w-3" />}
              {healthStatus.status === 'good' && <Activity className="h-3 w-3" />}
              {healthStatus.status === 'fair' && <Eye className="h-3 w-3" />}
              {healthStatus.status === 'poor' && <AlertTriangle className="h-3 w-3" />}
              {healthStatus.status}
            </div>
          </Badge>
        </div>

        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Success Rate</span>
            <span className="text-sm text-muted-foreground">{Math.round(successRate)}%</span>
          </div>
          <Progress value={successRate} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Requests</span>
            </div>
            <p className="text-lg font-bold">{metrics.totalRequests}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              <span className="text-xs text-muted-foreground">Successful</span>
            </div>
            <p className="text-lg font-bold text-success">{metrics.successfulRequests}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="text-xs text-muted-foreground">CAPTCHA Detected</span>
            </div>
            <p className="text-lg font-bold text-destructive">{metrics.captchaDetections}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">User Agents</span>
            </div>
            <p className="text-lg font-bold">{metrics.userAgentRotations}</p>
          </div>
        </div>

        {/* Response Time */}
        {metrics.avgResponseTime > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Response Time</span>
              <span className="text-sm text-muted-foreground">{metrics.avgResponseTime}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-1">
                <div 
                  className="h-1 rounded-full bg-primary"
                  style={{ 
                    width: `${Math.min((metrics.avgResponseTime / 5000) * 100, 100)}%` 
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">5s max</span>
            </div>
          </div>
        )}

        {/* Last Activity */}
        {metrics.lastRequestTime && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>
                Last request: {new Date(metrics.lastRequestTime).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMetrics}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};