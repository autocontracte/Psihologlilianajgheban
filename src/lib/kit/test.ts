/* ----------------------------------------------------------------------------
   Testul din kitul „Cum stai, de fapt, cu relația ta?".

   30 de afirmații, câte 5 pe fiecare dintre cele 6 dimensiuni ale relației,
   notate pe o scară de frecvență (1 = aproape niciodată … 5 = aproape mereu).
   Unele afirmații sunt formulate negativ și se notează invers. Înainte de
   test, câteva întrebări de context (etapa, copiii), iar la final un câmp
   liber, opțional, pentru situația omului — cel mai valoros pentru
   interpretarea personală.

   Modulul e pur (fără server), ca scorul să se poată calcula și în browser
   (previzualizarea de dinaintea plății) și pe server (raport, PDF, admin).
   -------------------------------------------------------------------------- */

export type Raspunsuri = Record<string, string | string[]>;

export type CheieDimensiune =
  | "comunicare"
  | "conflict"
  | "apropiere"
  | "incredere"
  | "respect"
  | "echipa";

export type Dimensiune = {
  cheie: CheieDimensiune;
  nume: string;
  /** Ce măsoară, pe scurt — apare sub bară, în raport. */
  descriere: string;
  /** O frază pentru fiecare nivel, de la cel mai bun la cel mai fragil. */
  niveluri: Record<CheieNivel, string>;
  /** Capitolele din ghid care lucrează exact această zonă. */
  capitole: string[];
};

export type CheieNivel = "resursa" | "ingrijit" | "presiune" | "critic";

export const NIVELURI: Record<CheieNivel, { nume: string; culoare: string }> = {
  resursa: { nume: "Resursă", culoare: "#6e8567" },
  ingrijit: { nume: "De îngrijit", culoare: "#a08b6f" },
  presiune: { nume: "Sub presiune", culoare: "#b97a55" },
  critic: { nume: "Zonă fragilă", culoare: "#a8624a" },
};

export function nivel(pct: number): CheieNivel {
  if (pct >= 75) return "resursa";
  if (pct >= 50) return "ingrijit";
  if (pct >= 25) return "presiune";
  return "critic";
}

