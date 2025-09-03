import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { KeywordSetup } from '../components/KeywordSetup';
import { TrackingResults } from '../components/TrackingResults';
import { Dashboard } from '../components/Dashboard';
import { ReportsView } from '../components/ReportsView';
import { NotificationCenter } from '../components/NotificationCenter';
import { ErrorBoundary } from '../components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Target, TrendingUp, Settings, LogOut, Cog } from 'lucide-react';
import { SettingsPage } from '../components/SettingsPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Amazon Keyword Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.email}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Setup</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Cog className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Setup</CardTitle>
                <CardDescription>
                  Configure your Amazon product tracking settings and keywords
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <KeywordSetup />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tracking Results</CardTitle>
                <CardDescription>
                  Monitor your keyword rankings and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <TrackingResults />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Detailed analysis and reporting of your keyword performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <ReportsView />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;