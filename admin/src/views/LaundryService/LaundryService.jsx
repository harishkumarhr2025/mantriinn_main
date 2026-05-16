import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import OpenRequests from './OpenRequests';
import AllDetails from './AllDetails';

const LaundryService = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <PageContainer title="Laundry Service" description="Manage laundry service requests">
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontFamily: 'Poppins', fontWeight: 600 }}>
          Laundry Service Management
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
          <Tab label="Open Requests" />
          <Tab label="All Details" />
        </Tabs>

        {currentTab === 0 && <OpenRequests />}
        {currentTab === 1 && <AllDetails />}
      </Box>
    </PageContainer>
  );
};

export default LaundryService;