export const DIMENSIUNI: Dimensiune[] = [
  {
    cheie: "comunicare",
    nume: "Comunicarea",
    descriere: "Cât de deschis puteți vorbi despre ce simțiți și ce vă trebuie.",
    niveluri: {
      resursa: "Vorbiți deschis și vă ascultați. E una dintre resursele pe care se sprijină relația.",
      ingrijit: "Comunicarea funcționează, dar există subiecte ocolite sau momente în care nu vă mai auziți.",
      presiune: "Multe discuții importante nu mai au loc sau se opresc repede. Tăcerea a început să țină locul cuvintelor.",
      critic: "Aproape că nu mai există spațiu sigur pentru a spune ce simți. Aici e nevoie de sprijin, nu doar de voință.",
    },
    capitole: ["Capitolul 1. Înțelegerea crizei de cuplu", "Capitolul 3. Instrumente de prevenție"],
  },
  {
    cheie: "conflict",
    nume: "Conflictul",
    descriere: "Cum vă certați și, mai ales, cum reveniți unul spre celălalt după.",
    niveluri: {
      resursa: "Vă certați ca doi oameni care rămân de aceeași parte: conflictul vă apropie, nu vă desparte.",
      ingrijit: "Certurile se rezolvă de cele mai multe ori, dar unele teme revin și lasă urme.",
      presiune: "Conflictele au început să se repete și să doară. Tiparul certurilor contează mai mult decât subiectul lor.",
      critic: "Conflictul a devenit distructiv: escaladează, jignește și nu se mai închide. E semnalul cel mai clar că e nevoie de ajutor.",
    },
    capitole: ["Capitolul 1. Înțelegerea crizei de cuplu", "Capitolul 3. Instrumente de prevenție"],
  },
  {
    cheie: "apropiere",
    nume: "Apropierea",
    descriere: "Conectarea emoțională: tandrețea, timpul în doi, sentimentul că sunteți un cuplu.",
    niveluri: {
      resursa: "Între voi există căldură și timp împreună. Vă simțiți, încă, un cuplu.",
      ingrijit: "Apropierea există, dar a început să fie înghesuită de rutină, oboseală sau griji.",
      presiune: "Distanța emoțională se simte. Deconectarea prelungită e mai riscantă pentru o relație decât certurile.",
      critic: "Trăiți mai degrabă unul lângă altul decât împreună. Singurătatea în doi e una dintre cele mai grele forme de singurătate.",
    },
    capitole: ["Capitolul 2. Semnale de alarmă care pot duce la divorț"],
  },
  {
    cheie: "incredere",
    nume: "Încrederea",
    descriere: "Siguranța emoțională: dacă te poți baza pe partener și îți poți arăta vulnerabilitatea.",
    niveluri: {
      resursa: "Te simți în siguranță în relație și te poți baza pe partener. E fundația pe care se construiește restul.",
      ingrijit: "Încrederea există, dar are fisuri: promisiuni uitate, momente în care te protejezi.",
      presiune: "Siguranța emoțională s-a erodat. Când încrederea scade, orice gest poate fi citit ca amenințare.",
      critic: "Nu te mai simți în siguranță în relație. Siguranța ta vine înaintea oricărei decizii despre cuplu.",
    },
    capitole: ["Capitolul 2. Semnale de alarmă care pot duce la divorț", "Capitolul 4. Divorțul ca proces emoțional"],
  },
  {
    cheie: "respect",
    nume: "Respectul",
    descriere: "Aprecierea, admirația și felul în care vă vorbiți unul despre celălalt.",
    niveluri: {
      resursa: "Vă apreciați și vă respectați limitele. Respectul protejează relația chiar și în perioadele grele.",
      ingrijit: "Respectul e acolo, dar aprecierea a început să se spună mai rar decât reproșul.",
      presiune: "Apar ironii, critică sau sentimentul că nu faci niciodată destul. Merită oprite devreme.",
      critic: "Disprețul, ironia și devalorizarea sunt prezente. Sunt printre cei mai puternici predictori ai despărțirii.",
    },
    capitole: ["Capitolul 2. Semnale de alarmă care pot duce la divorț", "Capitolul 3. Instrumente de prevenție"],
  },
  {
    cheie: "echipa",
    nume: "Echipa și viitorul",
    descriere: "Cât de mult funcționați ca o echipă: roluri, decizii, planuri comune.",
    niveluri: {
      resursa: "Funcționați ca o echipă și priviți în aceeași direcție. Aveți un „noi” solid.",
      ingrijit: "Colaborați, dar rolurile sau deciziile nu sunt mereu echilibrate, iar viitorul comun e mai puțin vorbit.",
      presiune: "Fiecare trage în altă parte. Roluri rigide și decizii luate separat duc, în timp, la epuizare.",
      critic: "Nu mai există un proiect comun, iar gândul despărțirii e prezent. E momentul pentru decizii luate conștient, nu în grabă.",
    },
    capitole: ["Capitolul 3. Instrumente de prevenție", "Capitolul 4. Divorțul ca proces emoțional"],
  },
];

export type Afirmatie = {
  id: string;
  dim: CheieDimensiune;
  text: string;
  /** Formulată negativ: „aproape mereu" înseamnă scor mic. */
  invers?: boolean;
};

