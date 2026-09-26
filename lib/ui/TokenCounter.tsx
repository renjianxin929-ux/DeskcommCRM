"use client";
import * as React from "react";
import { encode } from "gpt-tokenizer";
import { useTagDeIdioma } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";

interface Props {
  text: string;
  contextWindow?: number | null;
  className?: string;
}

export function TokenCounter({ text, contextWindow, className }: Props) {
  const tagDoIdioma = useTagDeIdioma();
  const tr = useT();
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        setCount(encode(text ?? "").length);
      } catch {
        setCount(null);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [text]);

  if (count === null) {
    return (
      <span className={className} aria-live="polite">
        — {tr("tokens")}
      </span>
    );
  }

  const ratio = contextWindow && contextWindow > 0 ? count / contextWindow : null;
  const warn = ratio !== null && ratio > 0.8;
  const danger = ratio !== null && ratio > 1;

  const tone = danger
    ? "text-destructive"
    : warn
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  return (
    <span className={`${tone} ${className ?? ""}`} aria-live="polite">
      ~{count.toLocaleString(tagDoIdioma)} {tr("tokens")}
      {contextWindow ? ` / ${contextWindow.toLocaleString(tagDoIdioma)}` : ""}
      {warn && !danger ? ` · ${tr("próximo do limite")}` : ""}
      {danger ? ` · ${tr("acima do limite")}` : ""}
    </span>
  );
}
