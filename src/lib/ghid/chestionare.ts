/* ----------------------------------------------------------------------------
   Chestionarele gratuite, câte unul pentru fiecare parte a ghidului.

   Fiecare are aceleași întrebări despre situație la început (din ele reiese
   partea care ți se potrivește), apoi 12 afirmații în 3 zone, legate de
   capitolele părții. Răspunsul e pe o scară de acord (1 = deloc … 5 = întru
   totul). Scorul unei zone arată cât de greu e acum: 0 = liniște, 100 = foarte
   greu. Afirmațiile marcate `resursa` descriu ceva bun, deci se notează invers.

   Interpretarea de aici e generică (gratuită). Raportul personal, scris de
   AI, vine cu partea cumpărată.

   Modul fără server: scorul se calculează la fel în browser și pe server.
   -------------------------------------------------------------------------- */

import { parte as gasesteParte, type Parte } from "./parti";

export type Raspunsuri = Record<string, string>;

export type Afirmatie = { id: string; text: string; resursa?: boolean };

export type CheieNivel = "liniste" | "atentie" | "presiune" | "critic";

export const NIVELURI: Record<CheieNivel, { nume: string; culoare: string }> = {
  liniste: { nume: "Teren stabil", culoare: "#6e8567" },
  atentie: { nume: "Semne de atenție", culoare: "#a08b6f" },
  presiune: { nume: "Sub presiune", culoare: "#b97a55" },
  critic: { nume: "Zonă fragilă", culoare: "#a8624a" },
};

export function nivel(pct: number): CheieNivel {
  if (pct < 25) return "liniste";
  if (pct < 50) return "atentie";
  if (pct < 75) return "presiune";
  return "critic";
}

export type Zona = {
  cheie: string;
  nume: string;
  /** Ce măsoară, pe scurt. */
  descriere: string;
  /** Capitolul din parte care lucrează exact zona aceasta. */
  capitol: string;
  afirmatii: Afirmatie[];
  /** Ce înseamnă scorul: sub 34, 34–66, peste 66. */
  texte: { jos: string; mediu: string; sus: string };
};

export type Chestionar = {
  /** Numărul chestionarului (1–6); e salvat în comandă. */
  id: number;
  /** Adresa lui: /kit/<slug>. */
  slug: string;
  /** Partea ghidului la care duce (1–4). */
  parte: number;
  /** Titlul cu care e anunțat (pe /kit și în reclame). */
  carlig: string;
  /** Subtitlul: ce afli. */
  promisiune: string;
  /** Cum să răspunzi la afirmații. */
  indrumare: string;
  zone: Zona[];
  /** Interpretarea generală, pe nivelul total. */
  niveluri: Record<CheieNivel, { titlu: string; text: string }>;
};

/* ---------- Întrebările despre situație, comune ---------- */

export type IntrebareContext = {
  id: string;
  intrebare: string;
  ajutor?: string;
  tip: "single" | "text" | "long";
  optiuni?: string[];
  optional?: boolean;
  /** Apare doar dacă funcția întoarce adevărat. */
  daca?: (r: Raspunsuri) => boolean;
};

export const SITUATII = [
  "Suntem împreună și, în mare, ne e bine",
  "Suntem împreună, dar simt că ceva nu mai merge",
  "Ne gândim la despărțire sau unul dintre noi a hotărât deja",
  "Suntem în plină despărțire sau în divorț",
  "Ne-am despărțit sau am divorțat de ceva vreme",
  "Am o relație nouă și în familie sunt copii din relații anterioare",
] as const;

export const COPII = ["Nu avem copii împreună", "Da, cel puțin unul sub 18 ani", "Da, dar sunt adulți"] as const;

export const SIGURANTA = ["Nu", "Uneori", "Des"] as const;

export const areCopiiMinori = (r: Raspunsuri) => r.copii === COPII[1];

export const CONTEXT_INAINTE: IntrebareContext[] = [
  {
    id: "situatia",
    intrebare: "Unde te afli acum în relație?",
    ajutor: "Alege varianta cea mai apropiată. Din ea reiese ce parte a ghidului ți se potrivește.",
    tip: "single",
    optiuni: [...SITUATII],
  },
  {
    id: "copii",
    intrebare: "Aveți copii împreună?",
    ajutor: "Dacă ai o familie nouă, gândește-te la copiii din relația ta anterioară.",
    tip: "single",
    optiuni: [...COPII],
  },
  {
    id: "varste_copii",
    intrebare: "Ce vârste au copiii?",
    ajutor: "De exemplu: 4 și 9 ani. Ajută raportul să țină cont de etapa lor.",
    tip: "text",
    optional: true,
    daca: areCopiiMinori,
  },
  {
    id: "siguranta",
    intrebare: "Ți s-a întâmplat să-ți fie frică de partener sau de fostul partener?",
    ajutor: "Răspunsul rămâne confidențial. Dacă e cazul, rezultatul îți arată unde poți cere ajutor imediat.",
    tip: "single",
    optiuni: [...SIGURANTA],
  },
];

