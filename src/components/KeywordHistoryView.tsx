import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  Award,
  BarChart3,
  Download,
  Zap,
  Clock
} from "lucide-react";
import { useState } from "react";

interface KeywordHistoryData {
  date: string;
  organicPosition: number | null;
  sponsoredPosition: number | null;
  timestamp: string;
}

interface KeywordDetails {
  keyword: string;
  asin: string;
  marketplace: string;
  currentOrganic: number | null;
  currentSponsored: number | null;
  bestOrganic: number | null;
  bestSponsored: number | null;
  worstOrganic: number | null;
  worstSponsored: number | null;
  averageOrganic: number | null;
  averageSponsored: number | null;
  trackingStarted: string;
  totalChecks: number;
}

// Mock historical data
const mockHistoryData: KeywordHistoryData[] = [
  { date: '2024-01-01', organicPosition: 25, sponsoredPosition: 8, timestamp: '2024-01-01T10:00:00Z' },
  { date: '2024-01-02', organicPosition: 22, sponsoredPosition: 6, timestamp: '2024-01-02T10:00:00Z' },
  { date: '2024-01-03', organicPosition: 28, sponsoredPosition: 7, timestamp: '2024-01-03T10:00:00Z' },
  { date: '2024-01-04', organicPosition: 18, sponsoredPosition: 5, timestamp: '2024-01-04T10:00:00Z' },
  { date: '2024-01-05', organicPosition: 15, sponsoredPosition: 3, timestamp: '2024-01-05T10:00:00Z' },
  { date: '2024-01-06', organicPosition: 12, sponsoredPosition: 4, timestamp: '2024-01-06T10:00:00Z' },
  { date: '2024-01-07', organicPosition: 15, sponsoredPosition: 3, timestamp: '2024-01-07T10:00:00Z' },
  { date: '2024-01-08', organicPosition: 13, sponsoredPosition: 2, timestamp: '2024-01-08T10:00:00Z' },
  { date: '2024-01-09', organicPosition: 16, sponsoredPosition: 4, timestamp: '2024-01-09T10:00:00Z' },
  { date: '2024-01-10', organicPosition: 14, sponsoredPosition: 3, timestamp: '2024-01-10T10:00:00Z' },
  { date: '2024-01-11', organicPosition: 11, sponsoredPosition: 2, timestamp: '2024-01-11T10:00:00Z' },
  { date: '2024-01-12', organicPosition: 18, sponsoredPosition: 5, timestamp: '2024-01-12T10:00:00Z' },
  { date: '2024-01-13', organicPosition: 15, sponsoredPosition: 3, timestamp: '2024-01-13T10:00:00Z' },
  { date: '2024-01-14', organicPosition: 12, sponsoredPosition: 4, timestamp: '2024-01-14T10:00:00Z' },
  { date: '2024-01-15', organicPosition: 15, sponsoredPosition: 3, timestamp: '2024-01-15T10:00:00Z' },
];

const mockKeywordDetails: KeywordDetails = {
  keyword: 'wireless headphones',
  asin: 'B08N5WRWNW',
  marketplace: 'amazon.com',
  currentOrganic: 15,
  currentSponsored: 3,
  bestOrganic: 11,
  bestSponsored: 2,
  worstOrganic: 28,
  worstSponsored: 8,
  averageOrganic: 16.8,
  averageSponsored: 4.1,
  trackingStarted: '2024-01-01',
  totalChecks: 15
};

interface KeywordHistoryViewProps {
  keywordId: string;
  onBack: () => void;
}

