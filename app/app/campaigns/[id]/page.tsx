
import { DetalheDaCampanha } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadados({
    title: "Campanha",
  });
}


export default async function CampanhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalheDaCampanha id={id} />;
}
