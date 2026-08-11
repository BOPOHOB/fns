server {
  server_name feelandswim.ru;
  root /var/www/feelandswim/dist;
  index index.html;

  # Vite build: hashed JS/CSS
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
    try_files $uri =404;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8787;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }

  listen 443 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/feelandswim.ru/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/feelandswim.ru/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
  if ($host = feelandswim.ru) {
    return 301 https://$host$request_uri;
  } # managed by Certbot

  server_name feelandswim.ru;
  listen 80;
  return 404; # managed by Certbot
}
