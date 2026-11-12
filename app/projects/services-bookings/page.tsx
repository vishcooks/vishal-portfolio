import type { Metadata } from "next";
import { ProjectLayout } from "@/components/ProjectLayout";
import ServicesDashboard from "@/dashboards/services/ServicesDashboard";
import { DASHBOARDS } from "@/lib/site";

const d = DASHBOARDS.find((x) => x.slug === "services-bookings")!;
export const metadata: Metadata = { title: d.title, description: d.summary };

export default function Page() {
  return (
    <ProjectLayout d={d}>
      <ServicesDashboard />
    </ProjectLayout>
  );
}
