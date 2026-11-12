import type { Metadata } from "next";
import { ProjectLayout } from "@/components/ProjectLayout";
import ProArchiveDashboard from "@/dashboards/pro-archive/ProArchiveDashboard";
import { DASHBOARDS } from "@/lib/site";

const d = DASHBOARDS.find((x) => x.slug === "pro-archive")!;
export const metadata: Metadata = { title: d.title, description: d.summary };

export default function Page() {
  return (
    <ProjectLayout d={d}>
      <ProArchiveDashboard />
    </ProjectLayout>
  );
}
