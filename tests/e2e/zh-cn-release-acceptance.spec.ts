/**
 * Aceitação visual zh-CN — os 15 caminhos de ZH_CN_RELEASE_ACCEPTANCE.md.
 *
 * Fora do CI de propósito (ver FORA_DO_CI em `.github/workflows/e2e.yml`):
 * grava locale na conta compartilhada do seed e zera `onboarded_at` para
 * fotografar o wizard. O `afterAll` devolve os dois. Não usa tradução do
 * Chrome: o Chromium sobe com Translate desligado e `locale: zh-CN`.
 *
 * O login reusa `loginComoAdmin` / `loginComoDono`. Os dados de funil e agenda
 * reusam os seeds que a suíte já tem.
 */
import { execFileSync, execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page, type Response } from "@playwright/test";

import { DICIONARIO } from "../../lib/i18n/dicionario";
import chines from "../../lib/i18n/traducoes/zh-CN.json";
import { credenciaisSupabaseDeTeste } from "../../scripts/lib/env-de-teste";
import { lerCreds, loginComoAdmin, loginComoDono, semearCredenciais, type CredsE2E } from "./helpers/login-admin";

const SHA = execSync("git rev-parse --short=8 HEAD", { encoding: "utf8" }).trim();
const EVIDENCIA = path.join(process.cwd(), "evidence", "zh-cn-release", SHA);

test.use({
  locale: "zh-CN",
  timezoneId: "America/Sao_Paulo",
  viewport: { width: 1440, height: 900 },
  extraHTTPHeaders: { "Accept-Language": "zh-CN,zh;q=0.9" },
  launchOptions: {
    args: ["--disable-features=Translate,TranslateUI", "--disable-translate"],
  },
});

type Creds = CredsE2E & {
  org_id: string;
  default_agent_id?: string;
  users: Record<string, { email: string; id?: string }>;
};

type Achado = { caminho: string; tipo: string; detalhe: string };

const achados: Achado[] = [];
const caminhos: { id: string; url: string; status: number | null; lang: string | null; title: string }[] = [];
let localeAlterado = false;
let orgsCriadas: string[] = [];
let dadoDoTenant = new Set<string>();

const ACENTO = /[áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]/;
const CALENDARIO_PT =
  /\b(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|segunda|terça|quarta|quinta|sexta|sábado|domingo)\b/i;
const QUEBRADO = /\[object Object\]|\{\{?[A-Za-z_][A-Za-z0-9_]*\}?\}/;

function anotar(caminho: string, tipo: string, detalhe: string) {
  achados.push({ caminho, tipo, detalhe: detalhe.slice(0, 400) });
}

function chaveNaoTraduzida(texto: string): boolean {
  const doDicionario = DICIONARIO[texto]?.["zh-CN"];
  const doArquivo = (chines as Record<string, string>)[texto];
  const zh = doDicionario ?? doArquivo;
  return Boolean(zh && zh !== texto);
}

function ehDado(texto: string): boolean {
  if (dadoDoTenant.has(texto)) return true;
  for (const item of dadoDoTenant) {
    if (item.length >= 8 && texto.includes(item)) return true;
    if (texto.length >= 12 && item.includes(texto)) return true;
  }
  return false;
}

