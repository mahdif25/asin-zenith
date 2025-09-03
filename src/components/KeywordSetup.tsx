import React, { useState } from 'react';
import { useTrackingJobs, CreateTrackingJobData } from '@/hooks/useTrackingJobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, X, Play } from 'lucide-react';

const MARKETPLACES = [
  { code: 'US', name: 'United States', domain: 'amazon.com' },
  { code: 'UK', name: 'United Kingdom', domain: 'amazon.co.uk' },
  { code: 'DE', name: 'Germany', domain: 'amazon.de' },
  { code: 'FR', name: 'France', domain: 'amazon.fr' },
  { code: 'IT', name: 'Italy', domain: 'amazon.it' },
  { code: 'ES', name: 'Spain', domain: 'amazon.es' },
  { code: 'CA', name: 'Canada', domain: 'amazon.ca' },
  { code: 'JP', name: 'Japan', domain: 'amazon.co.jp' },
  { code: 'AU', name: 'Australia', domain: 'amazon.com.au' },
];

export const KeywordSetup = () => {
  const { createTrackingJob, isCreating, trackingJobs, runTrackingJob, isRunning } = useTrackingJobs();
  
  const [formData, setFormData] = useState<CreateTrackingJobData>({
    asin: '',
    marketplace: 'US',
    keywords: [],
    tracking_frequency: 'daily',
    random_delay_min: 20,
    random_delay_max: 30,
  });
  
  const [newKeyword, setNewKeyword] = useState('');
  const [bulkKeywords, setBulkKeywords] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const addBulkKeywords = () => {
    const keywords = bulkKeywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k && !formData.keywords.includes(k));
    
    if (keywords.length > 0) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, ...keywords]
      }));
      setBulkKeywords('');
    }
  };

  const handleSubmit = () => {
    if (!formData.asin.trim()) {
      alert('Please enter an ASIN');
      return;
    }
    
    if (formData.keywords.length === 0) {
      alert('Please add at least one keyword');
      return;
    }

    createTrackingJob(formData);
  };

  const handleRunJob = (jobId: string) => {
    runTrackingJob(jobId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tracking Configuration</CardTitle>
          <CardDescription>
            Set up your Amazon keyword tracking parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asin">ASIN</Label>
              <Input
                id="asin"
                value={formData.asin}
                onChange={(e) => setFormData(prev => ({ ...prev, asin: e.target.value }))}
                placeholder="B08N5WRWNW"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Marketplace</Label>
              <Select
                value={formData.marketplace}
                onValueChange={(value) => setFormData(prev => ({ ...prev, marketplace: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACES.map((market) => (
                    <SelectItem key={market.code} value={market.code}>
                      {market.name} ({market.domain})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Tracking Frequency</Label>
            <Select
              value={formData.tracking_frequency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tracking_frequency: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="every_6_hours">Every 6 Hours</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keywords Management</CardTitle>
          <CardDescription>
            Add keywords to track for your ASIN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Bulk Add Keywords (one per line)</Label>
            <Textarea
              placeholder="wireless headphones&#10;bluetooth earbuds&#10;noise cancelling headphones"
              value={bulkKeywords}
              onChange={(e) => setBulkKeywords(e.target.value)}
              rows={4}
            />
            <Button onClick={addBulkKeywords} variant="secondary" size="sm">
              Add Bulk Keywords
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {formData.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {keyword}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 ml-1"
                  onClick={() => removeKeyword(keyword)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking Schedule</CardTitle>
          <CardDescription>Configure when and how often to track your keywords</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Tracking Frequency</Label>
              <Select
                value={formData.tracking_frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tracking_frequency: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="every_6_hours">Every 6 Hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay">Random Delay Range (seconds)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={formData.random_delay_min}
                  onChange={(e) => setFormData(prev => ({ ...prev, random_delay_min: parseInt(e.target.value) || 20 }))}
                  min="10"
                  max="60"
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="number"
                  value={formData.random_delay_max}
                  onChange={(e) => setFormData(prev => ({ ...prev, random_delay_max: parseInt(e.target.value) || 30 }))}
                  min="10"
                  max="60"
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Tracking Jobs</CardTitle>
          <CardDescription>Manage your current tracking configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {trackingJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tracking jobs yet. Create your first one above!
            </p>
          ) : (
            <div className="space-y-4">
              {trackingJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">ASIN: {job.asin}</h4>
                      <p className="text-sm text-muted-foreground">
                        {job.marketplace} • {job.keywords.length} keywords • {job.tracking_frequency}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunJob(job.id)}
                        disabled={isRunning}
                      >
                        {isRunning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.keywords.slice(0, 5).map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {job.keywords.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.keywords.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        size="lg"
        disabled={isCreating}
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Tracking Job...
          </>
        ) : (
          'Start Keyword Tracking'
        )}
      </Button>
    </div>
  );
};