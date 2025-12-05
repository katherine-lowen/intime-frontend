interface UserMessageBubbleProps {
  content: string;
}

export function UserMessageBubble({ content }: UserMessageBubbleProps) {
  return (
    <div className="flex justify-end mb-8">
      <div className="max-w-xl">
        <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-900/30">
          <p className="text-[15px] leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