function svc(): SupabaseClient {
  const c = credenciaisSupabaseDeTeste();
  return createClient(c.url, c.serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function usuarioPorEmail(admin: SupabaseClient, email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw new Error(`listUsers: ${error.message}`);
  const user = data.users.find((u) => u.email === email);
  if (!user) throw new Error(`usuário de teste ausente: ${email}`);
  return user;
}

async function gravarLocale(locale: "zh-CN" | null) {
  localeAlterado = true;
  const admin = svc();
  const creds = lerCreds() as Creds;
  for (const email of [creds.users.admin?.email, creds.users.dono?.email]) {
    if (!email) continue;
    const user = await usuarioPorEmail(admin, email);
    const meta = { ...(user.user_metadata ?? {}) } as Record<string, unknown>;
    if (locale) meta.locale = locale;
    else delete meta.locale;
    const { error } = await admin.auth.admin.updateUserById(user.id, { user_metadata: meta });
    if (error) throw new Error(`locale de ${email}: ${error.message}`);
  }
  const { error } = await admin
    .from("organizations")
    .update({ locale: locale ?? "pt-BR" } as never)
    .eq("id", creds.org_id);
  if (error) throw new Error(`locale da org: ${error.message}`);
}

async function carregarDadoDoTenant() {
  const admin = svc();
  const creds = lerCreds() as Creds;
  const orgId = creds.org_id;
  const textos = new Set<string>();
  const tabelas: { tabela: string; coluna: string }[] = [
    { tabela: "crm_stages", coluna: "name" },
    { tabela: "crm_pipelines", coluna: "name" },
    { tabela: "crm_leads", coluna: "title" },
    { tabela: "contacts", coluna: "name" },
    { tabela: "ai_agents", coluna: "name" },
    { tabela: "ai_agents", coluna: "description" },
    { tabela: "ai_agents", coluna: "system_prompt" },
    { tabela: "channel_sessions", coluna: "display_name" },
  ];
  for (const { tabela, coluna } of tabelas) {
    const { data } = await admin.from(tabela).select(coluna).eq("organization_id", orgId).limit(50);
    for (const linha of data ?? []) {
      const valor = (linha as unknown as Record<string, unknown>)[coluna];
      if (typeof valor === "string" && valor.trim()) textos.add(valor.trim());
    }
  }
  dadoDoTenant = textos;
}

async function criarOrgSemLocale(): Promise<{ via: string; locale: string | null; erro?: string }> {
  const admin = svc();
  const creds = lerCreds() as Creds;
  const slug = `zhcn-acc-${Date.now()}`;
  const emailDoDono = creds.users.dono?.email;
  if (!emailDoDono) return { via: "fn_create_tenant_with_owner", locale: null, erro: "seed sem dono" };
  const dono = await usuarioPorEmail(admin, emailDoDono);
  const { data, error } = await admin.rpc("fn_create_tenant_with_owner", {
    p_actor: dono.id,
    p_key: crypto.randomUUID(),
    p_request: {
      display_name: "Aceitacao sem locale",
      slug,
      legal_name: "Aceitacao sem locale",
      owner_email: emailDoDono,
    },
    p_hash: "abcd",
  });
  if (error) return { via: "fn_create_tenant_with_owner", locale: null, erro: error.message };
  const id = (data as { id?: string } | null)?.id;
  if (!id) return { via: "fn_create_tenant_with_owner", locale: null, erro: `resposta sem id: ${JSON.stringify(data)}` };
  orgsCriadas.push(id);
  const { data: org, error: leitura } = await admin.from("organizations").select("locale").eq("id", id).single();
  if (leitura) return { via: "fn_create_tenant_with_owner", locale: null, erro: leitura.message };
  return { via: "fn_create_tenant_with_owner", locale: (org as { locale: string | null }).locale };
}

async function criarOrgPeloDefaultDaColuna(): Promise<{ via: string; locale: string | null; erro?: string }> {
  const admin = svc();
  const slug = `zhcn-col-${Date.now()}`;
  const { data, error } = await admin
    .from("organizations")
    .insert({
      slug,
      legal_name: "Aceitacao coluna",
      display_name: "Aceitacao coluna",
    } as never)
    .select("id, locale")
    .single();
  if (error || !data) return { via: "column-default", locale: null, erro: error?.message };
  const linha = data as { id: string; locale: string | null };
  orgsCriadas.push(linha.id);
  return { via: "column-default", locale: linha.locale };
}

async function limparOrgsCriadas() {
  if (orgsCriadas.length === 0) return;
  const admin = svc();
  for (const id of orgsCriadas) {
    await admin.from("user_organizations").delete().eq("organization_id", id);
    await admin.from("idempotency_keys").delete().eq("organization_id", id);
    await admin.from("organizations").delete().eq("id", id);
  }
}

async function semearDados() {
  semearCredenciais();
  execFileSync("npx", ["tsx", "scripts/seed-e2e-kanban.ts"], { stdio: "inherit" });
  execFileSync("npx", ["tsx", "scripts/seed-e2e-agenda.ts"], { stdio: "inherit" });
  execFileSync("npx", ["tsx", "scripts/seed-e2e-system-update.ts"], { stdio: "inherit" });
}

function escreverRelatorio(extra: Record<string, unknown>) {
  fs.mkdirSync(EVIDENCIA, { recursive: true });
  fs.writeFileSync(
    path.join(EVIDENCIA, "resultado.json"),
    JSON.stringify({ sha: SHA, achados, caminhos, ...extra }, null, 2),
  );
}

async function textosVisiveis(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const saida: string[] = [];
    const anda = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let no = anda.nextNode(); no; no = anda.nextNode()) {
      const texto = (no.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!texto) continue;
      const pai = no.parentElement;
      if (!pai || pai.closest("script,style,noscript")) continue;
      const estilo = getComputedStyle(pai);
      if (estilo.display === "none" || estilo.visibility === "hidden") continue;
      saida.push(texto);
    }
    return saida;
  });
}

