import React, { useState, useEffect } from 'react';
import { useKeywordRankings } from '@/hooks/usePositionHistory';
import { useTrackingJobs } from '@/hooks/useTrackingJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KeywordHistoryView } from './KeywordHistoryView';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Target, Clock, Play, Loader2, Search, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const TrackingResults = () => {
  const [filter, setFilter] = useState('all');
  const [selectedKeywordData, setSelectedKeywordData] = useState<{keyword: string; asin: string} | null>(null);
  const [trackingProgress, setTrackingProgress] = useState(0);
  
  const { data: rankings, isLoading, error, refetch } = useKeywordRankings();
  const { trackingJobs, runTrackingJob, isRunning } = useTrackingJobs();

  // Set up real-time tracking progress updates
  useEffect(() => {
    const channel = supabase
      .channel('tracking-progress')
      .on('broadcast', { event: 'progress' }, (payload) => {
        setTrackingProgress(payload.progress || 0);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate statistics from real data
  const activeTracking = rankings?.filter(r => r.status === 'tracking').length || 0;
  const pausedTracking = rankings?.filter(r => r.status === 'paused').length || 0;
  const totalKeywords = rankings?.length || 0;

  const filteredRankings = (rankings || []).filter(ranking => {
    if (filter === 'all') return true;
    if (filter === 'organic') return ranking.organicPosition !== null;
    if (filter === 'sponsored') return ranking.sponsoredPosition !== null;
    return true;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tracking':
        return <Badge variant="default" className="bg-green-600 text-white">Tracking</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (selectedKeywordData) {
    return (
      <KeywordHistoryView 
        keyword={selectedKeywordData.keyword}
        asin={selectedKeywordData.asin}
        onBack={() => setSelectedKeywordData(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tracking results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error loading tracking results</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{activeTracking}</p>
                <p className="text-sm text-muted-foreground">Active Tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pausedTracking}</p>
                <p className="text-sm text-muted-foreground">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalKeywords}</p>
                <p className="text-sm text-muted-foreground">Total Keywords</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Current Tracking Cycle</CardTitle>
          <CardDescription>
            Progress of ongoing keyword position checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Cycle Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(trackingProgress)}%</span>
            </div>
            <Progress value={trackingProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {trackingProgress > 0 ? 'Tracking in progress...' : 'Ready for next tracking cycle'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Keyword Rankings</CardTitle>
              <CardDescription>
                Real-time tracking results for your ASINs
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="organic">Organic Only</SelectItem>
                  <SelectItem value="sponsored">Sponsored Only</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>ASIN</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead className="text-center">Organic Pos.</TableHead>
                  <TableHead className="text-center">Sponsored Pos.</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRankings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No tracking data available</p>
                        <p className="text-sm text-muted-foreground">
                          Set up keyword tracking to see results here
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRankings.map((ranking, index) => (
                    <TableRow key={`${ranking.asin}-${ranking.keyword}-${index}`}>
                      <TableCell className="font-medium">{ranking.keyword}</TableCell>
                      <TableCell className="font-mono text-sm">{ranking.asin}</TableCell>
                      <TableCell>{ranking.marketplace}</TableCell>
                      <TableCell className="text-center">
                        {ranking.organicPosition ? (
                          <Badge variant="outline">#{ranking.organicPosition}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {ranking.sponsoredPosition ? (
                          <Badge variant="secondary">#{ranking.sponsoredPosition}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(ranking.trend)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ranking.lastChecked).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ranking.status)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedKeywordData({
                            keyword: ranking.keyword,
                            asin: ranking.asin
                          })}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};