import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { LocalLaundryService, Person, MeetingRoom, Phone, AccessTime, MoreVert } from '@mui/icons-material';
import Config from 'src/components/Config';
import Toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const OpenRequests = () => {
  const [openRequests, setOpenRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOpenRequests();
  }, []);

  const fetchOpenRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Config.get('/api/admin/laundry/open', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOpenRequests(response.data.openRequests);
      }
    } catch (error) {
      console.error('Error fetching open requests:', error);
      Toast.error('Failed to load open requests');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');
      const response = await Config.put(
        '/api/admin/laundry/update-status',
        {
          requestIds: [selectedRequest._id],
          status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Toast.success(`Status updated to ${status}`);
        handleMenuClose();
        fetchOpenRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'In Progress':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {openRequests.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <LocalLaundryService sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No open requests at the moment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          openRequests.map((request) => (
            <Grid item xs={12} md={6} lg={4} key={request._id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalLaundryService sx={{ color: '#4caf50', fontSize: 32 }} />
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                        Request #{request._id.slice(-6)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, request)}
                        sx={{ ml: 1 }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  {request.isEmergency && (
                    <Chip
                      label="⚡ EMERGENCY"
                      color="error"
                      size="small"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Person sx={{ fontSize: 20, color: '#666' }} />
                      <Typography variant="body2">
                        <strong>Guest:</strong> {request.guestName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MeetingRoom sx={{ fontSize: 20, color: '#666' }} />
                      <Typography variant="body2">
                        <strong>Room:</strong> {request.roomNo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone sx={{ fontSize: 20, color: '#666' }} />
                      <Typography variant="body2">
                        <strong>Contact:</strong> {request.contactNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ fontSize: 20, color: '#666' }} />
                      <Typography variant="body2">
                        <strong>Requested:</strong> {new Date(request.createdAt).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Items:</strong> {request.numberOfItems}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Wash Type:</strong> {request.washType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Cloth Types:</strong>{' '}
                      {Array.isArray(request.clothType) ? request.clothType.join(', ') : request.clothType}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      p: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <strong>Delivery:</strong> {new Date(request.deliveryTime).toLocaleString('en-IN')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {openRequests.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/laundry-service')}
            sx={{
              fontFamily: 'Poppins',
              textTransform: 'none',
              px: 4,
            }}
          >
            View All Requests
          </Button>
        </Box>
      )}

      {/* Status Update Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate('In Progress')}>
          Mark as In Progress
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('Completed')}>
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('Delivered')}>
          Mark as Delivered
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OpenRequests;
