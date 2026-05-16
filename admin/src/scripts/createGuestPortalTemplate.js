// Script to create the Guest Portal Credentials WhatsApp template via the admin panel's API
// Place this file in admin/src/scripts and run it with `node createGuestPortalTemplate.js` (if your setup allows)

import Config from '../components/Config';

async function createGuestPortalTemplate() {
  const template = {
    name: 'Guest Portal Credentials',
    category: 'check-in',
    body: `Dear {{guest_name}},\n\nWelcome to Mantri In! Your guest portal is now active.\n\nLogin here: https://mantriinn.com/guest-portal (sample)\nUsername: {{username}}\nPassword: {{password}}\n\nYou can use the portal to opt for services, view your stay details, and more.\n\nFor any help, reply to this message.\n\nTeam Mantri In`,
    isActive: true
  };
  try {
    const res = await Config.post('/whatsapp/templates', template);
    if (res.data?.success) {
      console.log('Template created:', res.data.data);
    } else {
      console.error('Failed to create template:', res.data?.message);
    }
  } catch (err) {
    console.error('Error creating template:', err.message);
  }
}

createGuestPortalTemplate();
