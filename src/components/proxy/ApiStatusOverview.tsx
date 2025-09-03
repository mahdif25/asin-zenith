import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useProxyManager } from '@/hooks/useProxyManager';
import { RefreshCw, Wifi, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export const ApiStatusOverview = () => {
  const { proxyProviders, testAllConnections, getOverallStatus } = useProxyManager();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await testAllConnections();
    } finally {
      setIsRefreshing(false);
    }
  };

  const overallStatus = getOverallStatus();
  const connectedProviders = Object.values(proxyProviders).filter(p => p?.status === 'connected').length;
  const totalProviders = Object.keys(proxyProviders).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Status Overview</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            <StatusIndicator status={overallStatus} size="lg" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectedProviders}/{totalProviders}
            </div>
            <p className="text-xs text-muted-foreground">
              Providers Connected
            </p>
            <Progress 
              value={(connectedProviders / totalProviders) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Usage Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 GB</div>
            <p className="text-xs text-muted-foreground">
              of 10 GB limit
            </p>
            <Progress value={23} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Current scraping jobs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(proxyProviders).map(([providerId, provider]) => (
          <Card key={providerId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <StatusIndicator 
                    status={provider?.status === 'connected' ? 'online' : 'offline'} 
                  />
                  <div>
                    <CardTitle className="text-base capitalize">
                      {providerId.replace('-', ' ')}
                    </CardTitle>
                    <CardDescription>
                      {provider?.endpoint || 'Not configured'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={provider?.status === 'connected' ? 'default' : 'secondary'}>
                  {provider?.status || 'Not Configured'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Response Time</p>
                  <p className="font-medium">
                    {provider?.metrics?.avgResponseTime || 'N/A'}ms
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Success Rate</p>
                  <p className="font-medium">
                    {provider?.metrics?.successRate || 'N/A'}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data Used</p>
                  <p className="font-medium">
                    {provider?.metrics?.dataUsed || '0'} MB
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Test</p>
                  <p className="font-medium">
                    {provider?.lastTest ? 
                      new Date(provider.lastTest.timestamp).toLocaleTimeString() : 
                      'Never'
                    }
                  </p>
                </div>
              </div>

              {provider?.lastTest && !provider.lastTest.success && (
                <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive font-medium">Connection Error</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {provider.lastTest.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};