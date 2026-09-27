import { NewTenantForm } from "./_form";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Novo Tenant — Admin Plataforma",
  });
}


export default function NewTenantPage() {
  return <NewTenantForm />;
}
