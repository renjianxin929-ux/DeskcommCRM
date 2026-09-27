
import { NovaCampanha } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadados({
    title: "Nova campanha",
  });
}


export default function NovaCampanhaPage() {
  return <NovaCampanha />;
}
