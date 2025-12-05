"use client";

interface UserMessageBubbleProps {
  content: string;
}

export function UserMessageBubble({ content }: UserMessageBubbleProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%] rounded-2xl bg-indigo-500 text-white px-4 py-2 text-sm shadow-lg shadow-indigo-900/40">
        {content}
      </div>
    </div>
  );
}
