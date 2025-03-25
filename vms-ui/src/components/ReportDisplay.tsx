import { Box, Button, Typography, Paper, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ReportDisplayProps {
  report: any;
  onBack: () => void;
  onContinue: () => void;
}

export default function ReportDisplay({ report, onBack, onContinue }: ReportDisplayProps) {
  console.log('📊 Rendering report:', report);
  
  // Helper function to render nested objects as sections
  const renderNestedObject = (obj: any, level: number = 0) => {
    if (!obj || typeof obj !== 'object') return null;
    
    return Object.entries(obj).map(([key, value]: [string, any], index) => {
      // Skip rendering empty arrays
      if (Array.isArray(value) && value.length === 0) return null;
      
      // Skip rendering empty objects
      if (value && typeof value === 'object' && Object.keys(value).length === 0) return null;
      
      // Format section title from key
      const title = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (Array.isArray(value)) {
        // Render arrays as bullet points
        if (value.length === 0) return null;
        
        return (
          <Box key={index} sx={{ mb: 2, ml: level * 2 }}>
            <Typography variant={level === 0 ? "h5" : level === 1 ? "h6" : "subtitle1"} gutterBottom>
              {title}
            </Typography>
            <ul style={{ marginTop: 0, paddingLeft: 20 }}>
              {value.map((item, i) => (
                <li key={i}>
                  <Typography variant="body1">
                    {typeof item === 'object' ? JSON.stringify(item) : item}
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        );
      } else if (value && typeof value === 'object') {
        // For objects, either use Accordion for level 0 or recursively render nested objects
        if (level === 0) {
          return (
            <Accordion key={index} defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: 'rgba(65, 105, 225, 0.05)',
                  borderRadius: '4px',
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1B2B4B' }}>
                  {title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {renderNestedObject(value, level + 1)}
              </AccordionDetails>
            </Accordion>
          );
        } else {
          return (
            <Box key={index} sx={{ mb: 3, ml: level * 1.5 }}>
              <Typography 
                variant={level === 1 ? "h6" : "subtitle1"} 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: level === 1 ? '#4169E1' : '#1B2B4B'
                }}
              >
                {title}
              </Typography>
              <Box sx={{ ml: 1.5 }}>
                {renderNestedObject(value, level + 1)}
              </Box>
            </Box>
          );
        }
      } else if (value && typeof value === 'string') {
        // Render simple strings
        if (value.trim() === '') return null;
        
        return (
          <Box key={index} sx={{ mb: 2, ml: level * 1.5 }}>
            <Typography 
              variant={level <= 1 ? "subtitle1" : "body1"} 
              gutterBottom
              sx={{ fontWeight: level <= 1 ? 600 : 400 }}
            >
              {title}: {value}
            </Typography>
          </Box>
        );
      }
      
      return null;
    }).filter(Boolean); // Filter out null values
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: '#ffffff'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: '#1B2B4B',
            fontWeight: 600,
            mb: 3
          }}
        >
          Website Analysis Report
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Render the main report content */}
        {report && renderNestedObject(report)}
        
        {/* Fallback for empty reports */}
        {(!report || Object.keys(report).length === 0) && (
          <Typography variant="body1" color="text.secondary">
            No report data available. Please try generating the report again.
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onBack}
          variant="outlined"
          sx={{ color: '#4169E1', borderColor: '#4169E1' }}
        >
          Back to Report Generator
        </Button>
        
        <Button
          variant="contained"
          onClick={onContinue}
          sx={{ 
            background: 'linear-gradient(45deg, #4169E1 30%, #00BFFF 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #2850C9 30%, #00A3E0 90%)',
            }
          }}
        >
          Continue to Vertical Market Check
        </Button>
      </Box>
    </Box>
  );
} 