import { TenantsClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Tenants — Admin Plataforma",
  });
}


export default function AdminTenantsPage() {
  return <TenantsClient />;
}
