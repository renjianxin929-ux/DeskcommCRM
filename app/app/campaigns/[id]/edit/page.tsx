
import { EditarCampanha } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadados({
    title: "Editar campanha",
  });
}


export default async function EditarCampanhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditarCampanha id={id} />;
}
