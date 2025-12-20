// app/boards/[id]/PinCard.tsx
export type Pin = {
  id: string;
  board_id: string;
  content: string;
  created_at: string;
};

interface PinCardProps {
  pin: Pin;
}

export default function PinCard({ pin }: PinCardProps) {
  return (
    <article className="mb-4 break-inside-avoid rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-900">
      <p className="whitespace-pre-wrap">{pin.content}</p>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-neutral-400">
        {new Date(pin.created_at).toLocaleString()}
      </p>
    </article>
  );
}
