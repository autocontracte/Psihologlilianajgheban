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

1. **Date de contact** — telefonul și WhatsApp-ul sunt setate
   (`+40 764 802 536`). Mai lipsesc **emailul real, orașul și adresa
   cabinetului** (`SITE` în `src/content/site.ts`).
2. **Formare și acreditări** — lista `ABOUT.credentials` conține exemple
   generice. Înlocuiește-le cu formările reale, documentabile.
3. **Linkuri social media** — `SITE.social`; iconițele apar în footer doar
   pentru rețelele completate.
4. **Paginile legale** — `src/app/confidentialitate/page.tsx` și
   `src/app/termeni/page.tsx` sunt șabloane. Trebuie verificate de un jurist
   și completate cu politica reală de anulare și cu tarifele.
5. **Trimiterea emailurilor** — vezi secțiunea de mai jos.

---

## Sistemul de programări

Site-ul are un sistem complet de programări online, cu conturi de client și
panou de administrare.

### Primii pași

```bash
npx prisma migrate deploy   # creează baza de date
npm run db:seed             # servicii, program săptămânal, cont de admin
```

Seed-ul afișează în terminal parola contului de administrator. **Notează-o —
nu mai poate fi recuperată**, doar resetată rulând seed-ul pe un cont nou.
Poți fixa datele de acces dinainte:

```bash
ADMIN_EMAIL=liliana@exemplu.ro ADMIN_PASSWORD=parola-ta npm run db:seed
```

### Ce poate face clientul

**Contul nu este obligatoriu.** Oricine poate rezerva direct de pe
`/programari`, lăsând doar nume, telefon și email. Contul rămâne o opțiune,
utilă celor care vin la mai multe ședințe.

| Pagină | Ce face |
| --- | --- |
| `/programari` | Alege serviciul, ziua, ora și formatul, în trei pași — cu sau fără cont |
| `/cont/inregistrare` | Creează cont (nume, email, telefon, parolă) |
| `/cont/autentificare` | Intră în cont |
| `/cont` | Vede ședințele viitoare și istoricul, poate anula |

Anularea online este permisă cu cel puțin 24 de ore înainte
(`CANCEL_LEAD_HOURS` din `src/lib/slots.ts`) și doar pentru cei cu cont. Cine
a programat fără cont anulează telefonic.

În panoul de administrare, programările fără cont sunt marcate cu eticheta
„Fără cont", iar datele de contact apar la fel ca la ceilalți clienți.

### Ce poate face administratorul

| Pagină | Ce face |
| --- | --- |
| `/admin` | Cifre la zi, programul de azi, ce urmează |
| `/admin/programari` | Confirmă, anulează, marchează finalizate; note interne |
| `/admin/program` | Program săptămânal și zile libere (concedii) |
| `/admin/clienti` | Lista clienților, cu istoricul lor |

### Cum se calculează orele libere

Orele nu sunt scrise nicăieri de mână. Se calculează din programul săptămânal,
minus zilele blocate, minus ședințele deja rezervate, minus intervalul minim
până la ședință. Reglajele sunt în `src/lib/slots.ts`:

```
SLOT_STEP_MIN        = 60   pasul grilei de ore
BOOKING_LEAD_HOURS   = 4    cu cât timp înainte se mai poate rezerva
BOOKING_HORIZON_DAYS = 60   cât de departe în viitor
CANCEL_LEAD_HOURS    = 24   până când se poate anula
```

Orele se păstrează în baza de date în UTC și se convertesc în ora României
(`src/lib/tz.ts`), inclusiv la trecerea dintre ora de vară și cea de iarnă.
Asta contează pentru că VPS-ul rulează de regulă pe UTC.

### Securitate

- Parolele sunt salvate cu bcrypt (cost 12), niciodată în clar.
- Sesiunile stau în baza de date; în cookie ajunge doar un token aleatoriu,
  iar în baza de date hash-ul lui. Cookie-ul este `httpOnly` și `sameSite=lax`.
- Rutele `/admin` sunt protejate în layout, iar fiecare rută API verifică din
  nou rolul — nu doar interfața.
