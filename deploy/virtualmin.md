# Instalare pe VPS cu Virtualmin

Ghid pentru `psihologlilianajgheban.ro`.

Virtualmin gestionează singur configurația Apache și certificatele SSL, deci
**nu folosi `deploy/nginx.conf`** — acela e pentru un server fără panou. Aici
lăsăm Virtualmin să se ocupe de web server, iar aplicația Next.js rulează
separat, pe portul 3000, în spatele unui proxy.

Pe scurt: Virtualmin ascultă pe 80/443 și trimite cererile mai departe către
aplicația Node care rulează local.

---

## 1. Creează serverul virtual

În Virtualmin: **Create Virtual Server**.

| Câmp | Valoare |
| --- | --- |
| Domain name | `psihologlilianajgheban.ro` |
| Description | Psiholog Liliana Jgheban |
| Administration username | ex. `psiholog` |
| Administration password | alege una puternică |

Bifează **Apache website** și **SSL website**. Baza de date MySQL/PostgreSQL
**nu e necesară** — aplicația folosește SQLite, un simplu fișier.

Virtualmin creează utilizatorul Unix și directorul `/home/psiholog`.

> Reține numele de utilizator — apare peste tot mai jos. Dacă ai ales altceva
> decât `psiholog`, înlocuiește-l în comenzi.

---

## 2. Îndreaptă domeniul spre VPS

La registrarul domeniului, pune un record **A** către IP-ul VPS-ului:

```
psihologlilianajgheban.ro.       A     IP_VPS
www.psihologlilianajgheban.ro.   A     IP_VPS
```

Verifică propagarea înainte de a merge mai departe — certificatul SSL nu poate
fi emis până când domeniul nu indică spre server:

```bash
dig +short psihologlilianajgheban.ro
```

---

## 3. Instalează Node.js pe server

Conectat prin SSH ca root:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs git
npm install -g pm2
node --version
```

Pe CentOS/Rocky înlocuiește `apt` cu `dnf` și folosește `setup_22.x` de la
NodeSource pentru RPM.

---

## 4. Adu codul pe server

Aplicația **nu** stă în `public_html` — acolo Apache servește fișiere statice,
iar noi rulăm un proces Node. O punem alături, în directorul utilizatorului.

Toate comenzile din acest pas se rulează **ca utilizatorul domeniului**, nu ca
root:

```bash
su - psiholog
cd ~
git clone https://github.com/autocontracte/Psihologlilianajgheban.git app
cd app
npm ci
```

### Variabilele de mediu

```bash
cp .env.example .env.production
nano .env.production
```

Completează, în plus față de șablon:

```
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://psihologlilianajgheban.ro
CONTACT_EMAIL=adresa-reala@...
```

### Baza de date și primul build

```bash
npx prisma migrate deploy
ADMIN_EMAIL=liliana@exemplu.ro ADMIN_PASSWORD=alege-o-parola npm run db:seed
npm run build
```

Dacă nu pui `ADMIN_EMAIL` și `ADMIN_PASSWORD`, seed-ul generează o parolă și
o afișează în terminal. **Notează-o atunci — nu mai poate fi recuperată.**

---

## 5. Pornește aplicația cu PM2

Tot ca utilizatorul domeniului:

```bash
cd ~/app
pm2 start npm --name psiholog-lj -- start
pm2 save
```

Verifică:

```bash
pm2 status
curl -I http://127.0.0.1:3000
```

Trebuie să primești `HTTP/1.1 200 OK`.

### Pornire automată la restartul serverului

PM2 îți afișează o comandă pe care trebuie s-o rulezi **ca root**:

```bash
pm2 startup systemd -u psiholog --hp /home/psiholog
```

Copiază comanda afișată, rulează-o ca root, apoi întoarce-te la utilizator și
dă `pm2 save` încă o dată.

---

## 6. Configurează proxy-ul în Virtualmin

Aici se leagă totul. În Virtualmin:

**Virtualmin → (alege domeniul) → Server Configuration → Proxy Paths**

Adaugă o cale:

| Câmp | Valoare |
| --- | --- |
| Path | `/` |
| Proxy to URL | `http://127.0.0.1:3000` |

