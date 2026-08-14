# Instalare pe VPS cu Virtualmin

Ghid pentru `psihologlilianajgheban.ro`.

---

## Starea instalării de pe 31.97.54.70

Site-ul **este deja instalat** pe acest server. Configurația efectivă:

| | |
| --- | --- |
| Server virtual | `psihologlilianajgheban.ro` |
| Utilizator Unix | `psiholog` |
| Codul aplicației | `/home/psiholog/app` |
| Baza de date | `/home/psiholog/app/prisma/dev.db` |
| Port aplicație | **3001** (3000 e ocupat de `autocontracte`) |
| Proces | PM2 `psiholog-lj`, pornire automată activată |
| Proxy | Apache → `http://127.0.0.1:3001/` |
| SSL | **încă nu** — vezi mai jos |

Serverul mai găzduiește 7 site-uri. Orice modificare în `httpd.conf` le
afectează pe toate, deci fă backup și rulează `httpd -t` **înainte** de reload.

**Ce mai lipsește:** domeniul are nameservere la `ns.romania-webhosting.com`,
nu la acest VPS, deci nu rezolvă către `31.97.54.70`. Până se rezolvă asta,
certificatul Let's Encrypt nu poate fi emis, iar autentificarea nu funcționează
(cookie-ul de sesiune e marcat `Secure` și nu se salvează peste HTTP simplu).

Restul ghidului descrie pașii de la zero, dacă vei muta site-ul pe alt server.

---

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

**Acesta e pasul care mai lipsește.** Domeniul e înregistrat, dar are
nameserverele la `ns.romania-webhosting.com`, deci nu rezolvă către VPS.

Ai două variante:

**a) Lași nameserverele unde sunt** și adaugi acolo, în zona DNS, două
înregistrări A:

```
psihologlilianajgheban.ro.       A     31.97.54.70
www.psihologlilianajgheban.ro.   A     31.97.54.70
```

**b) Muți DNS-ul pe VPS.** Schimbi nameserverele la registrar (ROTLD) către
cele ale acestui server. Virtualmin are deja zona creată pentru domeniu.

Prima variantă e mai simplă și nu atinge nimic altceva.

Verifică propagarea înainte de a cere certificatul — Let's Encrypt nu poate
emite până când domeniul nu indică spre server:

```bash
dig +short psihologlilianajgheban.ro
# trebuie să răspundă: 31.97.54.70
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
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL=https://psihologlilianajgheban.ro
CONTACT_EMAIL=adresa-reala@...
PORT=3001
```

Două detalii care contează:

- **`file:./dev.db` fără `prisma/`.** Calea se rezolvă relativ la folderul în
  care stă `schema.prisma`, deci fișierul ajunge oricum în `prisma/dev.db`.
  Dacă scrii `file:./prisma/dev.db`, baza ajunge în `prisma/prisma/dev.db`.
- **`PORT`** trebuie să fie liber pe server. Dacă mai rulezi și alte aplicații
  Node, verifică întâi: `ss -tln | grep 3001`.

Fișierul conține date de configurare, deci restrânge-i accesul:

```bash
chmod 600 .env
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

## 6. Configurează proxy-ul

Aici se leagă totul. Cel mai simplu, dintr-o singură comandă ca root:

```bash
virtualmin modify-web --domain psihologlilianajgheban.ro \
  --proxy http://127.0.0.1:3001/
```

Virtualmin scrie singur `ProxyPass` și `ProxyPassReverse` în ambele blocuri
`<VirtualHost>` (80 și 443), exclude `/.well-known` (necesar pentru
Let's Encrypt) și reîncarcă Apache.

Din interfață, același lucru se face din
**Virtualmin → Server Configuration → Proxy Paths**, cu path `/` și URL
`http://127.0.0.1:3001`.

### Antetele suplimentare

Virtualmin nu adaugă `ProxyPreserveHost` și `X-Forwarded-Proto`. Fără ele,
aplicația nu știe pe ce schemă și pe ce gazdă a venit cererea, ceea ce duce la
URL-uri și redirectări greșite.

Editează `/etc/httpd/conf/httpd.conf` și adaugă, în blocul VirtualHost al
domeniului, chiar înainte de linia `ProxyPass /.well-known !`:

```apache
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}
```

`expr=%{REQUEST_SCHEME}` e mai bun decât `"https"` fix, pentru că același bloc
se folosește și pe portul 80.

**Fă asta cu plasă de siguranță** — o eroare de sintaxă oprește Apache pentru
toate site-urile de pe server:

```bash
cp /etc/httpd/conf/httpd.conf /root/httpd.conf.bak
# ... editezi ...
httpd -t && systemctl reload httpd || cp /root/httpd.conf.bak /etc/httpd/conf/httpd.conf
```

Modulele necesare (`proxy`, `proxy_http`, `headers`) sunt de regulă deja
încărcate. Verifici cu `httpd -M | grep -E "proxy|headers"`.

### Cum testezi înainte de a avea DNS

Vhost-urile sunt legate de IP-ul public, deci un `curl` către `127.0.0.1` va
nimeri vhost-ul implicit, nu al tău. Testează pe IP-ul real:

```bash
curl -H "Host: psihologlilianajgheban.ro" http://31.97.54.70/
```

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
