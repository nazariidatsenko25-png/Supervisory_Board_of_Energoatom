import MockChatWidget from '@/components/MockChatWidget';

export default function WidgetPage({ params }: { params: { agent_id: string } }) {
  return (
    <main className="w-full h-screen bg-transparent m-0 p-0 overflow-hidden">
      <MockChatWidget agentId={params.agent_id} />
    </main>
  );
}
