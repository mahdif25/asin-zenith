import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataUsageSettings } from '@/hooks/useDataUsageSettings';
import { BarChart3, Settings, AlertTriangle, TrendingDown } from 'lucide-react';

export const DataUsageSettings = () => {
  const { settings, updateSettings, usage, isLoading } = useDataUsageSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Data Usage Management</h3>
      </div>

      <Tabs defaultValue="optimization" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="optimization" className="space-y-4">
          <OptimizationSettings settings={settings} onUpdate={updateSettings} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <UsageMonitoring usage={usage} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertSettings settings={settings} onUpdate={updateSettings} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface OptimizationSettingsProps {
  settings: any;
  onUpdate: (settings: any) => Promise<void>;
  isLoading: boolean;
}

const OptimizationSettings = ({ settings, onUpdate, isLoading }: OptimizationSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings || {
    blockImages: true,
    blockCSS: true,
    blockJS: false,
    blockFonts: true,
    blockAds: true,
    compressRequests: true,
    minifyHTML: false,
    cacheResponses: true,
    maxCacheSize: 100, // MB
  });

  const handleSave = async () => {
    await onUpdate(localSettings);
  };

  const estimatedSavings = calculateSavings(localSettings);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            <span>Content Filtering</span>
          </CardTitle>
          <CardDescription>
            Block unnecessary content to reduce data usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="block-images"
                checked={localSettings.blockImages}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, blockImages: checked })
                }
              />
              <Label htmlFor="block-images">Block Images</Label>
              <Badge variant="secondary">~70% savings</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="block-css"
                checked={localSettings.blockCSS}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, blockCSS: checked })
                }
              />
              <Label htmlFor="block-css">Block CSS</Label>
              <Badge variant="secondary">~15% savings</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="block-js"
                checked={localSettings.blockJS}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, blockJS: checked })
                }
              />
              <Label htmlFor="block-js">Block JavaScript</Label>
              <Badge variant="secondary">~10% savings</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="block-fonts"
                checked={localSettings.blockFonts}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, blockFonts: checked })
                }
              />
              <Label htmlFor="block-fonts">Block Fonts</Label>
              <Badge variant="secondary">~3% savings</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="block-ads"
                checked={localSettings.blockAds}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, blockAds: checked })
                }
              />
              <Label htmlFor="block-ads">Block Ads</Label>
              <Badge variant="secondary">~20% savings</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="compress-requests"
                checked={localSettings.compressRequests}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, compressRequests: checked })
                }
              />
              <Label htmlFor="compress-requests">Compress Requests</Label>
              <Badge variant="secondary">~5% savings</Badge>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-md bg-green-50 border border-green-200">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Estimated Data Savings: {estimatedSavings}%
              </p>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Based on typical Amazon product pages
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Optimization</CardTitle>
          <CardDescription>
            Additional optimizations for response handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="cache-responses"
              checked={localSettings.cacheResponses}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, cacheResponses: checked })
              }
            />
            <Label htmlFor="cache-responses">Cache Responses</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cache-size">Max Cache Size (MB)</Label>
            <Input
              id="cache-size"
              type="number"
              value={localSettings.maxCacheSize}
              onChange={(e) => 
                setLocalSettings({ ...localSettings, maxCacheSize: parseInt(e.target.value) || 100 })
              }
              min="10"
              max="1000"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="minify-html"
              checked={localSettings.minifyHTML}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, minifyHTML: checked })
              }
            />
            <Label htmlFor="minify-html">Minify HTML</Label>
            <Badge variant="secondary">~2% savings</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UsageMonitoring = ({ usage }: { usage: any }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>Real-time data consumption metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{usage?.today || '0'} MB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{usage?.week || '0'} MB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{usage?.month || '0'} MB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{usage?.total || '0'} MB</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Limit</span>
              <span>{usage?.month || 0} / 10,000 MB</span>
            </div>
            <Progress value={((usage?.month || 0) / 10000) * 100} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usage?.byProvider && Object.entries(usage.byProvider).map(([provider, data]: [string, any]) => (
              <div key={provider} className="flex items-center justify-between">
                <span className="capitalize">{provider.replace('-', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{data.usage} MB</span>
                  <Progress value={(data.usage / (usage?.total || 1)) * 100} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AlertSettings = ({ settings, onUpdate, isLoading }: OptimizationSettingsProps) => {
  const [alertSettings, setAlertSettings] = useState(settings?.alerts || {
    enableAlerts: true,
    dailyLimit: 1000,
    weeklyLimit: 5000,
    monthlyLimit: 10000,
    emailNotifications: true,
    slackWebhook: '',
  });

  const handleSave = async () => {
    await onUpdate({ ...settings, alerts: alertSettings });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Usage Alerts</span>
        </CardTitle>
        <CardDescription>
          Get notified when approaching data limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="enable-alerts"
            checked={alertSettings.enableAlerts}
            onCheckedChange={(checked) => 
              setAlertSettings({ ...alertSettings, enableAlerts: checked })
            }
          />
          <Label htmlFor="enable-alerts">Enable Usage Alerts</Label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="daily-limit">Daily Limit (MB)</Label>
            <Input
              id="daily-limit"
              type="number"
              value={alertSettings.dailyLimit}
              onChange={(e) => 
                setAlertSettings({ ...alertSettings, dailyLimit: parseInt(e.target.value) || 1000 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly-limit">Weekly Limit (MB)</Label>
            <Input
              id="weekly-limit"
              type="number"
              value={alertSettings.weeklyLimit}
              onChange={(e) => 
                setAlertSettings({ ...alertSettings, weeklyLimit: parseInt(e.target.value) || 5000 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly-limit">Monthly Limit (MB)</Label>
            <Input
              id="monthly-limit"
              type="number"
              value={alertSettings.monthlyLimit}
              onChange={(e) => 
                setAlertSettings({ ...alertSettings, monthlyLimit: parseInt(e.target.value) || 10000 })
              }
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="email-notifications"
            checked={alertSettings.emailNotifications}
            onCheckedChange={(checked) => 
              setAlertSettings({ ...alertSettings, emailNotifications: checked })
            }
          />
          <Label htmlFor="email-notifications">Email Notifications</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slack-webhook">Slack Webhook URL (optional)</Label>
          <Input
            id="slack-webhook"
            placeholder="https://hooks.slack.com/..."
            value={alertSettings.slackWebhook}
            onChange={(e) => 
              setAlertSettings({ ...alertSettings, slackWebhook: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Alert Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const calculateSavings = (settings: any) => {
  let savings = 0;
  if (settings.blockImages) savings += 70;
  if (settings.blockCSS) savings += 15;
  if (settings.blockJS) savings += 10;
  if (settings.blockFonts) savings += 3;
  if (settings.blockAds) savings += 20;
  if (settings.compressRequests) savings += 5;
  if (settings.minifyHTML) savings += 2;
  
  return Math.min(savings, 85); // Cap at 85% max savings
};