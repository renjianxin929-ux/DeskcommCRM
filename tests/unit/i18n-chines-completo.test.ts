import { describe, expect, it } from "vitest";

import { DICIONARIO, traduzir } from "@/lib/i18n/dicionario";
import chines from "@/lib/i18n/traducoes/zh-CN.json";

const PLACEHOLDER = /\{\{?[A-Za-z_][A-Za-z0-9_]*\}?\}/g;
const placeholders = (texto: string) => (texto.match(PLACEHOLDER) ?? []).sort();

describe("interface completa em chinês simplificado", () => {
  it("toda chave do dicionário tem tradução zh-CN não vazia", () => {
    const faltando = Object.keys(DICIONARIO).filter((chave) => {
      const valor = (chines as Record<string, string>)[chave];
      return typeof valor !== "string" || valor.trim() === "";
    });

    expect(
      faltando,
      `${faltando.length} texto(s) da interface ainda caem para português em zh-CN`,
    ).toEqual([]);
  });

  it("nenhuma tradução chinesa perde ou inventa placeholders", () => {
    const divergentes = Object.entries(chines as Record<string, string>)
      .filter(([chave]) => chave in DICIONARIO)
      .filter(([chave, valor]) => placeholders(chave).join() !== placeholders(valor).join())
      .map(([chave, valor]) => `${JSON.stringify(chave)} → ${JSON.stringify(valor)}`);

    expect(divergentes).toEqual([]);
  });

  it("o runtime realmente serve o catálogo chinês", () => {
    for (const [chave, valor] of Object.entries(chines as Record<string, string>)) {
      if (!(chave in DICIONARIO)) continue;
      expect(traduzir(chave, "zh-CN"), chave).toBe(valor);
    }
  });

  it("os rótulos fundamentais nunca degradam para português", () => {
    const essenciais = [
      "Inbox",
      "Radar",
      "Agenda",
      "Respostas rápidas",
      "Funis",
      "Contatos",
      "Agentes",
      "Follow-ups",
      "Conexões",
      "Configurações",
      "Salvar",
      "Cancelar",
      "Excluir",
    ];

    for (const chave of essenciais) {
      expect(traduzir(chave, "zh-CN"), chave).not.toBe(chave);
    }
  });
});
