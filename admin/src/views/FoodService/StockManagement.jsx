import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Delete, Save, Inventory } from '@mui/icons-material';
import Config from 'src/components/Config';
import Toast from 'react-hot-toast';

const PREDEFINED_ITEMS = [
  { name: 'Rice', unit: 'KG' },
  { name: 'Wheat Flour', unit: 'KG' },
  { name: 'Rava (Semolina)', unit: 'KG' },
  { name: 'Chapati', unit: 'Pieces' },
  { name: 'Roti', unit: 'Pieces' },
  { name: 'Papad', unit: 'Pieces' },
  { name: 'Sambar', unit: 'Liters' },
  { name: 'Rasam', unit: 'Liters' },
  { name: 'Dal', unit: 'KG' },
  { name: 'Vegetables', unit: 'KG' },
  { name: 'Curd', unit: 'Liters' },
  { name: 'Buttermilk', unit: 'Liters' },
  { name: 'Fruit Juice', unit: 'Liters' },
  { name: 'Egg', unit: 'Pieces' },
  { name: 'Paneer', unit: 'KG' },
  { name: 'Oil', unit: 'Liters' },
  { name: 'Ghee', unit: 'KG' },
  { name: 'Tea', unit: 'Liters' },
  { name: 'Coffee', unit: 'Liters' },
  { name: 'Milk', unit: 'Liters' },
];

const StockManagement = () => {
  const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0]);
  const [stocks, setStocks] = useState([
    { itemName: '', unit: 'KG', preparedQuantity: 0, consumedQuantity: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [existingStock, setExistingStock] = useState(null);

  useEffect(() => {
    fetchStockForDate();
  }, [stockDate]);

  const fetchStockForDate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Config.get(`/api/admin/food/stock?date=${stockDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.stock) {
        setExistingStock(response.data.stock);
        setStocks(response.data.stock.stocks.length > 0 
          ? response.data.stock.stocks 
          : [{ itemName: '', unit: 'KG', preparedQuantity: 0, consumedQuantity: 0 }]
        );
      } else {
        setExistingStock(null);
        setStocks([{ itemName: '', unit: 'KG', preparedQuantity: 0, consumedQuantity: 0 }]);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const handleAddItem = () => {
    setStocks([...stocks, { itemName: '', unit: 'KG', preparedQuantity: 0, consumedQuantity: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newStocks = [...stocks];
    newStocks[index][field] = field.includes('Quantity') ? Number(value) : value;
    setStocks(newStocks);
  };

  const handleQuickAdd = (predefinedItem) => {
    setStocks([...stocks, { 
      itemName: predefinedItem.name, 
      unit: predefinedItem.unit, 
      preparedQuantity: 0, 
      consumedQuantity: 0 
    }]);
  };

  const handleSaveStock = async () => {
    const validStocks = stocks.filter(s => s.itemName && s.preparedQuantity >= 0);
    
    if (validStocks.length === 0) {
      Toast.error('Please add at least one item with valid data');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await Config.post(
        '/api/admin/food/stock',
        {
          date: stockDate,
          stocks: validStocks,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Toast.success('Stock saved successfully!');
        fetchStockForDate();
      }
    } catch (error) {
      console.error('Error saving stock:', error);
      Toast.error('Failed to save stock');
    } finally {
      setLoading(false);
    }
  };

  const calculateRemaining = (prepared, consumed) => {
    return Math.max(0, prepared - consumed);
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
                label="Stock Date"
                value={stockDate}
                onChange={(e) => setStockDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              {existingStock ? (
                <Alert severity="info">
                  Stock data exists for this date. You can update it below.
                </Alert>
              ) : (
                <Alert severity="warning">
                  No stock data found for this date. Create new stock entry below.
                </Alert>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
              Quick Add Items
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {PREDEFINED_ITEMS.map((item, index) => (
              <Button
                key={index}
                size="small"
                variant="outlined"
                onClick={() => handleQuickAdd(item)}
                sx={{ textTransform: 'none' }}
              >
                + {item.name}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory sx={{ color: '#4caf50' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                Daily Stock Management
              </Typography>
            </Box>
            <Button
              startIcon={<Add />}
              onClick={handleAddItem}
              sx={{ fontFamily: 'Poppins', textTransform: 'none' }}
            >
              Add Item
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name *</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Prepared Qty *</TableCell>
                  <TableCell>Consumed Qty</TableCell>
                  <TableCell>Remaining</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((stock, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={stock.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        placeholder="e.g., Rice, Dal"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={stock.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        >
                          <MenuItem value="KG">KG</MenuItem>
                          <MenuItem value="Liters">Liters</MenuItem>
                          <MenuItem value="Pieces">Pieces</MenuItem>
                          <MenuItem value="Grams">Grams</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={stock.preparedQuantity}
                        onChange={(e) => handleItemChange(index, 'preparedQuantity', e.target.value)}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={stock.consumedQuantity}
                        onChange={(e) => handleItemChange(index, 'consumedQuantity', e.target.value)}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {calculateRemaining(stock.preparedQuantity, stock.consumedQuantity)} {stock.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                        disabled={stocks.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSaveStock}
          disabled={loading}
          sx={{
            fontFamily: 'Poppins',
            textTransform: 'none',
            px: 6,
            py: 1.5,
            background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
          }}
        >
          {loading ? 'Saving...' : existingStock ? 'Update Stock' : 'Save Stock'}
        </Button>
      </Box>
    </Box>
  );
};

export default StockManagement;