/** Cele 30 de afirmații, amestecate între dimensiuni ca testul să curgă firesc. */
export const AFIRMATII: Afirmatie[] = [
  { id: "t01", dim: "comunicare", text: "Pot să-i spun partenerului ce simt, fără să mă tem de cum va reacționa." },
  { id: "t02", dim: "apropiere", text: "Petrecem timp doar noi doi, fără copii, telefoane sau treburi." },
  { id: "t03", dim: "conflict", text: "Certurile noastre alunecă repede în reproșuri despre trecut.", invers: true },
  { id: "t04", dim: "incredere", text: "Am încredere că partenerul îmi spune adevărul." },
  { id: "t05", dim: "respect", text: "Partenerul își arată aprecierea pentru ce fac." },
  { id: "t06", dim: "echipa", text: "Luăm împreună deciziile importante." },
  { id: "t07", dim: "comunicare", text: "Când vorbim despre ceva important, simt că partenerul mă ascultă cu adevărat." },
  { id: "t08", dim: "apropiere", text: "Simt singurătate în relație, chiar și când suntem împreună.", invers: true },
  { id: "t09", dim: "conflict", text: "După o ceartă, reușim să ne împăcăm și să vorbim despre ce s-a întâmplat." },
  { id: "t10", dim: "incredere", text: "Mă simt în siguranță în relația noastră, emoțional și fizic." },
  { id: "t11", dim: "respect", text: "În discuțiile noastre apar ironii, priviri de sus sau glume pe seama mea.", invers: true },
  { id: "t12", dim: "echipa", text: "Responsabilitățile casei (și ale copiilor, dacă există) sunt împărțite corect." },
  { id: "t13", dim: "comunicare", text: "Discuțiile noastre se reduc la logistică: cumpărături, facturi, program.", invers: true },
  { id: "t14", dim: "apropiere", text: "Există tandrețe între noi: o îmbrățișare, o atingere, un gest mic." },
  { id: "t15", dim: "conflict", text: "În timpul certurilor, unul dintre noi ridică tonul, jignește sau trântește ușa.", invers: true },
  { id: "t16", dim: "incredere", text: "Simt nevoia să verific ce face partenerul: telefonul, mesajele, programul.", invers: true },
  { id: "t17", dim: "respect", text: "Partenerul îmi respectă limitele și deciziile, chiar și când nu e de acord." },
  { id: "t18", dim: "echipa", text: "Când apare o problemă, o tratăm ca pe o problemă a noastră, nu ca pe vina unuia." },
  { id: "t19", dim: "comunicare", text: "Evit anumite subiecte, ca să nu iasă scandal.", invers: true },
  { id: "t20", dim: "apropiere", text: "Când mi se întâmplă ceva important, partenerul e primul om căruia vreau să-i spun." },
  { id: "t21", dim: "conflict", text: "Ne certăm pe aceleași teme, iar și iar, fără să ajungem undeva.", invers: true },
  { id: "t22", dim: "incredere", text: "Partenerul se ține de ce promite." },
  { id: "t23", dim: "respect", text: "Simt că, pentru partener, nu fac niciodată destul.", invers: true },
  { id: "t24", dim: "echipa", text: "Avem planuri sau vise comune pentru următorii ani." },
  { id: "t25", dim: "comunicare", text: "Putem vorbi deschis despre nevoile noastre, inclusiv despre intimitate." },
  { id: "t26", dim: "apropiere", text: "Trăim mai degrabă ca doi colegi de apartament decât ca un cuplu.", invers: true },
  { id: "t27", dim: "conflict", text: "Când unul dintre noi e copleșit, putem lua o pauză și reveni mai calmi." },
  { id: "t28", dim: "incredere", text: "Mă tem că, dacă îmi arăt vulnerabilitatea, va fi folosită împotriva mea.", invers: true },
  { id: "t29", dim: "respect", text: "Admir omul care este partenerul meu." },
  { id: "t30", dim: "echipa", text: "Mă gândesc serios că ar fi mai bine să ne despărțim.", invers: true },
];

export const SCALA = [
  { valoare: "1", eticheta: "Aproape niciodată" },
  { valoare: "2", eticheta: "Rar" },
  { valoare: "3", eticheta: "Uneori" },
  { valoare: "4", eticheta: "Des" },
  { valoare: "5", eticheta: "Aproape mereu" },
] as const;

/* ---------- Întrebările de context ---------- */

export type IntrebareContext = {
  id: string;
  tip: "single" | "text" | "long";
  intrebare: string;
  ajutor?: string;
  optiuni?: string[];
  optional?: boolean;
  /** Se arată doar dacă altă întrebare NU are unul dintre răspunsurile date. */
  daca?: { id: string; nu: string[] };
};

