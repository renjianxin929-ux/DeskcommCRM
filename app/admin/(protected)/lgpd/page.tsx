import { LgpdAdminClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "LGPD — Admin",
  });
}


export default function AdminLgpdPage() {
  return <LgpdAdminClient />;
}
