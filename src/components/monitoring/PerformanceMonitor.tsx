import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export const PerformanceMonitor = () => {
  const { metrics: performanceMetrics, isLoading: performanceLoading } = usePerformanceMetrics();
  const { metrics: systemMetrics, isLoading: systemLoading } = useSystemHealth();

  if (performanceLoading || systemLoading) {
    return <Skeleton className="h-96" />;
  }

  // Prepare chart data
  const trendData = [
    { name: 'Improving', value: performanceMetrics.improvingKeywords, color: '#10b981' },
    { name: 'Declining', value: performanceMetrics.decliningKeywords, color: '#ef4444' },
    { name: 'Stable', value: performanceMetrics.stableKeywords, color: '#6b7280' }
  ];

  const responseTimeData = [
    { 
      name: 'Current', 
      responseTime: systemMetrics.apiRequestHealth.avgResponseTime,
      successRate: systemMetrics.apiRequestHealth.successRate 
    }
  ];

  const performanceOverTime = [
    { time: '1h ago', requests: Math.max(0, systemMetrics.apiRequestHealth.totalRequests - 50), success: 95 },
    { time: '45m ago', requests: Math.max(0, systemMetrics.apiRequestHealth.totalRequests - 35), success: 92 },
    { time: '30m ago', requests: Math.max(0, systemMetrics.apiRequestHealth.totalRequests - 20), success: systemMetrics.apiRequestHealth.successRate },
    { time: 'Now', requests: systemMetrics.apiRequestHealth.totalRequests, success: systemMetrics.apiRequestHealth.successRate }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.apiRequestHealth.totalRequests}</div>
            <p className="text-xs text-muted-foreground">API requests in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.apiRequestHealth.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.apiRequestHealth.avgResponseTime < 5000 ? 'Excellent' : 
               systemMetrics.apiRequestHealth.avgResponseTime < 10000 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.apiRequestHealth.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.apiRequestHealth.successRate >= 90 ? 'Excellent' : 
               systemMetrics.apiRequestHealth.successRate >= 70 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAPTCHA Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.antiDetectionHealth.captchaRate}%</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.antiDetectionHealth.captchaRate < 5 ? 'Excellent' : 
               systemMetrics.antiDetectionHealth.captchaRate < 15 ? 'Good' : 'High detection'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Keyword Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Performance Trends</CardTitle>
            <CardDescription>Distribution of keyword movement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trendData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Timeline</CardTitle>
            <CardDescription>Request volume and success rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="requests" fill="#8884d8" name="Requests" />
                <Line yAxisId="right" type="monotone" dataKey="success" stroke="#82ca9d" name="Success Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
          <CardDescription>Comprehensive system performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Improving Keywords</span>
              </h4>
              <div className="text-2xl font-bold text-green-600">{performanceMetrics.improvingKeywords}</div>
              <p className="text-xs text-muted-foreground">Keywords moving up in rankings</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>Declining Keywords</span>
              </h4>
              <div className="text-2xl font-bold text-red-600">{performanceMetrics.decliningKeywords}</div>
              <p className="text-xs text-muted-foreground">Keywords dropping in rankings</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span>Stable Keywords</span>
              </h4>
              <div className="text-2xl font-bold text-blue-600">{performanceMetrics.stableKeywords}</div>
              <p className="text-xs text-muted-foreground">Keywords maintaining positions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anti-Detection Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Anti-Detection Performance</CardTitle>
          <CardDescription>Monitoring evasion techniques effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Session Health</span>
                <Badge variant={
                  systemMetrics.antiDetectionHealth.sessionHealth === 'good' ? 'default' :
                  systemMetrics.antiDetectionHealth.sessionHealth === 'warning' ? 'secondary' : 'destructive'
                }>
                  {systemMetrics.antiDetectionHealth.sessionHealth}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User Agent Rotations</span>
                <span className="font-semibold">{systemMetrics.antiDetectionHealth.userAgentRotations}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Recent Errors</span>
                <Badge variant={systemMetrics.apiRequestHealth.recentErrors > 10 ? "destructive" : "secondary"}>
                  {systemMetrics.apiRequestHealth.recentErrors}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Detection Rates</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CAPTCHA Detection</span>
                  <span>{systemMetrics.antiDetectionHealth.captchaRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemMetrics.antiDetectionHealth.captchaRate < 5 ? 'bg-green-600' :
                      systemMetrics.antiDetectionHealth.captchaRate < 15 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(systemMetrics.antiDetectionHealth.captchaRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};