import { allFontVariables } from "./lib/fonts";
import { VariantProvider } from "./lib/variant-context";
import "./showcase.css";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Design Showcase — DeskcommCRM",
    description: "Painel navegável de design system. Soft-tech / calmo.",
    robots: { index: false, follow: false },
  });
}


export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={allFontVariables}>
      <VariantProvider>
        <div className="ds-root">{children}</div>
      </VariantProvider>
    </div>
  );
}
