import MockChatWidget from '@/components/MockChatWidget';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Agentic Studio - Mock Architecture</h1>
        <p className="mb-8 text-gray-600">
          Це тестова сторінка Етапу 0. Тут ми ініціалізували базову структуру проєкту. 
          Праворуч внизу знаходиться MockChatWidget, який підключається до локального FastAPI-сервера 
          і приймає фіктивний Server-Sent Events потік для тестування механіки Live Tracking.
        </p>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Статус ініціалізації:</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li className="text-green-600 font-medium">✓ Next.js встановлено</li>
            <li className="text-green-600 font-medium">✓ React Flow & Zustand додані</li>
            <li className="text-green-600 font-medium">✓ Хуки detect-secrets налаштовані в корені</li>
            <li className="text-green-600 font-medium">✓ FastAPI бекенд із SSE налаштовано</li>
          </ul>
        </div>
      </div>
      
      {/* Віджет чату */}
      <MockChatWidget />
    </main>
  );
}
