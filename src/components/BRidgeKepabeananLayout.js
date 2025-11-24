import React from 'react';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  Description as DescriptionIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const BRidgeKepabeananLayout = ({ title, subtitle, breadcrumbs, children, actions }) => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          mb: 3,
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <DescriptionIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 0.5 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
        </Box>

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<ChevronRightIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
            sx={{ '& .MuiBreadcrumbs-separator': { color: 'rgba(255, 255, 255, 0.7)' } }}
          >
            <Link
              underline="hover"
              color="inherit"
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            >
              <HomeIcon sx={{ fontSize: 18 }} />
              Home
            </Link>
            {breadcrumbs.map((item, idx) => (
              <Typography
                key={idx}
                sx={{
                  color: idx === breadcrumbs.length - 1 ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                  fontWeight: idx === breadcrumbs.length - 1 ? 'bold' : 'normal',
                }}
              >
                {item}
              </Typography>
            ))}
          </Breadcrumbs>
        )}
      </Paper>

      {/* Content Section */}
      <Box sx={{ flex: 1, px: 3, pb: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default BRidgeKepabeananLayout;
