/* ============================================================================
   CONȚINUTUL SITE-ULUI — editează totul din acest fișier.
   Nu e nevoie să modifici componentele pentru a schimba texte.

   ⚠️  DE COMPLETAT ÎNAINTE DE LANSARE — vezi secțiunea SITE de mai jos:
       telefon, email, oraș, adresă cabinet, linkuri social media,
       precum și datele profesionale din secțiunea DESPRE (credentials).
   ========================================================================== */

export const SITE = {
  /* ⚠️ COMUTATOR PENTRU MOTOARELE DE CĂUTARE
     false — site-ul cere să nu fie indexat (noindex + robots.txt care
             interzice tot). Potrivit cât timp încă lucrăm la el.
     true  — site-ul devine vizibil în Google.

     Când îl treci pe `true`, mai fă un lucru: intră în Google Search Console
     și cere indexarea, altfel poate dura săptămâni până e găsit singur. */
  indexable: false,

  name: "Liliana Jgheban",
  role: "Psiholog clinician & Psihoterapeut integrativ",
  url: "https://psihologlilianajgheban.ro",
  description:
    "Cabinet de psihologie și psihoterapie integrativă pentru adulți, adolescenți și copii. Ședințe în cabinet și online, consiliere parentală, evaluare clinică psihologică și ateliere experiențiale Sandtray.",

  phone: "+40 764 802 536",
  phoneHref: "+40764802536",
  /** Format wa.me — doar cifre, cu prefixul de țară, fără + sau spații. */
  whatsapp: "40764802536",
  whatsappMessage:
    "Bună ziua! Aș dori câteva informații despre serviciile dumneavoastră.",

  /* ⚠️ DE COMPLETAT cu datele reale */
  email: "contact@psihologlilianajgheban.ro",
  city: "București",
  address: "Str. Exemplu nr. 00, București",
  addressNote: "Adresa exactă îți este comunicată la confirmarea programării.",

  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },

  schedule: [
    { days: "Luni – Vineri", hours: "10:00 – 20:00" },
    { days: "Sâmbătă", hours: "10:00 – 14:00" },
    { days: "Duminică", hours: "Închis" },
  ],
} as const;

/* -------------------------------------------------------------------------- */

export const NAV = [
  { label: "Acasă", href: "/#acasa" },
  { label: "Despre mine", href: "/#despre" },
  { label: "Servicii", href: "/#servicii" },
  { label: "Abordare", href: "/#abordare" },
  { label: "Întrebări", href: "/#intrebari" },
  { label: "Contact", href: "/#contact" },
] as const;

/* -------------------------------------------------------------------------- */

export const HERO = {
  eyebrow: "Psiholog clinician & Psihoterapeut integrativ",
  name: "Liliana Jgheban",
  tagline: "Un spațiu sigur, în care să fii ascultat și înțeles.",
  intro:
    "Lucrez cu adulți, adolescenți și copii, în cabinet și online. Împreună căutăm sensul din spatele a ceea ce simți și construim, pas cu pas, resursele de care ai nevoie.",
  ctaPrimary: { label: "Programează o ședință", href: "/programari" },
  ctaSecondary: { label: "Vezi serviciile", href: "/#servicii" },
};

/* -------------------------------------------------------------------------- */

export const WELCOME = {
  quote:
    "Vindecarea începe în momentul în care te simți cu adevărat auzit, într-o relație în care e sigur să fii tu însuți.",
  body: [
    "Sunt momente în care viața devine mai grea decât putem duce singuri — o pierdere, o anxietate care nu mai trece, o relație care doare, o perioadă de blocaj sau o schimbare care ne depășește.",
    "Terapia nu înseamnă că ceva e în neregulă cu tine. Înseamnă că alegi să îți acorzi atenție, sprijin și timp. Rolul meu este să te însoțesc în acest proces, cu răbdare și fără judecată.",
  ],
};

/* -------------------------------------------------------------------------- */

