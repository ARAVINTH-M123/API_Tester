import { notFound } from "next/navigation";

const sectionMap: Record<string, string> = {
  collections: "Collections",
  history: "History",
  environments: "Environments",
  workspaces: "Workspaces",
  settings: "Settings",
};

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sectionMap[section];

  if (!title) {
    notFound();
  }

  return (
    <main className="dashboard-main">
      <section className="coming-soon-card">
        <p className="coming-soon-eyebrow">Dashboard Section</p>
        <h1>{title}</h1>
        <p>Coming soon.</p>
      </section>
    </main>
  );
}
