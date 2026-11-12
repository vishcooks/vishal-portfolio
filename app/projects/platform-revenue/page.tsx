import type { Metadata } from "next";
import { ProjectLayout } from "@/components/ProjectLayout";
import PlatformDashboard from "@/dashboards/platform/PlatformDashboard";
import { DASHBOARDS } from "@/lib/site";

const d = DASHBOARDS.find((x) => x.slug === "platform-revenue")!;
export const metadata: Metadata = { title: d.title, description: d.summary };

export default function Page() {
  return (
    <ProjectLayout d={d}>
      <PlatformDashboard />
    </ProjectLayout>
  );
}
