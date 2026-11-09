/* Tipurile de evenimente urmărite pe site, cu eticheta din panoul de admin.
   Serverul acceptă doar tipurile de aici, iar panoul le afișează în această
   ordine. Lista e în același fișier pentru client și pentru server, ca să nu
   poată să se desincronizeze.                                                */

export const TRACK_LABELS = {
  pagina: "Pagină deschisă",
  sectiune: "Secțiune văzută",
  derulare: "A derulat",
  clic: "Clic",
  telefon: "Apel telefonic",
  whatsapp: "WhatsApp",
  email: "Email",
  intrebare: "Întrebare frecventă",
  formular: "Formular de contact",
  ana_deschis: "A deschis-o pe Ana",
  ana_mesaj: "Mesaj către Ana",
  programare_start: "A început o programare",
  programare: "Programare trimisă",
  plata_start: "A plecat spre plată",
  plata: "Plată reușită",
  kit_start: "A început trusa de ajutor",
  kit_gata: "A terminat trusa de ajutor",
  kit_plata: "A cerut interpretarea",
  contract_semnat: "Contract semnat",
  cont_nou: "Cont nou",
  abandon: "A lăsat programarea neterminată",
  rage: "Clicuri nervoase",
  copiere: "A copiat text",
  p404: "Pagină inexistentă",
  eroare: "Eroare în pagină",
  acord: "Răspuns la cookie-uri",
} as const;

export type TrackType = keyof typeof TRACK_LABELS;
export const TRACK_TYPES = Object.keys(TRACK_LABELS) as TrackType[];

/** Evenimentele care arată o intenție clară, nu doar navigare. */
export const TRACK_IMPORTANT: TrackType[] = [
  "telefon",
  "whatsapp",
  "email",
  "formular",
  "ana_mesaj",
  "programare_start",
  "programare",
  "plata",
  "kit_gata",
  "kit_plata",
  "contract_semnat",
  "cont_nou",
];

/** Evenimentele care arată o problemă, nu un interes. */
export const TRACK_PROBLEME: TrackType[] = ["abandon", "rage", "p404", "eroare"];
