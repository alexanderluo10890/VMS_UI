import { useState, useRef, useEffect } from 'react';
import { Container, Box, Paper, Stepper, Step, StepLabel, Typography, AppBar, Toolbar, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import backgroundImage from './assets/ValsoftBackgroundImage.jpg';

import WebsiteScraper from './components/WebsiteScraper';
import ReportGenerator from './components/ReportGenerator';
import ReportDisplay from './components/ReportDisplay';
import VerticalMarketCheck from './components/VerticalMarketCheck';
import { api } from './services';

const steps = ['Scrape', 'Generate', 'Report', 'VMS Check'];

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4169E1', // Royal Blue
    },
    secondary: {
      main: '#00BFFF', // Deep Sky Blue
    },
    background: {
      default: '#1B2B4B', // Valsoft dark blue
      paper: '#ffffff',
    },
    text: {
      primary: '#1B2B4B', // Dark blue for better visibility
      secondary: 'rgba(27, 43, 75, 0.7)', // Semi-transparent dark blue
    }
  },
  typography: {
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#ffffff',
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1B2B4B',
    },
    body1: {
      fontSize: '1rem',
      color: '#1B2B4B',
    },
    h6: {
      color: '#ffffff',
      fontSize: '1.5rem',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.75rem 2rem',
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #4169E1 30%, #00BFFF 90%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(45deg, #2850C9 30%, #00A3E0 90%)',
          }
        },
        outlined: {
          borderColor: '#ffffff',
          color: '#ffffff',
          '&:hover': {
            borderColor: '#00BFFF',
            color: '#00BFFF',
          }
        }
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: '1rem',
          color: '#1B2B4B',
          '&.Mui-active': {
            color: '#4169E1',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#1B2B4B',
          },
          '& .MuiOutlinedInput-input': {
            color: '#1B2B4B',
          },
        },
      },
    },
  },
});

// Background component with full image
const BackgroundPattern = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(27, 43, 75, 0.92) 0%, rgba(27, 43, 75, 0.85) 100%)',
        backdropFilter: 'blur(1px)', // Subtle blur effect
      }
    }}
  />
);

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [scrapedContent, setScrapedContent] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeStep]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNewAnalysis = () => {
    // Reset all states
    setActiveStep(0);
    setScrapedContent('');
    setReport(null);
    setUrl('');
    setMaxPages('');
    setLoading(false);
    setError(null);
  };

  const handleStartAnalysis = async () => {
    console.log('🚀 Start Analysis clicked');
    if (!url) {
      console.log('⚠️ No URL provided');
      setError('Please enter a website URL to analyze');
      setLoading(false);
      return;
    }

    // Format the URL if needed
    let formattedUrl = url.trim();
    if (!formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = 'https://' + formattedUrl;
      console.log('🔧 Added https:// prefix to URL:', formattedUrl);
    }

    console.log('📊 Analysis parameters:', { url: formattedUrl, maxPages });
    setError(null);
    setLoading(true);
    setStatusMessage('Scraping website pages, this may take a minute...');

    try {
      console.log('📤 Sending scrape request to backend');
      const scrapeResult = await api.scrapeWebsite({
        url: formattedUrl,
        max_pages: maxPages || undefined,
        force_crawl: true  // Force a fresh crawl
      });
      console.log('✅ Scrape request successful with result:', scrapeResult);

      // Check if we got valid content
      if (!scrapeResult || !scrapeResult.content) {
        console.warn('⚠️ No content was returned from scraping');
        setScrapedContent("");
        setError("No content was loaded from the website.");
        setLoading(false);
        return;
      }

      // Extract content from the response
      if (typeof scrapeResult.content === 'string') {
        console.log('📋 Using scraped content:', scrapeResult.content.substring(0, 100) + '...');
        setScrapedContent(scrapeResult.content);
      } else {
        console.log('📋 Converting scraped content to string');
        setScrapedContent(JSON.stringify(scrapeResult.content));
      }

      console.log('⏭️ Moving to next step with content extracted');
      handleNext();
    } catch (err) {
      console.error('❌ Error during analysis:', err);
      
      // Extract a more user-friendly error message
      let errorMessage = 'An error occurred while scraping the website';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Add network-specific error information
        if (errorMessage.includes('Network Error')) {
          errorMessage = 'Network error: Unable to connect to the backend server. Please ensure the server is running and accessible.';
        }
        
        // Handle timeout errors
        if (errorMessage.includes('timeout')) {
          errorMessage = 'Request timed out: The server took too long to respond. This might be due to the complexity of the website being analyzed.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setStatusMessage('');
      console.log('🏁 Analysis process completed (success or failure)');
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <WebsiteScraper
            url={url}
            maxPages={maxPages}
            loading={loading}
            error={error}
            statusMessage={statusMessage}
            onUrlChange={setUrl}
            onMaxPagesChange={setMaxPages}
            onSubmit={handleStartAnalysis}
          />
        );
      case 1:
        return (
          <ReportGenerator 
            scrapedContent={scrapedContent}
            onComplete={(generatedReport) => {
              setReport(generatedReport);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <ReportDisplay 
            report={report}
            onBack={handleBack}
            onContinue={handleNext}
          />
        );
      case 3:
        return (
          <VerticalMarketCheck 
            report={report}
            onBack={handleBack}
            onNewAnalysis={handleNewAnalysis}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        flexGrow: 1,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 0,
      }}>
        <BackgroundPattern />
        
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              VMS ANALYZER
            </Typography>
            <Button color="inherit">HOME</Button>
            <Button color="inherit">ABOUT</Button>
            <Button color="inherit">CONTACT</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md">
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 8,
            gap: 4,
          }}>
            {/* Hero */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" component="h1" gutterBottom>
                Website Analysis Made Simple
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.8)' }}
              >
                Analyze any website's market position and generate comprehensive reports with our advanced AI-powered tools.
              </Typography>
            </Box>

            {/* Card */}
            <Box ref={cardRef} sx={{ width: '100%' }}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '500px',
                }}
              >
                <Typography variant="h4" align="center" gutterBottom>
                  Website Analysis
                </Typography>
                <Stepper
                  activeStep={activeStep}
                  sx={{
                    pt: 3,
                    pb: 5,
                    '& .MuiStepConnector-line': {
                      borderColor: 'rgba(27, 43, 75, 0.2)',
                    }
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                {getStepContent(activeStep)}
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
