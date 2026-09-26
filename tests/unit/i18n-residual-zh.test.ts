/**
 * O que o zh-CN VÊ, fora do dicionário de tela.
 *
 * `i18n-espanhol-cobre-a-tela` varre `app/` e `components/`. Este guarda varre
 * o que aquela varredura não alcança e que a fase 2.5 tratou como P0: e-mail,
 * PDF, rodapé de saída, saudação de campanha, metadado de extensão e a frase
 * de produto do assistente de caso.
 *
 * Conta só ortografia portuguesa no RESULTADO zh-CN. Chave de dicionário em
 * pt-BR, fuso America/Sao_Paulo, nome de lei e moeda não entram aqui. P1 e
 * ACCEPTABLE estão listados em ZH_CN_RESIDUAL_AUDIT.md e ficam de fora desta
 * contagem de propósito.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import type { ReactElement, ReactNode } from "react";

import { montarSystem } from "@/lib/agent-engine/agent/conversa-do-caso/contexto";
import { saudacaoDaHora } from "@/lib/campanhas/renderizador";
import type { MarcaDeSaida } from "@/lib/branding/saida";
import {
  MODELOS_DE_ACESSO,
  montarTemplateDeAcesso,
} from "@/lib/email/templates/acesso-gotrue";
import { buildInviteEmail } from "@/lib/email/templates/invite";
import { localize, type LocalizedText } from "@/lib/extensions/manifest";
import { traduzir } from "@/lib/i18n/dicionario";
import type { ExportPayload } from "@/lib/lgpd/export-collector";
import { LgpdExportPdf } from "@/lib/lgpd/pdf-renderer";
import { rodapeDeSaida } from "@/lib/prospecting/rodape-de-saida";

const RAIZ = join(__dirname, "..", "..");

const MARCA: MarcaDeSaida = {
  nome: "Acme Co",
  logoUrl: null,
  accent: "#506d48",
  accentFg: "#ffffff",
  origens: { nome: "instalacao", cor: "instalacao" },
};

/** Acento ou palavra que só aparece se a frase zh-CN caiu de volta no molde. */
const ORTOGRAFIA_PT =
  /[áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]|\b(não|você|olá|relatório|solicitação|convidou|senha|pendente|processamento|controlador|receber mensagens|bom dia|boa tarde|boa noite|próximo do limite|acima do limite)\b/i;

function textos(no: ReactNode): string[] {
  if (no === null || no === undefined || typeof no === "boolean") return [];
  if (typeof no === "string") return [no];
  if (typeof no === "number") return [String(no)];
  if (Array.isArray(no)) return no.flatMap(textos);
  const elemento = no as ReactElement<{ children?: ReactNode }>;
  if (elemento.props && "children" in elemento.props) return textos(elemento.props.children);
  return [];
}

function camposLocalizados(valor: unknown, saida: LocalizedText[] = []): LocalizedText[] {
  if (Array.isArray(valor)) {
    for (const item of valor) camposLocalizados(item, saida);
    return saida;
  }
  if (!valor || typeof valor !== "object") return saida;
  const rec = valor as Record<string, unknown>;
  if (typeof rec["pt-BR"] === "string") saida.push(rec as LocalizedText);
  for (const item of Object.values(rec)) camposLocalizados(item, saida);
  return saida;
}

function pdfZh(): string {
  const data = {
    request_id: "abc12345-0000-0000-0000-000000000000",
    organization_id: "org-1",
    organization_legal_name: "Acme Co",
    organization_display_name: "Acme",
    dpo_email: "dpo@acme.test",
    lei_citada: null,
    documento_rotulo: "CPF",
    generated_at: "2026-09-26T12:00:00.000Z",
    no_local_footprint: true,
    contact: null,
    consents: [],
    conversations: [],
    messages_count_total: 0,
    messages_recent: [],
    leads: [],
    orders: [],
    activities: [],
    checkpoints: [],
    appointments: [],
    sales: [],
    tasks: [],
    webhook_captures: [],
    audit_log_extract: [],
    meeting_deliveries: [],
    appointment_notices: [],
    voice_calls: [],
    prospecting_candidates: [],
    cases: [],
    case_events: [],
    demandas: [],
    case_chat_messages: [],
    passagens: [],
    avisos_de_caso: [],
    campaign_recipients: [],
    campaign_suppressions: [],
  } as ExportPayload;
  return textos(
    LgpdExportPdf({ data, unsignedWarning: true, idioma: "zh-CN" }) as ReactElement,
  ).join("\n");
}

