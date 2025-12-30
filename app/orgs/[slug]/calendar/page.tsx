// app/orgs/[slug]/calendar/page.tsx
import { notFound } from "next/navigation";
import { getOrgBySlug } from "../org";

function Locked() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Subscription required</h1>
      <p className="text-gray-600 mt-2">
        This organisation’s boards are locked until a trial or paid subscription is active.
      </p>
    </main>
  );
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { org, isActive } = await getOrgBySlug(slug);

  if (!org) notFound();
  if (!isActive) return <Locked />;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Calendar</h1>
      <p className="text-gray-600 mt-2">Organisation: {org.name}</p>
      <p className="text-gray-600 mt-2">
        Public view enabled. Login required only to edit.
      </p>
    </main>
  );
}
