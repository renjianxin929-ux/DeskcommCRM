import type { Metadata } from "next";

import { loadAuthUser } from "@/lib/auth/server";
import { traduzir } from "@/lib/i18n/dicionario";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";
import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Idioma do `<title>` desta requisição.
 *
 * Quem está logado usa o idioma já resolvido (preferência, suporte, organização).
 * Quem não tem sessão — login, recuperação, páginas públicas — segue o visitante.
 * Durante o build não há usuário; o título cai no padrão do produto e não lança.
 */
export async function idiomaDaRequisicao(): Promise<Idioma> {
  const user = await loadAuthUser();
  if (user) return user.idioma;
  return idiomaDoVisitante(null);
}

/** Título e descrição de página. A chave continua em português; o valor segue o idioma. */
export async function metadados(entrada: {
  title: string;
  description?: string;
  robots?: Metadata["robots"];
}): Promise<Metadata> {
  const idioma = await idiomaDaRequisicao();
  const meta: Metadata = { title: traduzir(entrada.title, idioma) };
  if (entrada.description) meta.description = traduzir(entrada.description, idioma);
  if (entrada.robots) meta.robots = entrada.robots;
  return meta;
}
