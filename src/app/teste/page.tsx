import { redirect } from "next/navigation";

/* Secțiunea de teste vocaționale a fost înlocuită cu „Consiliere psihologică".
   Vechiul link duce acum acolo. */
export default function TestePage() {
  redirect("/consiliere");
}
