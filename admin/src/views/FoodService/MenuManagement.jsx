import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Add, Delete, Save, Restaurant } from '@mui/icons-material';
import Config from 'src/components/Config';
import Toast from 'react-hot-toast';

const PREDEFINED_MENU_ITEMS = {
  breakfast: [
    'Idli', 'Dosa', 'Vada', 'Poha', 'Upma', 'Paratha', 'Puri Bhaji', 
    'Aloo Paratha', 'Bread Toast', 'Sandwich', 'Omelette', 'Boiled Egg',
    'Buttermilk', 'Tea', 'Coffee', 'Milk', 'Fruit Juice'
  ],
  lunch: [
    'Rice Meals', 'Chapati', 'Roti', 'Biryani', 'Pulao', 'Fried Rice',
    'Sambar Rice', 'Curd Rice', 'Dal Rice', 'Paneer Curry', 'Veg Curry',
    'Chicken Curry', 'Fish Curry', 'Raita', 'Papad', 'Pickle',
    'Buttermilk', 'Fruit Juice', 'Curd'
  ],
  dinner: [
    'Rice Meals', 'Chapati', 'Roti', 'Biryani', 'Pulao', 'Fried Rice',
    'Sambar Rice', 'Curd Rice', 'Dal Rice', 'Paneer Curry', 'Veg Curry',
    'Chicken Curry', 'Fish Curry', 'Raita', 'Papad', 'Pickle',
    'Buttermilk', 'Fruit Juice', 'Curd'
  ],
};

const MenuManagement = () => {
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [menu, setMenu] = useState({
    breakfast: { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
    lunch: { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
    dinner: { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
  });
  const [loading, setLoading] = useState(false);
  const [existingMenu, setExistingMenu] = useState(null);

  useEffect(() => {
    fetchMenuForDate();
  }, [menuDate]);

  const fetchMenuForDate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Config.get(`/api/admin/food/menu?date=${menuDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.menu) {
        setExistingMenu(response.data.menu);
        setMenu({
          breakfast: response.data.menu.breakfast || { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
          lunch: response.data.menu.lunch || { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
          dinner: response.data.menu.dinner || { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
        });
      } else {
        setExistingMenu(null);
        setMenu({
          breakfast: { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
          lunch: { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
          dinner: { items: [{ name: '', description: '', price: 0, quantity: 0, category: 'Main' }] },
        });
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const handleAddItem = (mealType) => {
    setMenu(prev => ({
      ...prev,
      [mealType]: {
        items: [...prev[mealType].items, { name: '', description: '', price: 0, quantity: 0, category: 'Main' }],
      },
    }));
  };

  const handleRemoveItem = (mealType, index) => {
    setMenu(prev => ({
      ...prev,
      [mealType]: {
        items: prev[mealType].items.filter((_, i) => i !== index),
      },
    }));
  };

  const handleItemChange = (mealType, index, field, value) => {
    setMenu(prev => ({
      ...prev,
      [mealType]: {
        items: prev[mealType].items.map((item, i) =>
          i === index ? { ...item, [field]: field === 'price' ? Number(value) : value } : item
        ),
      },
    }));
  };

  const handleSaveMenu = async () => {
    // Validate
    const allMeals = [...menu.breakfast.items, ...menu.lunch.items, ...menu.dinner.items];
    const hasEmptyItems = allMeals.some(item => !item.name || item.price <= 0 || item.quantity < 0);
    
    if (hasEmptyItems) {
      Toast.error('Please fill all item names, prices, and quantities');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await Config.post(
        '/api/admin/food/menu',
        {
          date: menuDate,
          breakfast: menu.breakfast,
          lunch: menu.lunch,
          dinner: menu.dinner,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Toast.success('Menu saved successfully!');
        fetchMenuForDate();
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      Toast.error('Failed to save menu');
    } finally {
      setLoading(false);
    }
  };

  const renderMealSection = (mealType, mealLabel, icon) => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                {mealLabel}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => handleAddItem(mealType)}
              sx={{ fontFamily: 'Poppins', textTransform: 'none' }}
            >
              Add Item
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {menu[mealType].items.map((item, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo
                          options={PREDEFINED_MENU_ITEMS[mealType] || []}
                          value={item.name}
                          onChange={(e, newValue) => handleItemChange(mealType, index, 'name', newValue || '')}
                          onInputChange={(e, newValue) => handleItemChange(mealType, index, 'name', newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="Item Name *"
                              placeholder="Select or type item name"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={item.category || 'Main'}
                            label="Category"
                            onChange={(e) => handleItemChange(mealType, index, 'category', e.target.value)}
                          >
                            <MenuItem value="Main">Main Course</MenuItem>
                            <MenuItem value="Beverage">Beverage</MenuItem>
                            <MenuItem value="Side">Side Dish</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Description"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(mealType, index, 'description', e.target.value)}
                          placeholder="e.g., Idli with Sambar and Chutney"
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Price (₹) *"
                          value={item.price}
                          onChange={(e) => handleItemChange(mealType, index, 'price', e.target.value)}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Available Quantity (Plates) *"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(mealType, index, 'quantity', e.target.value)}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleRemoveItem(mealType, index)}
                          disabled={menu[mealType].items.length === 1}
                          sx={{ height: '40px' }}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Menu Date"
                value={menuDate}
                onChange={(e) => setMenuDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              {existingMenu ? (
                <Alert severity="info">
                  Menu already exists for this date. You can update it below.
                </Alert>
              ) : (
                <Alert severity="warning">
                  No menu found for this date. Create a new menu below.
                </Alert>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {renderMealSection('breakfast', '🌅 Breakfast Menu', <Restaurant sx={{ color: '#ff9800' }} />)}
      {renderMealSection('lunch', '🍱 Lunch Menu', <Restaurant sx={{ color: '#4caf50' }} />)}
      {renderMealSection('dinner', '🌙 Dinner Menu', <Restaurant sx={{ color: '#2196f3' }} />)}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSaveMenu}
          disabled={loading}
          sx={{
            fontFamily: 'Poppins',
            textTransform: 'none',
            px: 6,
            py: 1.5,
            background: 'linear-gradient(135deg, #f44336 0%, #ff7961 100%)',
          }}
        >
          {loading ? 'Saving...' : existingMenu ? 'Update Menu' : 'Save Menu'}
        </Button>
      </Box>
    </Box>
  );
};

export default MenuManagement;
