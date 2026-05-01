import { Box, TextField, Button, CircularProgress, Alert, Typography } from '@mui/material';

export interface WebsiteScraperProps {
  url: string;
  maxPages: number | '';
  loading: boolean;
  error: string | null;
  statusMessage?: string;
  onUrlChange: (newUrl: string) => void;
  onMaxPagesChange: (newMaxPages: number | '') => void;
  onSubmit: () => Promise<void>;
}

export default function WebsiteScraper({
  url,
  maxPages,
  loading,
  error,
  statusMessage,
  onUrlChange,
  onMaxPagesChange,
  onSubmit
}: WebsiteScraperProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submitted with:', { url, maxPages });
    try {
      await onSubmit();
      console.log('✅ Form submission completed successfully');
    } catch (error) {
      console.error('❌ Form submission failed:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(211, 47, 47, 0.05)',
            color: '#d32f2f',
          }}
        >
          {error}
        </Alert>
      )}
      
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 3, 
          color: '#1B2B4B',
          textAlign: 'center',
        }}
      >
        Enter the website URL you want to analyze. We'll gather information and prepare a detailed report.
      </Typography>

      <TextField
        fullWidth
        label="Website URL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        margin="normal"
        required
        placeholder="https://example.com"
        disabled={loading}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '& fieldset': {
              borderColor: 'rgba(27, 43, 75, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(27, 43, 75, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4169E1',
            }
          }
        }}
      />

      <TextField
        fullWidth
        label="Max Pages (Optional)"
        value={maxPages}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || /^\d+$/.test(value)) {
            onMaxPagesChange(value === '' ? '' : parseInt(value));
          }
        }}
        margin="normal"
        type="number"
        disabled={loading}
        placeholder="Leave empty for no limit"
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '& fieldset': {
              borderColor: 'rgba(27, 43, 75, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(27, 43, 75, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4169E1',
            }
          }
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={loading || !url}
          sx={{ 
            position: 'relative',
            minWidth: 200,
            background: 'linear-gradient(45deg, #4169E1 30%, #00BFFF 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #2850C9 30%, #00A3E0 90%)',
            },
            '&.Mui-disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
            }
          }}
        >
          {loading ? (
            <>
              Analyzing Website...
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                  color: 'inherit'
                }}
              />
            </>
          ) : (
            'Start Analysis'
          )}
        </Button>
        {loading && statusMessage && (
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: '#4169E1', fontStyle: 'italic' }}
          >
            {statusMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
} 