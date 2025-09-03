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
      // Use edge function instead of RPC
      const { data, error } = await supabase.functions.invoke('proxy-helper-functions', {
        body: { type: 'get_data_usage_settings', p_user_id: user?.id }
      });

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.data && data.data.length > 0) {
        setSettings(data.data[0].settings);
      }
    } catch (error) {
      console.error('Error loading data usage settings:', error);
    }
  };

  const loadUsageData = async () => {
    try {
      // Get usage data from API requests table using edge function
      const { data: requests, error } = await supabase.functions.invoke('proxy-helper-functions', {
        body: { type: 'get_data_usage_stats', p_user_id: user?.id }
      });

      if (error) throw error;

      if (requests && requests.data && requests.data.length > 0) {
        const stats = requests.data[0];
        setUsage({
          today: Math.round((stats.today_usage || 0) / 1024 / 1024), // Convert to MB
          week: Math.round((stats.week_usage || 0) / 1024 / 1024),
          month: Math.round((stats.month_usage || 0) / 1024 / 1024),
          total: Math.round((stats.total_usage || 0) / 1024 / 1024),
          byProvider: stats.by_provider || {},
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

      const { error } = await supabase.functions.invoke('proxy-helper-functions', {
        body: {
          type: 'upsert_data_usage_settings',
          p_user_id: user.id,
          p_settings: updatedSettings
        }
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