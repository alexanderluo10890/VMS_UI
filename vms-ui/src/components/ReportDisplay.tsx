import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

interface ReportDisplayProps {
  report: any;
  onBack: () => void;
  onContinue: () => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Typography
      variant="h6"
      sx={{ fontWeight: 700, color: '#1B2B4B', mb: 1.5, mt: 2 }}
    >
      {title}
    </Typography>
  );
}

function FieldRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
      {icon && <Box sx={{ color: '#4169E1', mt: 0.3, flexShrink: 0 }}>{icon}</Box>}
      <Box>
        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: '#1B2B4B' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function BulletList({ items, color }: { items: string[]; color?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {items.map((item, i) => (
        <Box component="li" key={i} sx={{ mb: 0.75 }}>
          <Typography variant="body2" sx={{ color: color || '#333', lineHeight: 1.6 }}>
            {item}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {items.map((item, i) => (
        <Chip
          key={i}
          label={item}
          size="small"
          sx={{ backgroundColor: 'rgba(65,105,225,0.08)', color: '#1B2B4B', fontWeight: 500 }}
        />
      ))}
    </Box>
  );
}

function Section({ title, children, defaultExpanded = true }: { title: string; children: React.ReactNode; defaultExpanded?: boolean }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid #e8ecf4',
        borderRadius: '8px !important',
        mb: 2,
        '&:before': { display: 'none' },
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#4169E1' }} />}
        sx={{ backgroundColor: '#f5f7ff', px: 3, py: 1.5 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1B2B4B' }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, py: 2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

function formatReportAsText(report: any): string {
  const lines: string[] = [];
  const snapshot = report?.overview?.company_snapshot || {};
  const websiteSummary = report?.overview?.website_summary || {};
  const products = report?.products_and_services?.core_offerings || report?.products_and_services || {};
  const conclusion = report?.high_level_observations_and_conclusion || {};

  lines.push('WEBSITE ANALYSIS REPORT', '='.repeat(50), '');

  if (snapshot.name) {
    lines.push('COMPANY SNAPSHOT', '-'.repeat(30));
    if (snapshot.name) lines.push(`Company: ${snapshot.name}`);
    if (snapshot.headquarters) lines.push(`Headquarters: ${snapshot.headquarters}`);
    if (snapshot.year_founded) lines.push(`Founded: ${snapshot.year_founded}`);
    if (snapshot.notable_leadership?.length) {
      lines.push('Notable Leadership:');
      snapshot.notable_leadership.forEach((l: string) => lines.push(`  • ${l}`));
    }
    lines.push('');
  }

  if (websiteSummary.pages_scraped_reviewed?.length || websiteSummary.key_observations?.length) {
    lines.push('WEBSITE SUMMARY', '-'.repeat(30));
    if (websiteSummary.pages_scraped_reviewed?.length) {
      lines.push('Pages Reviewed:');
      websiteSummary.pages_scraped_reviewed.forEach((p: string) => lines.push(`  • ${p}`));
    }
    if (websiteSummary.key_observations?.length) {
      lines.push('Key Observations:');
      websiteSummary.key_observations.forEach((o: string) => lines.push(`  • ${o}`));
    }
    lines.push('');
  }

  if (products.primary_products_services?.length || products.key_features_capabilities?.length) {
    lines.push('PRODUCTS & SERVICES', '-'.repeat(30));
    if (products.primary_products_services?.length) {
      lines.push('Primary Products/Services:');
      products.primary_products_services.forEach((p: string) => lines.push(`  • ${p}`));
    }
    if (products.key_features_capabilities?.length) {
      lines.push('Key Features & Capabilities:');
      products.key_features_capabilities.forEach((f: string) => lines.push(`  • ${f}`));
    }
    if (products.target_use_cases?.length) {
      lines.push('Target Use Cases:');
      products.target_use_cases.forEach((u: string) => lines.push(`  • ${u}`));
    }
    lines.push('');
  }

  if (conclusion.overall_positioning || conclusion.potential_strengths?.length) {
    lines.push('OBSERVATIONS & CONCLUSION', '-'.repeat(30));
    if (conclusion.overall_positioning) {
      lines.push('Overall Positioning:', conclusion.overall_positioning, '');
    }
    if (conclusion.potential_strengths?.length) {
      lines.push('Potential Strengths:');
      conclusion.potential_strengths.forEach((s: string) => lines.push(`  • ${s}`));
    }
    if (conclusion.potential_gaps_limitations?.length) {
      lines.push('Potential Gaps/Limitations:');
      conclusion.potential_gaps_limitations.forEach((g: string) => lines.push(`  • ${g}`));
    }
  }

  return lines.join('\n');
}

export default function ReportDisplay({ report, onBack, onContinue }: ReportDisplayProps) {
  const [copied, setCopied] = useState(false);
  const overview = report?.overview || {};
  const snapshot = overview?.company_snapshot || {};
  const websiteSummary = overview?.website_summary || {};
  const products = report?.products_and_services?.core_offerings || report?.products_and_services || {};
  const conclusion = report?.high_level_observations_and_conclusion || {};

  const handleCopy = () => {
    navigator.clipboard.writeText(formatReportAsText(report));
    setCopied(true);
  };

  const handleDownload = () => {
    const text = formatReportAsText(report);
    const name = snapshot.name ? snapshot.name.replace(/\s+/g, '_') : 'report';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 3, borderRadius: 2, backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#1B2B4B', fontWeight: 700, mb: 0.5 }}>
              Website Analysis Report
            </Typography>
            {snapshot.name && (
              <Typography variant="subtitle1" sx={{ color: '#4169E1', fontWeight: 600 }}>
                {snapshot.name}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon fontSize="small" />}
              onClick={handleCopy}
              sx={{ borderColor: '#4169E1', color: '#4169E1', textTransform: 'none' }}
            >
              Copy
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={handleDownload}
              sx={{ borderColor: '#4169E1', color: '#4169E1', textTransform: 'none' }}
            >
              Download
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mt: 2, mb: 3 }} />

        {/* ── Company Snapshot ── */}
        <Section title="Company Snapshot">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              {snapshot.name && (
                <FieldRow icon={<BusinessIcon fontSize="small" />} label="Company" value={snapshot.name} />
              )}
              {snapshot.headquarters && (
                <FieldRow icon={<LocationOnIcon fontSize="small" />} label="Headquarters" value={snapshot.headquarters} />
              )}
              {snapshot.year_founded && (
                <FieldRow icon={<CalendarTodayIcon fontSize="small" />} label="Founded" value={snapshot.year_founded} />
              )}
            </Grid>
            {snapshot.notable_leadership && snapshot.notable_leadership.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ color: '#4169E1', mt: 0.3 }}><PeopleIcon fontSize="small" /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Notable Leadership
                    </Typography>
                    <BulletList items={snapshot.notable_leadership} />
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Section>

        {/* ── Website Summary ── */}
        {(websiteSummary.pages_scraped_reviewed?.length > 0 || websiteSummary.key_observations?.length > 0) && (
          <Section title="Website Summary">
            {websiteSummary.pages_scraped_reviewed?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LanguageIcon fontSize="small" sx={{ color: '#4169E1' }} />
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Pages Reviewed
                  </Typography>
                </Box>
                <ChipList items={websiteSummary.pages_scraped_reviewed} />
              </Box>
            )}
            {websiteSummary.key_observations?.length > 0 && (
              <Box>
                <SectionHeader title="Key Observations" />
                <BulletList items={websiteSummary.key_observations} />
              </Box>
            )}
          </Section>
        )}

        {/* ── Products & Services ── */}
        {(products.primary_products_services?.length > 0 ||
          products.key_features_capabilities?.length > 0 ||
          products.target_use_cases?.length > 0) && (
          <Section title="Products & Services">
            {products.primary_products_services?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <SectionHeader title="Primary Products / Services" />
                <BulletList items={products.primary_products_services} />
              </Box>
            )}
            {products.key_features_capabilities?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <SectionHeader title="Key Features & Capabilities" />
                <BulletList items={products.key_features_capabilities} />
              </Box>
            )}
            {products.target_use_cases?.length > 0 && (
              <Box>
                <SectionHeader title="Target Use Cases" />
                <ChipList items={products.target_use_cases} />
              </Box>
            )}
          </Section>
        )}

        {/* ── Observations & Conclusion ── */}
        {(conclusion.overall_positioning ||
          conclusion.potential_strengths?.length > 0 ||
          conclusion.potential_gaps_limitations?.length > 0) && (
          <Section title="Observations & Conclusion">
            {conclusion.overall_positioning && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f7ff', borderLeft: '4px solid #4169E1', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Overall Positioning
                </Typography>
                <Typography variant="body1" sx={{ color: '#1B2B4B', mt: 0.5 }}>
                  {conclusion.overall_positioning}
                </Typography>
              </Box>
            )}
            <Grid container spacing={3}>
              {conclusion.potential_strengths?.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
                    Potential Strengths
                  </Typography>
                  <BulletList items={conclusion.potential_strengths} color="#2e7d32" />
                </Grid>
              )}
              {conclusion.potential_gaps_limitations?.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#c62828', mb: 1 }}>
                    Potential Gaps / Limitations
                  </Typography>
                  <BulletList items={conclusion.potential_gaps_limitations} color="#c62828" />
                </Grid>
              )}
            </Grid>
          </Section>
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
            '&:hover': { background: 'linear-gradient(45deg, #2850C9 30%, #00A3E0 90%)' },
          }}
        >
          Continue to Vertical Market Check
        </Button>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Report copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
