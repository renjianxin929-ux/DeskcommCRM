import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { traduzir } from "@/lib/i18n/dicionario";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";

// Manutenção é o cenário em que o Supabase pode estar fora do ar — esta página
// não consulta sessão. O sinal que sobra é o Accept-Language; sem idioma
// servido nele, vale o padrão da instalação (zh-CN), não o português.
export default async function ServiceUnavailablePage() {
  const idioma = await idiomaDoVisitante(null);
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold">{traduzir("503 — Em manutenção", idioma)}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {traduzir("Voltamos em alguns minutos.", idioma)}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/">{traduzir("Voltar", idioma)}</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