export const AUDIENCES = {
  eyebrow: "Pentru cine",
  title: "Cui mă adresez",
  subtitle:
    "Fiecare vârstă are nevoie de un limbaj diferit. Adaptez modul de lucru la persoana din fața mea.",
  items: [
    {
      icon: "adults",
      title: "Adulți",
      description:
        "Dificultăți emoționale, anxietate, depresie, traumă, perioade de blocaj sau tranziție.",
    },
    {
      icon: "teens",
      title: "Adolescenți și preadolescenți",
      description:
        "Reglare emoțională, comportamente, identitate și adaptare la schimbările vârstei.",
    },
    {
      icon: "children",
      title: "Copii",
      description:
        "Dificultăți emoționale și comportamentale, abordate prin joc și metode potrivite vârstei.",
    },
    {
      icon: "parents",
      title: "Părinți",
      description:
        "Consiliere parentală și ghidaj în relația cu copilul, pentru o legătură mai calmă și mai clară.",
    },
    {
      icon: "group",
      title: "Workshopuri și grupuri",
      description:
        "Grupuri de dezvoltare personală pentru adulți și adolescenți, într-un cadru sigur.",
    },
    {
      icon: "sandtray",
      title: "Ateliere experiențiale",
      description:
        "Ateliere Sandtray, în care lucrăm cu imaginea și simbolul, dincolo de cuvinte.",
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const SERVICES = {
  eyebrow: "Servicii",
  title: "Cum putem lucra împreună",
  subtitle:
    "De la psihoterapie individuală la evaluare clinică și intervenții de grup — alegem împreună forma potrivită pentru tine.",
  items: [
    {
      number: "01",
      title: "Psihoterapie integrativă individuală",
      audience: "Adulți și adolescenți",
      description:
        "Ședințe individuale în care lucrăm asupra dificultăților emoționale, a anxietății, a traumei sau a perioadelor de blocaj. Abordarea integrativă îmi permite să combin metode din mai multe școli terapeutice, în funcție de nevoia ta.",
    },
    {
      number: "02",
      title: "Consiliere parentală",
      audience: "Părinți",
      description:
        "Un spațiu în care înțelegem împreună comportamentul copilului și găsim modalități concrete de a răspunde. Lucrăm la relație, la limite și la comunicarea de zi cu zi.",
    },
    {
      number: "03",
      title: "Evaluare clinică psihologică — copii și adolescenți",
      audience: "Copii și adolescenți",
      description:
        "Evaluarea dezvoltării emoționale și comportamentale, a suspiciunii de ADHD și a dificultăților de învățare. Rezultatul este un raport clar, cu recomandări practice pentru familie și școală.",
    },
    {
      number: "04",
      title: "Evaluare clinică psihologică — adulți",
      audience: "Adulți",
      description:
        "Evaluare pentru anxietate, depresie, tulburări de personalitate, tulburări afective și alte dificultăți psihologice, cu instrumente validate științific.",
    },
    {
      number: "05",
      title: "Workshopuri și intervenții de grup",
      audience: "Adulți și adolescenți",
      description:
        "Întâlniri de grup pe teme de dezvoltare personală, reglare emoțională și relaționare. Grupul devine un spațiu de învățare și de sprijin reciproc.",
    },
    {
      number: "06",
      title: "Intervenții experiențiale (inclusiv Sandtray)",
      audience: "Toate vârstele",
      description:
        "Metode experiențiale în care exprimarea trece dincolo de cuvinte. Sandtray folosește nisipul și miniaturile pentru a da formă trăirilor greu de verbalizat.",
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const FORMATS = {
  eyebrow: "Format",
  title: "În cabinet și online",
  subtitle:
    "Alegi varianta care ți se potrivește. Ambele forme de lucru au aceeași structură și aceeași confidențialitate.",
  items: [
    {
      icon: "office",
      title: "În cabinet",
      description:
        "Un spațiu liniștit, gândit să te simți în siguranță. Recomandat mai ales pentru lucrul cu copiii și pentru intervențiile experiențiale, precum Sandtray.",
      points: [
        "Cadru dedicat, fără întreruperi",
        "Potrivit pentru copii și ateliere experiențiale",
        "Materiale și instrumente de evaluare la fața locului",
      ],
    },
    {
      icon: "online",
      title: "Online",
      description:
        "Ședințe prin video, de oriunde te-ai afla. O variantă potrivită dacă ai program încărcat, locuiești în altă localitate sau în străinătate.",
      points: [
        "Flexibilitate de program și locație",
        "Aceeași confidențialitate ca în cabinet",
        "Link securizat, trimis înainte de ședință",
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const ABOUT = {
  eyebrow: "Despre mine",
  title: "Bună, sunt Liliana",
  /* ⚠️ DE COMPLETAT / VERIFICAT: formare, ani de experiență, acreditări.
     Nu adăuga informații care nu pot fi susținute documentar. */
  paragraphs: [
    "Sunt psiholog clinician și psihoterapeut integrativ. Lucrez cu adulți, adolescenți și copii, iar în ultimii ani am însoțit oameni aflați în momente foarte diferite de viață: de la anxietate și epuizare, până la traume, pierderi și perioade de tranziție.",
    "Cred că schimbarea reală nu vine din sfaturi, ci din relația terapeutică. Din faptul că cineva te ascultă cu atenție, fără să te grăbească și fără să te judece. De acolo începe, de obicei, tot restul.",
    "În lucrul cu copiii și adolescenții folosesc metode potrivite vârstei — joc, poveste, tehnici experiențiale — pentru că ei nu au întotdeauna cuvinte pentru ceea ce simt. Iar cu părinții lucrez ca parteneri: nimeni nu cunoaște copilul mai bine decât ei.",
  ],
  credentials: [
    /* ⚠️ Înlocuiește cu formările și acreditările reale */
    "Psiholog clinician — Colegiul Psihologilor din România",
    "Psihoterapeut integrativ",
    "Formare în intervenții experiențiale — Sandtray",
    "Evaluare clinică psihologică — copii, adolescenți și adulți",
  ],
};

/* -------------------------------------------------------------------------- */

export const APPROACH = {
  eyebrow: "Abordare",
  title: "Cum lucrez",
  subtitle:
    "Nu există un drum unic. Construim împreună unul care are sens pentru tine.",
  steps: [
    {
      step: "01",
      title: "Primul contact",
      description:
        "Ne auzim scurt, îmi spui ce te aduce în terapie și stabilim prima întâlnire. Poți întreba orice te ajută să te simți mai în siguranță.",
    },
    {
      step: "02",
      title: "Ședința de evaluare",
      description:
        "În primele întâlniri ne cunoaștem și înțelegem împreună situația. Stabilim obiective realiste și forma de lucru potrivită.",
    },
    {
      step: "03",
      title: "Procesul terapeutic",
      description:
        "Lucrăm constant, de regulă săptămânal. Ritmul îl ajustăm pe parcurs, în funcție de nevoile și de resursele tale.",
    },
    {
      step: "04",
      title: "Consolidare și încheiere",
      description:
        "Când obiectivele sunt atinse, consolidăm ce ai câștigat și pregătim încheierea, astfel încât schimbările să rămână.",
    },
  ],
  values: [
    {
      title: "Confidențialitate",
      description:
        "Tot ce discutăm rămâne între noi, în limitele codului deontologic al profesiei.",
    },
    {
      title: "Fără judecată",
      description:
        "Nu ești evaluat și nu trebuie să vii pregătit. Vii așa cum ești, în ziua în care ești.",
    },
    {
      title: "Ritmul tău",
      description:
        "Nu grăbesc procesul. Mergem în profunzime atunci când te simți pregătit.",
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const FAQ = {
  eyebrow: "Întrebări frecvente",
  title: "Ce e bine să știi înainte",
  items: [
    {
      q: "Cât durează o ședință?",
      a: "O ședință de psihoterapie durează 50 de minute. Ședințele de evaluare psihologică pot dura mai mult, în funcție de instrumentele folosite, iar durata exactă ți-o comunic din timp.",
    },
    {
      q: "Cum decurge prima întâlnire?",
      a: "Prima întâlnire este una de cunoaștere. Îmi povestești ce te aduce în terapie, îți răspund la întrebări și stabilim împreună dacă și cum continuăm. Nu trebuie să te pregătești în niciun fel.",
    },
    {
      q: "Cât durează terapia?",
      a: "Depinde de ce lucrăm. Unele situații se rezolvă în câteva luni, altele cer mai mult timp. După primele întâlniri îți pot oferi o estimare realistă, pe care o reevaluăm pe parcurs.",
    },
    {
      q: "Ședințele online sunt la fel de eficiente?",
      a: "Da. Cercetările arată că psihoterapia online are rezultate comparabile cu cea din cabinet pentru majoritatea dificultăților. Pentru copiii mici și pentru atelierele experiențiale recomand însă lucrul în cabinet.",
    },
    {
      q: "Ce se întâmplă cu ceea ce discutăm?",
      a: "Tot ce discutăm este confidențial. Excepțiile sunt strict cele prevăzute de lege și de codul deontologic — situațiile în care există un risc real pentru siguranța ta sau a altcuiva.",
    },
    {
      q: "Copilul meu are nevoie de terapie sau de evaluare?",
      a: "Uneori e nevoie de amândouă, alteori de niciuna. Începem cu o discuție cu părinții, iar dacă e util recomand o evaluare clinică pentru a înțelege clar situația înainte de a decide direcția.",
    },
    {
      q: "Cum mă programez?",
      a: "Poți folosi formularul de programare de pe site sau mă poți contacta direct, telefonic ori pe email. Îți răspund în cel mai scurt timp, de regulă în aceeași zi lucrătoare.",
    },
    {
      q: "Ce este Sandtray?",
      a: "Sandtray este o metodă experiențială în care folosim o tavă cu nisip și miniaturi pentru a da formă trăirilor interioare. Este utilă mai ales atunci când emoțiile sunt greu de pus în cuvinte — la copii, dar și la adulți.",
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const CONTACT = {
  eyebrow: "Contact",
  title: "Primul pas e cel mai greu",
  subtitle:
    "Dacă te gândești de ceva vreme să începi, scrie-mi. Nu trebuie să știi de la început ce vrei să spui.",
};

/* -------------------------------------------------------------------------- */

export const TESTS = {
  eyebrow: "În curând",
  title: "Teste vocaționale gratuite",
  description:
    "Pregătesc o secțiune cu teste vocaționale gratuite, gândite pentru adolescenți și tineri aflați în fața unei alegeri: ce liceu, ce facultate, ce direcție profesională. Rezultatele vor veni însoțite de o interpretare clară, nu doar de un scor.",
  cta: "Anunță-mă când sunt gata",
};
