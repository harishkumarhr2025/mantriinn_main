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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress,
  Toolbar,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  FileDownload,
  CheckCircle,
  MoreVert,
} from '@mui/icons-material';
import Config from 'src/components/Config';
import Toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const AllDetails = () => {
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
  
  // Export form
  const [exportForm, setExportForm] = useState({
    reportType: 'daily',
    startDate: '',
    endDate: '',
    inchargeName: '',
    shiftDuration: '',
  });

  useEffect(() => {
    fetchAllRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, searchQuery, statusFilter, dateRange]);

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Config.get('/api/admin/laundry/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setRequests(response.data.laundryRequests);
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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.contactNumber.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (req) => new Date(req.createdAt) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((req) => new Date(req.createdAt) <= endDate);
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
        '/api/admin/laundry/update-status',
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
        '/api/admin/laundry/export',
        exportForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const { reportData } = response.data;
        
        // Create worksheet data
        const wsData = [
          ['MANTRI INN - LAUNDRY SERVICE REPORT'],
          [],
          ['Report Type:', reportData.metadata.reportType.toUpperCase()],
          ['Date Range:', reportData.metadata.dateRange],
          ['Incharge Person:', reportData.metadata.inchargeName],
          ['Shift Duration:', reportData.metadata.shiftDuration],
          ['Generated At:', reportData.metadata.generatedAt],
          ['Total Requests:', reportData.metadata.totalRequests],
          [],
          [
            'Guest ID',
            'Guest Name',
            'Room No',
            'Phone Number',
            'Cloth Types',
            'Items',
            'Wash Type',
            'Emergency',
            'Emergency Charge',
            'In Time',
            'Out Time',
            'Status',
            'Remarks',
          ],
        ];

        // Add data rows
        reportData.requests.forEach((req) => {
          wsData.push([
            String(req.guestId),
            req.guestName,
            req.roomNo,
            req.contactNumber,
            req.clothTypes,
            req.numberOfItems,
            req.washType,
            req.isEmergency,
            req.emergencyCharge,
            req.takenTime,
            req.deliveryTime,
            req.status,
            req.specialInstructions,
          ]);
        });

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
          { wch: 25 }, // Guest ID
          { wch: 20 }, // Guest Name
          { wch: 10 }, // Room No
          { wch: 15 }, // Phone
          { wch: 30 }, // Cloth Types
          { wch: 8 },  // Items
          { wch: 15 }, // Wash Type
          { wch: 10 }, // Emergency
          { wch: 15 }, // Charge
          { wch: 20 }, // In Time
          { wch: 20 }, // Out Time
          { wch: 12 }, // Status
          { wch: 30 }, // Remarks
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Laundry Report');

        // Generate filename
        const filename = `Laundry_Report_${exportForm.reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
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
      case 'Delivered':
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
                  <MenuItem value="Delivered">Delivered</MenuItem>
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
                <TableCell>Items</TableCell>
                <TableCell>Wash Type</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Requested
                  </TableSortLabel>
                </TableCell>
                <TableCell>Delivery</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Emergency</TableCell>
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
                    <TableCell>{request.numberOfItems}</TableCell>
                    <TableCell>{request.washType}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      {new Date(request.deliveryTime).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.isEmergency && (
                        <Chip label="⚡" color="error" size="small" />
                      )}
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
                <MenuItem value="Delivered">Mark as Delivered</MenuItem>
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
          Export Laundry Report
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={exportForm.reportType}
                    label="Report Type"
                    onChange={(e) => setExportForm({ ...exportForm, reportType: e.target.value })}
                  >
                    <MenuItem value="daily">Daily Report</MenuItem>
                    <MenuItem value="monthly">Monthly Report</MenuItem>
                    <MenuItem value="custom">Custom Date Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {exportForm.reportType === 'custom' && (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      value={exportForm.startDate}
                      onChange={(e) => setExportForm({ ...exportForm, startDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      value={exportForm.endDate}
                      onChange={(e) => setExportForm({ ...exportForm, endDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Incharge Person Name"
                  value={exportForm.inchargeName}
                  onChange={(e) => setExportForm({ ...exportForm, inchargeName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Shift Duration"
                  placeholder="e.g., 9 AM - 5 PM"
                  value={exportForm.shiftDuration}
                  onChange={(e) => setExportForm({ ...exportForm, shiftDuration: e.target.value })}
                />
              </Grid>
            </Grid>
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

export default AllDetails;
