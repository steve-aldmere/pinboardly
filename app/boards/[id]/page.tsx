import { notFound } from "next/navigation";
import BoardPageClient from "./BoardPageClient";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") notFound();

  return <BoardPageClient id={id} />;
}
