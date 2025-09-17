import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProxySettingsCard } from './proxy/ProxySettingsCard';
import { ApiStatusOverview } from './proxy/ApiStatusOverview';
import { DataOptimizer } from './optimization/DataOptimizer';
import { PerformanceAnalytics } from './analytics/PerformanceAnalytics';
import { ExportManager } from './reports/ExportManager';
import { AdvancedScheduler } from './scheduling/AdvancedScheduler';
import { Cog, Wifi, BarChart3, TrendingUp, Download, Clock } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Cog className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <Tabs defaultValue="proxies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-[700px]">
          <TabsTrigger value="proxies" className="flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <span>Proxies</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center space-x-2">
            <Cog className="h-4 w-4" />
            <span>Status</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Optimization</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Scheduler</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proxies" className="space-y-6">
          <ProxySettingsCard />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <ApiStatusOverview />
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <DataOptimizer />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportManager />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <AdvancedScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
};