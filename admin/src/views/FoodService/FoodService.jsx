import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import FoodRequests from './FoodRequests';
import MenuManagement from './MenuManagement';
import StockManagement from './StockManagement';

const FoodService = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <PageContainer title="Food Service" description="Manage food service requests and menu">
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontFamily: 'Poppins', fontWeight: 600 }}>
          Food Service Management
        </Typography>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        >
          <Tab label="Food Requests" />
          <Tab label="Menu Management" />
          <Tab label="Stock Management" />
        </Tabs>

        {currentTab === 0 && <FoodRequests />}
        {currentTab === 1 && <MenuManagement />}
        {currentTab === 2 && <StockManagement />}
      </Box>
    </PageContainer>
  );
};

export default FoodService;
