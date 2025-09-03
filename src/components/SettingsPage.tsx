import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProxySettingsCard } from './proxy/ProxySettingsCard';
import { ApiStatusOverview } from './proxy/ApiStatusOverview';
import { DataUsageSettings } from './proxy/DataUsageSettings';
import { Cog, Wifi, BarChart3 } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Cog className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <Tabs defaultValue="proxies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
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
            <span>Data Usage</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proxies" className="space-y-6">
          <ProxySettingsCard />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <ApiStatusOverview />
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <DataUsageSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};