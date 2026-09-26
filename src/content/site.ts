import { PRET_KIT_LEI } from "@/lib/kit/pret";

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
    "Psiholog clinician și psihoterapeut integrativ în București: psihoterapie pentru adulți, copii și adolescenți, consiliere parentală, evaluare psihologică (inclusiv ADHD), NLP și terapie Sandtray. Ședințe în cabinet și online.",

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
    { days: "Luni-Vineri", hours: "10:00-20:00" },
    { days: "Sâmbătă", hours: "10:00-14:00" },
    { days: "Duminică", hours: "Închis" },
  ],
} as const;

/* -------------------------------------------------------------------------- */

/** ⚠️ Prețul se schimbă doar aici — apare automat peste tot pe site. */
export const PRICE = {
  standard: 280,
  currency: "lei",
  /** Ce acoperă tariful, în cuvinte simple. */
  note: "O ședință de 50 de minute, în cabinet sau online.",
};

/* -------------------------------------------------------------------------- */

/* Meniul are doar ce contează cel mai mult; restul secțiunilor se găsesc
   derulând prima pagină. */
export const NAV = [
  { label: "Acasă", href: "/#acasa" },
  { label: "Despre mine", href: "/#despre" },
  { label: "Servicii", href: "/#servicii" },
  { label: "Kit relație", href: "/kit" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
] as const;

/* -------------------------------------------------------------------------- */

export const HERO = {
  eyebrow: "Psiholog clinician și psihoterapeut integrativ în București",
  name: "Liliana Jgheban",
  intro:
    "Psihoterapie pentru adulți, adolescenți și copii, consiliere parentală și evaluare psihologică, în cabinetul din București sau online. Privim împreună, cu blândețe, ce se ascunde în spatele a ceea ce simți și construim, pas cu pas, resursele de care ai nevoie.",
  ctaPrimary: { label: "Programează o ședință", href: "/programari" },
};

/* -------------------------------------------------------------------------- */

export const WELCOME = {
  quote:
    "Psihoterapia nu e doar o conversație între doi oameni. E o întâlnire în care trecutul e privit cu blândețe și curiozitate, ca prezentul să devină mai ușor de trăit.",
  body: [
    "Sunt momente în care viața devine mai grea decât putem duce singuri: o anxietate care nu mai trece, atacuri de panică, o tristețe care se așază peste tot, o despărțire, un doliu, epuizarea de la muncă sau o schimbare care ne depășește.",
    "A merge la psiholog nu înseamnă că ceva e în neregulă cu tine. Înseamnă că alegi să îți acorzi atenție, sprijin și timp. Rolul meu este să te însoțesc în acest drum, cu răbdare, fără judecată și în ritmul tău.",
  ],
};

/* -------------------------------------------------------------------------- */

export const AUDIENCES = {
  eyebrow: "Pentru cine",
  title: "Cui mă *adresez*",
  subtitle:
    "Fiecare vârstă are nevoie de un alt limbaj. Adaptez metodele de lucru la omul din fața mea, fie că e un adult, un adolescent, un copil sau un părinte îngrijorat.",
  items: [
    {
      icon: "adults",
      slogan: "Când anxietatea sau oboseala nu mai trec de la sine.",
      foto: "/foto/cabinet-camera-2.jpg",
      title: "Adulți",
      description:
        "Anxietate, atacuri de panică, depresie, burnout, traumă, stimă de sine scăzută, perioade de blocaj sau de tranziție.",
      /** Textul din fereastra deschisă cu „+". E în pagină de la început, deci îl vede și Google. */
      detalii: {
        text: [
          "Viața de adult vine cu responsabilități, relații și decizii care uneori se adună mai repede decât le putem duce. Psihoterapia individuală îți oferă un spațiu confidențial în care să înțelegi ce se întâmplă cu tine și să găsești alte moduri de a răspunde.",
          "Nu trebuie să ajungi la capătul puterilor ca să ceri sprijin. Poți veni și atunci când simți doar că ceva nu mai e în regulă.",
        ],
        semne: [
          "anxietate, atacuri de panică, griji care nu se mai opresc",
          "tristețe, lipsă de energie, pierderea plăcerii pentru lucrurile de altădată",
          "epuizare la locul de muncă (burnout)",
          "despărțire, divorț, doliu sau o schimbare care te depășește",
          "traume și tipare care se repetă în relații",
          "stimă de sine scăzută, autocritică, vinovăție",
        ],
        cum: "Ședințele durează 50 de minute, în cabinet sau online, de obicei o dată pe săptămână. Abordarea e integrativă: aleg metodele potrivite pentru tine, nu te potrivesc pe tine unei metode."
      },
    },
    {
      icon: "teens",
      slogan: "Un loc în care să fie ascultați, nu judecați.",
      title: "Adolescenți și preadolescenți",
      description:
        "Emoții greu de gestionat, presiunea școlii, identitate, relațiile cu colegii și cu părinții, timpul petrecut pe ecrane.",
      /** Textul din fereastra deschisă cu „+". E în pagină de la început, deci îl vede și Google. */
      detalii: {
        text: [
          "Adolescența e o perioadă de schimbări rapide: corpul, prieteniile, școala și felul în care se văd pe ei înșiși. Uneori emoțiile devin prea mari, iar vorbele către părinți nu mai vin ușor.",
          "În terapie, adolescentul are un adult de încredere care îl ascultă fără să-l judece și fără să-i țină predici.",
        ],
        semne: [
          "anxietate, atacuri de panică, emoții foarte intense",
          "retragere, tristețe, izolare de prieteni sau de familie",
          "presiunea notelor, a examenelor și a viitorului",
          "conflicte cu părinții sau cu colegii, bullying",
          "întrebări despre identitate și încredere în sine",
          "prea mult timp pe telefon, în jocuri sau pe rețelele sociale",
        ],
        cum: "Confidențialitatea adolescentului e respectată, iar părinții sunt implicați atât cât ajută procesul, cu acordul lui."
      },
    },
    {
      icon: "children",
      slogan: "Prin joc, spun ce încă nu pot în cuvinte.",
      title: "Copii",
      description:
        "Frici, crize de furie, dificultăți de adaptare sau de învățare, abordate prin joc, poveste și metode potrivite vârstei.",
      /** Textul din fereastra deschisă cu „+". E în pagină de la început, deci îl vede și Google. */
      detalii: {
        text: [
          "Copiii nu au întotdeauna cuvinte pentru ce simt, așa că ne arată prin comportament: crize, frici, refuzul de a merge la școală. În terapie lucrăm prin joc, desen, poveste și Sandtray, limbajul firesc al copilului.",
          "Părinții sunt parteneri în proces: împreună înțelegem ce are copilul nevoie și cum îl putem sprijini acasă.",
        ],
        semne: [
          "frici, anxietate de separare, coșmaruri",
          "crize de furie, agresivitate, opoziție",
          "refuzul de a merge la grădiniță sau la școală",
          "greutăți de adaptare după o mutare, un divorț sau venirea unui frate",
          "tristețe, retragere, încredere scăzută în sine",
          "suspiciune de ADHD sau dificultăți de învățare",
        ],
        cum: "Începem cu o întâlnire cu părinții. Dacă e nevoie, recomand o evaluare clinică psihologică înainte de a alege direcția."
      },
    },
    {
      icon: "parents",
      slogan: "O legătură mai calmă cu copilul tău.",
      title: "Părinți",
      description:
        "Consiliere parentală și evaluarea relației părinte-copil, pentru o legătură mai calmă, cu limite clare și comunicare caldă.",
      /** Textul din fereastra deschisă cu „+". E în pagină de la început, deci îl vede și Google. */
      detalii: {
        text: [
          "A fi părinte e unul dintre cele mai frumoase și mai grele roluri. Consilierea parentală te ajută să înțelegi ce se află în spatele comportamentului copilului și să răspunzi cu mai mult calm și mai multă încredere.",
          "Nu primești rețete gata făcute, ci pași potriviți copilului tău și familiei voastre.",
        ],
        semne: [
          "crize de furie, neascultare, opoziție",
          "limite și reguli puse fără țipete și fără vinovăție",
          "un copil sau un adolescent care s-a închis în sine",
          "separarea părinților și sprijinul copilului în schimbare",
          "oboseala și vinovăția de părinte",
        ],
        cum: "Pot folosi și evaluarea relației părinte-copil m&M („mic și Mare”), care arată concret cum funcționează legătura voastră și unde are nevoie de sprijin."
      },
    },
    {
      icon: "group",
      slogan: "Nu ești singur cu ce trăiești.",
      foto: "/foto/cabinet-spatiu-2.jpg",
      title: "Grupuri și ateliere",
      description:
        "Grupuri de dezvoltare personală pentru adulți și adolescenți, într-un cadru sigur, în care nu ești singur cu ce trăiești.",
      /** Textul din fereastra deschisă cu „+". E în pagină de la început, deci îl vede și Google. */
      detalii: {
        text: [
          "În grup descoperi că nu ești singur cu ce trăiești. Ceilalți devin oglindă și sprijin, iar ce înveți acolo se transferă ușor în relațiile de zi cu zi.",
        ],
        semne: [
          "grupuri de dezvoltare personală pentru adulți",
          "grupuri pentru adolescenți",
          "reglare emoțională și gestionarea stresului",
          "comunicare, relaționare, încredere",
          "ateliere pe teme alese dinainte",
        ],
        cum: "Grupurile au un cadru sigur și confidențial, cu reguli stabilite de la început. O întâlnire durează de obicei în jur de 90 de minute."
      },
    },
    {
      icon: "sandtray",
      slogan: "Când trăirile nu încap în cuvinte.",
      title: "Terapie experiențială Sandtray",
      description:
        "Lucrul cu nisipul și miniaturile, pentru trăirile care nu încap în cuvinte, la copii, dar și la adulți.",
      /** Textul din fereastra deschisă cu „+". E în pagină de la început, deci îl vede și Google. */
      detalii: {
        text: [
          "Sandtray este o metodă experiențială în care folosim o tavă cu nisip și miniaturi pentru a da formă trăirilor interioare. Ce e greu de spus devine vizibil, iar ce e vizibil poate fi înțeles și schimbat.",
          "E utilă mai ales atunci când emoțiile sunt greu de pus în cuvinte, la copii, dar și la adulți.",
        ],
        semne: [
          "copii care nu pot încă exprima ce simt",
          "experiențe dificile sau traumatice",
          "blocaje pe care vorbitul nu le mai atinge",
          "explorare personală și creativitate",
        ],
        cum: "Ședințele Sandtray au loc în cabinet, individual sau în ateliere de grup."
      },
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const SERVICES = {
  eyebrow: "Servicii",
  title: "Cum putem lucra *împreună*",
  subtitle:
    "De la psihoterapie individuală la evaluare clinică și intervenții de grup. Alegem împreună forma potrivită pentru tine.",
  items: [
    {
      number: "01",
      title: "Psihoterapie integrativă individuală",
      audience: "Adulți și adolescenți",
      description:
        "Ședințe individuale în care lucrăm asupra dificultăților emoționale, a anxietății, a traumei sau a perioadelor de blocaj. Abordarea integrativă îmi permite să combin metode din mai multe școli terapeutice, în funcție de nevoia ta.",
      situatii: [
        "anxietate, atacuri de panică, fobii, stres și insomnie",
        "stări depresive, lipsă de motivație, epuizare (burnout)",
        "stimă de sine scăzută, vinovăție, singurătate",
        "despărțire, divorț, doliu și alte crize de viață",
        "traume, relații toxice, dependență emoțională",
      ],
    },
    {
      number: "02",
      title: "Consiliere parentală",
      audience: "Părinți",
      description:
        "Un spațiu în care înțelegem împreună comportamentul copilului și găsim modalități concrete de a răspunde. Lucrăm la relație, la limite și la comunicarea de zi cu zi.",
      situatii: [
        "crize de furie, opoziție, refuzul de a merge la școală",
        "limite și reguli puse cu blândețe și consecvență",
        "comunicarea cu copilul sau cu adolescentul",
        "separarea părinților și sprijinul copilului în schimbare",
      ],
    },
    {
      number: "03",
      title: "Evaluare clinică psihologică pentru copii și adolescenți",
      audience: "Copii și adolescenți",
      description:
        "Evaluarea dezvoltării emoționale și comportamentale, a suspiciunii de ADHD și a dificultăților de învățare. Rezultatul este un raport clar, cu recomandări practice pentru familie și școală.",
      situatii: [
        "suspiciune de ADHD sau dificultăți de atenție",
        "dificultăți de învățare",
        "dezvoltare emoțională și comportamentală",
        "evaluarea relației părinte-copil m&M („mic și Mare”)",
      ],
    },
    {
      number: "04",
      title: "Evaluare clinică psihologică pentru adulți",
      audience: "Adulți",
      description:
        "Evaluare pentru anxietate, depresie, tulburări de personalitate, tulburări afective și alte dificultăți psihologice, cu instrumente validate științific.",
      situatii: [
        "anxietate și depresie",
        "tulburări afective",
        "trăsături și tulburări de personalitate",
        "evaluare la cererea medicului",
      ],
    },
    {
      number: "05",
      title: "Workshopuri și intervenții de grup",
      audience: "Adulți și adolescenți",
      description:
        "Întâlniri de grup pe teme de dezvoltare personală, reglare emoțională și relaționare. Grupul devine un spațiu de învățare și de sprijin reciproc.",
      situatii: [
        "dezvoltare personală și cunoaștere de sine",
        "reglare emoțională, stres și anxietate",
        "relaționare și comunicare asertivă",
      ],
    },
    {
      number: "06",
      title: "Intervenții experiențiale (inclusiv Sandtray)",
      audience: "Toate vârstele",
      description:
        "Metode experiențiale în care exprimarea trece dincolo de cuvinte. Sandtray folosește nisipul și miniaturile pentru a da formă trăirilor greu de verbalizat.",
      situatii: [
        "copii care nu au încă cuvinte pentru ce simt",
        "trăiri greu de exprimat în cuvinte, la orice vârstă",
        "ateliere individuale sau în grup",
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const FORMATS = {
  eyebrow: "Format",
  title: "Terapie în cabinet, în București, sau *online*",
  subtitle:
    "Alegi varianta care ți se potrivește. Ambele au aceeași structură, aceeași durată și aceeași confidențialitate.",
  items: [
    {
      icon: "office",
      title: "În cabinet",
      description:
        "Un spațiu liniștit, gândit ca să te simți în siguranță. Recomandat mai ales pentru terapia copiilor, pentru evaluări și pentru lucrul experiențial Sandtray.",
      points: [
        "Cadru dedicat, fără întreruperi",
        "Potrivit pentru copii și ateliere experiențiale",
        "Instrumente de evaluare la fața locului",
      ],
    },
    {
      icon: "online",
      title: "Terapie online",
      description:
        "Ședințe prin video, de oriunde te-ai afla. O variantă potrivită dacă ai un program încărcat, locuiești în alt oraș sau în străinătate.",
      points: [
        "Flexibilitate de program și de loc",
        "Aceeași confidențialitate ca în cabinet",
        "Link securizat, trimis înainte de ședință",
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const ABOUT = {
  eyebrow: "Despre mine",
  title: "Bună, sunt *Liliana*",
  /* ⚠️ Nu adăuga informații care nu pot fi susținute documentar. */
  paragraphs: [
    "Sunt psiholog clinician și psihoterapeut integrativ. Lucrez cu adulți, adolescenți și copii și am însoțit oameni aflați în momente foarte diferite ale vieții: anxietate și epuizare, pierderi și despărțiri, traume, dar și perioade în care pur și simplu nu mai știau încotro să meargă.",
    "Pornesc de la convingerea că fiecare dintre noi are resursele de care are nevoie ca să facă față vieții, chiar dacă uneori nu le mai vede. Iar schimbarea reală nu vine din sfaturi, ci dintr-o relație în care cineva te ascultă cu atenție, fără să te grăbească și fără să te judece.",
    "Ca psihoterapeut integrativ, îmbin tehnici fundamentate științific din mai multe orientări, alese după nevoile tale, păstrând în centru relația terapeutică. Cu copiii lucrez prin joc, poveste și Sandtray, iar cu părinții ca parteneri: nimeni nu își cunoaște copilul mai bine decât ei.",
    "Învăț din fiecare om cu care lucrez, atât ca terapeut, cât și ca om, și mă întreb mereu cum te pot însoți mai bine pe drumul tău.",
  ],
  credentials: [
    /* ⚠️ DE VERIFICAT cu Liliana: denumirile exacte ale instituțiilor
       (facultate, master, asociația de psihoterapie integrativă). */
    "Psiholog clinician, Colegiul Psihologilor din România",
    "Psihoterapeut integrativ, cu formare în psihoterapie integrativă",
    "Formare în psihoterapia copilului și adolescentului (IESTCA)",
    "Evaluarea relației părinte-copil m&M („mic și Mare”)",
    "Practician în programare neuro-lingvistică (NLP)",
    "Formare în terapia experiențială Sandtray",
    "Evaluare clinică psihologică pentru copii, adolescenți și adulți",
  ],
};

/* -------------------------------------------------------------------------- */

export const APPROACH = {
  eyebrow: "Abordare",
  title: "Cum *lucrez*",
  subtitle:
    "Nu există un drum unic. Îl construim împreună, pornind de la ce ai nevoie tu.",
  steps: [
    {
      step: "01",
      title: "Primul contact",
      description:
        "Ne auzim scurt, îmi spui ce te aduce la terapie și stabilim prima întâlnire. Poți întreba orice te ajută să te simți mai în siguranță.",
    },
    {
      step: "02",
      title: "Ședințele de evaluare",
      description:
        "În primele întâlniri ne cunoaștem și înțelegem situația. Stabilim obiective realiste și forma de lucru potrivită.",
    },
    {
      step: "03",
      title: "Procesul terapeutic",
      description:
        "Lucrăm constant, de obicei o dată pe săptămână, după un plan pe care îl revedem împreună pe parcurs.",
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
      title: "Relația terapeutică",
      description:
        "Studiile arată constant că relația dintre client și terapeut e unul dintre cei mai puternici factori ai schimbării. De aceea contează să te simți în siguranță, respectat și înțeles.",
    },
    {
      title: "Obiective și un plan",
      description:
        "Stabilim împreună ce vrei să schimbi și construim un plan de lucru, ca să vezi clar de unde ai pornit și cât drum ai parcurs.",
    },
    {
      title: "Abordare integrativă",
      description:
        "Îmbin metode validate din mai multe școli de psihoterapie, NLP și tehnici experiențiale precum Sandtray, alese după nevoile tale.",
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const FAQ = {
  eyebrow: "Întrebări frecvente",
  title: "Ce e bine să știi înainte de *prima ședință*",
  items: [
    {
      q: "Cât costă o ședință de psihoterapie?",
      a: `O ședință de psihoterapie individuală costă ${PRICE.standard} de ${PRICE.currency} și durează 50 de minute, în cabinet sau online. Evaluările psihologice și atelierele au tarife separate, pe care le găsești la programare.`,
    },
    {
      q: "Cât durează o ședință?",
      a: "O ședință de psihoterapie durează 50 de minute. O evaluare clinică psihologică sau un atelier de grup durează de obicei în jur de 90 de minute; durata exactă ți-o comunic din timp.",
    },
    {
      q: "Cum decurge prima întâlnire?",
      a: "Prima întâlnire e una de cunoaștere. Îmi povestești ce te aduce la terapie, îți răspund la întrebări și stabilim împreună dacă și cum continuăm. Nu trebuie să te pregătești în niciun fel.",
    },
    {
      q: "Cât timp durează terapia până îmi ating obiectivul?",
      a: "Depinde de obiectiv și de implicarea ta în proces. Unele situații se rezolvă în câteva luni, altele, mai ales cele legate de traume sau de tipare vechi, cer un an sau mai mult. După primele întâlniri îți pot da o estimare realistă, pe care o revedem pe parcurs.",
    },
    {
      q: "Cum îmi dau seama că terapia funcționează?",
      a: "Pe lângă instrumentele cu care măsurăm progresul, schimbările se văd în viața de zi cu zi: dormi mai bine, anxietatea scade, te trezești mai ușor dimineața, ai din nou chef de oameni, te organizezi mai bine și relațiile devin mai liniștite.",
    },
    {
      q: "De ce aș merge la terapie dacă mă simt bine?",
      a: "Pentru că terapia nu e doar pentru momentele de criză. Poți veni ca să te cunoști mai bine, să înveți să răspunzi altfel situațiilor dificile, să fii mai blând cu tine sau să crești în direcția pe care ți-o dorești.",
    },
    {
      q: "E ceva în neregulă cu mine dacă mă gândesc să merg la psiholog?",
      a: "Deloc. Dimpotrivă: să îți pui întrebări despre starea ta și să ceri sprijin e un semn de grijă față de tine, nu de slăbiciune.",
    },
    {
      q: "Ședințele online sunt la fel de eficiente?",
      a: "Da. Cercetările arată că psihoterapia online are rezultate comparabile cu cea din cabinet pentru majoritatea dificultăților. Pentru copiii mici, pentru evaluări și pentru atelierele Sandtray recomand însă lucrul în cabinet.",
    },
    {
      q: "Ce se întâmplă cu ceea ce discutăm?",
      a: "Tot ce discutăm e confidențial. Excepțiile sunt strict cele prevăzute de lege și de codul deontologic al psihologilor: situațiile în care există un risc real pentru siguranța ta sau a altcuiva.",
    },
    {
      q: "Copilul meu are nevoie de terapie sau de evaluare?",
      a: "Uneori de amândouă, alteori de niciuna. Începem cu o discuție cu părinții, iar dacă e util recomand o evaluare clinică sau evaluarea relației părinte-copil m&M, ca să înțelegem clar situația înainte de a alege direcția.",
    },
    {
      q: "Ce este terapia Sandtray?",
      a: "Sandtray e o metodă experiențială în care folosim o tavă cu nisip și miniaturi ca să dăm formă trăirilor interioare. E utilă mai ales atunci când emoțiile sunt greu de pus în cuvinte, la copii, dar și la adulți.",
    },
    {
      q: "Cum mă programez?",
      a: "Îți alegi ziua și ora direct din calendarul de programări de pe site sau mă poți suna ori îmi poți scrie pe WhatsApp. Îți răspund de regulă în aceeași zi lucrătoare.",
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const CONTACT = {
  eyebrow: "Contact",
  title: "Primul pas e *cel mai greu*",
  subtitle:
    "Dacă te gândești de ceva vreme să mergi la psiholog, scrie-mi. Nu trebuie să știi de la început ce vrei să spui.",
};

/* -------------------------------------------------------------------------- */

/* Secțiunea de pe prima pagină care duce la kitul „Cum stai, de fapt, cu
   relația ta?" (/kit): test, raport personal și ghid, la un singur preț. */
export const TESTS = {
  eyebrow: `Kit pentru cuplu · ${PRET_KIT_LEI} lei`,
  title: "Cum stai, de fapt, cu *relația ta*?",
  description:
    "Pentru momentele în care relația doare: certuri, gânduri de despărțire, un divorț în curs sau unul care încă apasă. Un kit complet, făcut acasă: un test de 30 de întrebări, un raport personal detaliat în PDF și ghidul practic de 63 de pagini.",
  items: ["Test de 30 de întrebări", "Raport personal detaliat, în PDF", "Ghidul practic de 63 de pagini"],
  cta: "Descoperă kitul",
  href: "/kit",
};

/* ============================================================================
   Prețuri, fotografii și recenzii
   ========================================================================== */


/** Fotografiile cabinetului, folosite în galerie și în hero. */
export const PHOTOS = {
  hero: "/foto/cabinet-camera-1.jpg",
  /** Hero-ul de pe prima pagină: cabinetul pe fundal, Liliana în prim-plan. */
  heroFundal: "/foto/cabinet-spatiu-3.jpg",
  heroPortret: "/foto/liliana-portret-4.jpg",
  despre: "/foto/liliana-fotoliu.jpg",
  /* Fiecare poză apare o singură dată. Fișierele primite conțineau aceeași
     fotografie sub mai multe nume, iar galeria o repeta de trei ori.
     Descrierile sunt scrise după ce s-a uitat cineva la fotografii. */
  cabinet: [
    { src: "/foto/cabinet-camera-1.jpg", alt: "Camera de consultații, cu canapea și bibliotecă" },
    { src: "/foto/cabinet-camera-2.jpg", alt: "Canapeaua verde din camera de consultații" },
    { src: "/foto/cabinet-spatiu-3.jpg", alt: "Fotoliul și biblioteca, din celălalt capăt al camerei" },
    { src: "/foto/cabinet-spatiu-2.jpg", alt: "Sala pentru ședințe de grup, cu scaunele așezate în cerc" },
    { src: "/foto/cabinet-spatiu-1.jpg", alt: "Baia cabinetului" },
  ],
  portrete: [
    "/foto/liliana-portret-1.jpg",
    "/foto/liliana-portret-2.jpg",
    "/foto/liliana-portret-4.jpg",
  ],
};

/** Mesaje primite de la oameni care au trecut prin terapie.
    ⚠️ Înainte de publicare, asigură-te că ai acordul scris al fiecăruia. */
export const REVIEWS = {
  eyebrow: "Ce spun oamenii",
  title: "Mesaje primite *după terapie*",
  subtitle:
    "Câteva dintre mesajele primite de-a lungul timpului, publicate cu acordul celor care le-au scris.",
  images: [
    { src: "/foto/recenzie-1.jpg", alt: "Mesaj primit de la o persoană care a urmat terapie" },
    { src: "/foto/recenzie-2.jpg", alt: "Mesaj de mulțumire primit după încheierea terapiei" },
    { src: "/foto/recenzie-3.jpg", alt: "Mesaj primit de la un client al cabinetului" },
  ],
  /* Mesaje primite pe WhatsApp. Pe site apar capturile (decupate: fără
     numele complet, poza de profil sau alte mesaje), iar transcrierea de aici
     e textul lor alternativ — o citesc Google și cititoarele de ecran.
     Apar doar prenumele — Mara a cerut explicit „Mara". Unde captura începe
     sau se termină în mijlocul mesajului, textul are „…".
     ⚠️ Confirmă cu fiecare că prenumele poate apărea așa. */
  mesaje: [
    {
      nume: "Sorina",
      foto: "/foto/recenzie-sorina.jpg",
      context: "Psihoterapie individuală",
      text: "Experiența mea cu psihoterapia a început poate puțin mai târziu decât ar fi trebuit, însă mult timp nu reușeam să mă conving că, într-adevăr, am nevoie de ea. Mi-au trebuit ani până să realizez că povara pe care o purtam pe umeri îmi afecta liniștea, pacea interioară și relațiile cu familia și cu cei apropiați. Alegeam să fiu acolo pentru toți, dar uitam să fiu acolo și pentru mine. Faptul că prima mea experiență în psihoterapie a fost alături de Liliana mă face să spun, cu multă bucurie, că am ajuns exact acolo unde aveam nevoie. Liliana este un psihoterapeut excelent și, dincolo de pregătirea sa profesională, un om cu un suflet blând și cald. Conexiunea dintre noi s-a creat foarte repede și, spre surprinderea mea, am reușit să mă deschid în fața ei încă din primele ședințe…",
    },
    {
      nume: "Alexandra",
      foto: "/foto/recenzie-alexandra-t.jpg",
      context: "Părinte",
      text: "Am ajuns la Lili într-o perioadă foarte dificilă pentru noi, când copilul nostru refuza să meargă la școală și îi era extrem de greu să intre pe poarta școlii. Cu multă răbdare, empatie și blândețe, Lili ne-a ajutat să înțelegem ce se întâmplă cu el și, pas cu pas, să depășim această perioadă. Experiența asta m-a făcut să privesc lucrurile altfel. Acum, de fiecare dată când văd un copil care plânge în fața școlii sau nu vrea să intre, nu mă mai gândesc că este doar „răsfăț”, ci înțeleg că în spatele acelui comportament pot fi emoții foarte puternice, pe care copilul încă nu știe și nu poate să le controleze. Îi mulțumim din suflet lui Lili pentru tot sprijinul oferit și o recomandăm cu toată încrederea tuturor părinților care trec prin perioade dificile cu copiii lor.",
    },
    {
      nume: "Mara",
      foto: "/foto/recenzie-mara.jpg",
      context: "Psihoterapie individuală",
      text: "…De asemenea, m-a ghidat să înțeleg cât de important este să îmi stabilesc limite sănătoase în relațiile cu cei din jur și să fiu mai blândă cu mine însămi. În timpul fiecărei ședințe, mă întreabă ce am nevoie să lucrăm. Cel mai mult a contat faptul că în timpul ședințelor m-am simțit întotdeauna ascultată și în siguranță. Este important să știi că poți să spui exact ce gândești și să exprimi tot prin ce treci fără teama de a fi judecată. Doamna Liliana are o voce caldă, blândă și o prezență liniștitoare. O recomand din tot sufletul și mă bucur să continui procesul terapeutic alături de ea.",
    },
    {
      nume: "Paula",
      foto: "/foto/recenzie-paula.jpg",
      context: "Cuplu și familie",
      text: "Am 41 de ani, sunt căsătorită de 18 ani, un copil frumos și multe realizări împreună. Și cum în firescul lucrurilor stau și discuțiile de la unele minore, am ajuns să ne certăm zi de zi. Relația mea cu soțul a început să se deterioreze, ba chiar și cu copilul… Ajunsesem să ne gândim la divorț. Spre norocul meu, al nostru, am cunoscut-o pe d-na psihoterapeut Jgheban Liliana, care cu multă răbdare și o vorbă caldă, înțeleaptă, ne-a făcut să ne apropiem din nou, să înțelegem unde am greșit fiecare, să înțelegem că fiecare dintre noi are o parte de vină. Datorită dumneaei astăzi suntem raționali în tot ceea ce facem, comunicăm mai mult, suntem fericiți, căreia îi mulțumim, aveți toate aprecierile noastre!",
    },
    {
      nume: "Alexandra",
      foto: "/foto/recenzie-alexandra-a.jpg",
      context: "Psihoterapie individuală",
      text: "…Am apreciat foarte mult faptul că nu mi-au fost oferite soluții gata făcute, am fost ghidată cu răbdare să-mi descopăr propriile resurse și să găsesc singură răspunsurile de care aveam nevoie. În timp, am observat schimbări reale. Am dobândit mai multă încredere în mine, am învățat să îmi înțeleg emoțiile, să gestionez mai bine stresul și să privesc cu mai multă compasiune atât către mine, cât și către cei din jur. Astăzi sunt mai conștientă de ceea ce simt, îmi ofer mai multă înțelegere și reușesc să gestionez situațiile dificile cu mai mult echilibru. Cel mai frumos lucru este că, după doi ani, mi-am atins obiectivele pe care le aveam la începutul terapiei, iar acum pot privi cu încredere către noi obiective. Sunt recunoscătoare pentru acest parcurs.",
    },
    {
      nume: "Rodica",
      foto: "/foto/recenzie-rodica.jpg",
      context: "Psihoterapie individuală",
      text: "Întâlnirea mea cu psihoterapia a fost începutul unui proces profund în care am descoperit cum sunt modelată de experiențele mele și ce mecanisme pot folosi ca să-mi înfrunt fricile și să depășesc obstacolele. A fost un drum care m-a ajutat să cresc și să privesc viața oarecum cu mai multă claritate în căutarea echilibrului personal.",
    },
    {
      nume: "Alexandra-Oana",
      foto: "/foto/recenzie-alexandra-oana.jpg",
      context: "Psihoterapie individuală",
      text: "Blândețe nemăsurată, comunicare profesionistă, spațiu de încredere, „igienă mentală”, astea definesc colaborarea cu Lili. Livrează într-o manieră modestă cuvinte care alcătuiesc puzzle-uri, iar ție îți rămâne să fii sincer cu tine în procesul terapeutic și vei avea „aha”-ul de nenumărate ori. Discuțiile capătă amploare și poți ajunge să te simți copleșit în sens pozitiv de felul în care se derulează totul pas cu pas. Are o candoare care mângâie, ascultă activ așa încât să simți că e parte din povestea ta, fără implicare personală, dar vine cu susținere și cu expertiză valoroasă. Lili e genul de profesionist pe care îl alegi ușor în cazul în care ai un moment greu de dus, dar și dacă ești într-o perioadă în care te orientezi mai clătinat și ai nevoie să stabiliți un obiectiv împreună. Concluzionez prin faptul că fiecare ședință reprezintă timp de calitate…",
    },
    {
      nume: "Paul",
      foto: "/foto/recenzie-paul.jpg",
      context: "Psihoterapie individuală",
      text: "…a fost un proces amplu care la început a fost destul de ușor de digerat ca apoi să se transforme într-o adevărată muncă personală care m-a încântat și mă încântă în continuare, și mă încântă de fiecare dată când ating anumite subiecte personale destul de profunde gata pentru a fi transformate cu ajutorul ei, Liliana fiind un adevărat ghid, un profesionist care știe să susțină procesul terapeutic până la capăt, și care știe să te ducă mai departe dincolo de limitele personale care până atunci păreau un dat al firii care nu ar fi putut fi schimbat vreodată. Marea mea încântare este faptul că ne-am cunoscut mult mai bine limitele mele interioare, m-am cunoscut pe mine, am devenit mai conștient de ceea ce sunt și de ceea ce pot, iar asta îmi aduce un câștig substanțial și mă face să continui ceea ce am început cu multă plăcere.",
    },
  ],
};

/* ============================================================================
   Ce se întâmplă mai departe, în funcție de formatul ales

   ⚠️ DE COMPLETAT: adresa reală a cabinetului și linkul de Zoom. Până atunci,
   textul spune că detaliile vin la confirmare — ceea ce e oricum adevărat.
   ========================================================================== */

export const MEETING = {
  cabinet: {
    title: "Ne vedem la cabinet",
    /** Lăsat gol → se afișează doar orașul și nota de mai jos. */
    address: "",
    city: SITE.city,
    note: "Adresa exactă și indicațiile de acces îți sunt trimise odată cu confirmarea programării.",
  },
  online: {
    title: "Ne vedem pe Zoom",
    platform: "Zoom",
    /** Camera personală de Zoom. Lăsat gol → se anunță că linkul vine pe email. */
    link: "",
    note: "Primești linkul de Zoom pe email, cu cel puțin o oră înainte de ședință. Nu ai nevoie de cont, se deschide direct din browser.",
  },
};
