import React, { useEffect, useMemo, useState } from 'react';
import { Fab, Box, Button, Typography, Card, CardContent, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { CSVLink } from 'react-csv';
import AgentModal from 'src/components/AgentsModal/AgentsModal';
import Config from '../../components/Config';
import EntityImportDialog from '../../components/shared/EntityImportDialog';
import { useSelector } from 'react-redux';
import { canModifyRecords, canExportData } from '../../utils/permissions';
import { useTranslation } from 'react-i18next';

const Agents = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const currentUser = useSelector((state) => state.Auth.user);
  const allowImport = canModifyRecords(currentUser);
  const allowExport = canExportData(currentUser);

  const fetchAgents = async () => {
    try {
      const response = await Config.get('/get-all-agent');
      setAgents(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleModalSubmit = () => {
    fetchAgents();
  };

  const csvHeaders = [
    { label: t('agents.csv.agentId', { defaultValue: 'Agent ID' }), key: 'agent_ID' },
    { label: t('agents.csv.agentName', { defaultValue: 'Agent Name' }), key: 'Agent_name' },
    { label: t('agents.csv.contactNumber', { defaultValue: 'Contact Number' }), key: 'Agent_contact_number' },
    { label: t('agents.csv.aadharNumber', { defaultValue: 'Aadhar Number' }), key: 'Agent_aadhar_No' },
    { label: t('agents.csv.vehicleNumber', { defaultValue: 'Vehicle Number' }), key: 'Agent_vehicle_no' },
    { label: t('agents.csv.commissionType', { defaultValue: 'Commission Type' }), key: 'Agent_commission_type' },
    { label: t('agents.csv.commissionAmount', { defaultValue: 'Commission Amount' }), key: 'Agent_commission_amount' },
    { label: t('agents.csv.status', { defaultValue: 'Status' }), key: 'status' },
  ];

  const csvData = useMemo(
    () =>
      agents.map((agent) => ({
        agent_ID: agent.agent_ID,
        Agent_name: agent.Agent_name,
        Agent_contact_number: agent.Agent_contact_number,
        Agent_aadhar_No: agent.Agent_aadhar_No,
        Agent_vehicle_no: agent.Agent_vehicle_no,
        Agent_commission_type: agent.Agent_commission_type,
        Agent_commission_amount: agent.Agent_commission_amount,
        status: agent.status,
      })),
    [agents],
  );

  const handlePreviewImportRows = async (rows, { forceCreate = false } = {}) => {
    const response = await Config.post('/agents/import-preview', { rows, forceCreate });
    return response.data;
  };

  const handleImportRows = async (rows, { forceCreate = false } = {}) => {
    try {
      setIsImporting(true);
      const response = await Config.post('/agents/import', { rows, forceCreate });
      await fetchAgents();
      return response.data;
    } catch (error) {
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div>
      <AgentModal
        open={open}
        handleClose={handleClose}
        handleModalSubmit={handleModalSubmit}
        // initialData={selectedFAQ}
        opacityValue={0.5}
      />
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('agents.title', { defaultValue: 'Agents' })}</Typography>
          {allowExport && (
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename="agents.csv"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                {t('agents.actions.exportCsv', { defaultValue: 'Export CSV' })}
              </Button>
            </CSVLink>
          )}
          {allowImport && (
            <Button variant="outlined" startIcon={<UploadFileIcon />} sx={{ ml: 2 }} onClick={() => setImportDialogOpen(true)}>
              {t('agents.actions.importCsv', { defaultValue: 'Import CSV / Excel' })}
            </Button>
          )}
        </Box>
        {agents.length ? (
          <Grid container spacing={2}>
            {agents.map((agent) => (
              <Grid item xs={12} md={4} key={agent._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{agent.Agent_name || t('agents.card.unnamedAgent', { defaultValue: 'Unnamed Agent' })}</Typography>
                    <Typography variant="body2">{t('agents.card.id', { defaultValue: 'ID' })}: {agent.agent_ID || '-'}</Typography>
                    <Typography variant="body2">{t('agents.card.phone', { defaultValue: 'Phone' })}: {agent.Agent_contact_number || '-'}</Typography>
                    <Typography variant="body2">{t('agents.card.status', { defaultValue: 'Status' })}: {agent.status || '-'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {t('agents.states.noAgents', { defaultValue: 'No Agents onboarded' })}
          </h1>
        )}
      </Box>
      <Fab
        color="primary"
        aria-label={t('agents.actions.addAriaLabel', { defaultValue: 'Add agent' })}
        onClick={handleOpen}
        sx={{ position: 'fixed', bottom: '70px', right: '70px' }}
      >
        <AddIcon />
      </Fab>
      <EntityImportDialog
        open={isImportDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onPreview={handlePreviewImportRows}
        onImport={handleImportRows}
        isImporting={isImporting}
        title={t('agents.import.title', { defaultValue: 'Import Agents' })}
        infoText={t('agents.import.infoText', { defaultValue: 'Preview which agent rows will be inserted, updated, or skipped before importing them into agent management.' })}
        importButtonLabel={t('agents.import.buttonLabel', { defaultValue: 'Import Agents' })}
        templateFileName="agents-import-template.xlsx"
        sheetName="Agents"
        templateHeaders={['agent_ID', 'Agent_name', 'Agent_contact_number', 'Agent_aadhar_No', 'Agent_vehicle_no', 'Agent_commission_type', 'Agent_commission_amount', 'status']}
        templateExampleRow={{ agent_ID: '', Agent_name: 'Ravi Agent', Agent_contact_number: '9876543210', Agent_aadhar_No: '123412341234', Agent_vehicle_no: 'OD02AB1234', Agent_commission_type: 'Percentage', Agent_commission_amount: '10', status: 'Active' }}
      />
    </div>
  );
};

export default Agents;
