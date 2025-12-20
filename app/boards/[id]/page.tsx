import { notFound } from "next/navigation";
import BoardPageClient from "./BoardPageClient";

export default function BoardPage({ params }: { params: { id: string } }) {
  const id = params.id;

  if (!id || id === "undefined") notFound();

  return <BoardPageClient id={id} />;
}
