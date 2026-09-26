import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizarIdioma, type Idioma } from "@/lib/i18n/idiomas";

/**
 * O idioma gravado na organização.
 *
 * Cron, e-mail e PDF não têm sessão de quem vai ler. A coluna é a fonte: o
 * instalador grava `APP_LOCALE`, e a tela de organização pode trocar depois.
 * Se a leitura falhar, fica pt-BR — um aviso em português ainda nasce; um
 * aviso que não nasce não avisa ninguém.
 */
export async function idiomaDaOrganizacao(
  admin: SupabaseClient,
  organizationId: string,
): Promise<Idioma> {
  try {
    const { data } = await admin
      .from("organizations")
      .select("locale")
      .eq("id", organizationId)
      .maybeSingle();
    return normalizarIdioma((data as { locale?: string | null } | null)?.locale ?? null);
  } catch {
    return "pt-BR";
  }
}
