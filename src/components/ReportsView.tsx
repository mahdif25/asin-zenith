import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, FileText, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useKeywordRankings, usePositionHistory } from '@/hooks/usePositionHistory';
import { useTrackingJobs } from '@/hooks/useTrackingJobs';
import { format } from 'date-fns';

export const ReportsView = () => {
  const [reportType, setReportType] = useState('combined');
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedAsin, setSelectedAsin] = useState('all');
  
  const { data: rankings, isLoading: rankingsLoading } = useKeywordRankings();
  const { data: positionHistory, isLoading: historyLoading } = usePositionHistory();
  const { trackingJobs } = useTrackingJobs();

  const asins = useMemo(() => {
    if (!trackingJobs) return [];
    return [...new Set(trackingJobs.map(job => job.asin))];
  }, [trackingJobs]);

  const chartData = useMemo(() => {
    if (!positionHistory) return [];
    
    const grouped = positionHistory.reduce((acc, item) => {
      const date = format(new Date(item.tracked_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, organic: [], sponsored: [] };
      }
      if (item.organic_position) acc[date].organic.push(item.organic_position);
      if (item.sponsored_position) acc[date].sponsored.push(item.sponsored_position);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      date: item.date,
      organic: item.organic.length > 0 ? Math.round(item.organic.reduce((a: number, b: number) => a + b, 0) / item.organic.length) : null,
      sponsored: item.sponsored.length > 0 ? Math.round(item.sponsored.reduce((a: number, b: number) => a + b, 0) / item.sponsored.length) : null,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30);
  }, [positionHistory]);

  const keywordPerformance = useMemo(() => {
    if (!rankings) return [];
    
    return rankings.map(ranking => ({
      keyword: ranking.keyword,
      organic: ranking.organicPosition,
      sponsored: ranking.sponsoredPosition,
      asin: ranking.asin,
      trend: ranking.trend,
    }));
  }, [rankings]);

  const stats = useMemo(() => {
    if (!rankings) return { bestOrganic: null, bestSponsored: null, totalKeywords: 0 };
    
    const organicPositions = rankings.filter(r => r.organicPosition).map(r => r.organicPosition!);
    const sponsoredPositions = rankings.filter(r => r.sponsoredPosition).map(r => r.sponsoredPosition!);
    
    return {
      bestOrganic: organicPositions.length > 0 ? Math.min(...organicPositions) : null,
      bestSponsored: sponsoredPositions.length > 0 ? Math.min(...sponsoredPositions) : null,
      totalKeywords: rankings.length,
    };
  }, [rankings]);

  const isLoading = rankingsLoading || historyLoading;

  const exportReport = (format: string) => {
    // This would need backend implementation
    console.log(`Exporting ${reportType} report in ${format} format for ${timeframe}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Configure and export your keyword tracking reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="combined">Combined Report</SelectItem>
                  <SelectItem value="organic">Organic Only</SelectItem>
                  <SelectItem value="sponsored">Sponsored Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Frame</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ASIN</label>
              <Select value={selectedAsin} onValueChange={setSelectedAsin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ASINs</SelectItem>
                  {asins.map(asin => (
                    <SelectItem key={asin} value={asin}>{asin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="combined">Combined Report</TabsTrigger>
          <TabsTrigger value="organic">Organic Report</TabsTrigger>
          <TabsTrigger value="sponsored">Sponsored Report</TabsTrigger>
        </TabsList>

        <TabsContent value="combined" className="space-y-6">
          {/* Position Trends Chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Position Trends (Combined)</CardTitle>
              <CardDescription>
                Organic vs Sponsored position changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis reversed domain={[1, 50]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="organic" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Organic Position"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sponsored" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Sponsored Position"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Keyword Performance Summary */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Keyword Performance Summary</CardTitle>
              <CardDescription>
                Current positions and estimated traffic for all keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Keyword</th>
                      <th className="text-center p-2">Organic Position</th>
                      <th className="text-center p-2">Sponsored Position</th>
                      <th className="text-center p-2">ASIN</th>
                      <th className="text-center p-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordPerformance.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{item.keyword}</td>
                        <td className="text-center p-2">
                          {item.organic ? (
                            <Badge variant="outline">#{item.organic}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-center p-2">
                          {item.sponsored ? (
                            <Badge variant="secondary">#{item.sponsored}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-center p-2 font-mono text-sm">{item.asin}</td>
                        <td className="text-center p-2">
                          {item.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-success mx-auto" />
                          ) : item.trend === 'down' ? (
                            <TrendingUp className="h-4 w-4 text-destructive mx-auto rotate-180" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organic" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Organic Rankings Report</CardTitle>
              <CardDescription>
                Natural search position tracking and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis reversed domain={[1, 50]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="organic" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Organic Position"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sponsored" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Sponsored Rankings Report</CardTitle>
              <CardDescription>
                Paid advertisement position tracking and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="sponsored" 
                      fill="hsl(var(--success))" 
                      name="Sponsored Position"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Organic Rank</p>
                <p className="text-2xl font-bold">
                  {stats.bestOrganic ? `#${stats.bestOrganic}` : '-'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Sponsored Rank</p>
                <p className="text-2xl font-bold">
                  {stats.bestSponsored ? `#${stats.bestSponsored}` : '-'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Keywords</p>
                <p className="text-lg font-semibold">{stats.totalKeywords}</p>
              </div>
              <Calendar className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};