export const CONTEXT_DUPA: IntrebareContext[] = [
  {
    id: "povestea",
    intrebare: "Vrei să-mi spui, cu cuvintele tale, ce se întâmplă?",
    ajutor:
      "Opțional. Dacă alegi partea ghidului, raportul tău personal pornește de aici. Nu scrie nume sau date care te pot identifica.",
    tip: "long",
    optional: true,
  },
];

/* ---------- Scara de răspuns ---------- */

export const SCALA = [
  { valoare: "1", eticheta: "Deloc" },
  { valoare: "2", eticheta: "Puțin" },
  { valoare: "3", eticheta: "Parțial" },
  { valoare: "4", eticheta: "În mare parte" },
  { valoare: "5", eticheta: "Întru totul" },
] as const;

/* ---------- Cele 6 chestionare ---------- */

export const CHESTIONARE: Chestionar[] = [
  {
    id: 1,
    slug: "preventia-divortului",
    parte: 1,
    carlig: "Simți că nu mai merge ceva în relație?",
    promisiune:
      "Află dacă ești în pragul despărțirii sau ce poți face ca să nu ajungi acolo. Chestionar gratuit, în jur de 5 minute.",
    indrumare: "Gândește-te la ultimele luni ale relației voastre.",
    zone: [
      {
        cheie: "criza",
        nume: "Ce se întâmplă de fapt",
        descriere: "Tiparul certurilor și momentele care v-au îndepărtat.",
        capitol: "Înțelegerea crizei de cuplu",
        afirmatii: [
          { id: "p1_1", text: "Certurile noastre se învârt în jurul acelorași teme, iar și iar." },
          { id: "p1_2", text: "După o ceartă, rămâne mult timp o răceală între noi." },
          { id: "p1_3", text: "Știu ce anume declanșează de obicei tensiunile dintre noi.", resursa: true },
          { id: "p1_4", text: "O schimbare din ultimii ani (un copil, o mutare, o pierdere, un loc de muncă nou) ne-a îndepărtat." },
        ],
        texte: {
          jos: "Certurile nu par să vă țină prizonieri într-un cerc. Știi, în mare, ce vă tensionează și reveniți unul spre celălalt.",
          mediu: "Unele certuri se repetă și lasă urme. Semn că există un tipar pe care merită să-l numiți, înainte să se adâncească.",
          sus: "Conflictele se repetă și nu se mai închid. Nu subiectul lor e problema, ci tiparul în care ați intrat, iar el se poate înțelege.",
        },
      },
      {
        cheie: "semnale",
        nume: "Semnale de alarmă",
        descriere: "Deconectarea, disprețul și retragerea, semnele care contează cel mai mult.",
        capitol: "Semnale de alarmă care pot duce la divorț",
        afirmatii: [
          { id: "p1_5", text: "Am senzația că trăim unul lângă altul, nu împreună." },
          { id: "p1_6", text: "În discuțiile noastre apar ironia, disprețul sau jignirile." },
          { id: "p1_7", text: "Am încetat să mai spun ce mă supără, pentru că oricum nu schimbă nimic." },
          { id: "p1_8", text: "Mă gândesc tot mai des la cum ar fi viața fără partenerul meu." },
        ],
        texte: {
          jos: "Semnalele grave lipsesc: nu apar disprețul sau retragerea care macină o relație din interior.",
          mediu: "Apar câteva semnale care cer atenție. Luate devreme, sunt exact momentul în care prevenția funcționează cel mai bine.",
          sus: "Răspunsurile tale arată semnale de alarmă serioase: deconectare, retragere sau dispreț. Sunt semnalele care merită luate în serios acum, nu mai târziu.",
        },
      },
      {
        cheie: "resurse",
        nume: "Ce vă poate ajuta",
        descriere: "Cum vă certați, cum împărțiți greul și cât sunteți dispuși să lucrați la relație.",
        capitol: "Instrumente de prevenție",
        afirmatii: [
          { id: "p1_9", text: "Când ne certăm, reușim să ne oprim înainte să spunem lucruri care dor.", resursa: true },
          { id: "p1_10", text: "Amândoi ne asumăm partea noastră în ce nu merge.", resursa: true },
          { id: "p1_11", text: "Unul dintre noi duce aproape tot greul casei, al banilor sau al copiilor." },
          { id: "p1_12", text: "Am fi dispuși, amândoi, să cerem ajutorul unui specialist.", resursa: true },
        ],
        texte: {
          jos: "Aveți resurse reale: vă puteți opri la timp, vă asumați partea și sunteți deschiși la ajutor. Pe ele se sprijină orice schimbare.",
          mediu: "Resursele există, dar nu sunt folosite constant. Câteva instrumente simple pot schimba felul în care vă certați.",
          sus: "Resursele relației sunt acum la minimum: certurile scapă de sub control, greul e pe umerii unuia, iar ajutorul din afară pare departe.",
        },
      },
    ],
    niveluri: {
      liniste: {
        titlu: "Relația voastră are o temelie solidă",
        text: "Din răspunsurile tale, relația trece prin tensiuni obișnuite, nu printr-o criză. E un moment bun să vă îngrijiți ce funcționează, ca să rămână așa și în perioadele grele.",
      },
      atentie: {
        titlu: "Relația trece printr-o perioadă de încercare",
        text: "Există semne că ceva s-a dereglat, dar și resurse cu care se poate lucra. Acum, când lucrurile încă se pot discuta, prevenția are cea mai mare șansă.",
      },
      presiune: {
        titlu: "Relația e într-o criză reală",
        text: "Răspunsurile tale descriu o relație sub presiune: tipare care se repetă și semne de îndepărtare. O criză nu înseamnă sfârșitul, dar cere să o înțelegeți înainte să luați decizii.",
      },
      critic: {
        titlu: "Relația pare aproape de punctul de rupere",
        text: "Deconectarea și conflictele nerezolvate au ajuns să cântărească foarte mult. Înainte de orice decizie, merită să înțelegi ce s-a întâmplat, iar sprijinul unui specialist poate face diferența.",
      },
    },
  },
  {
    id: 2,
    slug: "despartirea",
    parte: 2,
    carlig: "Te gândești la despărțire sau decizia a fost deja luată?",
    promisiune:
      "Află în ce etapă emoțională a despărțirii ești și ce te ajută să treci prin ea fără să te pierzi. Chestionar gratuit, în jur de 5 minute.",
    indrumare: "Gândește-te la ce trăiești în ultimele săptămâni.",
    zone: [
      {
        cheie: "doliu",
        nume: "Pierderea și doliul",
        descriere: "Cât de mult te copleșește despărțirea, emoțional și în viața de zi cu zi.",
        capitol: "Divorțul ca proces emoțional: doliul",
        afirmatii: [
          { id: "p2_1", text: "Trec de la speranță la disperare de mai multe ori în aceeași zi." },
          { id: "p2_2", text: "Mi-e greu să accept că relația, așa cum o știam, se încheie." },
          { id: "p2_3", text: "Am momente în care pot vorbi despre despărțire fără să mă copleșească.", resursa: true },
          { id: "p2_4", text: "Somnul, pofta de mâncare sau puterea de muncă mi-au fost date peste cap." },
        ],
        texte: {
          jos: "Treci prin pierdere fără să te copleșească. Ai momente de liniște în care poți privi despărțirea limpede.",
          mediu: "Doliul e prezent și vine în valuri. E firesc: nu poți închide o relație fără să treci prin el.",
          sus: "Despărțirea te copleșește acum, emoțional și fizic. E o etapă grea, care cere grijă pentru tine înainte de orice decizie mare.",
        },
      },
      {
        cheie: "furie",
        nume: "Furia și vinovăția",
        descriere: "Emoțiile care pot prelungi divorțul emoțional, chiar și după separare.",
        capitol: "Divorțul ca proces emoțional: furia și vinovăția",
        afirmatii: [
          { id: "p2_5", text: "Mă macin cu gândul la ce aș fi putut face altfel." },
          { id: "p2_6", text: "Simt o furie pe care nu știu unde s-o pun." },
          { id: "p2_7", text: "Îmi dau voie să văd și partea mea de responsabilitate, fără să mă învinovățesc pentru tot.", resursa: true },
          { id: "p2_8", text: "Discuțiile cu partenerul despre despărțire se transformă repede în reproșuri." },
        ],
        texte: {
          jos: "Furia și vinovăția nu te țin pe loc. Poți privi responsabilitatea fără ca ea să te strivească.",
          mediu: "Furia sau vinovăția apar des. Neprocesate, ele pot ține despărțirea deschisă mult după ce s-a încheiat pe hârtie.",
          sus: "Furia sau vinovăția ocupă acum mult loc. Ce nu e lucrat emoțional ajunge să fie jucat în relație, de aceea merită atenție acum.",
        },
      },
      {
        cheie: "ritm",
        nume: "Ritmuri diferite și decizia",
        descriere: "Unde ești tu față de partener și cât de pregătit e momentul pentru decizii.",
        capitol: "Divorțul ca proces emoțional: ritmuri diferite",
        afirmatii: [
          { id: "p2_9", text: "Unul dintre noi a închis deja relația în minte, celălalt încă nu." },
          { id: "p2_10", text: "Simt presiunea să iau decizii mari înainte de vreme." },
          { id: "p2_11", text: "Am în jur oameni cu care pot vorbi deschis despre ce trăiesc.", resursa: true },
          { id: "p2_12", text: "Nu știu dacă vreau, de fapt, despărțirea sau doar să se oprească durerea." },
        ],
        texte: {
          jos: "Pari să ai sprijin și un ritm al tău în decizie. E un teren bun pentru a trece prin despărțire cu demnitate.",
          mediu: "Ritmurile voastre diferă sau decizia încă oscilează. Diferența de ritm nu înseamnă lipsă de suferință, ci momente diferite ale aceluiași proces.",
          sus: "Te simți împins de timp, de partener sau de durere, iar decizia nu e încă limpede. E important să nu hotărăști din mijlocul furtunii.",
        },
      },
    ],
    niveluri: {
      liniste: {
        titlu: "Treci prin despărțire cu resurse",
        text: "Despărțirea doare, dar din răspunsurile tale reiese că ai sprijin și spațiu să o înțelegi. Partea aceasta a ghidului te ajută să păstrezi direcția și în momentele grele.",
      },
      atentie: {
        titlu: "Ești în mijlocul procesului emoțional al despărțirii",
        text: "Doliul, furia sau îndoiala sunt prezente, cum e firesc. Cu cât le înțelegi mai bine, cu atât despărțirea poate fi dureroasă fără să devină distructivă.",
      },
      presiune: {
        titlu: "Despărțirea te apasă greu acum",
        text: "Emoțiile despărțirii ocupă aproape tot spațiul: te consumă și te grăbesc. E momentul să ai grijă de tine și să înțelegi etapa prin care treci, înainte de decizii mari.",
      },
      critic: {
        titlu: "Ești într-una dintre cele mai grele etape",
        text: "Răspunsurile tale descriu o suferință foarte mare. Nu e nevoie să treci prin asta fără sprijin: sprijinul unui specialist te poate ajuta să iei decizii din liniște, nu din durere.",
      },
    },
  },
  {
    id: 3,
    slug: "divortul-fara-copii",
    parte: 2,
    carlig: "Divorțezi și nu aveți copii împreună?",
    promisiune:
      "Află unde ești, emoțional și practic, și ce te ajută să închei relația fără să te pierzi pe drum. Chestionar gratuit, în jur de 5 minute.",
    indrumare: "Gândește-te la perioada pe care o trăiești acum.",
    zone: [
      {
        cheie: "identitate",
        nume: "Cine ești după relație",
        descriere: "Identitatea, presiunea celor din jur și singurătatea.",
        capitol: "Impact emoțional asupra adulților",
        afirmatii: [
          { id: "p3_1", text: "Nu mai știu foarte bine cine sunt în afara relației." },
          { id: "p3_2", text: "Am început să fac lucruri doar pentru mine, care îmi fac bine.", resursa: true },
          { id: "p3_3", text: "Simt judecata celor din jur (familie, prieteni) pentru divorț." },
          { id: "p3_4", text: "Singurătatea de acasă mă apasă mai mult decât mă odihnește." },
        ],
        texte: {
          jos: "Îți regăsești conturul: ai lucruri ale tale și o liniște în care poți respira.",
          mediu: "Te reconstruiești, dar cu momente de gol și de presiune din afară. Singurătatea poate deveni, treptat, un spațiu al tău.",
          sus: "Divorțul te-a lăsat fără repere: cine ești, ce cred ceilalți, cum umpli golul. Sunt întrebări firești, care merită lucrate cu grijă.",
        },
      },
      {
        cheie: "practic",
        nume: "Partea juridică și materială",
        descriere: "Forma divorțului, bunurile și informațiile de care ai nevoie.",
        capitol: "Aspecte juridice de bază",
        afirmatii: [
          { id: "p3_5", text: "Încă nu știu ce formă va lua divorțul (la notar, la primărie sau în instanță)." },
          { id: "p3_6", text: "Împărțirea bunurilor sau a datoriilor ne aduce certuri dese." },
          { id: "p3_7", text: "Am informațiile de care am nevoie despre pașii legali.", resursa: true },
          { id: "p3_8", text: "Mă tem că voi pierde mult, material, în urma divorțului." },
        ],
        texte: {
          jos: "Partea practică pare limpede și fără mari conflicte. Asta ușurează mult și partea emoțională.",
          mediu: "Rămân întrebări practice deschise și câteva tensiuni. Informația corectă reduce mult din teamă.",
          sus: "Partea juridică și materială e acum un câmp de luptă și de nesiguranță. Forma divorțului influențează direct cât de repede te vindeci.",
        },
      },
      {
        cheie: "inchidere",
        nume: "Închiderea emoțională",
        descriere: "Cât te mai ține relația, dincolo de hârtii.",
        capitol: "Aspecte juridice de bază: închiderea emoțională",
        afirmatii: [
          { id: "p3_9", text: "Verific ce face fostul partener (pe rețele, prin prieteni comuni)." },
          { id: "p3_10", text: "Folosesc procesul juridic ca să-mi descarc supărarea pe partener." },
          { id: "p3_11", text: "Pot să mă gândesc la relație și cu recunoștință pentru ce a fost bun.", resursa: true },
          { id: "p3_12", text: "Simt că nu voi putea merge mai departe până nu se termină totul pe hârtie." },
        ],
        texte: {
          jos: "Pari să te desprinzi treptat, cu o privire împăcată asupra a ce a fost.",
          mediu: "Relația te mai ține prin gânduri, verificări sau supărare. Închiderea juridică nu aduce singură închiderea emoțională.",
          sus: "Relația te ține încă strâns, iar lupta de pe hârtie pare să țină locul despărțirii adevărate. Aici e, poate, cea mai importantă muncă.",
        },
      },
    ],
    niveluri: {
      liniste: {
        titlu: "Închei relația cu pași limpezi",
        text: "Răspunsurile tale arată un divorț care, deși dureros, e gestionat cu claritate. Partea aceasta a ghidului te ajută să închei bine și să pornești mai departe.",
      },
      atentie: {
        titlu: "Ești la mijlocul drumului",
        text: "Unele lucruri s-au așezat, altele încă doar. E firesc ca partea emoțională și cea practică să meargă în ritmuri diferite.",
      },
      presiune: {
        titlu: "Divorțul te consumă mult acum",
        text: "Emoțiile, nesiguranța practică sau conflictele te țin în tensiune. Înțelegerea lor te ajută să nu lași ca divorțul să decidă cine devii.",
      },
      critic: {
        titlu: "Divorțul a devenit greu de dus",
        text: "Răspunsurile tale arată o perioadă foarte grea, pe mai multe planuri deodată. Nu e nevoie să o duci fără sprijin: un specialist te poate ajuta să pui ordine, pas cu pas.",
      },
    },
  },
  {
    id: 4,
    slug: "divortul-cu-copii",
    parte: 3,
    carlig: "Vă despărțiți și aveți copii?",
    promisiune:
      "Află cum trăiește copilul vostru despărțirea, ce îl protejează și ce îl încarcă fără să vă dați seama. Chestionar gratuit, în jur de 5 minute.",
    indrumare: "Dacă aveți mai mulți copii, gândește-te la cel care te îngrijorează cel mai mult.",
    zone: [
      {
        cheie: "nevoi",
        nume: "Ce trăiește copilul",
        descriere: "Schimbările din comportamentul lui, vina pe care și-o poate asuma și stabilitatea.",
        capitol: "Nevoile psihologice ale copilului în divorț",
        afirmatii: [
          { id: "p4_1", text: "Copilul s-a schimbat de când au început tensiunile (somn, școală, toane, retragere)." },
          { id: "p4_2", text: "Copilul pare să creadă că e vina lui sau că ar putea repara lucrurile." },
          { id: "p4_3", text: "Copilul are în continuare rutine și lucruri stabile pe care se poate baza.", resursa: true },
          { id: "p4_4", text: "Copilul a ajuns să aibă grijă de unul dintre noi, să ne consoleze sau să ne țină partea." },
        ],
        texte: {
          jos: "Copilul pare să aibă stabilitatea de care are nevoie. Rutinele și liniștea lui sunt cel mai bun scut.",
          mediu: "Copilul arată câteva semne de neliniște. Sunt reacții firești, dar merită urmărite și liniștite din timp.",
          sus: "Copilul poartă acum mult din greutatea despărțirii: schimbări, vină sau roluri de adult. Are nevoie să fie scos din mijlocul lucrurilor.",
        },
      },
      {
        cheie: "comunicare",
        nume: "Cum îi vorbiți",
        descriere: "Ce știe copilul despre despărțire și de la cine a aflat.",
        capitol: "Cum comunicăm divorțul copilului",
        afirmatii: [
          { id: "p4_5", text: "I-am explicat copilului despărțirea împreună, pe înțelesul vârstei lui.", resursa: true },
          { id: "p4_6", text: "Copilul a auzit certuri sau detalii despre motivele despărțirii." },
          { id: "p4_7", text: "Nu știu ce să-i răspund copilului când întreabă de ce ne despărțim." },
          { id: "p4_8", text: "Mi se întâmplă să spun lucruri negative despre celălalt părinte de față cu copilul." },
        ],
        texte: {
          jos: "Copilul a primit un adevăr simplu, de la voi amândoi. Asta reduce mult din anxietatea lui.",
          mediu: "Comunicarea cu copilul are goluri: întrebări fără răspuns sau lucruri auzite fără să fie pentru el.",
          sus: "Copilul află despre despărțire mai mult din certuri decât din explicații. Are nevoie de adevăr simplu, nu de detalii dureroase.",
        },
      },
      {
        cheie: "organizare",
        nume: "Organizarea și celălalt părinte",
        descriere: "Locuința, programul, custodia și relația copilului cu amândoi părinții.",
        capitol: "Autoritatea parentală și organizarea vieții copilului; alienarea parentală",
        afirmatii: [
          { id: "p4_9", text: "Nu ne-am înțeles încă unde va locui copilul și cât timp petrece cu fiecare." },
          { id: "p4_10", text: "Discuțiile despre program, bani sau custodie ajung în conflict." },
          { id: "p4_11", text: "Copilul refuză, fără un motiv clar, să petreacă timp cu unul dintre noi." },
          { id: "p4_12", text: "Amândoi îl încurajăm pe copil să aibă o relație bună cu celălalt părinte.", resursa: true },
        ],
        texte: {
          jos: "Organizarea vieții copilului pare stabilă, iar el păstrează legătura cu amândoi. E temelia cea mai importantă.",
          mediu: "Programul și custodia încă aduc tensiuni. Copilul are nevoie de stabilitate mai mult decât de egalitate perfectă.",
          sus: "Organizarea vieții copilului a devenit teren de conflict, iar relația lui cu un părinte poate fi în pericol. Aici e nevoie de grijă și, uneori, de sprijin specializat.",
        },
      },
    ],
    niveluri: {
      liniste: {
        titlu: "Copilul e protejat în despărțirea voastră",
        text: "Din răspunsurile tale, reușiți să-l țineți pe copil departe de conflict și să-i dați stabilitate. Partea aceasta a ghidului vă ajută să rămâneți așa, pe fiecare etapă de vârstă.",
      },
      atentie: {
        titlu: "Copilul simte despărțirea și are nevoie de voi",
        text: "Există câteva semne că copilul resimte schimbările. Ce faceți acum, în felul în care îi vorbiți și îi organizați viața, contează foarte mult.",
      },
      presiune: {
        titlu: "Copilul e prins în mijlocul despărțirii",
        text: "Răspunsurile tale arată că, fără să vrea nimeni, copilul a ajuns să ducă o parte din greutatea despărțirii. Nu divorțul îl rănește cel mai mult, ci conflictul prelungit.",
      },
      critic: {
        titlu: "Copilul are nevoie de protecție acum",
        text: "Conflictul dintre părinți a ajuns foarte aproape de copil. E momentul să-l scoateți din mijloc; sprijinul unui specialist, pentru voi sau pentru el, poate ajuta mult.",
      },
    },
  },
  {
    id: 5,
    slug: "co-parentajul",
    parte: 4,
    carlig: "După divorț, mai funcționați ca o echipă de părinți?",
    promisiune:
      "Află ce merge în co-parentajul vostru și ce îl încarcă pe copil între cele două case. Chestionar gratuit, în jur de 5 minute.",
    indrumare: "Gândește-te la ultimele două-trei luni.",
    zone: [
      {
        cheie: "comunicare",
        nume: "Comunicarea dintre părinți",
        descriere: "Dacă puteți vorbi despre copil fără să vă întoarceți la trecut.",
        capitol: "Co-parentajul sănătos: comunicarea",
        afirmatii: [
          { id: "p5_1", text: "Putem vorbi despre copil fără ca discuția să alunece în trecut sau în reproșuri.", resursa: true },
          { id: "p5_2", text: "Aflu lucruri importante despre copil de la el, nu de la celălalt părinte." },
          { id: "p5_3", text: "Mesajele dintre noi sunt tensionate sau rămân fără răspuns." },
          { id: "p5_4", text: "Copilul ajunge să ducă mesaje între noi." },
        ],
        texte: {
          jos: "Comunicarea despre copil funcționează. Asta îi spune copilului că părinții lui rămân o echipă.",
          mediu: "Comunicarea merge cu sincope: informații care nu ajung sau discuții care alunecă în trecut.",
          sus: "Comunicarea dintre voi s-a rupt, iar copilul ajunge să umple golul. Discuțiile trebuie să fie despre copil, nu despre conflictul dintre adulți.",
        },
      },
      {
        cheie: "stabilitate",
        nume: "Două case, aceeași siguranță",
        descriere: "Programul, regulile și predictibilitatea pentru copil.",
        capitol: "Co-parentajul sănătos: stabilitatea",
        afirmatii: [
          { id: "p5_5", text: "Programul copilului între cele două case se schimbă des sau în ultimul moment." },
          { id: "p5_6", text: "Regulile din cele două case sunt atât de diferite încât copilul e derutat." },
          { id: "p5_7", text: "Copilul știe dinainte când e la fiecare dintre noi și ce urmează.", resursa: true },
          { id: "p5_8", text: "Unul dintre noi anulează sau amână des timpul cu copilul." },
        ],
        texte: {
          jos: "Copilul are predictibilitate între cele două case. E una dintre cele mai mari surse de siguranță pentru el.",
          mediu: "Programul sau regulile se clatină uneori. Copilul se poate adapta la două case, dar are nevoie de claritate.",
          sus: "Viața copilului între cele două case e greu de prevăzut. Lipsa de stabilitate îl obosește mai mult decât despărțirea în sine.",
        },
      },
      {
        cheie: "limite",
        nume: "Limitele dintre trecut și rolul de părinte",
        descriere: "Cât mai cântăresc conflictele vechi și cât e copilul încărcat cu lucruri de adult.",
        capitol: "Co-parentajul sănătos: limitele",
        afirmatii: [
          { id: "p5_9", text: "Conflictele vechi dintre noi încă ne influențează deciziile despre copil." },
          { id: "p5_10", text: "Copilul îmi ține companie sau mă sprijină în lucruri care țin de adulți." },
          { id: "p5_11", text: "Îmi pot trăi viața personală separat de rolul de părinte.", resursa: true },
          { id: "p5_12", text: "Simt că tot greul creșterii copilului a rămas pe umerii mei." },
        ],
        texte: {
          jos: "Ați reușit să separați trecutul de rolul de părinte. Copilul poate rămâne copil.",
          mediu: "Trecutul și rolul de părinte se mai amestecă. Limitele clare reduc mult din conflict.",
          sus: "Conflictele vechi și greutățile tale ajung la copil. Are nevoie să fie scos din rolul de sprijin al adulților.",
        },
      },
    ],
    niveluri: {
      liniste: {
        titlu: "Funcționați ca o echipă de părinți",
        text: "Din răspunsurile tale, co-parentajul vostru îi dă copilului ce are nevoie: stabilitate și doi părinți care cooperează. Partea aceasta a ghidului vă ajută să păstrați direcția.",
      },
      atentie: {
        titlu: "Co-parentajul merge, dar cu fisuri",
        text: "Sunt lucruri care funcționează și altele care scârțâie. Mici ajustări de comunicare și de program pot face o diferență mare pentru copil.",
      },
      presiune: {
        titlu: "Co-parentajul a devenit un teren de conflict",
        text: "Conflictul dintre voi continuă și după divorț și se vede în viața copilului. Nu divorțul îl afectează cel mai mult, ci conflictul parental prelungit.",
      },
      critic: {
        titlu: "Copilul e prins între două case în conflict",
        text: "Răspunsurile tale descriu un co-parentaj foarte încărcat. Pentru binele copilului și al tău, sprijinul unui specialist sau al unui mediator poate deschide o cale.",
      },
    },
  },
  {
    id: 6,
    slug: "familia-recompusa",
    parte: 4,
    carlig: "Familie nouă, cu copii din relații diferite?",
    promisiune:
      "Află unde se blochează lucrurile în familia voastră recompusă și cum le dați timp să se așeze. Chestionar gratuit, în jur de 5 minute.",
    indrumare: "Gândește-te la viața de zi cu zi a familiei voastre de acum.",
    zone: [
      {
        cheie: "ritm",
        nume: "Ritmul familiei noi",
        descriere: "Așteptările, presiunea din afară și timpul pe care vi-l dați.",
        capitol: "Ce este familia recompusă",
        afirmatii: [
          { id: "p6_1", text: "Ne-am dorit să fim repede o familie, iar copiii nu au ținut pasul." },
          { id: "p6_2", text: "Ne dăm timp să ne cunoaștem, fără să forțăm apropierea.", resursa: true },
          { id: "p6_3", text: "Fostul partener sau familia extinsă se opun noii familii." },
          { id: "p6_4", text: "Simt că trebuie să demonstrez mereu că noua familie funcționează." },
        ],
        texte: {
          jos: "Vă dați timp, fără să forțați. E exact ritmul în care o familie recompusă prinde rădăcini.",
          mediu: "Așteptările și presiunea din afară grăbesc uneori lucrurile. O familie recompusă nu se construiește instantaneu.",
          sus: "Presiunea de a fi repede o familie perfectă e mare și naște rezistență. Relațiile au nevoie de timp și de experiențe bune repetate.",
        },
      },
      {
        cheie: "roluri",
        nume: "Roluri și limite",
        descriere: "Cine pune regulile și ce loc are fiecare adult pentru fiecare copil.",
        capitol: "Roluri și limite în familia recompusă",
        afirmatii: [
          { id: "p6_5", text: "Nu e clar cine pune regulile și cine disciplinează fiecare copil." },
          { id: "p6_6", text: "Părintele vitreg încearcă să țină locul părintelui biologic." },
          { id: "p6_7", text: "Copilul pare prins între părintele lui și noul partener." },
          { id: "p6_8", text: "Am stabilit împreună ce rol are fiecare adult față de fiecare copil.", resursa: true },
        ],
        texte: {
          jos: "Rolurile sunt destul de clare, iar copiii nu sunt puși să aleagă. Pe asta se poate construi.",
          mediu: "Rolurile sunt încă în negociere, cu momente de confuzie. Claritatea dintre adulți îi liniștește pe copii.",
          sus: "Rolurile și limitele sunt neclare, iar copiii ajung prinși între adulți. Părintele vitreg nu trebuie să înlocuiască, ci să-și construiască locul treptat.",
        },
      },
      {
        cheie: "copiii",
        nume: "Copiii în casa nouă",
        descriere: "Rivalitățile, apartenența și regulile din cele două case.",
        capitol: "Copiii într-o familie recompusă",
        afirmatii: [
          { id: "p6_9", text: "Între copii apar rivalități sau gelozii frecvente." },
          { id: "p6_10", text: "Un copil spune sau arată că nu se simte acasă la noi." },
          { id: "p6_11", text: "Regulile diferite din cele două case ale copilului creează tensiuni." },
          { id: "p6_12", text: "Copiii au momente bune împreună, din ce în ce mai des.", resursa: true },
        ],
        texte: {
          jos: "Copiii își găsesc locul în casa nouă. Momentele bune repetate construiesc apartenența.",
          mediu: "Copiii se adaptează, cu rivalități și reticențe firești. Sunt parte normală a procesului.",
          sus: "Copiii nu se simt încă acasă, iar rivalitățile sau regulile diferite aduc tensiune. Apartenența se construiește în timp, prin stabilitate și răbdare.",
        },
      },
    ],
    niveluri: {
      liniste: {
        titlu: "Familia voastră se așază",
        text: "Din răspunsurile tale, familia recompusă își găsește ritmul: roluri tot mai clare și copii care își fac loc. Partea aceasta a ghidului vă ajută să consolidați ce ați construit.",
      },
      atentie: {
        titlu: "Familia nouă e în plin proces de adaptare",
        text: "Sunt tensiuni firești pentru o familie recompusă: așteptări, roluri, copii care încă se acomodează. Cu răbdare și claritate, ele se pot așeza.",
      },
      presiune: {
        titlu: "Familia recompusă trece printr-o perioadă grea",
        text: "Rolurile neclare și presiunea de a funcționa repede nasc conflicte. Înțelegerea modului în care se construiește o familie recompusă poate reduce mult tensiunea.",
      },
      critic: {
        titlu: "Familia nouă e sub o presiune foarte mare",
        text: "Răspunsurile tale descriu multe tensiuni deodată, între adulți și între copii. Sprijinul unui specialist în terapia de familie vă poate ajuta să găsiți ritmul împreună.",
      },
    },
  },
];

