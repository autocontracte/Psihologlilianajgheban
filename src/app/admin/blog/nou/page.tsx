import { FormularArticol } from "@/components/admin/FormularArticol";

export const metadata = { title: "Articol nou" };

export default function ArticolNouPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Articol nou</h1>
      <div className="mt-8">
        <FormularArticol
          articol={{ title: "", slug: "", excerpt: "", content: "", coverImage: null, status: "DRAFT" }}
        />
      </div>
    </div>
  );
}
