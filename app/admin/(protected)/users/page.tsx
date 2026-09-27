import { UsersClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Usuários — Admin Plataforma",
  });
}


export default function AdminUsersPage() {
  return <UsersClient />;
}
