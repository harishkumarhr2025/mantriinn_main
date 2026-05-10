import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Toast from 'react-hot-toast';
import Config from '../Config';
import { useTranslation } from 'react-i18next';

// ── Available placeholder fields ─────────────────────────────────────────────
export const TEMPLATE_FIELDS = [
  { key: 'guest_name',      label: 'Guest Name' },
  { key: 'room_no',         label: 'Room No' },
  { key: 'grc_no',          label: 'GRC No' },
  { key: 'arrival_date',    label: 'Arrival Date' },
  { key: 'checkout_date',   label: 'Checkout Date' },
  { key: 'amount',          label: 'Amount' },
  { key: 'hotel_name',      label: 'Hotel Name' },
  { key: 'contact_number',  label: 'Contact Number' },
  { key: 'agent_name',      label: 'Agent Name' },
  { key: 'days',            label: 'No. of Days' },
];

const CATEGORIES = ['check-in', 'checkout', 'reminder', 'promotion', 'custom'];

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95vw', sm: 600 },
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

const empty = {
  name: '',
  category: 'custom',
  body: '',
  isActive: true,
};

const WhatsAppTemplateModal = ({ open, handleClose, onSaved, initialData }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);
  const isEdit = !!initialData?._id;

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        category: initialData.category || 'custom',
        body: initialData.body || '',
        isActive: initialData.isActive !== false,
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Insert {{key}} at cursor position in the textarea
  const insertField = (key) => {
    const el = textareaRef.current;
    const placeholder = `{{${key}}}`;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const current = form.body;
      const next = current.substring(0, start) + placeholder + current.substring(end);
      setForm((prev) => ({ ...prev, body: next }));
      // Restore cursor after the inserted text
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      setForm((prev) => ({ ...prev, body: prev.body + placeholder }));
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError(t('whatsapp.modal.errors.templateNameRequired', { defaultValue: 'Template name is required' })); return; }
    if (!form.body.trim()) { setError(t('whatsapp.modal.errors.messageBodyRequired', { defaultValue: 'Message body is required' })); return; }

    try {
      setSaving(true);
      setError('');
      let res;
      if (isEdit) {
        res = await Config.put(`/whatsapp/templates/${initialData._id}`, form);
      } else {
        res = await Config.post('/whatsapp/templates', form);
      }

      if (!res.data?.success) { setError(res.data?.message || t('whatsapp.modal.errors.saveFailed', { defaultValue: 'Failed to save' })); return; }

      Toast.success(
        isEdit
          ? t('whatsapp.modal.success.updated', { defaultValue: 'Template updated' })
          : t('whatsapp.modal.success.created', { defaultValue: 'Template created' }),
      );
      onSaved?.(res.data.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || t('whatsapp.modal.errors.saveTemplateFailed', { defaultValue: 'Failed to save template' }));
    } finally {
      setSaving(false);
    }
  };

  // Preview: replace placeholders with dummy values
  const preview = form.body
    .replace(/\{\{guest_name\}\}/g, 'Ramesh Kumar')
    .replace(/\{\{room_no\}\}/g, '101')
    .replace(/\{\{grc_no\}\}/g, 'GRC-2026-001')
    .replace(/\{\{arrival_date\}\}/g, '06 May 2026')
    .replace(/\{\{checkout_date\}\}/g, '08 May 2026')
    .replace(/\{\{amount\}\}/g, '₹3,500')
    .replace(/\{\{hotel_name\}\}/g, 'Mantri In')
    .replace(/\{\{contact_number\}\}/g, '9876543210')
    .replace(/\{\{agent_name\}\}/g, 'Suresh Travels')
    .replace(/\{\{days\}\}/g, '2');

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}>
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            {isEdit
              ? t('whatsapp.modal.titleEdit', { defaultValue: 'Edit WhatsApp Template' })
              : t('whatsapp.modal.titleNew', { defaultValue: 'New WhatsApp Template' })}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stack spacing={2}>
            {/* Name */}
            <TextField
              label={t('whatsapp.modal.fields.templateName', { defaultValue: 'Template Name' })}
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder={t('whatsapp.modal.fields.templateNamePlaceholder', { defaultValue: 'e.g. Welcome Message' })}
            />

            {/* Category */}
            <FormControl fullWidth size="small">
              <InputLabel>{t('whatsapp.modal.fields.category', { defaultValue: 'Category' })}</InputLabel>
              <Select name="category" value={form.category} onChange={handleChange} label={t('whatsapp.modal.fields.category', { defaultValue: 'Category' })}>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>
                    {t(`whatsapp.categories.${c}`, { defaultValue: c.charAt(0).toUpperCase() + c.slice(1) })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Available fields palette */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('whatsapp.modal.fields.helpInsertField', { defaultValue: 'Click a field to insert it at the cursor position in the message:' })}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {TEMPLATE_FIELDS.map((f) => (
                  <Chip
                    key={f.key}
                    label={t(`whatsapp.modal.templateFields.${f.key}`, { defaultValue: f.label })}
                    size="small"
                    variant="outlined"
                    color="primary"
                    clickable
                    onClick={() => insertField(f.key)}
                    sx={{ fontFamily: 'monospace', fontSize: 11 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Message body */}
            <TextField
              label={t('whatsapp.modal.fields.messageBody', { defaultValue: 'Message Body' })}
              name="body"
              value={form.body}
              onChange={handleChange}
              multiline
              minRows={5}
              fullWidth
              size="small"
              placeholder={t('whatsapp.modal.fields.messageBodyPlaceholder', { defaultValue: 'Hi {{guest_name}}, welcome to {{hotel_name}}! Your room is {{room_no}}.' })}
              inputRef={textareaRef}
            />

            {/* Live preview */}
            {form.body.trim() && (
              <>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t('whatsapp.modal.previewTitle', { defaultValue: 'Preview (sample data):' })}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: '#e9fbe9',
                      borderRadius: 2,
                      whiteSpace: 'pre-wrap',
                      fontSize: 13,
                      border: '1px solid #c8e6c9',
                    }}
                  >
                    {preview}
                  </Box>
                </Box>
              </>
            )}

            {/* Active toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  color="primary"
                />
              }
              label={t('whatsapp.modal.fields.active', { defaultValue: 'Active' })}
            />

            {/* Actions */}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" color="inherit" onClick={handleClose} disabled={saving}>
                {t('whatsapp.actions.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                {saving
                  ? t('whatsapp.modal.actions.saving', { defaultValue: 'Saving...' })
                  : isEdit
                    ? t('whatsapp.modal.actions.update', { defaultValue: 'Update' })
                    : t('whatsapp.modal.actions.create', { defaultValue: 'Create' })}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default WhatsAppTemplateModal;
