/**
 * Fase 3.1 — título do navegador, aviso direto e locale de organização nova.
 *
 * O português continua sendo a chave. Em zh-CN o resultado não pode cair
 * de volta nessa chave, salvo nome de produto. Em pt-BR a chave volta igual.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { DETALHE_CREDENCIAL_RECUSADA, avisoDaConexao } from "@/lib/channels/health";
import { avisoDoEvento } from "@/lib/channels/zernio/avisos";
import { traduzir } from "@/lib/i18n/dicionario";
import { textoDoAvisoDeMidiaNaoLida } from "@/workers/media-derive-worker";

const RAIZ = join(__dirname, "..", "..");
const ORTOGRAFIA_PT =
  /[áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]|\b(não|você|olá|senha|pendente|negócio|conexão)\b/i;

/** Nome de produto ou rótulo que permanece igual nos três idiomas. */
const IGUAL_PERMITIDO = new Set(["CRM", "Meta Ads", "Tags", "WhatsApp", "LGPD", "multi-tenant"]);

function blocoDeMetadados(src: string): string | null {
  const marca = "export async function generateMetadata";
  const i = src.indexOf(marca);
  if (i < 0) return null;
  const abre = src.indexOf("{", i);
  let depth = 0;
  for (let j = abre; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") {
      depth--;
      if (depth === 0) return src.slice(abre, j + 1);
    }
  }
  return null;
}

function literais(bloco: string): string[] {
  return [...bloco.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => JSON.parse(`"${m[1]}"`) as string);
}

function semPortugues(texto: string, onde: string): void {
  const zh = traduzir(texto, "zh-CN");
  expect(zh, onde).not.toMatch(ORTOGRAFIA_PT);
  if (zh === texto) expect(IGUAL_PERMITIDO.has(texto), onde).toBe(true);
  expect(traduzir(texto, "pt-BR"), onde).toBe(texto);
}

describe("títulos de página em zh-CN", () => {
  it("cada título e descrição resolvidos não voltam em português", () => {
    const layout = readFileSync(join(RAIZ, "app/layout.tsx"), "utf8");
    const bloco = blocoDeMetadados(layout);
    expect(bloco).toBeTruthy();
    const frases = [
      ...[...bloco!.matchAll(/traduzir\(\s*"((?:\\.|[^"\\])*)"/g)].map(
        (m) => JSON.parse(`"${m[1]}"`) as string,
      ),
      ...literais(bloco!.match(/keywords:\s*\[[\s\S]*?\]/)?.[0] ?? ""),
    ];
    expect(frases.length).toBeGreaterThan(3);
    for (const frase of frases) semPortugues(frase, frase);

    const anda = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) anda(p);
        else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
          if (p.endsWith("/app/layout.tsx")) continue;
          const src = readFileSync(p, "utf8");
          if (!src.includes('from "@/lib/i18n/metadados"')) continue;
          const meta = blocoDeMetadados(src);
          expect(meta, p).toBeTruthy();
          const textos = literais(meta!).filter((s) => s.length > 0);
          expect(textos.length, p).toBeGreaterThan(0);
          for (const texto of textos) semPortugues(texto, `${p}: ${texto}`);
        }
      }
    };
    anda(join(RAIZ, "app"));
  });
});

