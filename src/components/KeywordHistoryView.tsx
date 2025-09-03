import React, { useState } from 'react';
import { usePositionHistory } from '@/hooks/usePositionHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Calendar, TrendingUp, TrendingDown, BarChart3, Target, Loader2 } from 'lucide-react';

interface KeywordHistoryViewProps {
  keyword: string;
  asin: string;
  onBack: () => void;
}

export const KeywordHistoryView: React.FC<KeywordHistoryViewProps> = ({ keyword, asin, onBack }) => {
  const [period, setPeriod] = useState('30');
  const [chartType, setChartType] = useState('line');
  
  // Get position history for this specific keyword
  const { data: positionHistory, isLoading, error } = usePositionHistory(undefined, keyword);
  
  // Filter history for this specific ASIN and time period
  const filteredHistory = React.useMemo(() => {
    if (!positionHistory) return [];
    
    const days = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return positionHistory
      .filter(entry => entry.tracking_jobs.asin === asin)
      .filter(entry => new Date(entry.tracked_at) >= cutoffDate)
      .sort((a, b) => new Date(a.tracked_at).getTime() - new Date(b.tracked_at).getTime());
  }, [positionHistory, asin, period]);

  // Calculate analytics from real data
  const analytics = React.useMemo(() => {
    if (!filteredHistory.length) return null;

    const organicPositions = filteredHistory
      .map(h => h.organic_position)
      .filter(p => p !== null) as number[];
    
    const sponsoredPositions = filteredHistory
      .map(h => h.sponsored_position)
      .filter(p => p !== null) as number[];

    const current = filteredHistory[filteredHistory.length - 1];
    const previous = filteredHistory[filteredHistory.length - 2];

    return {
      keyword,
      asin,
      marketplace: filteredHistory[0]?.tracking_jobs?.marketplace || 'US',
      currentOrganic: current?.organic_position || null,
      currentSponsored: current?.sponsored_position || null,
      avgOrganic: organicPositions.length > 0 
        ? Math.round(organicPositions.reduce((a, b) => a + b, 0) / organicPositions.length)
        : null,
      avgSponsored: sponsoredPositions.length > 0
        ? Math.round(sponsoredPositions.reduce((a, b) => a + b, 0) / sponsoredPositions.length)
        : null,
      bestOrganic: organicPositions.length > 0 ? Math.min(...organicPositions) : null,
      bestSponsored: sponsoredPositions.length > 0 ? Math.min(...sponsoredPositions) : null,
      worstOrganic: organicPositions.length > 0 ? Math.max(...organicPositions) : null,
      worstSponsored: sponsoredPositions.length > 0 ? Math.max(...sponsoredPositions) : null,
      totalTracked: filteredHistory.length,
      trend: calculateTrend(previous, current)
    };
  }, [filteredHistory, keyword, asin]);

  const calculateTrend = (previous: any, current: any) => {
    if (!previous || !current) return 'stable';
    
    const prevPos = previous.organic_position || previous.sponsored_position || 999;
    const currPos = current.organic_position || current.sponsored_position || 999;
    
    if (currPos < prevPos - 2) return 'up';
    if (currPos > prevPos + 2) return 'down';
    return 'stable';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading keyword history...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error loading keyword history</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{analytics.keyword}</h1>
            <p className="text-muted-foreground">
              ASIN: {analytics.asin} • {analytics.marketplace}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="15">Last 15 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {analytics.currentOrganic ? `#${analytics.currentOrganic}` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Current Organic</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.currentSponsored ? `#${analytics.currentSponsored}` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Current Sponsored</p>
              </div>
              <div className="mt-4">
                <Badge variant={analytics.trend === 'up' ? 'default' : analytics.trend === 'down' ? 'destructive' : 'secondary'}>
                  {analytics.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {analytics.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {analytics.trend === 'stable' && <Target className="h-3 w-3 mr-1" />}
                  {analytics.trend.charAt(0).toUpperCase() + analytics.trend.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Average: {analytics.avgOrganic ? `#${analytics.avgOrganic}` : 'N/A'}</p>
                <p className="font-medium">Best: {analytics.bestOrganic ? `#${analytics.bestOrganic}` : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Worst: {analytics.worstOrganic ? `#${analytics.worstOrganic}` : 'N/A'}</p>
                <p className="font-medium">Tracked: {analytics.totalTracked}x</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sponsored Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Average: {analytics.avgSponsored ? `#${analytics.avgSponsored}` : 'N/A'}</p>
                <p className="font-medium">Best: {analytics.bestSponsored ? `#${analytics.bestSponsored}` : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Worst: {analytics.worstSponsored ? `#${analytics.worstSponsored}` : 'N/A'}</p>
                <p className="font-medium">Active: {analytics.currentSponsored ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tracking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Period:</span> {period} days</p>
              <p><span className="font-medium">Data Points:</span> {analytics.totalTracked}</p>
              <p><span className="font-medium">Marketplace:</span> {analytics.marketplace}</p>
              <p><span className="font-medium">Last Update:</span> {filteredHistory.length > 0 ? new Date(filteredHistory[filteredHistory.length - 1].tracked_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Position History Chart</CardTitle>
          <CardDescription>
            Historical ranking positions over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {filteredHistory.length > 0 
                  ? `Chart visualization for ${filteredHistory.length} data points`
                  : 'No data available for the selected period'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Chart integration coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Position Data</CardTitle>
          <CardDescription>
            Latest position tracking results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-center p-2">Organic Position</th>
                    <th className="text-center p-2">Sponsored Position</th>
                    <th className="text-center p-2">Search Volume</th>
                    <th className="text-center p-2">Competition</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.slice(-10).reverse().map((entry, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(entry.tracked_at).toLocaleDateString()}</td>
                      <td className="p-2 text-center">
                        {entry.organic_position ? (
                          <Badge variant="outline">#{entry.organic_position}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {entry.sponsored_position ? (
                          <Badge variant="secondary">#{entry.sponsored_position}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {entry.search_volume || <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant="outline" className="text-xs">
                          {entry.competition_level || 'Unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No position data available for this period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};