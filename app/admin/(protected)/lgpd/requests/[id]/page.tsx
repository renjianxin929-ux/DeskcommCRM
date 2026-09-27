import { LgpdRequestAdminDetail } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Solicitação LGPD — Admin",
  });
}


export default async function AdminLgpdRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LgpdRequestAdminDetail id={id} />;
}
