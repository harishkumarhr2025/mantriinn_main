import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  OutlinedInput,
  Chip,
} from '@mui/material';
import {
  Person,
  CalendarToday,
  MeetingRoom,
  Logout,
  Dashboard,
  RoomService,
  LocalLaundryService,
  Tv,
  ReportProblem,
  Restaurant,
  Iron,
  CleaningServices,
  Wifi,
  Feedback,
  Menu as MenuIcon,
  Send,
  Home,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from 'src/redux/features/AuthSlice';
import Config from 'src/components/Config';
import Toast from 'react-hot-toast';
import FoodServiceDialog from './FoodServiceDialog.jsx';

const GuestPortal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [laundryDialogOpen, setLaundryDialogOpen] = useState(false);
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  const [laundryForm, setLaundryForm] = useState({
    clothType: [],
    numberOfItems: '',
    washType: '',
    specialInstructions: '',
    isEmergency: false,
  });

  const clothTypeOptions = [
    'Shirts',
    'Pants',
    'T-Shirts',
    'Jeans',
    'Bedsheets',
    'Towels',
    'Blankets',
    'Undergarments',
    'Socks',
    'Jackets',
  ];

  useEffect(() => {
    const fetchGuestData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth/guest-login');
          return;
        }

        const response = await Config.get('/api/guest/portal/details', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setGuestData(response.data.guest);
        }
      } catch (error) {
        console.error('Error fetching guest data:', error);
        Toast.error('Failed to load guest details');
      } finally {
        setLoading(false);
      }
    };

    fetchGuestData();
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    Toast.success('Logged out successfully');
    navigate('/');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTimeRemaining = () => {
    if (!guestData?.Checkout_date) return 'N/A';
    const now = new Date();
    const checkout = new Date(guestData.Checkout_date);
    const diff = checkout - now;
    
    if (diff < 0) return 'Checkout time passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const handleServiceRequest = async (service) => {
    if (service === 'Food Service') {
      setFoodDialogOpen(true);
    } else if (service === 'Laundry Service') {
      setLaundryDialogOpen(true);
    } else {
      // Send WhatsApp notification for other services
      try {
        const token = localStorage.getItem('token');
        const message = `🔔 Service Request: ${service}\n\nGuest: ${guestData.Guest_name}\nRoom: ${guestData.Room_no}\nTime: ${new Date().toLocaleString('en-IN')}`;
        
        await Config.post(
          '/api/guest/service-notification',
          { serviceName: service, message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        Toast.success(`${service} request submitted!`);
      } catch (error) {
        console.error('Error sending service notification:', error);
        Toast.success(`${service} request submitted!`);
      }
    }
  };

  const handleLaundrySubmit = async () => {
    if (!laundryForm.clothType.length || !laundryForm.numberOfItems || !laundryForm.washType) {
      Toast.error('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await Config.post(
        '/api/guest/laundry-request',
        laundryForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const deliveryMsg = laundryForm.isEmergency 
          ? 'Emergency delivery in 4 hours (₹200 extra charge)'
          : 'Standard delivery in 24 hours';
        Toast.success(`Laundry request submitted! ${deliveryMsg}`);
        setLaundryDialogOpen(false);
        setLaundryForm({
          clothType: [],
          numberOfItems: '',
          washType: '',
          specialInstructions: '',
          isEmergency: false,
        });
      }
    } catch (error) {
      console.error('Error submitting laundry request:', error);
      Toast.error('Failed to submit laundry request');
    }
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) {
      Toast.error('Please enter feedback');
      return;
    }
    Toast.success('Feedback submitted successfully!');
    setFeedbackText('');
  };

  const services = [
    { name: 'Laundry Service', icon: LocalLaundryService, color: '#4caf50' },
    { name: 'TV Activation', icon: Tv, color: '#2196f3' },
    { name: 'Report Issue', icon: ReportProblem, color: '#ff9800' },
    { name: 'Food Service', icon: Restaurant, color: '#f44336' },
    { name: 'Room Service', icon: RoomService, color: '#9c27b0' },
    { name: 'Iron Service', icon: Iron, color: '#795548' },
    { name: 'Housekeeping', icon: CleaningServices, color: '#00bcd4' },
    { name: 'Extra Towels', icon: Home, color: '#ff5722' },
  ];

  const menuItems = [
    { text: 'Dashboard', icon: Dashboard, view: 'dashboard' },
    { text: 'Services', icon: RoomService, view: 'services' },
    { text: 'All Details', icon: Person, view: 'details' },
    { text: 'Feedback', icon: Feedback, view: 'feedback' },
  ];

  const drawerWidth = 240;

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#1a1a2e', color: 'white' }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'rgba(124, 77, 255, 0.3)',
            fontSize: '2rem',
          }}
        >
          {guestData?.Guest_name?.charAt(0) || 'G'}
        </Avatar>
        <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
          {guestData?.Guest_name || 'Guest'}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {guestData?.GRC_No || 'N/A'}
        </Typography>
      </Box>
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <ListItemButton
              key={item.view}
              onClick={() => {
                setCurrentView(item.view);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: currentView === item.view ? 'rgba(124, 77, 255, 0.2)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(124, 77, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontFamily: 'Poppins' } }} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.3)',
            fontFamily: 'Poppins',
            '&:hover': {
              borderColor: '#ff4081',
              bgcolor: 'rgba(255, 64, 129, 0.1)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!guestData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6">No guest data found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {currentView === 'dashboard' && (
          <Box>
            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 3 }}>
              Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins', mb: 1 }}>Check-in</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>{formatDateTime(guestData.Arrival_date)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins', mb: 1 }}>Check-out</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>{formatDateTime(guestData.Checkout_date)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins', mb: 1 }}>Time Remaining</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>{calculateTimeRemaining()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Wifi sx={{ fontSize: 40, color: '#7c4dff' }} />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>WiFi Credentials</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Network:</strong> Mantri Inn Guest</Typography>
                    <Typography variant="body1"><strong>Password:</strong> mantri@2024</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <MeetingRoom sx={{ fontSize: 40, color: '#ff4081' }} />
                      <Typography variant="h5" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Room Details</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Room No:</strong> {guestData.Room_no || 'N/A'}</Typography>
                    <Typography variant="body1"><strong>Room Type:</strong> {guestData.Room_type || 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {currentView === 'services' && (
          <Box>
            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 3 }}>
              Services
            </Typography>
            <Grid container spacing={3}>
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={service.name}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        },
                      }}
                      onClick={() => handleServiceRequest(service.name)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: service.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            color: 'white',
                          }}
                        >
                          <IconComponent sx={{ fontSize: 40 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                          {service.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {currentView === 'details' && (
          <Box>
            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 3 }}>
              Complete Details
            </Typography>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {Object.entries(guestData).map(([key, value]) => {
                    if (key === '_id' || key === '__v' || key === 'Guest_ID_Proof') return null;
                    
                    let displayValue = value;
                    if (key.includes('date') || key.includes('Date')) {
                      displayValue = formatDate(value);
                    } else if (Array.isArray(value)) {
                      displayValue = value.join(', ') || 'N/A';
                    } else if (typeof value === 'object' && value !== null) {
                      displayValue = JSON.stringify(value);
                    } else if (!value) {
                      displayValue = 'N/A';
                    }

                    return (
                      <Grid item xs={12} md={6} key={key}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="body1">
                            {String(displayValue)}
                          </Typography>
                          <Divider sx={{ mt: 1 }} />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {currentView === 'feedback' && (
          <Box>
            <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 3 }}>
              Feedback
            </Typography>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins', mb: 2 }}>
                  We'd love to hear from you!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please share your experience with us. Your feedback helps us improve our services.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Write your feedback here..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<Send />}
                  onClick={handleFeedbackSubmit}
                  sx={{
                    px: 4,
                    fontFamily: 'Poppins',
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #7c4dff 0%, #ff4081 100%)',
                  }}
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Laundry Request Dialog */}
      <Dialog open={laundryDialogOpen} onClose={() => setLaundryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)', color: 'white' }}>
          Laundry Service Request
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Cloth Types</InputLabel>
                <Select
                  multiple
                  value={laundryForm.clothType}
                  onChange={(e) => setLaundryForm({ ...laundryForm, clothType: e.target.value })}
                  input={<OutlinedInput label="Cloth Types" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {clothTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={laundryForm.clothType.indexOf(type) > -1} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Number of Items"
                value={laundryForm.numberOfItems}
                onChange={(e) => setLaundryForm({ ...laundryForm, numberOfItems: e.target.value })}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Wash Type</InputLabel>
                <Select
                  value={laundryForm.washType}
                  label="Wash Type"
                  onChange={(e) => setLaundryForm({ ...laundryForm, washType: e.target.value })}
                >
                  <MenuItem value="Gentle Wash">Gentle Wash</MenuItem>
                  <MenuItem value="Normal Wash">Normal Wash</MenuItem>
                  <MenuItem value="Heavy Duty Wash">Heavy Duty Wash</MenuItem>
                  <MenuItem value="Dry Clean">Dry Clean</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={laundryForm.isEmergency}
                    onChange={(e) => setLaundryForm({ ...laundryForm, isEmergency: e.target.checked })}
                    color="error"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Emergency Delivery (4 hours)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Extra charge: ₹200
                    </Typography>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Instructions (Optional)"
                placeholder="Any special care instructions..."
                value={laundryForm.specialInstructions}
                onChange={(e) => setLaundryForm({ ...laundryForm, specialInstructions: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLaundryDialogOpen(false)} sx={{ fontFamily: 'Poppins' }}>
            Cancel
          </Button>
          <Button
            onClick={handleLaundrySubmit}
            variant="contained"
            sx={{
              fontFamily: 'Poppins',
              background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Food Service Dialog */}
      <FoodServiceDialog 
        open={foodDialogOpen} 
        onClose={() => setFoodDialogOpen(false)} 
      />
    </Box>
  );
};

export default GuestPortal;