export const KeywordHistoryView = ({ keywordId, onBack }: KeywordHistoryViewProps) => {
  const [timeframe, setTimeframe] = useState('7d');
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('combined');
  
  const filteredData = mockHistoryData.slice(-(timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 15));
  
  const calculateTrend = (data: KeywordHistoryData[], field: 'organicPosition' | 'sponsoredPosition') => {
    const validData = data.filter(d => d[field] !== null).map(d => d[field] as number);
    if (validData.length < 2) return { trend: 'stable', change: 0 };
    
    const recent = validData.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, validData.length);
    const earlier = validData.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, validData.length);
    const change = earlier - recent; // Lower position is better, so positive change is improvement
    
    return {
      trend: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
      change: Math.abs(change)
    };
  };

  const organicTrend = calculateTrend(filteredData, 'organicPosition');
  const sponsoredTrend = calculateTrend(filteredData, 'sponsoredPosition');

  const exportData = (format: string) => {
    console.log(`Exporting keyword history in ${format} format`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Results
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{mockKeywordDetails.keyword}</h2>
            <p className="text-muted-foreground">
              ASIN: {mockKeywordDetails.asin} • {mockKeywordDetails.marketplace}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="15d">Last 15 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
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

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="combined">Combined View</SelectItem>
                  <SelectItem value="organic">Organic Only</SelectItem>
                  <SelectItem value="sponsored">Sponsored Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Organic</p>
                <p className="text-lg font-bold">#{mockKeywordDetails.currentOrganic}</p>
              </div>
              <Target className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Best Organic</p>
                <p className="text-lg font-bold text-success">#{mockKeywordDetails.bestOrganic}</p>
              </div>
              <Award className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Sponsored</p>
                <p className="text-lg font-bold">#{mockKeywordDetails.currentSponsored}</p>
              </div>
              <Zap className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Best Sponsored</p>
                <p className="text-lg font-bold text-success">#{mockKeywordDetails.bestSponsored}</p>
              </div>
              <Award className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Organic</p>
                <p className="text-lg font-bold">#{mockKeywordDetails.averageOrganic?.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Checks</p>
                <p className="text-lg font-bold">{mockKeywordDetails.totalChecks}</p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Organic Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {organicTrend.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : organicTrend.trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                ) : (
                  <Target className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium">
                  {organicTrend.trend === 'up' ? 'Improving' : 
                   organicTrend.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
              <Badge variant={organicTrend.trend === 'up' ? 'default' : organicTrend.trend === 'down' ? 'destructive' : 'secondary'}>
                {organicTrend.change.toFixed(1)} positions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sponsored Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sponsoredTrend.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : sponsoredTrend.trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                ) : (
                  <Target className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium">
                  {sponsoredTrend.trend === 'up' ? 'Improving' : 
                   sponsoredTrend.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
              <Badge variant={sponsoredTrend.trend === 'up' ? 'default' : sponsoredTrend.trend === 'down' ? 'destructive' : 'secondary'}>
                {sponsoredTrend.change.toFixed(1)} positions
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position History Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Position History</CardTitle>
          <CardDescription>
            Historical ranking positions over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis reversed domain={[1, 50]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => [
                      value ? `#${value}` : 'Not ranked',
                      name === 'organicPosition' ? 'Organic Position' : 'Sponsored Position'
                    ]}
                  />
                  {(viewMode === 'combined' || viewMode === 'organic') && (
                    <Line 
                      type="monotone" 
                      dataKey="organicPosition" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      connectNulls={false}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  )}
                  {(viewMode === 'combined' || viewMode === 'sponsored') && (
                    <Line 
                      type="monotone" 
                      dataKey="sponsoredPosition" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      connectNulls={false}
                      dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                    />
                  )}
                </LineChart>
              ) : (
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis reversed domain={[1, 50]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => [
                      value ? `#${value}` : 'Not ranked',
                      name === 'organicPosition' ? 'Organic Position' : 'Sponsored Position'
                    ]}
                  />
                  {(viewMode === 'combined' || viewMode === 'organic') && (
                    <Area 
                      type="monotone" 
                      dataKey="organicPosition" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                      connectNulls={false}
                    />
                  )}
                  {(viewMode === 'combined' || viewMode === 'sponsored') && (
                    <Area 
                      type="monotone" 
                      dataKey="sponsoredPosition" 
                      stroke="hsl(var(--success))" 
                      fill="hsl(var(--success) / 0.2)"
                      strokeWidth={2}
                      connectNulls={false}
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Historical Data Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Historical Data Points</CardTitle>
          <CardDescription>
            Detailed position data for the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-center p-2">Time</th>
                  <th className="text-center p-2">Organic Position</th>
                  <th className="text-center p-2">Sponsored Position</th>
                  <th className="text-center p-2">Change</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice().reverse().map((item, index) => {
                  const prevItem = index < filteredData.length - 1 ? filteredData[filteredData.length - 2 - index] : null;
                  const organicChange = prevItem && item.organicPosition && prevItem.organicPosition 
                    ? prevItem.organicPosition - item.organicPosition 
                    : 0;
                  const sponsoredChange = prevItem && item.sponsoredPosition && prevItem.sponsoredPosition 
                    ? prevItem.sponsoredPosition - item.sponsoredPosition 
                    : 0;

                  return (
                    <tr key={item.date} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="text-center p-2 text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="text-center p-2">
                        {item.organicPosition ? (
                          <Badge variant="outline">#{item.organicPosition}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        {item.sponsoredPosition ? (
                          <Badge variant="secondary">#{item.sponsoredPosition}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center gap-2">
                          {organicChange > 0 && (
                            <div className="flex items-center gap-1 text-success text-sm">
                              <TrendingUp className="h-3 w-3" />
                              <span>+{organicChange}</span>
                            </div>
                          )}
                          {organicChange < 0 && (
                            <div className="flex items-center gap-1 text-destructive text-sm">
                              <TrendingDown className="h-3 w-3" />
                              <span>{organicChange}</span>
                            </div>
                          )}
                          {sponsoredChange > 0 && (
                            <div className="flex items-center gap-1 text-success text-sm">
                              <TrendingUp className="h-3 w-3" />
                              <span>+{sponsoredChange}</span>
                            </div>
                          )}
                          {sponsoredChange < 0 && (
                            <div className="flex items-center gap-1 text-destructive text-sm">
                              <TrendingDown className="h-3 w-3" />
                              <span>{sponsoredChange}</span>
                            </div>
                          )}
                          {organicChange === 0 && sponsoredChange === 0 && (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};