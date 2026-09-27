import { PlatformAdminsClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Platform Admins — Admin Plataforma",
  });
}


export default function AdminPlatformAdminsPage() {
  return <PlatformAdminsClient />;
}
