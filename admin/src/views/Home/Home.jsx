import React, { useEffect } from 'react';
import './Home.css';
import { Container, Typography, Button, Grid, Card, CardContent, Avatar, Box } from '@mui/material';
import buildingBg from '../../assets/images/backgrounds/building-bg.jpg';
import {
  Wifi,
  Restaurant,
  Security,
  LocalLaundryService,
  Favorite,
  ChevronRight,
  LocationOn,
} from '@mui/icons-material';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { useDispatch } from 'react-redux';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import MapSection from '../../components/MapSection/MapSection';

import { CheckAuthentication } from 'src/redux/features/AuthSlice';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import EnquiryForm from 'src/components/EnquiryForm/EnquiryForm';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#0a1929',
      paper: '#001e3c',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

const Home = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserAuthentication = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await dispatch(CheckAuthentication());
      } else {
        console.log('User not authenticated.');
      }
    };

    checkUserAuthentication();
  }, [dispatch]);

  const images = [1, 2, 3, 4];

  const settings = {
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
    arrows: true,
    dots: true,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          arrows: false,
          dots: true,
        },
      },
    ],
  };
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Poppins',
          backgroundImage: `url(${buildingBg})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 25, 41, 0.7)',
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container
          maxWidth="xl"
          sx={{
            flex: 1,

            px: { xs: 2, sm: 4, lg: 6 },
            mt: { xs: 8, md: 8 },
            maxWidth: 1200,
            mx: 'auto',
            mb: 12,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {/* Hero Section */}

          <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(45deg, #7c4dff 30%, #ff4081 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'Poppins',
                  [theme.breakpoints.between(360, 740)]: {
                    fontSize: '2rem', // Adjust font size
                    lineHeight: 1.3, // Adjust line height
                  },

                  // Optional: Small screens (below 360px)
                  [theme.breakpoints.down(360)]: {
                    fontSize: '1.8rem',
                  },

                  // Optional: Larger screens (above 740px)
                  [theme.breakpoints.up(740)]: {
                    fontSize: '4rem',
                  },
                }}
              >
                PG rentals lowest from rs 8,999
              </Typography>
              <a href="https://www.google.com/maps/place/HOTEL+MANTRI+INN/@12.9870158,77.5723796,17z/data=!3m1!4b1!4m9!3m8!1s0x3bae16183c0f32ed:0xa91b2970ce401265!5m2!4m1!1i2!8m2!3d12.9870158!4d77.5723796!16s%2Fg%2F1td_fp69?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 4,
                  '&:hover': {
                    '& .location-text': {
                      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      transform: 'scale(1.05)',
                    },
                    '& .location-icon': {
                      color: '#FF6B35',
                      transform: 'scale(1.2) rotate(15deg)',
                    }
                  }
                }}>
                  <Typography 
                    className="location-text"
                    variant="h5" 
                    sx={{ 
                      fontFamily: 'Poppins', 
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      color: '#FF8C42',
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                    }}
                  >
                    seshadriupuram
                  </Typography>
                  <LocationOn 
                    className="location-icon"
                    sx={{ 
                      color: '#FF8C42', 
                      cursor: 'pointer', 
                      fontSize: '1.5rem',
                      transition: 'all 0.3s ease-in-out',
                    }} 
                  />
                </Box>
              </a>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 4,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontFamily: 'Poppins',
                }}
              >
                Virtual Tour
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <div
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.3)',
                  height: '100%',
                }}
              >
                <Slider {...settings}>
                  {images.map((item) => (
                    <div key={item} style={{ width: '100%', height: '400px' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Background with gradient */}
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(45deg, #2d2d2d, #3d3d3d)`,
                          }}
                        />

                        {/* Image Section */}
                        <img
                          src={require(`../../assets/images/products/PG-picture-${item}.jpg`)}
                          alt={`PG Living Space ${item}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />

                        {/* Text Overlay */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '16px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ color: '#fff', fontFamily: 'Poppins' }}
                          >
                            {item === 1 || item === 2 ? 'Living Space' : 'Wash Room'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </Grid>
          </Grid>

          {/* Features Grid */}
          <Grid container spacing={4} sx={{ mb: 12 }}>
            {[
              { icon: <Wifi sx={{ fontSize: 40 }} />, title: 'High-Speed WiFi' },
              { icon: <Restaurant sx={{ fontSize: 40 }} />, title: 'Tasty Meals' },
              { icon: <Security sx={{ fontSize: 40 }} />, title: '24/7 Security' },
              { icon: <LocalLaundryService sx={{ fontSize: 40 }} />, title: 'Laundry Service' },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    borderRadius: 4,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        mb: 3,
                        mx: 'auto',
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 400, fontFamily: 'Poppins' }}>
                      {feature.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pricing Section */}

          <Grid container spacing={4} sx={{ mb: 12, justifyContent: 'center' }}>
            <Grid item xs={12}>
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  mb: 6,

                  fontFamily: 'Poppins',
                }}
              >
                Flexible Plans for Everyone
              </Typography>
            </Grid>
            {['ur Sharing', 'Triple Sharing', 'Double Sharing', 'Single Sharing'].map(
              (plan, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: '2px solid #7c4dff',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(10px)',
                      height: '100%', // Add consistent height
                      display: 'flex', // Enable flex layout
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        textAlign: 'center',
                        color: '#7c4dff',
                        fontFamily: 'Poppins',
                      }}
                    >
                      {plan}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        textAlign: 'center',
                        mb: 3,
                        fontWeight: 600,
                        color: '#7c4dff',
                        fontFamily: 'Poppins',
                      }}
                    >
                      ₹{['8000', '9000', '10000', '20000'][index]}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '1rem',
                          opacity: 0.8,
                          color: '#7c4dff',
                          fontFamily: 'Poppins',
                        }}
                      >
                        /month
                      </Typography>
                    </Typography>
                    <ul
                      style={{
                        listStyle: 'none',
                        paddingLeft: 0,
                        marginBottom: 32,
                        color: '#000000',
                        fontFamily: 'Poppins',
                      }}
                    >
                      {[
                        'AC Room*',
                        'Lift Facility',
                        'Daily Housekeeping',
                        'Laundry Service',
                        'Daily Hot Water',
                        '24/7 Electricity',
                        'Parking for two wheeler',
                      ].map((item, i) => (
                        <li
                          key={i}
                          style={{
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: '#000000',
                            fontFamily: 'Poppins',
                          }}
                        >
                          <Favorite
                            sx={{
                              fontSize: 20,
                              color: '#000000',
                              fontFamily: 'Poppins',
                            }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Grid>
              ),
            )}
          </Grid>

          {/* Food Pricing Section */}
          <Grid container spacing={4} sx={{ mb: 12 }}>
            <Grid item xs={12}>
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  mb: 6,
                  fontWeight: 700,
                  fontFamily: 'Poppins',
                }}
              >
                Meal Plans
              </Typography>
            </Grid>
            {['1 Time meal', '2 Times meal', '3 Times meal'].map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '2px solid #ff4081',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      textAlign: 'center',
                      color: '#ff4081',
                      fontFamily: 'Poppins',
                    }}
                  >
                    {plan}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      textAlign: 'center',
                      mb: 3,
                      fontWeight: 600,
                      fontFamily: 'Poppins',
                      color: '#ff4081',
                    }}
                  >
                    ₹{['2,000', '4,000', '6,000'][index]}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '1rem',
                        opacity: 0.8,
                        color: '#ff4081',
                        fontFamily: 'Poppins',
                      }}
                    >
                      /month
                    </Typography>
                  </Typography>
                  <ul
                    style={{
                      listStyle: 'none',
                      paddingLeft: 0,
                      marginBottom: 32,
                      fontFamily: 'Poppins',
                      color: '#000000',
                    }}
                  >
                    {[
                      `${index + 1} Meal${index > 0 ? 's' : ''} Per Day`,
                      'Vegetarian Options',
                      'Weekly Menu Rotation',
                      'Meal is not inter changable',
                    ].map((item, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontFamily: 'Poppins',
                        }}
                      >
                        <Restaurant
                          sx={{
                            color: '#000000',
                            fontSize: 20,
                            fontFamily: 'Poppins',
                          }}
                        />
                        <span sx={{ fontFamily: 'Poppins' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Container maxWidth="xl" sx={{ py: 8 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 500,
                fontFamily: 'Poppins',
              }}
            >
              Our Spaces
            </Typography>
            <Grid container spacing={2}>
              {[
                { title: 'Luxury Rooms', desc: 'Modern AC accommodations' },
                { title: 'Dining Area', desc: 'Healthy meal services' },
                { title: 'Common Areas', desc: 'Social interaction spaces' },
                { title: 'Security', desc: '24/7 surveillance' },
              ].map((space, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        '& .gallery-overlay': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    {/* Image placeholder - replace with actual image */}
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '75%',
                        background: `linear-gradient(45deg, #2d2d2d, #3d3d3d)`,
                      }}
                    >
                      <Box
                        className="gallery-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          fontFamily: 'Poppins',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 4,
                          opacity: 0.8,
                          transition: 'opacity 0.3s',
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 500, fontFamily: 'Poppins' }}>
                          {space.title}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8, fontFamily: 'Poppins' }}>
                          {space.desc}
                        </Typography>
                        <Button
                          variant="text"
                          endIcon={<ChevronRight />}
                          sx={{
                            mt: 2,
                            alignSelf: 'flex-start',
                            color: 'primary.main',
                            px: 0,
                            fontFamily: 'Poppins',
                          }}
                        >
                          View More
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Contact Section */}

          {/* <EnquiryForm /> */}
          {/* <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 500,
              fontFamily: 'Poppins',
            }}
          >
            Ready to Move In?
          </Typography> */}
          {/* <Grid container justifyContent="center">
            <Grid xs={12} md={6} item>
              <Card
                sx={{
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <MapSection />
              </Card>
            </Grid>
          </Grid> */}
        </Container>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Home;
