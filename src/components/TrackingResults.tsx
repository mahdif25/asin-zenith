import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  Target,
  Search,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { KeywordHistoryView } from "./KeywordHistoryView";

interface KeywordRanking {
  id: string;
  keyword: string;
  asin: string;
  marketplace: string;
  organicPosition: number | null;
  sponsoredPosition: number | null;
  lastChecked: string;
  trend: 'up' | 'down' | 'stable' | 'new';
  status: 'tracking' | 'paused' | 'error';
}

// Mock data for demonstration
const mockRankings: KeywordRanking[] = [
  {
    id: '1',
    keyword: 'wireless headphones',
    asin: 'B08N5WRWNW',
    marketplace: 'amazon.com',
    organicPosition: 15,
    sponsoredPosition: 3,
    lastChecked: '2024-01-15 10:30:00',
    trend: 'up',
    status: 'tracking'
  },
  {
    id: '2',
    keyword: 'bluetooth earbuds',
    asin: 'B08N5WRWNW',
    marketplace: 'amazon.com',
    organicPosition: null,
    sponsoredPosition: 8,
    lastChecked: '2024-01-15 10:25:00',
    trend: 'stable',
    status: 'tracking'
  },
  {
    id: '3',
    keyword: 'noise cancelling headphones',
    asin: 'B08N5WRWNW',
    marketplace: 'amazon.com',
    organicPosition: 42,
    sponsoredPosition: null,
    lastChecked: '2024-01-15 10:20:00',
    trend: 'down',
    status: 'tracking'
  }
];

export const TrackingResults = () => {
  const [filter, setFilter] = useState('all');
  const [rankings] = useState<KeywordRanking[]>(mockRankings);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);

  if (selectedKeywordId) {
    return (
      <KeywordHistoryView 
        keywordId={selectedKeywordId} 
        onBack={() => setSelectedKeywordId(null)} 
      />
    );
  }
  
  const filteredRankings = rankings.filter(ranking => {
    if (filter === 'organic') return ranking.organicPosition !== null;
    if (filter === 'sponsored') return ranking.sponsoredPosition !== null;
    return true;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Target className="h-4 w-4 text-info" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tracking':
        return <Badge variant="default" className="bg-success text-white">Tracking</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tracking</p>
                <p className="text-2xl font-bold">
                  {rankings.filter(r => r.status === 'tracking').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paused</p>
                <p className="text-2xl font-bold">
                  {rankings.filter(r => r.status === 'paused').length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Update</p>
                <p className="text-lg font-semibold">2 min</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Progress */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Current Tracking Cycle</CardTitle>
          <CardDescription>
            Progress of ongoing keyword position checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Keywords checked: 12/15</span>
              <span>80% complete</span>
            </div>
            <Progress value={80} className="w-full" />
            <p className="text-xs text-muted-foreground">
              Next keyword check in 23 seconds (randomized delay active)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-soft">
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
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                Refresh
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
                  filteredRankings.map((ranking) => (
                    <TableRow key={ranking.id}>
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
                          onClick={() => setSelectedKeywordId(ranking.id)}
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