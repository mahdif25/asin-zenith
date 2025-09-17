import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Zap, TrendingUp, AlertTriangle, Settings } from 'lucide-react';

interface ScheduleConfig {
  frequency: 'hourly' | 'every_6h' | 'daily' | 'weekly' | 'custom';
  customInterval: number;
  customUnit: 'minutes' | 'hours' | 'days';
  timeZone: string;
  specificTimes: string[];
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  randomDelay: {
    enabled: boolean;
    min: number;
    max: number;
  };
  loadBalancing: {
    enabled: boolean;
    maxConcurrent: number;
    spreadRequests: boolean;
  };
}

export const AdvancedScheduler = () => {
  const [config, setConfig] = useState<ScheduleConfig>({
    frequency: 'daily',
    customInterval: 1,
    customUnit: 'hours',
    timeZone: 'UTC',
    specificTimes: ['09:00', '15:00'],
    workingHours: {
      enabled: true,
      start: '09:00',
      end: '17:00'
    },
    randomDelay: {
      enabled: true,
      min: 5,
      max: 30
    },
    loadBalancing: {
      enabled: true,
      maxConcurrent: 3,
      spreadRequests: true
    }
  });

  const frequencyOptions = [
    { value: 'hourly', label: 'Every Hour', description: 'High frequency tracking' },
    { value: 'every_6h', label: 'Every 6 Hours', description: 'Balanced approach' },
    { value: 'daily', label: 'Daily', description: 'Standard frequency' },
    { value: 'weekly', label: 'Weekly', description: 'Low frequency' },
    { value: 'custom', label: 'Custom', description: 'Define your own interval' }
  ];

  const timeZones = [
    'UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Europe/Berlin',
    'Asia/Tokyo', 'Australia/Sydney', 'America/New_York'
  ];

  const updateConfig = (key: keyof ScheduleConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedConfig = (parent: keyof ScheduleConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [key]: value
      }
    }));
  };

  const addSpecificTime = () => {
    const newTime = '12:00';
    setConfig(prev => ({
      ...prev,
      specificTimes: [...prev.specificTimes, newTime]
    }));
  };

  const removeSpecificTime = (index: number) => {
    setConfig(prev => ({
      ...prev,
      specificTimes: prev.specificTimes.filter((_, i) => i !== index)
    }));
  };

  const updateSpecificTime = (index: number, time: string) => {
    setConfig(prev => ({
      ...prev,
      specificTimes: prev.specificTimes.map((t, i) => i === index ? time : t)
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Advanced Scheduler</h3>
        <p className="text-sm text-muted-foreground">
          Configure intelligent tracking schedules and anti-detection timing
        </p>
      </div>

      <Tabs defaultValue="frequency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tracking Frequency</CardTitle>
              <CardDescription>
                Set how often your keywords are checked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {frequencyOptions.map(option => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      config.frequency === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => updateConfig('frequency', option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        {config.frequency === option.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {config.frequency === 'custom' && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Interval</Label>
                      <Input
                        type="number"
                        min="1"
                        value={config.customInterval}
                        onChange={(e) => updateConfig('customInterval', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Select
                        value={config.customUnit}
                        onValueChange={(value) => updateConfig('customUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Zone */}
              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Select
                  value={config.timeZone}
                  onValueChange={(value) => updateConfig('timeZone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeZones.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Working Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Working Hours Only</Label>
                  <Switch
                    checked={config.workingHours.enabled}
                    onCheckedChange={(checked) => 
                      updateNestedConfig('workingHours', 'enabled', checked)
                    }
                  />
                </div>
                
                {config.workingHours.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Start Time</Label>
                      <Input
                        type="time"
                        value={config.workingHours.start}
                        onChange={(e) => 
                          updateNestedConfig('workingHours', 'start', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Time</Label>
                      <Input
                        type="time"
                        value={config.workingHours.end}
                        onChange={(e) => 
                          updateNestedConfig('workingHours', 'end', e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Specific Times */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Specific Times</Label>
                  <Button size="sm" variant="outline" onClick={addSpecificTime}>
                    Add Time
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {config.specificTimes.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateSpecificTime(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSpecificTime(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4">
            {/* Random Delay */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Random Delay</span>
                </CardTitle>
                <CardDescription>
                  Add random delays to avoid detection patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Random Delays</Label>
                  <Switch
                    checked={config.randomDelay.enabled}
                    onCheckedChange={(checked) => 
                      updateNestedConfig('randomDelay', 'enabled', checked)
                    }
                  />
                </div>

                {config.randomDelay.enabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Delay Range (minutes)</span>
                        <span>{config.randomDelay.min} - {config.randomDelay.max}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Min</Label>
                          <Slider
                            value={[config.randomDelay.min]}
                            onValueChange={([value]) => 
                              updateNestedConfig('randomDelay', 'min', value)
                            }
                            min={1}
                            max={60}
                            step={1}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max</Label>
                          <Slider
                            value={[config.randomDelay.max]}
                            onValueChange={([value]) => 
                              updateNestedConfig('randomDelay', 'max', value)
                            }
                            min={config.randomDelay.min}
                            max={120}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Load Balancing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Load Balancing</span>
                </CardTitle>
                <CardDescription>
                  Distribute requests to optimize performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Load Balancing</Label>
                  <Switch
                    checked={config.loadBalancing.enabled}
                    onCheckedChange={(checked) => 
                      updateNestedConfig('loadBalancing', 'enabled', checked)
                    }
                  />
                </div>

                {config.loadBalancing.enabled && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Max Concurrent Requests</span>
                        <span>{config.loadBalancing.maxConcurrent}</span>
                      </div>
                      <Slider
                        value={[config.loadBalancing.maxConcurrent]}
                        onValueChange={([value]) => 
                          updateNestedConfig('loadBalancing', 'maxConcurrent', value)
                        }
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Spread Requests</Label>
                      <Switch
                        checked={config.loadBalancing.spreadRequests}
                        onCheckedChange={(checked) => 
                          updateNestedConfig('loadBalancing', 'spreadRequests', checked)
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule Preview</CardTitle>
              <CardDescription>
                Preview how your schedule will work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Frequency</span>
                  <Badge variant="outline">
                    {config.frequency === 'custom' 
                      ? `Every ${config.customInterval} ${config.customUnit}`
                      : frequencyOptions.find(f => f.value === config.frequency)?.label
                    }
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Time Zone</span>
                  <Badge variant="outline">{config.timeZone}</Badge>
                </div>

                {config.workingHours.enabled && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Working Hours</span>
                    <Badge variant="outline">
                      {config.workingHours.start} - {config.workingHours.end}
                    </Badge>
                  </div>
                )}

                {config.randomDelay.enabled && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Random Delay</span>
                    <Badge variant="outline">
                      {config.randomDelay.min}-{config.randomDelay.max} min
                    </Badge>
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Next Execution Times
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>• Today 14:30 (in 2h 15m)</div>
                    <div>• Tomorrow 09:00 (in 19h 45m)</div>
                    <div>• Tomorrow 15:00 (in 25h 45m)</div>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Apply Schedule Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};