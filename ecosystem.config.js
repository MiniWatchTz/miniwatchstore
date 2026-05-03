module.exports = {
  apps: [
    {
      name: 'ecommerce-server',
      script: 'index.js',
      cwd: 'C:\\Users\\DELL\\Documents\\CODING WITH GEMINI CLI\\my-ecommerce-site\\server',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    },
    {
      name: 'ecommerce-client',
      script: 'cmd',
      args: '/c npm run dev',
      cwd: 'C:\\Users\\DELL\\Documents\\CODING WITH GEMINI CLI\\my-ecommerce-site\\client',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      }
    }
  ]
};