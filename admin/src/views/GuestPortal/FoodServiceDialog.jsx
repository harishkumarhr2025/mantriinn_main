import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { Restaurant } from '@mui/icons-material';
import Config from 'src/components/Config';
import Toast from 'react-hot-toast';

const FoodServiceDialog = ({ open, onClose }) => {
  const [todaysMenu, setTodaysMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodForm, setFoodForm] = useState({
    breakfast: { selected: false, items: [], price: 0 },
    lunch: { selected: false, items: [], price: 0 },
    dinner: { selected: false, items: [], price: 0 },
    specialInstructions: '',
  });

  useEffect(() => {
    if (open) {
      fetchTodaysMenu();
    }
  }, [open]);

  const fetchTodaysMenu = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await Config.get('/api/guest/food/menu', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setTodaysMenu(response.data.menu);
      } else {
        Toast.error('No menu available for today');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      Toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleMealToggle = (mealType) => {
    setFoodForm(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        selected: !prev[mealType].selected,
      },
    }));
  };

  const handleItemSelection = (mealType, item) => {
    setFoodForm(prev => {
      const meal = { ...prev[mealType] };
      const itemIndex = meal.items.findIndex(i => i === item.name);
      
      if (itemIndex > -1) {
        meal.items.splice(itemIndex, 1);
        meal.price -= item.price;
      } else {
        meal.items.push(item.name);
        meal.price += item.price;
      }
      
      return { ...prev, [mealType]: meal };
    });
  };

  const handleSubmit = async () => {
    if (!foodForm.breakfast.selected && !foodForm.lunch.selected && !foodForm.dinner.selected) {
      Toast.error('Please select at least one meal');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await Config.post(
        '/api/guest/food/request',
        foodForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Toast.success('Food service request submitted successfully!');
        onClose();
        setFoodForm({
          breakfast: { selected: false, items: [], price: 0 },
          lunch: { selected: false, items: [], price: 0 },
          dinner: { selected: false, items: [], price: 0 },
          specialInstructions: '',
        });
      }
    } catch (error) {
      console.error('Error submitting food request:', error);
      Toast.error('Failed to submit food request');
    }
  };

  const getTotalPrice = () => {
    return foodForm.breakfast.price + foodForm.lunch.price + foodForm.dinner.price;
  };

  const renderMealSection = (mealType, mealLabel, mealData) => {
    if (!mealData || !mealData.items || mealData.items.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={foodForm[mealType].selected}
              onChange={() => handleMealToggle(mealType)}
              color="primary"
            />
          }
          label={
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
              {mealLabel}
            </Typography>
          }
        />
        
        {foodForm[mealType].selected && (
          <Box sx={{ ml: 4, mt: 2 }}>
            <Grid container spacing={2}>
              {mealData.items.map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: foodForm[mealType].items.includes(item.name) ? '2px solid #f44336' : '1px solid #ddd',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                      opacity: item.quantity === 0 ? 0.5 : 1,
                    }}
                    onClick={() => item.quantity > 0 && handleItemSelection(mealType, item)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          {item.category && (
                            <Chip 
                              label={item.category} 
                              size="small" 
                              sx={{ mt: 0.5, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        <Chip
                          label={`₹${item.price}`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      {item.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {item.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ 
                          color: item.quantity > 0 ? 'success.main' : 'error.main',
                          fontWeight: 600 
                        }}>
                          {item.quantity > 0 ? `${item.quantity} plates available` : 'Out of stock'}
                        </Typography>
                        {foodForm[mealType].items.includes(item.name) && (
                          <Chip label="✓ Selected" color="success" size="small" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {foodForm[mealType].items.length > 0 && (
              <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: '#f44336' }}>
                Selected: {foodForm[mealType].items.join(', ')} - ₹{foodForm[mealType].price}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600, background: 'linear-gradient(135deg, #f44336 0%, #ff7961 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Restaurant />
          Food Service Request
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Typography>Loading menu...</Typography>
        ) : !todaysMenu ? (
          <Typography>No menu available for today. Please contact the front desk.</Typography>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select your meals for today. Click on items to add them to your order.
            </Typography>

            {renderMealSection('breakfast', '🌅 Breakfast', todaysMenu.breakfast)}
            {renderMealSection('lunch', '🍱 Lunch', todaysMenu.lunch)}
            {renderMealSection('dinner', '🌙 Dinner', todaysMenu.dinner)}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                Total: ₹{getTotalPrice()}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Special Instructions (Optional)"
              placeholder="Any dietary preferences or special requests..."
              value={foodForm.specialInstructions}
              onChange={(e) => setFoodForm({ ...foodForm, specialInstructions: e.target.value })}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontFamily: 'Poppins' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !todaysMenu}
          sx={{
            fontFamily: 'Poppins',
            background: 'linear-gradient(135deg, #f44336 0%, #ff7961 100%)',
          }}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FoodServiceDialog;
