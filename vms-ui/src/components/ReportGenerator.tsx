import { useState } from 'react';
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material';
import { api } from '../services/api';

interface ReportGeneratorProps {
  scrapedContent: string;
  onComplete: (report: any) => void;
  onBack: () => void;
}

export default function ReportGenerator({ scrapedContent, onComplete, onBack }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.generateReport({
        pages_text: scrapedContent
      });
      onComplete(response.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the report');
    } finally {
      setLoading(false);
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

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onBack}
          disabled={loading}
        >
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
    </Box>
  );
} 