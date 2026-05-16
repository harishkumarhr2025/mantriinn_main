import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Search,
  FileDownload,
  CheckCircle,
} from '@mui/icons-material';
import Config from 'src/components/Config';
import Toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const FoodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Dialogs
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, searchQuery, statusFilter, dateRange]);

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Config.get('/api/admin/food/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      Toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.contactNumber.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(
        (req) => new Date(req.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((req) => new Date(req.date) <= endDate);
    }

    setFilteredRequests(filtered);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRequests.map((req) => req._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleUpdateStatus = async () => {
    if (selected.length === 0) {
      Toast.error('Please select at least one request');
      return;
    }

    if (!actionType) {
      Toast.error('Please select an action');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await Config.put(
        '/api/admin/food/update-status',
        {
          requestIds: selected,
          status: actionType,
          customMessage: customMessage || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Toast.success(response.data.message);
        setActionDialogOpen(false);
        setSelected([]);
        setActionType('');
        setCustomMessage('');
        fetchAllRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Config.post(
        '/api/admin/food/export',
        { reportDate: exportDate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const { reportData } = response.data;
        
        // Create worksheet matching PDF format
        const wsData = [
          ['FOOD DAILY REPORT'],
          [],
          ['DATE:', reportData.date],
          [],
          ['SL.NO', 'ROOM NO', 'NAME', 'STIFFEN', 'BREAKFAST', 'LUNCH', 'DINNER'],
        ];

        // Add data rows (40-70 as per PDF)
        for (let i = 0; i < 31; i++) {
          const req = reportData.requests[i];
          if (req) {
            wsData.push([
              req.slNo,
              req.roomNo,
              req.name,
              req.stiffen,
              req.breakfast,
              req.lunch,
              req.dinner,
            ]);
          } else {
            wsData.push([40 + i, '', '', '', '', '', '']);
          }
        }

        // Add summary
        wsData.push([]);
        wsData.push(['SUMMARY', '', 'LODGE', 'STAFF']);
        wsData.push(['TOTAL BREAKFAST', '', reportData.summary.totalBreakfast, '']);
        wsData.push(['TOTAL LUNCH', '', reportData.summary.totalLunch, '']);
        wsData.push(['TOTAL DINNER', '', reportData.summary.totalDinner, '']);
        wsData.push([]);
        wsData.push(['FINAL FOOD STOCK']);
        wsData.push(['CHAPATHI', 'RICE', 'SABGI', 'SAMBAR', 'DAL']);
        wsData.push(['QTY IN KG', '', '', '', '']);
        wsData.push([]);
        wsData.push(['SIGNATURE', 'PG - GUEST']);

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
          { wch: 8 },  // SL.NO
          { wch: 12 }, // ROOM NO
          { wch: 20 }, // NAME
          { wch: 15 }, // STIFFEN
          { wch: 12 }, // BREAKFAST
          { wch: 12 }, // LUNCH
          { wch: 12 }, // DINNER
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Food Report');

        // Generate filename
        const filename = `Food_Daily_Report_${exportDate}.xlsx`;
        
        // Download file
        XLSX.writeFile(wb, filename);

        Toast.success('Report exported successfully!');
        setExportDialogOpen(false);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Toast.error('Failed to export report');
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
      default:
        return 'default';
    }
  };

  const sortedRequests = filteredRequests.sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    }
    return a[orderBy] < b[orderBy] ? 1 : -1;
  });

  const paginatedRequests = sortedRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <Toolbar sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, room, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => setExportDialogOpen(true)}
                sx={{ fontFamily: 'Poppins' }}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </Toolbar>

        {selected.length > 0 && (
          <Box sx={{ px: 2, py: 1, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selected.length} selected
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => setActionDialogOpen(true)}
              sx={{ fontFamily: 'Poppins', textTransform: 'none' }}
            >
              Update Status
            </Button>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredRequests.length}
                    checked={filteredRequests.length > 0 && selected.length === filteredRequests.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'guestName'}
                    direction={orderBy === 'guestName' ? order : 'asc'}
                    onClick={() => handleSort('guestName')}
                  >
                    Guest Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Breakfast</TableCell>
                <TableCell>Lunch</TableCell>
                <TableCell>Dinner</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No requests found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRequests.map((request) => (
                  <TableRow
                    key={request._id}
                    hover
                    selected={selected.indexOf(request._id) !== -1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.indexOf(request._id) !== -1}
                        onChange={() => handleSelectOne(request._id)}
                      />
                    </TableCell>
                    <TableCell>{request.guestName}</TableCell>
                    <TableCell>{request.roomNo}</TableCell>
                    <TableCell>{request.contactNumber}</TableCell>
                    <TableCell>
                      {request.breakfast?.selected ? (
                        <Chip label="✓" color="success" size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {request.lunch?.selected ? (
                        <Chip label="✓" color="success" size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {request.dinner?.selected ? (
                        <Chip label="✓" color="success" size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>₹{request.totalPrice}</TableCell>
                    <TableCell>
                      {new Date(request.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRequests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
          Update Status for {selected.length} Request(s)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionType}
                label="Action"
                onChange={(e) => setActionType(e.target.value)}
              >
                <MenuItem value="In Progress">Mark as In Progress</MenuItem>
                <MenuItem value="Completed">Mark as Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom Message (Optional)"
              placeholder="Add a custom message for the notification..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActionDialogOpen(false)} sx={{ fontFamily: 'Poppins' }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            sx={{ fontFamily: 'Poppins' }}
          >
            Update & Notify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
          Export Food Daily Report
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Report Date"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Select the date for the food report"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ fontFamily: 'Poppins' }}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            startIcon={<FileDownload />}
            sx={{ fontFamily: 'Poppins' }}
          >
            Export Excel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FoodRequests;
