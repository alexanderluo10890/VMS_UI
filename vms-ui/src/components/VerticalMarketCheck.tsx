import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Paper } from '@mui/material';
import { api } from '../services/api';

interface VerticalMarketCheckProps {
  report: any;
  onBack: () => void;
}

export default function VerticalMarketCheck({ report, onBack }: VerticalMarketCheckProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reasoning: string; final_answer: string } | null>(null);

  useEffect(() => {
    checkVerticalMarket();
  }, []);

  const checkVerticalMarket = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.checkVerticalMarket({
        report_text: JSON.stringify(report)
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while checking vertical market status');
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : result ? (
        <Box>
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Analysis Result
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {result.final_answer}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Reasoning
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {result.reasoning}
            </Typography>
          </Paper>
        </Box>
      ) : null}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={checkVerticalMarket}
          disabled={loading}
        >
          Recheck
        </Button>
      </Box>
    </Box>
  );
} 