async function inspecionar(page: Page, caminho: string, resposta: Response | null) {
  const status = resposta?.status() ?? null;
  const lang = await page.locator("html").getAttribute("lang");
  const title = await page.title();
  caminhos.push({ id: caminho, url: page.url(), status, lang, title });

  if (status !== null && status >= 500) anotar(caminho, "http", `status ${status}`);
  const corpo = await page.locator("body").innerText().catch(() => "");
  if (/Internal Server Error|Application error/i.test(corpo) && status !== 404) {
    anotar(caminho, "http", "página de erro do servidor");
  }
  if (lang !== "zh-CN") anotar(caminho, "lang", `html lang=${lang ?? "null"}`);

  if (ACENTO.test(title) || CALENDARIO_PT.test(title)) anotar(caminho, "title", title);
  else if (chaveNaoTraduzida(title.split("·")[0]?.trim() ?? title)) {
    anotar(caminho, "title", title);
  }

  const textos = await textosVisiveis(page);
  const vistos = new Set<string>();
  for (const texto of textos) {
    if (vistos.has(texto) || ehDado(texto)) continue;
    vistos.add(texto);
    if (QUEBRADO.test(texto)) anotar(caminho, "quebrado", texto);
    if (ACENTO.test(texto) || CALENDARIO_PT.test(texto)) anotar(caminho, "portugues", texto);
    else if (chaveNaoTraduzida(texto)) anotar(caminho, "chave", texto);
  }

  const placeholders = await page.locator("input, textarea").evaluateAll((els) =>
    els
      .map((el) => (el as HTMLInputElement).placeholder || "")
      .filter((p) => p.length > 0),
  );
  for (const placeholder of placeholders) {
    if (QUEBRADO.test(placeholder) || ACENTO.test(placeholder) || chaveNaoTraduzida(placeholder)) {
      anotar(caminho, "placeholder", placeholder);
    }
  }

  if (/Invalid Date|\bNaN\b/.test(corpo)) anotar(caminho, "data", "Invalid Date ou NaN");

  const estouro = await page.evaluate(() => {
    const alvos = Array.from(document.querySelectorAll('button, [role="tab"], select, [role="combobox"]'));
    const ruins: string[] = [];
    for (const el of alvos) {
      const estilo = getComputedStyle(el);
      if (estilo.display === "none" || estilo.visibility === "hidden") continue;
      const texto = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (texto.length < 2) continue;
      if (el.scrollWidth > el.clientWidth + 12 || el.scrollHeight > el.clientHeight + 12) {
        ruins.push(texto.slice(0, 80));
      }
    }
    return ruins.slice(0, 12);
  });
  for (const item of estouro) anotar(caminho, "overflow", item);
}

async function foto(page: Page, nome: string) {
  fs.mkdirSync(EVIDENCIA, { recursive: true });
  await page.screenshot({ path: path.join(EVIDENCIA, nome), fullPage: true });
}

async function abrir(page: Page, url: string): Promise<Response | null> {
  const resposta = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
  return resposta;
}

