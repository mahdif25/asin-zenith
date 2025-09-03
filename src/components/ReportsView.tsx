import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, FileText, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";

// Mock data for charts
const positionData = [
  { date: '2024-01-10', organic: 25, sponsored: 8 },
  { date: '2024-01-11', organic: 22, sponsored: 6 },
  { date: '2024-01-12', organic: 18, sponsored: 5 },
  { date: '2024-01-13', organic: 15, sponsored: 3 },
  { date: '2024-01-14', organic: 12, sponsored: 4 },
  { date: '2024-01-15', organic: 15, sponsored: 3 },
];

const keywordPerformance = [
  { keyword: 'wireless headphones', organic: 15, sponsored: 3, clicks: 245 },
  { keyword: 'bluetooth earbuds', organic: null, sponsored: 8, clicks: 156 },
  { keyword: 'noise cancelling', organic: 42, sponsored: null, clicks: 89 },
  { keyword: 'wireless earphones', organic: 28, sponsored: 12, clicks: 178 },
];

export const ReportsView = () => {
  const [reportType, setReportType] = useState('combined');
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedAsin, setSelectedAsin] = useState('all');

  const exportReport = (format: string) => {
    // This would need backend implementation
    console.log(`Exporting ${reportType} report in ${format} format for ${timeframe}`);
  };

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
                  <SelectItem value="B08N5WRWNW">B08N5WRWNW</SelectItem>
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
                  <LineChart data={positionData}>
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
                      <th className="text-center p-2">Est. Clicks</th>
                      <th className="text-center p-2">Performance</th>
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
                        <td className="text-center p-2">{item.clicks}</td>
                        <td className="text-center p-2">
                          {item.organic && item.organic <= 20 ? (
                            <TrendingUp className="h-4 w-4 text-success mx-auto" />
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
                  <LineChart data={positionData}>
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
                  <BarChart data={positionData}>
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
                <p className="text-2xl font-bold">#12</p>
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
                <p className="text-2xl font-bold">#3</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Report Period</p>
                <p className="text-lg font-semibold">7 Days</p>
              </div>
              <Calendar className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};