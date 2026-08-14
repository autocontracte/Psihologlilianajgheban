# Psiholog Liliana Jgheban — site de prezentare

Site construit cu **Next.js 15**, **Tailwind CSS v4** și **Framer Motion**.
Domeniu: `psihologlilianajgheban.ro`

---

## Rulare locală

```bash
npm install
npm run dev
```

Site-ul pornește pe <http://localhost:3000>.

---

## Unde se editează conținutul

**Aproape tot textul stă într-un singur fișier:** `src/content/site.ts`.
Poți schimba titluri, descrieri, servicii, întrebări frecvente și date de
contact fără să atingi componentele.

| Ce vrei să schimbi | Unde |
| --- | --- |
| Telefon, email, oraș, program | `SITE` din `src/content/site.ts` |
| Textul din hero | `HERO` |
| Categoriile „Cui mă adresez” | `AUDIENCES` |
| Lista de servicii | `SERVICES` |
| Textul „Despre mine” și formările | `ABOUT` |
| Etapele procesului terapeutic | `APPROACH` |
| Întrebări frecvente | `FAQ` |
| Poza | înlocuiește `public/liliana-jgheban.webp` |

### ⚠️ De completat înainte de lansare

1. **Date de contact reale** — telefon, email, oraș și adresa cabinetului
   (`SITE` în `src/content/site.ts`; acum sunt valori de test).
2. **Formare și acreditări** — lista `ABOUT.credentials` conține exemple
   generice. Înlocuiește-le cu formările reale, documentabile.
3. **Linkuri social media** — `SITE.social`; iconițele apar în footer doar
   pentru rețelele completate.
4. **Paginile legale** — `src/app/confidentialitate/page.tsx` și
   `src/app/termeni/page.tsx` sunt șabloane. Trebuie verificate de un jurist
   și completate cu politica reală de anulare și cu tarifele.
5. **Trimiterea emailurilor** — vezi secțiunea de mai jos.

---

## Activarea formularelor

Formularele validează datele și sunt gata de folosit, dar deocamdată doar
**scriu mesajul în log-ul serverului**. Ca să ajungă pe email:

1. Creează un cont pe [Resend](https://resend.com) și verifică domeniul.
2. Copiază `.env.example` în `.env.production` și completează `RESEND_API_KEY`
   și `CONTACT_EMAIL`.
3. Instalează pachetul și decomentează blocul marcat `TODO livrare` din:
   - `src/app/api/contact/route.ts`
   - `src/app/api/programari/route.ts`

```bash
npm install resend
```

Ambele rute au deja validare, limitare de trafic (5 cereri / IP / 10 minute)
și capcană anti-spam.

---

## Deployment pe VPS

### 1. Pregătirea serverului

```bash
sudo apt update && sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Codul aplicației

```bash
sudo mkdir -p /var/www/psihologlilianajgheban.ro
sudo chown -R $USER:$USER /var/www/psihologlilianajgheban.ro
git clone https://github.com/autocontracte/Psihologlilianajgheban.git /var/www/psihologlilianajgheban.ro
cd /var/www/psihologlilianajgheban.ro
npm ci
npm run build
```

### 3. Pornirea aplicației

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx și certificatul SSL

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/psihologlilianajgheban.ro
sudo ln -s /etc/nginx/sites-available/psihologlilianajgheban.ro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d psihologlilianajgheban.ro -d www.psihologlilianajgheban.ro
```

Înainte de `certbot`, domeniul trebuie să aibă un record **A** care indică
spre IP-ul VPS-ului.

### 5. Actualizări ulterioare

```bash
cd /var/www/psihologlilianajgheban.ro
git pull
npm ci
npm run build
pm2 reload psiholog-lj
```

---

## Ce urmează

### Sistemul de programări

Pagina `/programari` și ruta `src/app/api/programari/route.ts` funcționează
acum ca **cerere de programare**. Pentru un calendar real cu sloturi:

1. Adaugă PostgreSQL și Prisma, cu tabelele `appointments` și `availability`.
2. Expune `GET /api/programari/disponibilitate` care întoarce sloturile libere.
3. Transformă `POST` în creare de rezervare cu status `pending`.
4. Trimite confirmare pe email, cu fișier `.ics` atașat.

Pașii sunt notați și în comentariile din rută.

### Testele vocaționale

Pagina `/teste` este pregătită ca prezentare. Testele propriu-zise pot fi
adăugate ca rute separate (`/teste/[slug]`), cu întrebările într-un fișier de
conținut și scorarea într-o rută API.

---

## Structura proiectului

```
src/
├─ app/
│  ├─ page.tsx                 pagina principală
│  ├─ layout.tsx               fonturi, metadate, date structurate
│  ├─ globals.css              paletă, colțuri rotunjite, utilitare
│  ├─ programari/              pagina de programări
│  ├─ teste/                   teste vocaționale
│  ├─ confidentialitate/       GDPR (șablon)
│  ├─ termeni/                 termeni și condiții (șablon)
│  └─ api/                     rute pentru formulare
├─ components/
│  ├─ Nav.tsx  Footer.tsx  LegalPage.tsx
│  ├─ sections/               secțiunile paginii principale
│  └─ ui/                     Reveal, Button, Icons
└─ content/site.ts            ⭐ tot conținutul editabil
```

---

## Design

Paleta și fonturile urmează referința agreată:

| Rol | Culoare |
| --- | --- |
| Fundal cream | `#F2F3EC` |
| Navy (text) | `#383E52` |
| Periwinkle (accent) | `#6778AF` |
| Sage (accent secundar) | `#6A7E63` |

Fonturi: **Fraunces** (titluri), **Ibarra Real Nova** (citate),
**Montserrat** (text curent).

Față de referință, colțurile sunt vizibil mai rotunjite: carduri la 32–40px,
imagini la 44–56px, butoane complet rotunde.