test.describe("aceitação zh-CN", () => {
  test.afterAll(async () => {
    if (localeAlterado) {
      await gravarLocale(null);
    }
    await limparOrgsCriadas();
  });

  test("15 caminhos no navegador zh-CN", async ({ page, browser, baseURL }) => {
    test.setTimeout(720_000);
    const orgs: { via: string; locale: string | null; erro?: string }[] = [];
    try {
      await semearDados();
      await gravarLocale("zh-CN");
      await carregarDadoDoTenant();
      orgs.push(await criarOrgSemLocale());
      orgs.push(await criarOrgPeloDefaultDaColuna());
      for (const org of orgs) {
        if (org.erro) anotar("org-default", "teste", `${org.via}: ${org.erro}`);
        else if (org.locale !== "zh-CN") anotar("org-default", "produto", `${org.via} locale=${org.locale}`);
      }

      const creds = lerCreds();

      let resposta = await abrir(page, "/login");
      await inspecionar(page, "01-login", resposta);
      await foto(page, "01-login.png");

      await page.getByRole("button", { name: /^(Entrar|登录)$/ }).click();
      await page.locator("form").waitFor();
      await inspecionar(page, "14-validacao-login", null);
      await foto(page, "14-validacao-login.png");

      resposta = await abrir(page, "/login/forgot");
      await inspecionar(page, "15-recuperar-senha", resposta);
      await foto(page, "15-recuperar-senha.png");

      resposta = await abrir(page, "/legal/terms");
      await inspecionar(page, "15-termos", resposta);
      await foto(page, "15-termos.png");

      resposta = await abrir(page, "/legal/privacy");
      await inspecionar(page, "15-privacidade", resposta);
      await foto(page, "15-privacidade.png");

      resposta = await abrir(page, "/signup");
      await inspecionar(page, "15-cadastro", resposta);
      await foto(page, "15-cadastro.png");

      await loginComoAdmin(page, creds);

      const adminDb = svc();
      const credsAtuais = lerCreds() as Creds;
      await adminDb
        .from("organizations")
        .update({ onboarded_at: null } as never)
        .eq("id", credsAtuais.org_id);
      resposta = await abrir(page, "/onboarding");
      await inspecionar(page, "02-onboarding", resposta);
      await foto(page, "02-onboarding.png");
      await adminDb
        .from("organizations")
        .update({ onboarded_at: new Date().toISOString() } as never)
        .eq("id", credsAtuais.org_id);

      const visitas: { id: string; url: string; arquivo: string }[] = [
        { id: "03-nav", url: "/app/inbox", arquivo: "03-nav.png" },
        { id: "04-inbox", url: "/app/inbox", arquivo: "04-inbox.png" },
        { id: "05-contatos", url: "/app/contacts", arquivo: "05-contatos.png" },
        { id: "06-funil", url: "/app/kanban", arquivo: "06-funil.png" },
        { id: "07-agenda", url: "/app/agenda", arquivo: "07-agenda.png" },
        { id: "08-agentes", url: "/app/ai/agents", arquivo: "08-agentes.png" },
        { id: "10-followups", url: "/app/ai/followups", arquivo: "10-followups.png" },
        { id: "10-conhecimento", url: "/app/ai/knowledge/sources", arquivo: "10-conhecimento.png" },
        { id: "11-conexoes", url: "/app/connections", arquivo: "11-conexoes.png" },
        { id: "12-configuracoes", url: "/app/settings", arquivo: "12-configuracoes.png" },
        { id: "14-vazio", url: "/app/campaigns", arquivo: "14-vazio.png" },
      ];

      for (const visita of visitas) {
        resposta = await abrir(page, visita.url);
        await inspecionar(page, visita.id, resposta);
        await foto(page, visita.arquivo);
      }

      const nav = page.locator("nav").first();
      if (await nav.count()) {
        await nav.screenshot({ path: path.join(EVIDENCIA, "03-nav-recorte.png") });
      }

      const agentId = (lerCreds() as Creds).default_agent_id;
      if (!agentId) anotar("09-editor", "teste", "seed sem default_agent_id");
      else {
        resposta = await abrir(page, `/app/ai/agents/${agentId}`);
        await inspecionar(page, "09-editor", resposta);
        await foto(page, "09-editor.png");
      }

      await abrir(page, "/app/contacts");
      await page.getByRole("button", { name: /新建联系人|Novo contato/ }).click();
      const dialogo = page.getByRole("dialog");
      await dialogo.waitFor({ timeout: 15_000 });
      await inspecionar(page, "14-dialogo", null);
      await dialogo.screenshot({ path: path.join(EVIDENCIA, "14-dialogo.png") });
      await dialogo.getByRole("button", { name: /创建联系人|Criar contato/ }).click();
      await inspecionar(page, "14-validacao-dialogo", null);
      await dialogo.screenshot({ path: path.join(EVIDENCIA, "14-validacao-dialogo.png") });
      await page.keyboard.press("Escape");

      const contextoDoDono = await browser.newContext({
        locale: "zh-CN",
        timezoneId: "America/Sao_Paulo",
        viewport: { width: 1440, height: 900 },
        extraHTTPHeaders: { "Accept-Language": "zh-CN,zh;q=0.9" },
        baseURL: baseURL ?? "http://localhost:3001",
      });
      const paginaDoDono = await contextoDoDono.newPage();
      try {
        await loginComoDono(paginaDoDono, lerCreds());
        resposta = await abrir(paginaDoDono, "/admin");
        await inspecionar(paginaDoDono, "13-admin", resposta);
        await foto(paginaDoDono, "13-admin.png");
      } finally {
        await contextoDoDono.close();
      }
    } finally {
      escreverRelatorio({ orgs });
    }

    const produto = achados.filter((a) => a.tipo !== "teste");
    expect(produto, produto.map((a) => `${a.caminho} ${a.tipo}: ${a.detalhe}`).join("\n")).toEqual([]);
  });
});
