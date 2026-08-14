/* Configurație PM2 pentru rularea site-ului pe VPS.
   Pornire:   pm2 start ecosystem.config.js
   Repornire: pm2 reload psiholog-lj
   Log-uri:   pm2 logs psiholog-lj                                            */

module.exports = {
  apps: [
    {
      name: "psiholog-lj",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/psihologlilianajgheban.ro",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/psiholog-lj-error.log",
      out_file: "/var/log/pm2/psiholog-lj-out.log",
      time: true,
    },
  ],
};
