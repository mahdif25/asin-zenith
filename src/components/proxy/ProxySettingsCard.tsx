import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProxyManager } from '@/hooks/useProxyManager';
import { Loader2, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ProxySettingsCard = () => {
  const { toast } = useToast();
  const { proxyProviders, testConnection, saveProxyConfig, isLoading } = useProxyManager();
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const handleTest = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const result = await testConnection(providerId);
      toast({
        title: result.success ? 'Connection Successful' : 'Connection Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Setup instructions copied successfully',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proxy Configuration</CardTitle>
        <CardDescription>
          Configure your residential proxy providers for optimal scraping performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bright-data" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bright-data">Bright Data</TabsTrigger>
            <TabsTrigger value="smartproxy">SmartProxy</TabsTrigger>
            <TabsTrigger value="oxylabs">Oxylabs</TabsTrigger>
          </TabsList>

          <TabsContent value="bright-data" className="space-y-4">
            <ProxyProviderForm
              providerId="bright-data"
              provider={proxyProviders['bright-data']}
              onSave={saveProxyConfig}
              onTest={handleTest}
              isLoading={isLoading}
              isTesting={testingProvider === 'bright-data'}
            />
            <SetupInstructions provider="bright-data" onCopy={copyToClipboard} />
          </TabsContent>

          <TabsContent value="smartproxy" className="space-y-4">
            <ProxyProviderForm
              providerId="smartproxy"
              provider={proxyProviders['smartproxy']}
              onSave={saveProxyConfig}
              onTest={handleTest}
              isLoading={isLoading}
              isTesting={testingProvider === 'smartproxy'}
            />
            <SetupInstructions provider="smartproxy" onCopy={copyToClipboard} />
          </TabsContent>

          <TabsContent value="oxylabs" className="space-y-4">
            <ProxyProviderForm
              providerId="oxylabs"
              provider={proxyProviders['oxylabs']}
              onSave={saveProxyConfig}
              onTest={handleTest}
              isLoading={isLoading}
              isTesting={testingProvider === 'oxylabs'}
            />
            <SetupInstructions provider="oxylabs" onCopy={copyToClipboard} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ProxyProviderFormProps {
  providerId: string;
  provider: any;
  onSave: (providerId: string, config: any) => Promise<void>;
  onTest: (providerId: string) => void;
  isLoading: boolean;
  isTesting: boolean;
}

const ProxyProviderForm = ({ providerId, provider, onSave, onTest, isLoading, isTesting }: ProxyProviderFormProps) => {
  const [config, setConfig] = useState({
    endpoint: provider?.endpoint || '',
    username: provider?.username || '',
    password: provider?.password || '',
    port: provider?.port || '22225',
    zones: provider?.zones || '',
    enabled: provider?.enabled || false,
  });

  const handleSave = async () => {
    await onSave(providerId, config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold capitalize">{providerId.replace('-', ' ')}</h3>
          <Badge variant={provider?.status === 'connected' ? 'default' : 'secondary'}>
            {provider?.status || 'Not Configured'}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(providerId)}
            disabled={!config.endpoint || !config.username || isTesting}
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>Test Connection</>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${providerId}-endpoint`}>Endpoint</Label>
          <Input
            id={`${providerId}-endpoint`}
            placeholder="proxy.provider.com"
            value={config.endpoint}
            onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${providerId}-port`}>Port</Label>
          <Input
            id={`${providerId}-port`}
            placeholder="22225"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${providerId}-username`}>Username</Label>
          <Input
            id={`${providerId}-username`}
            placeholder="your-username"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${providerId}-password`}>Password</Label>
          <Input
            id={`${providerId}-password`}
            type="password"
            placeholder="your-password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${providerId}-zones`}>Available Zones/Countries (comma-separated)</Label>
        <Textarea
          id={`${providerId}-zones`}
          placeholder="US, GB, DE, FR, ES, IT, CA, AU"
          value={config.zones}
          onChange={(e) => setConfig({ ...config, zones: e.target.value })}
          rows={3}
        />
      </div>

      {provider?.lastTest && (
        <Alert>
          <div className="flex items-center space-x-2">
            {provider.lastTest.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              Last test: {provider.lastTest.success ? 'Successful' : 'Failed'} - {provider.lastTest.message}
              <br />
              <span className="text-sm text-muted-foreground">
                {new Date(provider.lastTest.timestamp).toLocaleString()}
              </span>
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};

interface SetupInstructionsProps {
  provider: string;
  onCopy: (text: string) => void;
}

const SetupInstructions = ({ provider, onCopy }: SetupInstructionsProps) => {
  const instructions = {
    'bright-data': {
      title: 'Bright Data Setup',
      url: 'https://brightdata.com/',
      steps: [
        '1. Sign up at brightdata.com',
        '2. Go to Proxy & Scraping Infrastructure → Residential proxies',
        '3. Create a new proxy zone',
        '4. Select "Residential" proxy type',
        '5. Choose your target countries',
        '6. Copy the endpoint, username, and password',
        '7. Default port is usually 22225',
      ]
    },
    'smartproxy': {
      title: 'SmartProxy Setup',
      url: 'https://smartproxy.com/',
      steps: [
        '1. Sign up at smartproxy.com',
        '2. Go to Dashboard → Residential Proxies',
        '3. Create a new endpoint',
        '4. Select your target locations',
        '5. Choose authentication method (username/password)',
        '6. Copy the endpoint details',
        '7. Default port is usually 10000',
      ]
    },
    'oxylabs': {
      title: 'Oxylabs Setup',
      url: 'https://oxylabs.io/',
      steps: [
        '1. Sign up at oxylabs.io',
        '2. Go to Dashboard → Residential Proxies',
        '3. Create a new sub-user',
        '4. Select your target countries',
        '5. Choose sticky session preferences',
        '6. Copy the credentials',
        '7. Default endpoint: pr.oxylabs.io:7777',
      ]
    }
  };

  const instruction = instructions[provider as keyof typeof instructions];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{instruction.title}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(instruction.steps.join('\n'))}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(instruction.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Visit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {instruction.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};