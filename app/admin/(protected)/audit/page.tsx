import { AuditClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


export async function generateMetadata() {
  return metadados({
    title: "Audit Log — Admin",
  });
}


export default function AdminAuditPage() {
  return <AuditClient />;
}
