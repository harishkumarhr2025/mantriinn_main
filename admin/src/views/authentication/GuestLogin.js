import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff } from '@tabler/icons';
import PageContainer from 'src/components/container/PageContainer';
import { useDispatch } from 'react-redux';
import { guestLogin } from '../../redux/features/AuthSlice';
import Toast from 'react-hot-toast';

const GuestLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginCredential = {
        username,
        password,
      };
      const response = await dispatch(guestLogin(loginCredential));

      if (response?.meta?.requestStatus === 'rejected') {
        Toast.error(response?.payload?.message || 'Invalid credentials');
      }
      if (response?.meta?.requestStatus === 'fulfilled') {
        Toast.success('Welcome to Guest Portal!');
        navigate('/guest-portal');
      }
    } catch (error) {
      console.log('Error:', error);
      Toast.error('Something went wrong. Please try again later.');
    }
  };

  useEffect(() => {
    if (errorText) {
      const timeOut = setTimeout(() => {
        setErrorText('');
      }, 4000);
      return () => clearTimeout(timeOut);
    }
  }, [errorText]);

  return (
    <PageContainer title="Guest Login" description="Guest login page">
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Card
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: 'background.paper',
          }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              sx={{
                background: 'linear-gradient(45deg, #7c4dff 30%, #ff4081 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Poppins',
                fontSize: '2.3rem',
                fontWeight: 600,
                lineHeight: 2,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              Mantri Inn
            </Typography>

            <Typography variant="h5" sx={{ fontFamily: 'Poppins', fontWeight: 500, mb: 1 }}>
              Guest Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Please sign in with your guest credentials
            </Typography>
          </Box>

          <Stack sx={{ width: '100%', marginBottom: '2rem' }} spacing={2}>
            {errorText && (
              <Alert
                severity="error"
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  borderColor: 'error.light',
                  backgroundColor: '#FF6A6A',
                  backdropFilter: 'blur(2px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  '& .MuiAlert-icon': {
                    color: 'error.main',
                    alignItems: 'center',
                  },
                }}
                action={
                  <IconButton
                    aria-label="close"
                    color="error"
                    size="small"
                    onClick={() => setErrorText('')}
                    sx={{ color: '#fff', fontSize: '1.3rem' }}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                <Typography sx={{ color: '#fff', fontSize: '1rem', fontFamily: 'Poppins' }}>
                  {errorText}
                </Typography>
              </Alert>
            )}
          </Stack>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder="Enter your username (e.g., gu1)"
              InputProps={{
                sx: { borderRadius: 1 },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              InputProps={{
                sx: { borderRadius: 1 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 1,
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #7c4dff 0%, #9575ff 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6a3de8 0%, #8364ff 100%)',
                },
              }}
            >
              Sign In
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
              <Button
                onClick={() => navigate('/auth/login')}
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  textTransform: 'none',
                  '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' },
                }}
              >
                ← Back to login selection
              </Button>
            </Typography>
          </Stack>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default GuestLogin;
