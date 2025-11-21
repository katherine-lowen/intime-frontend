// src/components/timeline.tsx
type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  timestamp?: string;
};

export default function Timeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) {
    return (
      <p className="mt-2 text-xs text-neutral-600">
        No activity yet. As things happen, they’ll appear here.
      </p>
    );
  }

  return (
    <ol className="mt-3 space-y-3">
      {items.map((item, idx) => (
        <li key={item.id} className="flex items-start gap-3">
          {/* Bullet + line */}
          <div className="flex flex-col items-center">
            <div className="mt-1 h-2 w-2 rounded-full bg-black" />
            {idx !== items.length - 1 && (
              <div className="mt-1 h-full w-px bg-neutral-200" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-0.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-neutral-900">{item.title}</p>
              {item.timestamp && (
                <span className="text-[11px] text-neutral-500">
                  {item.timestamp}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-neutral-600">{item.description}</p>
            )}
            {item.meta && (
              <p className="text-[11px] text-neutral-500">{item.meta}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