export const ETAPE_SEPARARE = [
  "Suntem în proces de separare sau divorț",
  "Ne-am despărțit sau am divorțat",
];

export const CONTEXT_INAINTE: IntrebareContext[] = [
  {
    id: "etapa",
    tip: "single",
    intrebare: "În ce moment e relația voastră acum?",
    optiuni: [
      "Suntem împreună și vreau să văd cum stăm",
      "Trecem printr-o perioadă grea, dar n-am decis nimic",
      "Mă gândesc dacă e cazul să ne despărțim",
      ...ETAPE_SEPARARE,
    ],
  },
  {
    id: "durata",
    tip: "single",
    intrebare: "De cât timp sunteți (sau ați fost) împreună?",
    optiuni: ["Sub 2 ani", "Între 2 și 5 ani", "Între 5 și 10 ani", "Între 10 și 20 de ani", "Peste 20 de ani"],
  },
  {
    id: "copii",
    tip: "single",
    intrebare: "Aveți copii împreună?",
    optiuni: ["Nu", "Da, unul", "Da, mai mulți"],
  },
  {
    id: "varste_copii",
    tip: "text",
    intrebare: "Ce vârste au copiii?",
    ajutor: "Ne ajută să înțelegem cum trăiesc ei situația. Opțional.",
    optional: true,
    daca: { id: "copii", nu: ["Nu"] },
  },
];

export const CONTEXT_DUPA: IntrebareContext[] = [
  {
    id: "situatie",
    tip: "long",
    intrebare: "Vrei să ne spui, cu cuvintele tale, ce se întâmplă?",
    ajutor:
      "Opțional, dar e partea care face raportul cu adevărat al tău. Ce te-a adus aici, ce te doare, ce ți-ai dori.",
    optional: true,
  },
];

/* ---------- Pașii testului, în ordine ---------- */

export type Pas =
  | { tip: "context"; intrebare: IntrebareContext }
  | { tip: "afirmatie"; afirmatie: Afirmatie; nr: number };

function contextVizibil(q: IntrebareContext, r: Raspunsuri) {
  if (!q.daca) return true;
  const v = r[q.daca.id];
  return !(typeof v === "string" && q.daca.nu.includes(v));
}

export function pasi(r: Raspunsuri): Pas[] {
  return [
    ...CONTEXT_INAINTE.filter((q) => contextVizibil(q, r)).map((q) => ({ tip: "context" as const, intrebare: q })),
    ...AFIRMATII.map((a, i) => ({ tip: "afirmatie" as const, afirmatie: a, nr: i + 1 })),
    ...CONTEXT_DUPA.map((q) => ({ tip: "context" as const, intrebare: q })),
  ];
}

export const eSeparat = (r: Raspunsuri) =>
  typeof r.etapa === "string" && ETAPE_SEPARARE.includes(r.etapa);

export const areCopii = (r: Raspunsuri) => typeof r.copii === "string" && r.copii !== "Nu";

/* ---------- Scorul ---------- */

function valoare(a: Afirmatie, r: Raspunsuri): number | null {
  const v = Number(r[a.id]);
  if (!Number.isInteger(v) || v < 1 || v > 5) return null;
  return a.invers ? 6 - v : v;
}

/** Câte afirmații au răspuns. */
export const raspunsuriTest = (r: Raspunsuri) => AFIRMATII.filter((a) => valoare(a, r) !== null).length;

/** Testul e complet: toate cele 30 de afirmații au răspuns. */
export const testComplet = (r: Raspunsuri) => raspunsuriTest(r) === AFIRMATII.length;

export type ScorDimensiune = Dimensiune & { pct: number; nivel: CheieNivel };

export type Rezultat = {
  indice: number;
  profil: Profil;
  dimensiuni: ScorDimensiune[];
  /** Ordonate de la cea mai puternică la cea mai fragilă. */
  forte: ScorDimensiune[];
  fragile: ScorDimensiune[];
  semnale: Semnal[];
};

