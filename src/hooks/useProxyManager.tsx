import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface ProxyProvider {
  id: string;
  endpoint: string;
  username: string;
  password: string;
  port: string;
  zones: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastTest?: {
    success: boolean;
    message: string;
    timestamp: number;
    responseTime?: number;
  };
  metrics?: {
    successRate: number;
    avgResponseTime: number;
    dataUsed: number;
    requestCount: number;
  };
}

interface ProxyConfig {
  [key: string]: ProxyProvider;
}

export const useProxyManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proxyProviders, setProxyProviders] = useState<ProxyConfig>({
    'bright-data': {
      id: 'bright-data',
      endpoint: '',
      username: '',
      password: '',
      port: '22225',
      zones: 'US,GB,DE,FR,ES,IT,CA,AU',
      enabled: false,
      status: 'disconnected',
    },
    'smartproxy': {
      id: 'smartproxy',
      endpoint: '',
      username: '',
      password: '',
      port: '10000',
      zones: 'US,GB,DE,FR,ES,IT,CA,AU',
      enabled: false,
      status: 'disconnected',
    },
    'oxylabs': {
      id: 'oxylabs',
      endpoint: 'pr.oxylabs.io',
      username: '',
      password: '',
      port: '7777',
      zones: 'US,GB,DE,FR,ES,IT,CA,AU',
      enabled: false,
      status: 'disconnected',
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load proxy configurations from Supabase on mount
  useEffect(() => {
    if (user) {
      loadProxyConfigurations();
    }
  }, [user]);

  const loadProxyConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('proxy_configurations')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedProviders = { ...proxyProviders };
        data.forEach((config: any) => {
          if (updatedProviders[config.provider_id]) {
            updatedProviders[config.provider_id] = {
              ...updatedProviders[config.provider_id],
              ...config.configuration,
              lastTest: config.last_test_result,
              metrics: config.metrics,
            };
          }
        });
        setProxyProviders(updatedProviders);
      }
    } catch (error) {
      console.error('Error loading proxy configurations:', error);
    }
  };

  const saveProxyConfig = async (providerId: string, config: Partial<ProxyProvider>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update local state
      setProxyProviders(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          ...config,
        },
      }));

      // Save to Supabase
      const { error } = await supabase
        .from('proxy_configurations')
        .upsert({
          user_id: user.id,
          provider_id: providerId,
          configuration: {
            endpoint: config.endpoint,
            username: config.username,
            password: config.password,
            port: config.port,
            zones: config.zones,
            enabled: config.enabled,
          },
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Configuration Saved',
        description: `${providerId.replace('-', ' ')} settings have been updated.`,
      });
    } catch (error) {
      console.error('Error saving proxy configuration:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save proxy configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (providerId: string): Promise<{ success: boolean; message: string; responseTime?: number }> => {
    const provider = proxyProviders[providerId];
    if (!provider || !provider.endpoint || !provider.username) {
      return {
        success: false,
        message: 'Provider not configured properly',
      };
    }

    try {
      const startTime = Date.now();
      
      // Call our edge function to test the proxy
      const { data, error } = await supabase.functions.invoke('test-proxy-connection', {
        body: {
          provider: providerId,
          config: {
            endpoint: provider.endpoint,
            port: provider.port,
            username: provider.username,
            password: provider.password,
          },
        },
      });

      const responseTime = Date.now() - startTime;

      if (error) throw error;

      const testResult = {
        success: data.success,
        message: data.message,
        responseTime,
        timestamp: Date.now(),
      };

      // Update local state with test result
      setProxyProviders(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          status: data.success ? 'connected' : 'error',
          lastTest: testResult,
        },
      }));

      // Save test result to database
      if (user) {
        await supabase
          .from('proxy_configurations')
          .update({
            last_test_result: testResult,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('provider_id', providerId);
      }

      return testResult;
    } catch (error) {
      const testResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
        timestamp: Date.now(),
      };

      setProxyProviders(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          status: 'error',
          lastTest: testResult,
        },
      }));

      return testResult;
    }
  };

  const testAllConnections = async () => {
    const enabledProviders = Object.keys(proxyProviders).filter(
      id => proxyProviders[id].enabled && proxyProviders[id].endpoint
    );

    for (const providerId of enabledProviders) {
      await testConnection(providerId);
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getOverallStatus = (): 'online' | 'offline' | 'error' => {
    const enabledProviders = Object.values(proxyProviders).filter(p => p.enabled);
    if (enabledProviders.length === 0) return 'offline';

    const connectedProviders = enabledProviders.filter(p => p.status === 'connected');
    if (connectedProviders.length === 0) return 'error';
    if (connectedProviders.length === enabledProviders.length) return 'online';
    
    return 'error'; // Some connected, some not
  };

  return {
    proxyProviders,
    isLoading,
    saveProxyConfig,
    testConnection,
    testAllConnections,
    getOverallStatus,
    loadProxyConfigurations,
  };
};