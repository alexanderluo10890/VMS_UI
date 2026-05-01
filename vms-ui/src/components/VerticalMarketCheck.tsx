import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { api } from '../services/api';

interface VerticalMarketCheckProps {
  report: any;
  onBack: () => void;
  onNewAnalysis: () => void;
}

const LOADING_MESSAGES = [
  'Running vertical market analysis...',
  'Evaluating market fit...',
  'Reviewing industry signals...',
  'Finalizing assessment...',
];

export default function VerticalMarketCheck({ report, onBack, onNewAnalysis }: VerticalMarketCheckProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reasoning: string; final_answer: string } | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const timer = setTimeout(() => checkVerticalMarket(), 500);
    return () => clearTimeout(timer);
  }, []);

  const checkVerticalMarket = async () => {
    setError(null);
    setLoading(true);

    try {
      let reportText = '';
      if (typeof report === 'string') {
        reportText = report;
      } else if (report && typeof report === 'object') {
        const sections = [
          report.overview?.company_snapshot && `Company: ${JSON.stringify(report.overview.company_snapshot)}`,
          report.overview?.website_summary && `Website Summary: ${JSON.stringify(report.overview.website_summary)}`,
          report.products_and_services?.core_offerings && `Products and Services: ${JSON.stringify(report.products_and_services.core_offerings)}`,
          report.high_level_observations_and_conclusion && `Conclusions: ${JSON.stringify(report.high_level_observations_and_conclusion)}`,
        ].filter(Boolean);
        reportText = sections.join('\n\n');
      }

      const response = await api.checkVerticalMarket({ report_text: reportText, retries: 3 });

      if (response?.reasoning !== undefined && response?.final_answer !== undefined) {
        setResult({
          reasoning: response.reasoning,
          final_answer: String(response.final_answer).toLowerCase(),
        });
      } else {
        setResult({
          reasoning: 'Analysis completed but returned in an unexpected format.',
          final_answer: 'false',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg.includes('Network Error')
        ? 'Unable to connect to the backend. Please ensure the server is running.'
        : msg);
      setResult({
        reasoning: 'Unable to complete the vertical market analysis due to a technical issue.',
        final_answer: 'false',
      });
    } finally {
      setLoading(false);
    }
  };

  const isMatch = result?.final_answer === 'true';

  return (
    <Box sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 2 }}>
          <CircularProgress size={48} sx={{ color: '#4169E1' }} />
          <Typography variant="body2" sx={{ color: '#4169E1', fontStyle: 'italic' }}>
            {LOADING_MESSAGES[msgIndex]}
          </Typography>
        </Box>
      ) : result ? (
        <Paper
          elevation={2}
          sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)' }}
        >
          {/* Verdict */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            {isMatch ? (
              <CheckCircleIcon sx={{ fontSize: 80, color: '#2e7d32', mb: 1 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 80, color: '#c62828', mb: 1 }} />
            )}
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: isMatch ? '#2e7d32' : '#c62828', textAlign: 'center' }}
            >
              {isMatch ? 'Vertical Market Match' : 'Not a Vertical Market Match'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mt: 1, textAlign: 'center' }}>
              {isMatch
                ? 'This company is a strong candidate for the vertical market.'
                : 'This company does not appear to fit the vertical market criteria.'}
            </Typography>
          </Box>

          {/* Reasoning */}
          <Box sx={{ backgroundColor: '#f5f7ff', p: 3, borderRadius: 2, border: '1px solid #e3e9ff' }}>
            <Typography variant="subtitle2" sx={{ color: '#2c387e', fontWeight: 700, mb: 1 }}>
              Analysis Details
            </Typography>
            <Typography variant="body1" sx={{ color: '#37474f', lineHeight: 1.7 }}>
              {result.reasoning}
            </Typography>
          </Box>
        </Paper>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            onClick={onBack}
            disabled={loading}
            variant="outlined"
            sx={{ color: '#4169E1', borderColor: '#4169E1', flex: 1 }}
          >
            Back to Report
          </Button>
          <Button
            variant="contained"
            onClick={checkVerticalMarket}
            disabled={loading}
            sx={{
              flex: 1,
              background: 'linear-gradient(45deg, #4169E1 30%, #00BFFF 90%)',
              '&:hover': { background: 'linear-gradient(45deg, #2850C9 30%, #00A3E0 90%)' },
            }}
          >
            Recheck
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onNewAnalysis}
            disabled={loading}
            sx={{
              minWidth: 200,
              background: 'linear-gradient(45deg, #2196F3 30%, #00BFA5 90%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00897B 90%)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            New Analysis
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