Salvează. Virtualmin scrie singur directivele `ProxyPass` în configurația
Apache a domeniului și reîncarcă serviciul.

### Dacă Proxy Paths nu apare în meniu

Unele versiuni îl ascund. Alternativa este să adaugi directivele manual:

**Virtualmin → Services → Configure Website → Edit Directives**

și pui în blocul `<VirtualHost>`:

```apache
ProxyPreserveHost On
ProxyRequests Off
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
RequestHeader set X-Forwarded-Proto "https"
```

Modulele necesare, activate ca root:

```bash
a2enmod proxy proxy_http headers
systemctl reload apache2
```

`RequestHeader set X-Forwarded-Proto` contează: fără el aplicația crede că
merge pe HTTP simplu, iar cookie-ul de sesiune marcat `secure` nu se mai
salvează — nimeni nu se mai poate autentifica.

---

## 7. Certificatul SSL

**Virtualmin → Server Configuration → SSL Certificate → Let's Encrypt**

Cere certificat pentru `psihologlilianajgheban.ro` și
`www.psihologlilianajgheban.ro`, apoi activează redirectarea spre HTTPS din
**Server Configuration → Website Options → Redirect all requests to SSL**.

Virtualmin reînnoiește certificatul automat.

---

## 8. Închide portul 3000 din exterior

Aplicația trebuie accesibilă doar prin Apache, nu direct.

```bash
ufw allow 22,80,443/tcp
ufw enable
ufw status
```

Verifică din afara serverului că `http://IP_VPS:3000` **nu** răspunde.

---

## Actualizări ulterioare

Ca utilizatorul domeniului:

```bash
cd ~/app
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 reload psiholog-lj
```

`npx prisma migrate deploy` e important — sare peste el doar dacă ești sigur
că schema nu s-a schimbat.

---

## Copii de siguranță

Toată baza de date e un singur fișier: `~/app/prisma/dev.db`. Conține conturile
clienților și toate programările.

Adaugă în crontab-ul utilizatorului (`crontab -e`):

```
0 3 * * * sqlite3 /home/psiholog/app/prisma/dev.db ".backup /home/psiholog/backups/lj-$(date +\%F).db" && find /home/psiholog/backups -name 'lj-*.db' -mtime +30 -delete
```

Creează întâi directorul: `mkdir -p ~/backups`.

Virtualmin poate include `/home/psiholog` în backup-urile lui obișnuite
(**Backup and Restore → Scheduled Backups**), ceea ce acoperă și baza de date.

---

## Când ceva nu merge

**Site-ul dă 502 Bad Gateway** — aplicația nu rulează. `pm2 status` și
`pm2 logs psiholog-lj --lines 50`.

**Se vede pagina implicită Virtualmin** — proxy-ul nu e activ. Verifică
Proxy Paths și că `mod_proxy` e încărcat: `apache2ctl -M | grep proxy`.

**Autentificarea nu funcționează pe HTTPS** — lipsește
`RequestHeader set X-Forwarded-Proto "https"`. Cookie-ul de sesiune e marcat
`secure` în producție și nu se salvează peste o conexiune pe care aplicația
o crede necriptată.

**Orele apar decalate** — serverul e pe alt fus. Aplicația convertește singură
în ora României, dar poți verifica: `timedatectl` și, dacă vrei,
`timedatectl set-timezone Europe/Bucharest`.

**Eroare la scrierea în baza de date** — permisiuni. Fișierul și directorul
trebuie să aparțină utilizatorului care rulează aplicația:

```bash
chown -R psiholog:psiholog /home/psiholog/app/prisma
```
