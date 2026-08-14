/** Datele clientului unei programări, indiferent dacă are cont sau nu. */
export type AppointmentClient = {
  name: string;
  email: string;
  phone: string;
  hasAccount: boolean;
};

type WithClient = {
  user: { name: string; email: string; phone: string } | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
};

/* Programarea vine fie de la un cont, fie de la cineva care a programat fără
   cont. Restul aplicației nu trebuie să știe de fiecare dată care e cazul. */
export function clientOf(a: WithClient): AppointmentClient {
  if (a.user) {
    return {
      name: a.user.name,
      email: a.user.email,
      phone: a.user.phone,
      hasAccount: true,
    };
  }

  return {
    name: a.guestName ?? "Client necunoscut",
    email: a.guestEmail ?? "",
    phone: a.guestPhone ?? "",
    hasAccount: false,
  };
}