describe("avisos diretos em zh-CN", () => {
  it("a saúde da conexão segue o idioma e o pt-BR permanece a chave", () => {
    const zh = avisoDaConexao(
      { reachable: false, status: null, detail: DETALHE_CREDENCIAL_RECUSADA },
      "N1",
      "zh-CN",
    );
    expect(zh?.title).toContain("N1");
    expect(zh?.title).not.toMatch(ORTOGRAFIA_PT);
    expect(zh?.body).not.toMatch(ORTOGRAFIA_PT);

    const qr = avisoDaConexao(
      { reachable: true, status: "SCAN_QR_CODE", detail: null },
      "N1",
      "zh-CN",
    );
    expect(qr?.title).not.toMatch(ORTOGRAFIA_PT);
    expect(qr?.body).not.toMatch(ORTOGRAFIA_PT);

    const fora = avisoDaConexao({ reachable: true, status: "FAILED", detail: null }, "N1", "zh-CN");
    expect(fora?.title).toContain("FAILED");
    expect(fora?.title).not.toMatch(ORTOGRAFIA_PT);

    const pt = avisoDaConexao(
      { reachable: false, status: null, detail: DETALHE_CREDENCIAL_RECUSADA },
      "Vendas",
    );
    expect(pt?.body).toMatch(/QR não resolve/);
    expect(pt?.title).toContain("Vendas");
  });

  it("o evento de canal traduz a frase fixa e preserva o estado cru", () => {
    const modelo = avisoDoEvento(
      { event: "whatsapp.template.status_updated", template: { name: "promo", status: "REJECTED" } },
      "zh-CN",
    );
    expect(modelo?.title).toContain("promo");
    expect(modelo?.title).toContain("REJECTED");
    expect(modelo?.title).not.toMatch(ORTOGRAFIA_PT);

    for (const evento of [
      "whatsapp.number.suspended",
      "whatsapp.number.activated",
      "account.disconnected",
      "account.connected",
      "verification.failed",
    ]) {
      const aviso = avisoDoEvento({ event: evento }, "zh-CN");
      expect(aviso?.title, evento).not.toMatch(ORTOGRAFIA_PT);
    }

    expect(avisoDoEvento({ event: "whatsapp.number.suspended" })?.title).toMatch(/SUSPENSO/);
  });

  it("a mídia não lida segue o idioma e o pt-BR cita o arquivo", () => {
    const zh = textoDoAvisoDeMidiaNaoLida({
      tipo: "imagem",
      motivo: "o modelo {modelo} não enxerga imagens",
      consequencia: "Enquanto isso, o agente responde avisando que não conseguiu abrir o arquivo.",
      detalheTecnico: "provider said no",
      idioma: "zh-CN",
      vars: { modelo: "m1" },
    });
    expect(zh.body).toContain("m1");
    expect(zh.title).not.toMatch(ORTOGRAFIA_PT);
    expect(zh.body).toContain("provider said no");
    expect(zh.body).not.toMatch(ORTOGRAFIA_PT);

    const pt = textoDoAvisoDeMidiaNaoLida({
      tipo: "imagem",
      motivo: "a leitura deu erro em todas as tentativas, ao abrir o arquivo ou ao chamar o provedor de IA",
      consequencia:
        "O conteúdo do arquivo não chegou ao agente. Da próxima mensagem em diante ele sabe que houve um arquivo que não deu para ler, e responde avisando em vez de supor o que estava nele.",
    });
    expect(pt.title).toContain("imagem");
    expect(pt.body).toContain("O conteúdo do arquivo não chegou ao agente.");
    expect(pt.body).toContain("responde avisando");
  });
});

describe("organização nova", () => {
  it("o padrão futuro é zh-CN e a migração não reescreve linhas", () => {
    const migracao = readFileSync(
      join(RAIZ, "supabase/migrations/20260926230000_0420_locale_padrao_zh_cn.sql"),
      "utf8",
    );
    expect(migracao).toContain("alter table public.organizations alter column locale set default 'zh-CN'");
    expect(migracao).toContain("else 'zh-CN' end");
    expect(migracao).toMatch(/in \('zh-CN', 'pt-BR', 'es'\)/);
    expect(migracao).not.toMatch(/update\s+(public\.)?organizations/i);

    const baseline = readFileSync(join(RAIZ, "supabase/baseline.sql"), "utf8");
    expect(baseline.match(/"locale" "text" DEFAULT 'zh-CN'/g)).toHaveLength(1);
    expect(baseline.match(/"locale" "text" DEFAULT 'pt-BR'/g)).toHaveLength(1);
    expect(baseline.match(/else 'zh-CN' end/g)).toHaveLength(3);
  });
});
