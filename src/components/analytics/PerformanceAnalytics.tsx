import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, Zap, 
  AlertTriangle, CheckCircle, XCircle, Activity
} from 'lucide-react';

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  successRate: number;
  dataUsage: number;
  requestCount: number;
}

export const PerformanceAnalytics = () => {
  const { metrics, isLoading } = usePerformanceMetrics();
  const [timeRange, setTimeRange] = useState('24h');
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    // Generate sample performance data for demonstration
    if (metrics) {
      generatePerformanceData();
    }
  }, [metrics, timeRange]);

  const generatePerformanceData = () => {
    const now = new Date();
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const interval = timeRange === '24h' ? 1 : timeRange === '7d' ? 6 : 24;

    const data = [];
    for (let i = hours; i >= 0; i -= interval) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        responseTime: Math.random() * 2000 + 500, // 500-2500ms
        successRate: Math.random() * 20 + 80, // 80-100%
        dataUsage: Math.random() * 10 + 5, // 5-15 MB
        requestCount: Math.floor(Math.random() * 50 + 10) // 10-60 requests
      });
    }
    setPerformanceData(data);
  };

  const calculateAverages = () => {
    if (performanceData.length === 0) return {};

    return {
      avgResponseTime: Math.round(
        performanceData.reduce((sum, d) => sum + d.responseTime, 0) / performanceData.length
      ),
      avgSuccessRate: Math.round(
        performanceData.reduce((sum, d) => sum + d.successRate, 0) / performanceData.length
      ),
      totalDataUsage: Math.round(
        performanceData.reduce((sum, d) => sum + d.dataUsage, 0)
      ),
      totalRequests: performanceData.reduce((sum, d) => sum + d.requestCount, 0)
    };
  };

  const getPerformanceStatus = () => {
    const averages = calculateAverages();
    const { avgResponseTime, avgSuccessRate } = averages;

    if (avgSuccessRate >= 95 && avgResponseTime <= 1000) {
      return { status: 'excellent', color: 'green', icon: CheckCircle };
    } else if (avgSuccessRate >= 90 && avgResponseTime <= 2000) {
      return { status: 'good', color: 'blue', icon: TrendingUp };
    } else if (avgSuccessRate >= 80 && avgResponseTime <= 3000) {
      return { status: 'fair', color: 'yellow', icon: AlertTriangle };
    } else {
      return { status: 'poor', color: 'red', icon: XCircle };
    }
  };

  const averages = calculateAverages();
  const performanceStatus = getPerformanceStatus();
  const StatusIcon = performanceStatus.icon;

  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor system performance and optimization metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={performanceStatus.status === 'excellent' ? 'default' : 'secondary'}
            className={`bg-${performanceStatus.color}-100 text-${performanceStatus.color}-700`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {performanceStatus.status}
          </Badge>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {['24h', '7d', '30d'].map(range => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">{averages.avgResponseTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{averages.avgSuccessRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{averages.totalRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data Usage</p>
                    <p className="text-2xl font-bold">{averages.totalDataUsage}MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Time Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${Math.round(value)}ms`, 'Response Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Success Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Success Rate Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis domain={[70, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [`${Math.round(value)}%`, 'Success Rate']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="successRate" 
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Request Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [value, 'Requests']}
                    />
                    <Bar dataKey="requestCount" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Usage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${Math.round(value)}MB`, 'Data Usage']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dataUsage" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-700">✓ Performing Well</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Response times are within acceptable range</li>
                    <li>• Success rate is above 90%</li>
                    <li>• Data usage is optimized</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-700">⚠ Areas for Improvement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Consider enabling more aggressive caching</li>
                    <li>• Peak usage times could benefit from load balancing</li>
                    <li>• Some proxy endpoints showing higher latency</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Enable image blocking during non-peak hours</li>
                    <li>• Increase cache size for frequently accessed data</li>
                    <li>• Consider upgrading proxy tier for better performance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};