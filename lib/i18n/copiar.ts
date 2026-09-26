import { traduzir } from "@/lib/i18n/dicionario";
import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Traduz um molde e troca `{nome}` pelos valores.
 *
 * O português é a chave: em pt-BR o molde volta igual, e os outros idiomas
 * recebem a frase já com os buracos no lugar certo. Quem chama escapa HTML
 * depois, se a saída for para e-mail.
 */
export function copiar(
  idioma: Idioma,
  chave: string,
  vars: Record<string, string | number> = {},
): string {
  let saida = traduzir(chave, idioma);
  for (const [nome, valor] of Object.entries(vars)) {
    saida = saida.split(`{${nome}}`).join(String(valor));
  }
  return saida;
}
