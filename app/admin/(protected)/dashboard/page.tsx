import { DashboardClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Dashboard — Admin Plataforma",
  });
}


export default function AdminDashboardPage() {
  return <DashboardClient />;
}
