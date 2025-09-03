import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, Settings, Clock } from "lucide-react";

interface TrackingSettings {
  asin: string;
  keywords: string[];
  marketplace: string;
  trackingType: 'organic' | 'sponsored' | 'both';
  interval: 'hourly' | 'daily';
  frequency: number;
  randomDelay: boolean;
}

const MARKETPLACES = [
  { value: 'amazon.com', label: 'United States (amazon.com)' },
  { value: 'amazon.co.uk', label: 'United Kingdom (amazon.co.uk)' },
  { value: 'amazon.de', label: 'Germany (amazon.de)' },
  { value: 'amazon.fr', label: 'France (amazon.fr)' },
  { value: 'amazon.it', label: 'Italy (amazon.it)' },
  { value: 'amazon.es', label: 'Spain (amazon.es)' },
  { value: 'amazon.ca', label: 'Canada (amazon.ca)' },
  { value: 'amazon.co.jp', label: 'Japan (amazon.co.jp)' },
];

export const KeywordSetup = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TrackingSettings>({
    asin: '',
    keywords: [],
    marketplace: '',
    trackingType: 'both',
    interval: 'daily',
    frequency: 1,
    randomDelay: true
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [bulkKeywords, setBulkKeywords] = useState('');

  const addKeyword = () => {
    if (keywordInput.trim() && !settings.keywords.includes(keywordInput.trim())) {
      setSettings(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addBulkKeywords = () => {
    const newKeywords = bulkKeywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k && !settings.keywords.includes(k));
    
    setSettings(prev => ({
      ...prev,
      keywords: [...prev.keywords, ...newKeywords]
    }));
    setBulkKeywords('');
  };

  const handleSubmit = () => {
    if (!settings.asin || !settings.marketplace || settings.keywords.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in ASIN, marketplace, and add at least one keyword.",
        variant: "destructive",
      });
      return;
    }

    // This would need Supabase backend integration
    toast({
      title: "Backend Required",
      description: "Connect to Supabase to enable keyword tracking functionality.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tracking Configuration
          </CardTitle>
          <CardDescription>
            Set up your ASIN keyword tracking parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ASIN Input */}
          <div className="space-y-2">
            <Label htmlFor="asin">Amazon ASIN</Label>
            <Input
              id="asin"
              placeholder="B08N5WRWNW"
              value={settings.asin}
              onChange={(e) => setSettings(prev => ({ ...prev, asin: e.target.value }))}
              className="font-mono"
            />
          </div>

          {/* Marketplace Selection */}
          <div className="space-y-2">
            <Label>Amazon Marketplace</Label>
            <Select
              value={settings.marketplace}
              onValueChange={(value) => setSettings(prev => ({ ...prev, marketplace: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marketplace" />
              </SelectTrigger>
              <SelectContent>
                {MARKETPLACES.map((market) => (
                  <SelectItem key={market.value} value={market.value}>
                    {market.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tracking Type */}
          <div className="space-y-2">
            <Label>Tracking Type</Label>
            <Select
              value={settings.trackingType}
              onValueChange={(value: 'organic' | 'sponsored' | 'both') => 
                setSettings(prev => ({ ...prev, trackingType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organic">Organic Only</SelectItem>
                <SelectItem value="sponsored">Sponsored Only</SelectItem>
                <SelectItem value="both">Both (Separate Reports)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Keywords Management */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Keywords Management</CardTitle>
          <CardDescription>
            Add keywords to track for your ASIN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Keyword Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Bulk Keywords Input */}
          <div className="space-y-2">
            <Label>Bulk Add Keywords (one per line)</Label>
            <Textarea
              placeholder={`wireless headphones\nbluetooth earbuds\nnoise cancelling headphones`}
              value={bulkKeywords}
              onChange={(e) => setBulkKeywords(e.target.value)}
              rows={4}
            />
            <Button onClick={addBulkKeywords} variant="secondary" size="sm">
              Add Bulk Keywords
            </Button>
          </div>

          {/* Keywords List */}
          {settings.keywords.length > 0 && (
            <div className="space-y-2">
              <Label>Added Keywords ({settings.keywords.length})</Label>
              <div className="flex flex-wrap gap-2">
                {settings.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="pr-1">
                    {keyword}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeKeyword(keyword)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Schedule */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tracking Schedule
          </CardTitle>
          <CardDescription>
            Configure tracking frequency and anti-detection settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tracking Interval</Label>
              <Select
                value={settings.interval}
                onValueChange={(value: 'hourly' | 'daily') => 
                  setSettings(prev => ({ ...prev, interval: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Frequency (every {settings.interval === 'hourly' ? 'X hours' : 'X days'})
              </Label>
              <Input
                type="number"
                min="1"
                max={settings.interval === 'hourly' ? 24 : 30}
                value={settings.frequency}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  frequency: parseInt(e.target.value) || 1 
                }))}
              />
            </div>
          </div>

          <div className="p-4 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-info">Anti-Detection Features</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  • 20-30 second randomized delays between requests<br/>
                  • Randomized request patterns to avoid systematic blocking<br/>
                  • User-agent rotation and session management<br/>
                  • Distributed tracking schedule across time periods
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" size="lg">
            Start Keyword Tracking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};