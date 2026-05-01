import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material';
import { api } from '../services/api';

interface ReportGeneratorProps {
  scrapedContent: string;
  onComplete: (report: any) => void;
  onBack: () => void;
}

const LOADING_MESSAGES = [
  'Analyzing scraped content...',
  'Identifying key business details...',
  'Building your report...',
  'Applying AI analysis...',
  'Almost done...',
];

export default function ReportGenerator({ scrapedContent, onComplete, onBack }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerateReport = async () => {
    console.log('🔍 Starting report generation with scraped content');
    setError(null);
    setLoading(true);

    try {
      // First, check if the backend is accessible with a simple OPTIONS request
      try {
        console.log('🔬 Testing backend connectivity with fetch API');
        const testResponse = await fetch(`${window.location.protocol}//${window.location.hostname}:8000/api/report/generate-report`, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('✅ Backend connectivity test completed with status:', testResponse.status);
      } catch (testError) {
        console.warn('⚠️ Backend connectivity test failed:', testError);
        // Continue anyway as this is just a test
      }
      
      // At this point, scrapedContent should already be just the content string
      // extracted from the scrape result
      console.log('📤 Sending report generation request with content:', 
        typeof scrapedContent === 'string' ? 
          (scrapedContent.length > 100 ? scrapedContent.substring(0, 100) + '...' : scrapedContent) : 
          'Non-string content');
      
      const response = await api.generateReport({
        pages_text: scrapedContent,
        retries: 3
      });
      console.log('✅ Report generation response:', response);
      
      // Check if we have a valid report
      if (response && response.report) {
        console.log('📄 Report generated successfully:', response.report);
        onComplete(response.report);
      } else if (response && typeof response === 'object') {
        // The API might return the report directly instead of nested
        console.log('📄 Report object returned directly:', response);
        onComplete(response);
      } else {
        console.warn('⚠️ Report response has unexpected structure:', response);
        // Create a fallback report
        const fallbackReport = {
          overview: {
            company_snapshot: {
              name: "Unknown Company",
              headquarters: "Unknown Location",
              year_founded: "Unknown",
              notable_leadership: ["Unknown Leadership"]
            },
            website_summary: {
              pages_scraped_reviewed: ["No pages scraped"],
              key_observations: ["No data available"]
            }
          },
          products_and_services: {
            core_offerings: {
              primary_products_services: ["No products identified"],
              key_features_capabilities: ["No features identified"],
              target_use_cases: ["No use cases identified"]
            }
          },
          high_level_observations_and_conclusion: {
            overall_positioning: "Unable to determine from scraped content",
            potential_strengths: ["No data available"],
            potential_gaps_limitations: ["Insufficient data for analysis"]
          }
        };
        console.log('🔄 Using fallback report:', fallbackReport);
        onComplete(fallbackReport);
      }
    } catch (err) {
      console.error('❌ Error generating report:', err);
      
      // Create a nicer error message
      let errorMessage = 'An error occurred while generating the report';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for network-related errors
        if (errorMessage.includes('Network Error')) {
          errorMessage = 'Network error: Unable to connect to the backend server. Please ensure the server is running and accessible.';
        }
      }
      
      setError(errorMessage);
      
      // Even on error, we want to allow proceeding with a default report
      console.warn('⚠️ Creating fallback report due to error');
      const fallbackReport = {
        overview: {
          company_snapshot: {
            name: "Unknown Company",
            headquarters: "Unknown Location",
            year_founded: "Unknown",
            notable_leadership: ["Unknown Leadership"]
          },
          website_summary: {
            pages_scraped_reviewed: ["No pages scraped due to error"],
            key_observations: ["An error occurred during report generation"]
          }
        },
        products_and_services: {
          core_offerings: {
            primary_products_services: ["No products identified due to error"],
            key_features_capabilities: ["No features identified due to error"],
            target_use_cases: ["No use cases identified due to error"]
          }
        },
        high_level_observations_and_conclusion: {
          overall_positioning: "Unable to determine due to error in report generation",
          potential_strengths: ["No data available due to error"],
          potential_gaps_limitations: ["Error in report generation process"]
        }
      };
      
      // Proceed with the fallback report
      onComplete(fallbackReport);
    } finally {
      setLoading(false);
      console.log('🏁 Report generation process completed (success or failure)');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body1" gutterBottom>
        Scraped content is ready for analysis. Click the button below to generate a business report.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onBack} disabled={loading}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading}
            sx={{ position: 'relative' }}
          >
            {loading ? (
              <>
                Generating Report...
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </Box>
        {loading && (
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#4169E1', mt: 2, fontStyle: 'italic' }}>
            {LOADING_MESSAGES[msgIndex]}
          </Typography>
        )}
      </Box>
    </Box>
  );
} 