import { CivicHeader } from "@/components/civic-header";
import { IncidentDetail } from "@/components/incident-detail";

type IncidentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IncidentPage({ params }: IncidentPageProps) {
  const { id } = await params;
  return (
    <>
      <CivicHeader />
      <IncidentDetail id={id} />
    </>
  );
}
