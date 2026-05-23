# 🤖 Agentic Studio — No-Code AI Agent Builder

> Візуальна платформа для створення автономних AI-агентів. Збирайте логіку з блоків, оснащуйте інструментами та деплойте чат-віджет на будь-який сайт одним рядком коду.

![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?logo=google&logoColor=white)

---

## ✨ Основні можливості

- **Visual Builder** — Drag-and-drop конструктор логіки агента на базі React Flow
- **ReAct Engine** — Кастомний цикл оркестрації ШІ (~100 рядків Python), без важких фреймворків
- **Live Thought Tracking** — Потоковий SSE, що показує "мислення" агента у реальному часі
- **Deploy Anywhere** — Автоматично генерований JS-сніпет для вбудовування на будь-який сайт
- **Guardrails** — Обмеження ітерацій для запобігання зацикленню
- **Presentation Mock Mode** — Секретний режим для безпечних демонстрацій без залежності від API

## 🏗️ Архітектура

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Next.js 14)          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │
│  │  Builder  │  │  Widget  │  │  Landing Page  │ │
│  │(ReactFlow)│  │ (iframe) │  │  (Demo Chat)   │ │
│  └────┬─────┘  └────┬─────┘  └───────┬────────┘ │
└───────┼─────────────┼────────────────┼──────────┘
        │ POST        │ SSE            │ SSE
        ▼             ▼                ▼
┌─────────────────────────────────────────────────┐
│              Backend (FastAPI + Python)           │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  /api/agents  │  │  /api/chat/stream (SSE)  │  │
│  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                     │                   │
│         ▼                     ▼                   │
│  ┌────────────┐     ┌─────────────────────┐      │
│  │  Supabase  │     │  ReAct Loop Engine  │      │
│  │ (Postgres) │     │  ├─ Gemini 2.0 Flash│      │
│  └────────────┘     │  ├─ Tavily Search   │      │
│                     │  └─ Calculator      │      │
│                     └─────────────────────┘      │
└─────────────────────────────────────────────────┘
```

## 🛠️ Інструменти агента

| Інструмент | Опис | API |
|---|---|---|
| 🔍 Web Search | Пошук актуальної інформації в інтернеті | Tavily API |
| 🧮 Calculator | Обчислення математичних виразів | Вбудований |

## 🚀 Швидкий старт

### Передумови
- Node.js 18+
- Python 3.10+
- Акаунт [Supabase](https://supabase.com) (безкоштовно)

### 1. Клонування
```bash
git clone https://github.com/nazariidatsenko25-png/Supervisory_Board_of_Energoatom.git
cd Supervisory_Board_of_Energoatom
```

### 2. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Заповніть .env вашими ключами
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. База даних (Supabase)
Виконайте у SQL Editor вашого проєкту Supabase:
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_prompt TEXT,
  tools JSONB,
  max_iterations INT
);
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id)
);
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  role VARCHAR(50),
  content TEXT
);

-- Для локальної розробки:
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

## ⚙️ Конфігурація (.env)

```env
GEMINI_API_KEY=ваш_ключ        # Google AI Studio
TAVILY_API_KEY=tvly-dev-...     # tavily.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhb...           # anon/public key
```

## 🎭 Mock Mode (для презентацій)

Щоб гарантувати стабільну демонстрацію без залежності від Wi-Fi чи API лімітів, відправте запит з параметром `mock: true`:

```json
{
  "message": "Аналіз конкурентів у сфері EdTech",
  "mock": true
}
```

Бекенд імітуватиме повний ReAct цикл (думки → дія → спостереження → відповідь) з реалістичними затримками.

## 👥 Команда

Проєкт реалізовано в рамках 48-годинного хакатону з паралельною розробкою у 3 потоках:

| Потік | Зона відповідальності | Статус |
|---|---|---|
| 🔧 Потік 1 | Backend + Supabase + Tavily | ✅ Done |
| 🖼️ Потік 2 | Iframe Widget + embed.js | ✅ Done |
| 🎨 Потік 3 | UI Builder + React Flow | ✅ Done |

## 📄 Ліцензія

MIT License © 2026 Agentic Studio Team