describe("zh-CN residual nas superfícies que furavam o dicionário", () => {
  const convite = buildInviteEmail({
    inviterName: "Lin",
    orgName: "Acme",
    acceptUrl: "https://example.test/invite",
    role: "agent",
    expiresAt: new Date("2026-09-26T15:00:00.000Z"),
    marca: MARCA,
    idioma: "zh-CN",
  });
  const acessos = MODELOS_DE_ACESSO.map((modelo) => montarTemplateDeAcesso(modelo, MARCA, "zh-CN"));
  const pacotes = readdirSync(join(RAIZ, "extensoes/pacotes/deskcomm"))
    .filter((nome) => nome.endsWith(".json"))
    .flatMap((nome) => {
      const pacote = JSON.parse(readFileSync(join(RAIZ, "extensoes/pacotes/deskcomm", nome), "utf8"));
      return camposLocalizados(pacote).map((campo) => localize(campo, "zh-CN"));
    });
  const vistos = [
    convite.subject,
    convite.html,
    convite.text,
    ...acessos,
    pdfZh(),
    rodapeDeSaida("zh-CN"),
    saudacaoDaHora(new Date("2026-09-26T08:00:00.000Z"), "UTC", "zh-CN"),
    saudacaoDaHora(new Date("2026-09-26T15:00:00.000Z"), "UTC", "zh-CN"),
    saudacaoDaHora(new Date("2026-09-26T21:00:00.000Z"), "UTC", "zh-CN"),
    ...pacotes.map((campo) => campo.text),
    traduzir(
      "Responde às perguntas de quem vai decidir um caso: lê o caso, o que a equipe já decidiu e a conversa com o cliente, e explica em português. Nunca fala com o cliente nem mexe no caso.",
      "zh-CN",
    ),
  ];

  it("nenhuma dessas saídas zh-CN carrega ortografia portuguesa", () => {
    const ofensores = vistos.filter((texto) => ORTOGRAFIA_PT.test(texto));
    expect(ofensores).toEqual([]);
    expect(ofensores).toHaveLength(0);
  });

  it("o pacote zh-CN não cai no título português", () => {
    expect(pacotes.length).toBeGreaterThan(0);
    for (const campo of pacotes) {
      expect(campo.fallback).toBe(false);
      expect(campo.text).toMatch(/\p{Script=Han}/u);
    }
  });

  it("o rodapé zh-CN pede STOP, que o detector já reconhece", () => {
    expect(rodapeDeSaida("zh-CN")).toContain("STOP");
    expect(rodapeDeSaida("zh-CN")).not.toMatch(/receber mensagens/);
  });

  it("a saudação zh-CN segue a hora, e a omissão continua em português", () => {
    expect(saudacaoDaHora(new Date("2026-09-26T08:00:00.000Z"), "UTC", "zh-CN")).toBe("早上好");
    expect(saudacaoDaHora(new Date("2026-09-26T08:00:00.000Z"), "UTC")).toBe("Bom dia");
  });

  it("o assistente de caso recebe a regra de chinês por último, e pt-BR não ganha essa regra", () => {
    const zh = montarSystem({ persona: "persona", memoriaDaOrganizacao: null, idioma: "zh-CN" });
    expect(zh.endsWith("不要用葡萄牙语回答。")).toBe(true);
    expect(zh).toContain("请只用简体中文回答");
    const pt = montarSystem({ persona: "persona", memoriaDaOrganizacao: null });
    expect(pt).not.toContain("简体中文");
    expect(pt).toBe(montarSystem({ persona: "persona", memoriaDaOrganizacao: null, idioma: "pt-BR" }));
  });

  it("a frase de produto do assistente de caso não manda explicar em português", () => {
    const frase = traduzir(
      "Responde às perguntas de quem vai decidir um caso: lê o caso, o que a equipe já decidiu e a conversa com o cliente, e explica em português. Nunca fala com o cliente nem mexe no caso.",
      "zh-CN",
    );
    expect(frase).toContain("简体中文");
    expect(frase).not.toContain("葡萄牙语");
  });

  it("TokenCounter e os prompts novos não travam o idioma em português", () => {
    const contador = readFileSync(join(RAIZ, "lib/ui/TokenCounter.tsx"), "utf8");
    const semChave = contador.replace(/tr\("(?:tokens|próximo do limite|acima do limite)"\)/g, "");
    expect(semChave).not.toMatch(/próximo do limite|acima do limite/);
    expect(readFileSync(join(RAIZ, "lib/ai/guardrails-schema.ts"), "utf8")).not.toContain(
      "em português do Brasil",
    );
    expect(readFileSync(join(RAIZ, "lib/prospecting/agent-setup.ts"), "utf8")).not.toContain(
      "em português do Brasil",
    );
  });
});
