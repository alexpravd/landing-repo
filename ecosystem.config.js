module.exports = {
  apps: [
    {
      name: 'payload-demo',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/payload-demo',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/payload-demo/logs/pm2-error.log',
      out_file: '/var/www/payload-demo/logs/pm2-out.log',
      time: true,
    },
  ],
}