- Autentificarea și înregistrarea au limitare de încercări per IP.
- Programările fără cont sunt limitate la 5 rezervări per IP la 30 de minute.
  Se numără doar rezervările reușite, ca o greșeală de tastare să nu consume
  din cotă, iar pragul e larg pentru că mai mulți oameni pot împărți un IP.
- Două persoane nu pot rezerva același interval: verificarea se reia într-o
  tranzacție, în momentul salvării.

### O capcană la actualizare

`prisma migrate deploy` aplică migrările, dar **nu** regenerează clientul
Prisma. Dacă schema s-a schimbat și sari peste `npm ci` (care îl regenerează
prin `postinstall`), build-ul cade cu erori de tipul „Property does not exist
on type PrismaClient" — iar dacă procesul e repornit între timp, site-ul rămâne
jos. Rulează întotdeauna `npx prisma generate` înainte de build.

### Ce lipsește încă

Emailurile. Programările apar corect în panou, dar nu se trimite încă nicio
notificare. Vezi secțiunea următoare.

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

> **Ai Virtualmin pe server?** Atunci sari peste secțiunea asta și urmează
> [deploy/virtualmin.md](deploy/virtualmin.md). Virtualmin gestionează singur
> Apache și certificatele SSL, iar pașii de mai jos (nginx, certbot) ar intra
> în conflict cu el.

Instrucțiunile de mai jos sunt pentru un VPS fără panou de administrare.

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
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 reload psiholog-lj
```

### 6. Baza de date

Baza de date este un singur fișier: `prisma/dev.db`. Salvează-l periodic —
conține conturile clienților și toate programările.

```bash
# copie de siguranță zilnică, păstrată 30 de zile
0 3 * * * sqlite3 /var/www/psihologlilianajgheban.ro/prisma/dev.db ".backup /var/backups/lj-$(date +\%F).db" && find /var/backups -name 'lj-*.db' -mtime +30 -delete
```

Pentru volume mari se poate trece pe PostgreSQL: schimbi `provider` în
`prisma/schema.prisma` și `DATABASE_URL`, apoi rulezi migrarea din nou.

---

## Ce urmează

### Testele vocaționale

Pagina `/teste` este pregătită ca prezentare. Testele propriu-zise pot fi
adăugate ca rute separate (`/teste/[slug]`), cu întrebările într-un fișier de
conținut și scorarea într-o rută API.

---

## Structura proiectului

```
prisma/
├─ schema.prisma              tabelele bazei de date
└─ seed.ts                    servicii, program, cont de admin

src/
├─ app/
│  ├─ page.tsx                pagina principală
│  ├─ layout.tsx              fonturi, metadate, date structurate
│  ├─ globals.css             paletă, colțuri rotunjite, utilitare
│  ├─ programari/             fluxul de rezervare în 3 pași
│  ├─ cont/                   autentificare, înregistrare, contul clientului
│  ├─ admin/                  panoul de administrare (protejat în layout)
│  ├─ teste/                  teste vocaționale
│  ├─ confidentialitate/      GDPR (șablon)
│  ├─ termeni/                termeni și condiții (șablon)
│  └─ api/                    auth, sloturi, programări, administrare
├─ components/
│  ├─ Nav.tsx  Footer.tsx  WhatsAppButton.tsx  LegalPage.tsx
│  ├─ sections/              secțiunile paginii principale
│  ├─ booking/               fluxul de rezervare
│  ├─ account/               lista de programări a clientului
│  ├─ admin/                 tabele și acțiuni de administrare
│  └─ ui/                    Reveal, Button, Icons, OrbitFrame
├─ lib/
│  ├─ db.ts                  clientul Prisma
│  ├─ auth.ts                parole, sesiuni, roluri
│  ├─ tz.ts                  conversii pentru ora României
│  ├─ slots.ts               calculul orelor libere
│  └─ types.ts               statusuri, formate, etichete
└─ content/site.ts           ⭐ tot conținutul editabil
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

Chenarele decorative care se leagănă încet în spatele conținutului sunt
componenta `OrbitFrame` din `src/components/ui/OrbitFrame.tsx`. Se folosesc în
hero, la poza din „Despre mine", în formularele de cont și în fluxul de
rezervare. `OrbitRing` este varianta circulară, pentru fundalul secțiunilor.
Ambele se opresc automat dacă vizitatorul a cerut mișcare redusă în sistem.
