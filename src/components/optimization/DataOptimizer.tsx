import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataUsageSettings } from '@/hooks/useDataUsageSettings';
import { Settings, Zap, Shield, BarChart3, TrendingDown } from 'lucide-react';

export const DataOptimizer = () => {
  const { settings, usage, updateSettings, isLoading } = useDataUsageSettings();
  const [optimizedSettings, setOptimizedSettings] = useState(settings);
  const [savingsEstimate, setSavingsEstimate] = useState(0);

  useEffect(() => {
    setOptimizedSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (optimizedSettings) {
      calculateSavings();
    }
  }, [optimizedSettings]);

  const calculateSavings = () => {
    if (!optimizedSettings || !usage) return;

    let savings = 0;
    const baseUsage = usage.month || 100; // MB

    // Calculate savings from different optimizations
    if (optimizedSettings.blockImages) savings += baseUsage * 0.4;
    if (optimizedSettings.blockCSS) savings += baseUsage * 0.1;
    if (optimizedSettings.blockJS) savings += baseUsage * 0.15;
    if (optimizedSettings.compressRequests) savings += baseUsage * 0.2;
    if (optimizedSettings.minifyHTML) savings += baseUsage * 0.05;
    if (optimizedSettings.cacheResponses) savings += baseUsage * 0.3;

    setSavingsEstimate(Math.min(savings, baseUsage * 0.8)); // Max 80% savings
  };

  const handleSettingChange = (key: string, value: any) => {
    setOptimizedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyOptimizations = async () => {
    await updateSettings(optimizedSettings);
  };

  const optimizationOptions = [
    {
      key: 'blockImages',
      title: 'Block Images',
      description: 'Skip downloading product images during scraping',
      icon: <Shield className="h-4 w-4" />,
      savings: 40,
      impact: 'High'
    },
    {
      key: 'blockCSS',
      title: 'Block CSS',
      description: 'Skip downloading stylesheets',
      icon: <TrendingDown className="h-4 w-4" />,
      savings: 10,
      impact: 'Low'
    },
    {
      key: 'blockJS',
      title: 'Block JavaScript',
      description: 'Skip downloading JavaScript files',
      icon: <Zap className="h-4 w-4" />,
      savings: 15,
      impact: 'Medium'
    },
    {
      key: 'compressRequests',
      title: 'Compress Requests',
      description: 'Enable gzip compression for all requests',
      icon: <BarChart3 className="h-4 w-4" />,
      savings: 20,
      impact: 'Medium'
    },
    {
      key: 'minifyHTML',
      title: 'Minify HTML',
      description: 'Remove unnecessary whitespace from responses',
      icon: <Settings className="h-4 w-4" />,
      savings: 5,
      impact: 'Low'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Data Optimizer</h3>
          <p className="text-sm text-muted-foreground">
            Optimize your data usage with smart content filtering
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          {Math.round(savingsEstimate)} MB/month saved
        </Badge>
      </div>

      <Tabs defaultValue="optimizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-4">
          {/* Quick Optimization Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Presets</CardTitle>
              <CardDescription>
                Apply pre-configured optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setOptimizedSettings({
                      ...optimizedSettings,
                      blockImages: false,
                      blockCSS: false,
                      blockJS: false,
                      compressRequests: true,
                      minifyHTML: false
                    });
                  }}
                >
                  Conservative
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setOptimizedSettings({
                      ...optimizedSettings,
                      blockImages: true,
                      blockCSS: true,
                      blockJS: true,
                      compressRequests: true,
                      minifyHTML: true
                    });
                  }}
                >
                  Aggressive
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setOptimizedSettings({
                      ...optimizedSettings,
                      blockImages: true,
                      blockCSS: false,
                      blockJS: true,
                      compressRequests: true,
                      minifyHTML: true
                    });
                  }}
                >
                  Balanced
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Individual Optimizations */}
          <div className="grid gap-4">
            {optimizationOptions.map(option => (
              <Card key={option.key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {option.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{option.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge 
                          variant={option.impact === 'High' ? 'default' : 
                                 option.impact === 'Medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {option.savings}% savings
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.impact} impact
                        </p>
                      </div>
                      <Switch
                        checked={optimizedSettings?.[option.key] || false}
                        onCheckedChange={(checked) => 
                          handleSettingChange(option.key, checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cache Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Cache responses to reduce data usage
                  </p>
                </div>
                <Switch
                  checked={optimizedSettings?.cacheResponses || false}
                  onCheckedChange={(checked) => 
                    handleSettingChange('cacheResponses', checked)
                  }
                />
              </div>
              
              {optimizedSettings?.cacheResponses && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Max Cache Size (MB)</span>
                    <span className="text-sm font-medium">
                      {optimizedSettings?.maxCacheSize || 100}
                    </span>
                  </div>
                  <Slider
                    value={[optimizedSettings?.maxCacheSize || 100]}
                    onValueChange={([value]) => 
                      handleSettingChange('maxCacheSize', value)
                    }
                    min={10}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            onClick={applyOptimizations} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Applying...' : 'Apply Optimizations'}
          </Button>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{usage?.today || 0} MB</p>
                  <Progress value={(usage?.today || 0) / 10} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{usage?.month || 0} MB</p>
                  <Progress value={(usage?.month || 0) / 1000} className="h-2" />
                </div>
              </div>
              
              {usage?.byProvider && Object.keys(usage.byProvider).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Usage by Provider</p>
                  {Object.entries(usage.byProvider).map(([provider, data]: [string, any]) => (
                    <div key={provider} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{provider}</span>
                      <span className="text-sm font-medium">{data.usage || 0} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Request Timeout (seconds)</span>
                  <span className="text-sm font-medium">
                    {(optimizedSettings as any)?.requestTimeout || 30}
                  </span>
                </div>
                <Slider
                  value={[(optimizedSettings as any)?.requestTimeout || 30]}
                  onValueChange={([value]) => 
                    handleSettingChange('requestTimeout', value)
                  }
                  min={5}
                  max={120}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Max Concurrent Requests</span>
                  <span className="text-sm font-medium">
                    {(optimizedSettings as any)?.maxConcurrentRequests || 3}
                  </span>
                </div>
                <Slider
                  value={[(optimizedSettings as any)?.maxConcurrentRequests || 3]}
                  onValueChange={([value]) => 
                    handleSettingChange('maxConcurrentRequests', value)
                  }
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};