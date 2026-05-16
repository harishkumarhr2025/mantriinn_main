import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person, Business } from '@mui/icons-material';
import PageContainer from 'src/components/container/PageContainer';

const LoginTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <PageContainer title="Login Type Selection" description="Choose login type">
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center" mb={6}>
            <Typography
              sx={{
                background: 'linear-gradient(45deg, #7c4dff 30%, #ff4081 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Poppins',
                fontSize: '2.5rem',
                fontWeight: 600,
                mb: 2,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              Mantri Inn
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontFamily: 'Poppins' }}>
              Select Login Type
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Guest Login */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(124, 77, 255, 0.2)',
                    borderColor: '#7c4dff',
                  },
                }}
                onClick={() => navigate('/auth/guest-login')}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c4dff 0%, #9575ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Person sx={{ fontSize: 50, color: 'white' }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    mb: 2,
                    color: '#7c4dff',
                  }}
                >
                  Guest Login
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  Access your guest portal to view your stay details and information
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 3,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontFamily: 'Poppins',
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #7c4dff 0%, #9575ff 100%)',
                  }}
                >
                  Continue as Guest
                </Button>
              </Card>
            </Grid>

            {/* Staff Login */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(255, 64, 129, 0.2)',
                    borderColor: '#ff4081',
                  },
                }}
                onClick={() => navigate('/auth/staff-login')}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff4081 0%, #ff6090 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Business sx={{ fontSize: 50, color: 'white' }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    mb: 2,
                    color: '#ff4081',
                  }}
                >
                  Staff Login
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  Access the admin dashboard and management tools
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 3,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontFamily: 'Poppins',
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #ff4081 0%, #ff6090 100%)',
                  }}
                >
                  Continue as Staff
                </Button>
              </Card>
            </Grid>
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button
              onClick={() => navigate('/')}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                fontFamily: 'Poppins',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                },
              }}
            >
              ← Back to Home
            </Button>
          </Box>
        </Container>
      </Box>
    </PageContainer>
  );
};

export default LoginTypeSelection;
