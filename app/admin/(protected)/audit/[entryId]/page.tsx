import { AuditDetailClient } from "./_client";
import { metadados } from "@/lib/i18n/metadados";


interface AuditDetailPageProps {
  params: Promise<{ entryId: string }>;
}

export async function generateMetadata() {
  return metadados({
    title: "Audit Entry — Admin",
  });
}


export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { entryId } = await params;
  return <AuditDetailClient entryId={entryId} />;
}
