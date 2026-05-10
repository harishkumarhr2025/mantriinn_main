import React from 'react';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_OPTIONS, SUPPORTED_LANGUAGES } from 'src/i18n/config';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isOpen = Boolean(anchorEl);
  const languageCode = String(i18n.resolvedLanguage || i18n.language || '').split('-')[0];
  const currentLanguage = SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'en';

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t('common.language', { defaultValue: 'Language' })}>
        <IconButton
          color="inherit"
          aria-label={t('common.language', { defaultValue: 'Language' })}
          onClick={handleOpen}
          size="large"
        >
          <TranslateRoundedIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose} keepMounted>
        {LANGUAGE_OPTIONS.map((option) => (
          <MenuItem
            key={option.code}
            selected={currentLanguage === option.code}
            onClick={() => handleLanguageChange(option.code)}
          >
            {t(option.key, { defaultValue: option.code.toUpperCase() })}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
