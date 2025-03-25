import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Paper, Chip } from '@mui/material';
import { api } from '../services/api';

interface VerticalMarketCheckProps {
  report: any;
  onBack: () => void;
  onNewAnalysis: () => void;
}

export default function VerticalMarketCheck({ report, onBack, onNewAnalysis }: VerticalMarketCheckProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reasoning: string; final_answer: string } | null>(null);

  useEffect(() => {
    console.log('🔄 VerticalMarketCheck component mounted with report:', report);
    // Add a small delay to ensure everything is ready
    setTimeout(() => {
      console.log('⏱️ Starting vertical market check after delay');
      checkVerticalMarket();
    }, 500);
    
    // Debug check for state updates
    return () => {
      console.log('🔚 VerticalMarketCheck component unmounting');
    };
  }, []);

  const checkVerticalMarket = async () => {
    console.log('🔍 Starting vertical market check');
    console.log('📋 Raw report data:', report);
    setError(null);
    setLoading(true);

    try {
      // Extract the relevant text from the report
      let reportText = '';
      if (typeof report === 'string') {
        reportText = report;
      } else if (report && typeof report === 'object') {
        // Convert the report object to a string representation
        const reportSections = [
          report.overview?.company_snapshot && `Company: ${JSON.stringify(report.overview.company_snapshot)}`,
          report.overview?.website_summary && `Website Summary: ${JSON.stringify(report.overview.website_summary)}`,
          report.products_and_services?.core_offerings && `Products and Services: ${JSON.stringify(report.products_and_services.core_offerings)}`,
          report.high_level_observations_and_conclusion && `Conclusions: ${JSON.stringify(report.high_level_observations_and_conclusion)}`
        ].filter(Boolean);
        
        reportText = reportSections.join('\n\n');
      }
      
      console.log('📤 Prepared report text:', reportText);
      
      const response = await api.checkVerticalMarket({
        report_text: reportText,
        retries: 3
      });
      console.log('✅ Vertical market check response:', response);
      
      // SPECIAL CASE: Directly test if the response matches the expected format from your backend
      if (response && 
          typeof response.reasoning === 'string' && 
          (response.final_answer === 'True' || response.final_answer === 'False')) {
        console.log('🔍 DIRECT MATCH: Response matches exactly the format we expect');
        // Force to lowercase
        const directResult = {
          reasoning: response.reasoning,
          final_answer: response.final_answer.toLowerCase()
        };
        console.log('📊 Setting result state with direct format:', directResult);
        setResult(directResult);
        setLoading(false);
        return;
      }
      
      // Check if we have a valid response
      if (response) {
        console.log('📊 Setting vertical market check result');
        
        // Handle different response structures
        if (response.reasoning !== undefined && response.final_answer !== undefined) {
          // This is the expected format from the backend
          // final_answer could be a string "true" or "false" (case may vary)
          console.log('📝 Response has expected structure with reasoning and final_answer:', {
            reasoning: response.reasoning,
            final_answer: response.final_answer
          });
          
          // Make a copy of the response with normalized case for final_answer
          const normalizedResponse = {
            ...response,
            final_answer: typeof response.final_answer === 'string' 
              ? response.final_answer.toLowerCase() 
              : String(response.final_answer).toLowerCase()
          };
          
          console.log('📝 Setting result state with normalized response:', normalizedResponse);
          setResult(normalizedResponse);
          console.log('📝 Result state should now be set');
        } else if (typeof response === 'object') {
          // Try to create a compatible structure from whatever we got
          console.warn('⚠️ Response has unexpected structure, attempting to adapt:', response);
          
          let reasoning = 'No reasoning provided';
          let finalAnswer = 'Unknown';
          
          // Extract data from different possible formats
          if (response.reasoning) {
            reasoning = response.reasoning;
          } else if (response.message) {
            reasoning = response.message;
          } else if (response.vertical_markets) {
            reasoning = `Identified vertical markets: ${response.vertical_markets.join(', ')}`;
            if (response.confidence) {
              reasoning += `. Confidence: ${response.confidence}`;
            }
          }
          
          // Try to determine final answer
          if (response.final_answer !== undefined) {
            finalAnswer = String(response.final_answer).toLowerCase(); // Ensure it's a lowercase string
          } else if (response.suitable !== undefined) {
            finalAnswer = String(response.suitable).toLowerCase();
          } else if (response.vertical_markets && response.vertical_markets.length > 0) {
            finalAnswer = "true"; // If we have vertical markets, consider it true
          }
          
          const formattedResult = {
            reasoning: reasoning,
            final_answer: finalAnswer
          };
          
          console.log('🔄 Formatted vertical market check result:', formattedResult);
          setResult(formattedResult);
        } else {
          // Fallback for completely unexpected response
          console.warn('⚠️ Completely unexpected response format:', response);
          const fallbackResult = {
            reasoning: "The vertical market analysis was completed, but returned in an unexpected format.",
            final_answer: "false"
          };
          console.log('🔄 Using fallback result:', fallbackResult);
          setResult(fallbackResult);
        }
      } else {
        console.warn('⚠️ Empty response from vertical market check');
        throw new Error('Empty response from server');
      }
    } catch (err) {
      console.error('❌ Error during vertical market check:', err);
      
      // Create a nicer error message
      let errorMessage = 'An error occurred while checking vertical market status';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for network-related errors
        if (errorMessage.includes('Network Error')) {
          errorMessage = 'Network error: Unable to connect to the backend server. Please ensure the server is running and accessible.';
        }
      }
      
      setError(errorMessage);
      
      // Provide a fallback result
      const fallbackResult = {
        reasoning: "Unable to complete the vertical market analysis due to a technical issue.",
        final_answer: "false"
      };
      
      // Set a fallback result even on error
      setResult(fallbackResult);
    } finally {
      setLoading(false);
      console.log('🏁 Vertical market check completed (success or failure)');
    }
  };

  // Helper function to render the appropriate message based on final_answer
  const renderResultMessage = () => {
    if (!result) return null;
    
    // Handle final_answer as a string that could be "true" or "false"
    const isPositive = result.final_answer === "true" || result.final_answer === true;
    
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>Vertical Market Match:</Typography>
          <Chip 
            label={isPositive ? "Suitable" : "Not Suitable"} 
            color={isPositive ? "success" : "error"}
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1rem',
              px: 1
            }}
          />
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {isPositive 
            ? "This website is suitable for the vertical market." 
            : "This website is not a good match for the vertical market."}
        </Typography>
      </>
    );
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
          <Paper 
            elevation={2}
            sx={{ 
              p: 4, 
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 600,
                  mb: 3
                }}
              >
                Vertical Market Analysis
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Chip
                  label={result.final_answer.toLowerCase() === 'true' ? 'Vertical Market Match' : 'Not a Vertical Market Match'}
                  color={result.final_answer.toLowerCase() === 'true' ? 'success' : 'error'}
                  sx={{
                    px: 2,
                    py: 2.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    borderRadius: '8px',
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ 
              backgroundColor: '#f5f7ff',
              p: 3,
              borderRadius: 2,
              border: '1px solid #e3e9ff'
            }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: '#2c387e',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Analysis Details
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  color: '#37474f',
                  lineHeight: 1.7,
                  fontSize: '1rem'
                }}
              >
                {result.reasoning}
              </Typography>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No result data available. Click "Recheck" to analyze the report.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={onBack}
            disabled={loading}
            variant="outlined"
            sx={{ 
              color: '#4169E1', 
              borderColor: '#4169E1',
              flex: 1,
              minWidth: '160px'
            }}
          >
            Back to Report
          </Button>
          
          <Button
            variant="contained"
            onClick={checkVerticalMarket}
            disabled={loading}
            sx={{ 
              position: 'relative',
              flex: 1,
              minWidth: '160px',
              background: loading ? 'rgba(0, 0, 0, 0.12)' : 'linear-gradient(45deg, #4169E1 30%, #00BFFF 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2850C9 30%, #00A3E0 90%)',
              }
            }}
          >
            {loading ? (
              <>
                Analyzing...
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
              'Recheck'
            )}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onNewAnalysis}
            disabled={loading}
            sx={{ 
              minWidth: '200px',
              background: 'linear-gradient(45deg, #2196F3 30%, #00BFA5 90%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              py: 1.5,
              boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00897B 90%)',
                boxShadow: '0 12px 20px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 5px 10px rgba(33, 150, 243, 0.2)',
              }
            }}
          >
            New Analysis
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 