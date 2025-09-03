import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { KeywordSetup } from "./KeywordSetup";
import { TrackingResults } from "./TrackingResults";
import { ReportsView } from "./ReportsView";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";

interface DashboardStats {
  totalKeywords: number;
  activeTracking: number;
  avgPosition: number;
  trendsUp: number;
}

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("setup");
  
  const stats: DashboardStats = {
    totalKeywords: 0,
    activeTracking: 0,
    avgPosition: 0,
    trendsUp: 0
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Amazon Keyword Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Track ASIN keyword rankings for organic and sponsored positions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeywords}</div>
              <p className="text-xs text-muted-foreground">
                Keywords being tracked
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tracking</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTracking}</div>
              <p className="text-xs text-muted-foreground">
                Currently monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Position</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgPosition > 0 ? stats.avgPosition : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Average ranking position
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trends Up</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.trendsUp}</div>
              <p className="text-xs text-muted-foreground">
                Keywords improving
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Keyword Setup</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="mt-6">
            <KeywordSetup />
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <TrackingResults />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};