export const chestionar = (id: number | null | undefined) => CHESTIONARE.find((c) => c.id === id) ?? null;
export const chestionarDupaSlug = (slug: string) => CHESTIONARE.find((c) => c.slug === slug) ?? null;

export const afirmatii = (c: Chestionar) => c.zone.flatMap((z) => z.afirmatii);

/* ---------- Pașii, în ordine ---------- */

export type Pas =
  | { tip: "context"; intrebare: IntrebareContext }
  | { tip: "afirmatie"; afirmatie: Afirmatie; nr: number; total: number };

export function pasi(c: Chestionar, r: Raspunsuri): Pas[] {
  const toate = afirmatii(c);
  const ctx = (l: IntrebareContext[]) =>
    l.filter((q) => !q.daca || q.daca(r)).map((q) => ({ tip: "context" as const, intrebare: q }));
  return [
    ...ctx(CONTEXT_INAINTE),
    ...toate.map((a, i) => ({ tip: "afirmatie" as const, afirmatie: a, nr: i + 1, total: toate.length })),
    ...ctx(CONTEXT_DUPA),
  ];
}

export function complet(c: Chestionar, r: Raspunsuri) {
  return (
    CONTEXT_INAINTE.every((q) => q.optional || (q.daca && !q.daca(r)) || !!r[q.id]) &&
    afirmatii(c).every((a) => /^[1-5]$/.test(r[a.id] ?? ""))
  );
}