/** Scorul pe dimensiuni (0–100) și indicele relației. Null dacă testul nu e complet. */
export function calculeaza(r: Raspunsuri): Rezultat | null {
  if (!testComplet(r)) return null;

  const dimensiuni: ScorDimensiune[] = DIMENSIUNI.map((d) => {
    const valori = AFIRMATII.filter((a) => a.dim === d.cheie).map((a) => valoare(a, r)!);
    const suma = valori.reduce((s, v) => s + v, 0);
    // 5 afirmații × (1..5) → 5..25 → 0..100
    const pct = Math.round(((suma - valori.length) / (valori.length * 4)) * 100);
    return { ...d, pct, nivel: nivel(pct) };
  });

  const indice = Math.round(dimensiuni.reduce((s, d) => s + d.pct, 0) / dimensiuni.length);
  const ordonate = [...dimensiuni].sort((a, b) => b.pct - a.pct);

  return {
    indice,
    profil: profil(indice),
    dimensiuni,
    forte: ordonate.filter((d) => d.pct >= 50).slice(0, 3),
    fragile: [...ordonate].reverse().filter((d) => d.pct < 75).slice(0, 3),
    semnale: semnale(r),
  };
}

/* ---------- Profilul general ---------- */

export type Profil = {
  cheie: "radacini" | "presiune" | "criza" | "deconectare";
  nume: string;
  scurt: string;
  descriere: string;
};

export const PROFILURI: Profil[] = [
  {
    cheie: "radacini",
    nume: "O relație cu rădăcini solide",
    scurt: "Aveți pe ce construi. Relația are resurse reale, chiar dacă are și zone care cer atenție.",
    descriere:
      "Rezultatul tău arată o relație în care comunicarea, încrederea și sentimentul de echipă funcționează în mare parte. Nu înseamnă că nu există greutăți, ci că aveți resursele cu care să le traversați. Cel mai bun lucru pe care îl puteți face acum e să îngrijiți ce merge, înainte ca oboseala sau rutina să-l erodeze.",
  },
  {
    cheie: "presiune",
    nume: "O relație bună, pusă la încercare",
    scurt: "Fundația e acolo, dar câteva zone au început să cedeze sub greutatea vieții de zi cu zi.",
    descriere:
      "Rezultatul tău arată o relație care are încă multe lucruri bune, dar care e pusă la încercare. Unele dimensiuni sunt resurse, altele au început să se tensioneze. E momentul ideal pentru a interveni: problemele sunt încă la un nivel la care conversațiile potrivite și câteva schimbări concrete pot face o diferență mare.",
  },
  {
    cheie: "criza",
    nume: "O relație în criză",
    scurt: "Relația trece printr-o perioadă grea. O criză nu e un verdict, e un moment care cere decizii conștiente.",
    descriere:
      "Rezultatul tău arată o relație în care mai multe zone importante sunt sub presiune în același timp. Criza nu înseamnă că relația s-a terminat; înseamnă că felul în care ați funcționat până acum nu mai ajunge. Cuplurile trec prin crize și ies din ele, dar rareori singure și rareori fără să înțeleagă întâi tiparul care le ține blocate.",
  },
  {
    cheie: "deconectare",
    nume: "O relație în deconectare profundă",
    scurt: "Distanța dintre voi e mare. Înainte de orice decizie, contează să ai grijă de tine.",
    descriere:
      "Rezultatul tău arată o relație în care comunicarea, apropierea și siguranța emoțională sunt foarte fragile. Asta doare, iar oboseala acumulată poate face ca orice decizie să pară fie imposibilă, fie urgentă. Indiferent încotro vei merge, fie spre reconstrucție, fie spre separare, un drum parcurs cu sprijin e mai puțin dureros și mai puțin distructiv.",
  },
];

export function profil(indice: number): Profil {
  if (indice >= 75) return PROFILURI[0];
  if (indice >= 55) return PROFILURI[1];
  if (indice >= 35) return PROFILURI[2];
  return PROFILURI[3];
}

/* ---------- Semnale care cer atenție imediată ---------- */

export type Semnal = { cheie: string; titlu: string; text: string };

