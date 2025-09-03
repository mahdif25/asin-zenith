import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DataUsageSettings {
  blockImages: boolean;
  blockCSS: boolean;
  blockJS: boolean;
  blockFonts: boolean;
  blockAds: boolean;
  compressRequests: boolean;
  minifyHTML: boolean;
  cacheResponses: boolean;
  maxCacheSize: number;
  alerts: {
    enableAlerts: boolean;
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
    emailNotifications: boolean;
    slackWebhook: string;
  };
}

interface DataUsage {
  today: number;
  week: number;
  month: number;
  total: number;
  byProvider: {
    [key: string]: {
      usage: number;
      requests: number;
    };
  };
}

export const useDataUsageSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<DataUsageSettings>({
    blockImages: true,
    blockCSS: true,
    blockJS: false,
    blockFonts: true,
    blockAds: true,
    compressRequests: true,
    minifyHTML: false,
    cacheResponses: true,
    maxCacheSize: 100,
    alerts: {
      enableAlerts: true,
      dailyLimit: 1000,
      weeklyLimit: 5000,
      monthlyLimit: 10000,
      emailNotifications: true,
      slackWebhook: '',
    },
  });
  const [usage, setUsage] = useState<DataUsage>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    byProvider: {},
  });

  useEffect(() => {
    if (user) {
      loadSettings();
      loadUsageData();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('data_usage_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading data usage settings:', error);
    }
  };

  const loadUsageData = async () => {
    try {
      // Get usage data from API requests table
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: requests, error } = await supabase
        .from('api_requests')
        .select('created_at, data_used, marketplace')
        .eq('user_id', user?.id)
        .gte('created_at', monthAgo.toISOString());

      if (error) throw error;

      if (requests) {
        const todayUsage = requests
          .filter(r => new Date(r.created_at) >= today)
          .reduce((sum, r) => sum + (r.data_used || 0), 0);

        const weekUsage = requests
          .filter(r => new Date(r.created_at) >= weekAgo)
          .reduce((sum, r) => sum + (r.data_used || 0), 0);

        const monthUsage = requests
          .reduce((sum, r) => sum + (r.data_used || 0), 0);

        const byProvider = requests.reduce((acc: any, r) => {
          const provider = r.marketplace || 'unknown';
          if (!acc[provider]) {
            acc[provider] = { usage: 0, requests: 0 };
          }
          acc[provider].usage += r.data_used || 0;
          acc[provider].requests += 1;
          return acc;
        }, {});

        setUsage({
          today: Math.round(todayUsage / 1024 / 1024), // Convert to MB
          week: Math.round(weekUsage / 1024 / 1024),
          month: Math.round(monthUsage / 1024 / 1024),
          total: Math.round(monthUsage / 1024 / 1024),
          byProvider: Object.entries(byProvider).reduce((acc: any, [key, value]: [string, any]) => {
            acc[key] = {
              usage: Math.round(value.usage / 1024 / 1024),
              requests: value.requests,
            };
            return acc;
          }, {}),
        });
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<DataUsageSettings>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      const { error } = await supabase
        .from('data_usage_settings')
        .upsert({
          user_id: user.id,
          settings: updatedSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Settings Updated',
        description: 'Data usage settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating data usage settings:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    usage,
    isLoading,
    updateSettings,
    loadUsageData,
  };
};