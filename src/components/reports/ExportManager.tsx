import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useExportData } from '@/hooks/useExportData';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, FileText, BarChart3, Calendar as CalendarIcon,
  FileSpreadsheet, Image, Settings, Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface ExportConfig {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  dateRange: {
    from: Date;
    to: Date;
  };
  dataTypes: string[];
  includeCharts: boolean;
  groupBy: 'keyword' | 'asin' | 'date' | 'marketplace';
}

export const ExportManager = () => {
  const { exportReport, isExporting } = useExportData();
  const { toast } = useToast();
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date()
    },
    dataTypes: ['rankings', 'performance'],
    includeCharts: false,
    groupBy: 'keyword'
  });

  const [showCalendar, setShowCalendar] = useState<'from' | 'to' | null>(null);

  const exportFormats = [
    {
      value: 'csv',
      label: 'CSV',
      description: 'Comma-separated values for spreadsheets',
      icon: <FileText className="h-4 w-4" />
    },
    {
      value: 'excel',
      label: 'Excel',
      description: 'Microsoft Excel workbook with charts',
      icon: <FileSpreadsheet className="h-4 w-4" />
    },
    {
      value: 'json',
      label: 'JSON',
      description: 'Machine-readable data format',
      icon: <Settings className="h-4 w-4" />
    },
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Formatted report with visualizations',
      icon: <FileText className="h-4 w-4" />
    }
  ];

  const dataTypeOptions = [
    { id: 'rankings', label: 'Keyword Rankings', description: 'Position data for all keywords' },
    { id: 'performance', label: 'Performance Metrics', description: 'Response times and success rates' },
    { id: 'usage', label: 'Data Usage', description: 'Bandwidth and request statistics' },
    { id: 'jobs', label: 'Tracking Jobs', description: 'Job configurations and schedules' },
    { id: 'errors', label: 'Error Logs', description: 'Failed requests and error details' }
  ];

  const handleExport = async () => {
    try {
      // Map config to the expected format for the existing hook
      const exportOptions = {
        reportType: config.dataTypes.includes('rankings') ? 'combined' : 'organic' as any,
        timeframe: '30d' as any,
        selectedAsin: 'all',
        format: config.format === 'csv' ? 'csv' : 'pdf' as any
      };
      
      await exportReport(exportOptions);
      
      toast({
        title: 'Export Complete',
        description: `Report exported successfully as ${config.format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting data',
        variant: 'destructive',
      });
    }
  };

  const getContentType = (format: string) => {
    switch (format) {
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf': return 'application/pdf';
      default: return 'text/plain';
    }
  };

  const handleDataTypeToggle = (dataType: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      dataTypes: checked 
        ? [...prev.dataTypes, dataType]
        : prev.dataTypes.filter(type => type !== dataType)
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Export Manager</h3>
        <p className="text-sm text-muted-foreground">
          Export your tracking data in various formats
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Configuration</CardTitle>
            <CardDescription>
              Configure your export settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="grid grid-cols-2 gap-2">
                {exportFormats.map(format => (
                  <Button
                    key={format.value}
                    variant={config.format === format.value ? 'default' : 'outline'}
                    className="h-auto p-3 justify-start"
                    onClick={() => setConfig(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <div className="flex items-start space-x-2">
                      {format.icon}
                      <div className="text-left">
                        <p className="font-medium text-sm">{format.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex space-x-2">
                <Popover 
                  open={showCalendar === 'from'} 
                  onOpenChange={(open) => setShowCalendar(open ? 'from' : null)}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(config.dateRange.from, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={config.dateRange.from}
                      onSelect={(date) => {
                        if (date) {
                          setConfig(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, from: date }
                          }));
                        }
                        setShowCalendar(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="flex items-center text-muted-foreground">to</span>

                <Popover 
                  open={showCalendar === 'to'} 
                  onOpenChange={(open) => setShowCalendar(open ? 'to' : null)}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(config.dateRange.to, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={config.dateRange.to}
                      onSelect={(date) => {
                        if (date) {
                          setConfig(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, to: date }
                          }));
                        }
                        setShowCalendar(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Group By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Data By</label>
              <Select 
                value={config.groupBy} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, groupBy: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="asin">ASIN</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Charts (for PDF/Excel) */}
            {(config.format === 'pdf' || config.format === 'excel') && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeCharts: !!checked }))
                  }
                />
                <label htmlFor="includeCharts" className="text-sm font-medium">
                  Include Charts and Visualizations
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Selection</CardTitle>
            <CardDescription>
              Choose which data to include in your export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataTypeOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-3">
                <Checkbox
                  id={option.id}
                  checked={config.dataTypes.includes(option.id)}
                  onCheckedChange={(checked) => 
                    handleDataTypeToggle(option.id, !!checked)
                  }
                />
                <div className="flex-1">
                  <label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                    {option.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Export Summary */}
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Export Summary</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">
                  {config.format.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {config.dataTypes.length} data types
                </Badge>
                <Badge variant="outline">
                  {Math.ceil((config.dateRange.to.getTime() - config.dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} days
                </Badge>
              </div>
            </div>

            <Button 
              onClick={handleExport}
              disabled={isExporting || config.dataTypes.length === 0}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Full Report - CSV</span>
                <Badge variant="secondary" className="text-xs">2 hours ago</Badge>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-center py-4 text-muted-foreground text-sm">
              Export history will appear here
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};