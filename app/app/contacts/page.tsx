import { ContactsListClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadados({
    title: "Contatos",
  });
}


export default function ContactsPage() {
  return <ContactsListClient />;
}
