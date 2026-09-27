
import { ConfiguracaoDeCampanhas } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadados({
    title: "Configuração de campanhas",
  });
}


export default function ConfiguracaoDeCampanhasPage() {
  return <ConfiguracaoDeCampanhas />;
}