/* ---------- Rezultatul ---------- */

/** Ce chestionar se potrivește situației descrise (1–6). */
export function chestionarRecomandat(r: Raspunsuri): number {
  const i = SITUATII.indexOf(r.situatia as (typeof SITUATII)[number]);
  const minori = areCopiiMinori(r);
  switch (i) {
    case 2:
      return 2;
    case 3:
      return minori ? 4 : 3;
    case 4:
      return minori ? 5 : 3;
    case 5:
      return 6;
    default:
      return 1;
  }
}

/** Ce parte a ghidului se potrivește situației descrise (1–4). */
export const parteRecomandata = (r: Raspunsuri) => chestionar(chestionarRecomandat(r))!.parte;

export type ScorZona = Zona & { pct: number; nivel: CheieNivel; text: string };

export type Rezultat = {
  chestionar: Chestionar;
  /** 0 = liniște, 100 = foarte greu. */
  indice: number;
  nivel: CheieNivel;
  titlu: string;
  text: string;
  zone: ScorZona[];
  /** Partea care se potrivește situației (poate fi alta decât cea a chestionarului). */
  recomandata: Parte;
  /** Partea chestionarului, dacă e alta decât cea recomandată. */
  aChestionarului: Parte | null;
  /** Și-a exprimat teama de partener: rezultatul arată numerele de urgență. */
  siguranta: boolean;
};

