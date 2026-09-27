
import { ListaDeCampanhas } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadados({
    title: "Campanhas",
  });
}


export default function CampanhasPage() {
  // Auth e organização já vêm garantidas pelo layout de /app; a lista carrega
  // pela API, que confere o papel `manager` por conta própria.
  return <ListaDeCampanhas />;
}
