import { UsageClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Uso & Custo — Admin Plataforma",
  });
}


export default function AdminUsagePage() {
  return <UsageClient />;
}
