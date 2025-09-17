import { useState } from 'react';
import { useKeywordRankings, usePositionHistory } from './usePositionHistory';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExportOptions {
  reportType: 'combined' | 'organic' | 'sponsored';
  timeframe: '24h' | '7d' | '30d' | '90d';
  selectedAsin: string;
  format: 'csv' | 'pdf';
}

export const useExportData = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { data: rankings } = useKeywordRankings();
  const { data: positionHistory } = usePositionHistory();
  const { user } = useAuth();
  const { toast } = useToast();

  const generateCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          typeof row[header] === 'string' && row[header].includes(',') 
            ? `"${row[header]}"` 
            : row[header] || ''
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReport = async (options: ExportOptions) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export reports.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      let exportData = [];
      
      if (options.reportType === 'combined' || options.reportType === 'organic') {
        const organicData = rankings?.filter(r => 
          r.organicPosition && 
          (options.selectedAsin === 'all' || r.asin === options.selectedAsin)
        ).map(r => ({
          keyword: r.keyword,
          asin: r.asin,
          marketplace: r.marketplace,
          organic_position: r.organicPosition,
          trend: r.trend,
          last_checked: new Date(r.lastChecked).toISOString(),
          status: r.status
        })) || [];
        
        exportData.push(...organicData);
      }

      if (options.reportType === 'combined' || options.reportType === 'sponsored') {
        const sponsoredData = rankings?.filter(r => 
          r.sponsoredPosition && 
          (options.selectedAsin === 'all' || r.asin === options.selectedAsin)
        ).map(r => ({
          keyword: r.keyword,
          asin: r.asin,
          marketplace: r.marketplace,
          sponsored_position: r.sponsoredPosition,
          trend: r.trend,
          last_checked: new Date(r.lastChecked).toISOString(),
          status: r.status
        })) || [];
        
        if (options.reportType === 'sponsored') {
          exportData = sponsoredData;
        } else {
          exportData.push(...sponsoredData);
        }
      }

      // Log the export activity
      await supabase.from('api_requests').insert({
        user_id: user.id,
        success: true,
        response_time_ms: Date.now(),
        keyword: `export_${options.reportType}`,
        marketplace: 'US'
      });

      const filename = `amazon_keywords_${options.reportType}_${options.timeframe}_${new Date().toISOString().split('T')[0]}`;
      
      if (options.format === 'csv') {
        generateCSV(exportData, filename);
      } else {
        // PDF export would require additional library like jsPDF
        toast({
          title: "PDF Export",
          description: "PDF export feature is coming soon!",
          variant: "default"
        });
      }

      toast({
        title: "Export Successful",
        description: `${options.reportType} report exported as ${options.format.toUpperCase()}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportReport,
    isExporting
  };
};