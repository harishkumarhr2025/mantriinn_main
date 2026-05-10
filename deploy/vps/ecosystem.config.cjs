module.exports = {
  apps: [
    {
      name: 'mantriinn-backend',
      cwd: '/var/www/mantri_inn/backend/current',
      script: 'app.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      error_file: '/var/log/mantri_inn/backend-error.log',
      out_file: '/var/log/mantri_inn/backend-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