export function semnale(r: Raspunsuri): Semnal[] {
  const v = (id: string) => Number(r[id]);
  const out: Semnal[] = [];
  if (v("t10") && v("t10") <= 2) {
    out.push({
      cheie: "siguranta",
      titlu: "Siguranța ta vine întâi",
      text:
        "Ai spus că rar te simți în siguranță în relație. Dacă ți-e teamă de partener sau te-a rănit, poți suna gratuit, oricând, la linia pentru victimele violenței domestice: 0800 500 333. În pericol imediat, sună la 112.",
    });
  }
  if (v("t11") >= 4 || v("t23") >= 4) {
    out.push({
      cheie: "dispret",
      titlu: "Ironia și devalorizarea",
      text:
        "Ironia, privirile de sus și sentimentul că nu faci niciodată destul sunt semnale importante. Cercetările despre cuplu arată că disprețul e unul dintre cei mai puternici predictori ai despărțirii, mai puternic decât certurile.",
    });
  }
  if (v("t30") >= 4) {
    out.push({
      cheie: "despartire",
      titlu: "Gândul despărțirii",
      text:
        "Gândul despărțirii e des prezent. Nu trebuie să iei o decizie azi. Contează ca, oricare ar fi ea, să vină din claritate, nu din epuizare sau din furia de moment.",
    });
  }
  if (v("t15") >= 4) {
    out.push({
      cheie: "escaladare",
      titlu: "Certurile care escaladează",
      text:
        "Tonul ridicat, jignirile și ușile trântite lasă urme, mai ales dacă sunt copii în casă. O pauză convenită dinainte („ne oprim și revenim peste o oră”) e primul lucru care poate schimba dinamica.",
    });
  }
  return out;
}

/* ---------- Capitolele din ghid recomandate ---------- */

export function capitoleRecomandate(r: Raspunsuri, rez: Rezultat): string[] {
  const set = new Set<string>();
  for (const d of rez.fragile) for (const c of d.capitole) set.add(c);
  if (eSeparat(r) || Number(r.t30) >= 4) {
    set.add("Capitolul 4. Divorțul ca proces emoțional");
    if (!areCopii(r)) set.add("Capitolul 5. Impact emoțional asupra adulților");
  }
  if (areCopii(r)) {
    set.add("Capitolul 7. Nevoile psihologice ale copilului în divorț");
    if (eSeparat(r)) {
      set.add("Capitolul 9. Cum comunicăm divorțul copilului");
      set.add("Capitolul 12. Co-parentajul sănătos");
    }
  }
  if (set.size === 0) set.add("Capitolul 3. Instrumente de prevenție");
  const nr = (s: string) => Number(s.match(/Capitolul (\d+)/)?.[1] ?? 99);
  return [...set].sort((a, b) => nr(a) - nr(b));
}

/* ---------- Text citibil (pentru interpretarea AI și pentru admin) ---------- */

const ETICHETA = Object.fromEntries(SCALA.map((s) => [s.valoare, s.eticheta]));

export function raspunsuriText(r: Raspunsuri): string {
  const linii: string[] = [];
  const cunoscute = new Set<string>();

  for (const q of [...CONTEXT_INAINTE, ...CONTEXT_DUPA]) {
    cunoscute.add(q.id);
    const v = r[q.id];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    linii.push(`${q.intrebare}\n${Array.isArray(v) ? v.join(", ") : v}`);
  }

  const test = AFIRMATII.filter((a) => r[a.id] !== undefined);
  if (test.length) {
    linii.push(
      "Afirmațiile testului (cât de des e adevărat):\n" +
        test
          .map((a) => {
            cunoscute.add(a.id);
            return `- [${DIMENSIUNI.find((d) => d.cheie === a.dim)!.nume}] ${a.text} → ${ETICHETA[String(r[a.id])] ?? r[a.id]}`;
          })
          .join("\n"),
    );
  }

  // Răspunsuri din versiunea veche a chestionarului (comenzile de dinainte de kit)
  for (const [k, v] of Object.entries(r)) {
    if (cunoscute.has(k) || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    linii.push(`${k}\n${Array.isArray(v) ? v.join(", ") : v}`);
  }

  return linii.join("\n\n");
}
