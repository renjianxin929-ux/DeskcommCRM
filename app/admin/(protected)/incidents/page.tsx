import { IncidentsClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Incidentes — Admin Plataforma",
  });
}


export default function AdminIncidentsPage() {
  return <IncidentsClient />;
}
