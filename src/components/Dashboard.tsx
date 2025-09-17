import React from 'react';
import { useKeywordRankings } from '@/hooks/usePositionHistory';
import { useTrackingJobs } from '@/hooks/useTrackingJobs';
import { PerformanceWidget } from '@/components/PerformanceWidget';
import { AntiDetectionMonitor } from '@/components/AntiDetectionMonitor';
import { SystemHealthWidget } from '@/components/SystemHealthWidget';
import { NotificationBell } from '@/components/NotificationBell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, TrendingDown, Target, Clock, Play, Search, Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const { data: rankings, isLoading: rankingsLoading } = useKeywordRankings();
  const { trackingJobs, isLoading: jobsLoading } = useTrackingJobs();

  if (rankingsLoading || jobsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  // Calculate metrics from real data
  const totalKeywords = rankings?.length || 0;
  const activeJobs = trackingJobs.filter(job => job.status === 'active').length;
  const improving = rankings?.filter(r => r.trend === 'up').length || 0;
  const declining = rankings?.filter(r => r.trend === 'down').length || 0;
  const stable = rankings?.filter(r => r.trend === 'stable').length || 0;

  // Get recent rankings for quick stats
  const topRankings = rankings?.filter(r => r.organicPosition && r.organicPosition <= 10).length || 0;
  const averagePosition = rankings?.length > 0 
    ? Math.round(rankings
        .filter(r => r.organicPosition)
        .reduce((sum, r) => sum + (r.organicPosition || 0), 0) / 
        rankings.filter(r => r.organicPosition).length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Notification Bell */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <NotificationBell />
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalKeywords}</p>
                <p className="text-sm text-muted-foreground">Total Keywords</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeJobs}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{topRankings}</p>
                <p className="text-sm text-muted-foreground">Top 10 Rankings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{averagePosition || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Avg Position</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Widget */}
        <SystemHealthWidget />

        {/* Performance Widget */}
        <PerformanceWidget />

        {/* Anti-Detection Monitor */}
        <AntiDetectionMonitor />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Keyword ranking movement over time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">Improving</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{improving}</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  +{improving}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm">Declining</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{declining}</span>
                <Badge variant="outline" className="text-red-600 border-red-600">
                  -{declining}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Stable</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stable}</span>
                <Badge variant="secondary">
                  ={stable}
                </Badge>
              </div>
            </div>

            {totalKeywords > 0 && (
              <div className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Performance Distribution</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-l-full" 
                      style={{ width: `${(improving / totalKeywords) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-600 h-2" 
                      style={{ width: `${(declining / totalKeywords) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalKeywords === 0 ? (
              <div className="text-center py-6">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Keywords Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by setting up your first keyword tracking job
                </p>
                <Button>
                  Set Up Keywords
                </Button>
              </div>
            ) : (
              <>
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View All Rankings
                </Button>
                
                <Button className="w-full" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Run Manual Check
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tracking Activity</CardTitle>
          <CardDescription>
            Latest keyword position updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankings && rankings.length > 0 ? (
            <div className="space-y-4">
              {rankings.slice(0, 5).map((ranking, index) => (
                <div 
                  key={`${ranking.asin}-${ranking.keyword}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {ranking.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {ranking.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {ranking.trend === 'stable' && <Target className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{ranking.keyword}</p>
                      <p className="text-sm text-muted-foreground">
                        ASIN: {ranking.asin} • {ranking.marketplace}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-2">
                      {ranking.organicPosition && (
                        <Badge variant="outline">
                          Organic #{ranking.organicPosition}
                        </Badge>
                      )}
                      {ranking.sponsoredPosition && (
                        <Badge variant="secondary">
                          Sponsored #{ranking.sponsoredPosition}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ranking.lastChecked).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground">
                Tracking results will appear here once you start monitoring keywords
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};