export function calculeaza(c: Chestionar, r: Raspunsuri): Rezultat | null {
  if (!complet(c, r)) return null;

  const zone: ScorZona[] = c.zone.map((z) => {
    const puncte = z.afirmatii.reduce((s, a) => {
      const v = Number(r[a.id]);
      return s + (a.resursa ? 5 - v : v - 1);
    }, 0);
    const pct = Math.round((puncte / (z.afirmatii.length * 4)) * 100);
    return { ...z, pct, nivel: nivel(pct), text: pct < 34 ? z.texte.jos : pct < 67 ? z.texte.mediu : z.texte.sus };
  });

  const indice = Math.round(zone.reduce((s, z) => s + z.pct, 0) / zone.length);
  const niv = nivel(indice);
  const recomandata = gasesteParte(parteRecomandata(r))!;
  const aChestionarului = recomandata.nr === c.parte ? null : gasesteParte(c.parte);

  return {
    chestionar: c,
    indice,
    nivel: niv,
    titlu: c.niveluri[niv].titlu,
    text: c.niveluri[niv].text,
    zone,
    recomandata,
    aChestionarului,
    siguranta: !!r.siguranta && r.siguranta !== SIGURANTA[0],
  };
}

/** Răspunsurile, ca text, pentru interpretarea AI și pentru panou. */
export function raspunsuriText(c: Chestionar, r: Raspunsuri): string {
  const eticheta = (v: string) => SCALA.find((s) => s.valoare === v)?.eticheta ?? "—";
  const linii: string[] = [];
  for (const q of CONTEXT_INAINTE) {
    if (r[q.id]) linii.push(`${q.intrebare} ${r[q.id]}`);
  }
  for (const z of c.zone) {
    linii.push(`\n[${z.nume}]`);
    for (const a of z.afirmatii) {
      linii.push(`- „${a.text}”${a.resursa ? " (afirmație despre o resursă)" : ""}: ${eticheta(r[a.id] ?? "")}`);
    }
  }
  if (r.povestea?.trim()) linii.push(`\nCu cuvintele ei/lui: ${r.povestea.trim()}`);
  return linii.join("\n");
}
