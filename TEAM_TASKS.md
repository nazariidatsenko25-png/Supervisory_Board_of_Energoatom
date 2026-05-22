# 📚 Agentic Studio: Посібник для команди та AI-асистентів

Цей документ створено для повного занурення команди в проєкт **Agentic Studio**. Він містить детальну інформацію про архітектуру, API-контракти та завдання для паралельної розробки.

## 0. Підготовка до роботи (Quick Start)
**УВАГА:** Оскільки API-ключі не зберігаються в репозиторії (захищено через `.gitignore`), кожен розробник повинен налаштувати їх локально перед початком роботи:
1. Перейдіть у папку `backend/`.
2. Зробіть копію файлу `.env.example` та назвіть її `.env` (у терміналі: `cp .env.example .env`).
3. Відкрийте створений файл `.env` та вставте ваші власні безкоштовні ключі (Google Gemini та Brave Search). Без цього бекенд не зможе робити запити до ШІ.

---

## 1. Архітектура Проєкту
- **Фронтенд (`frontend/`):** Next.js (App Router), Zustand, React Flow, Tailwind CSS.
- **Бекенд (`backend/`):** FastAPI (Python), `google-genai` (SDK для Gemini 2.0 Flash), `httpx`.
- **Оркестрація:** Кастомний цикл `ReAct`, який дозволяє стрімити події в реальному часі через Server-Sent Events (SSE). 

Формат потоку від бекенду (НЕ ЛАМАТИ ПРИ РОЗРОБЦІ):
`data: {"type": "thought|action|observation|message", "content": "..."}\n\n`

---

## 2. Зафіксований API-Контракт
Для уникнення конфліктів розробляйте свої частини, спираючись виключно на цей контракт.

### 2.1. Створення Агента (`POST /api/agents`)
**Request (JSON):** `{"system_prompt": "...", "tools": ["web_search"], "max_iterations": 5}`
**Response (200 OK):** `{"agent_id": "123e4567-e89b-12d3-a456-426614174000"}`

### 2.2. Потік Чату (`POST /api/chat/stream`)
**Request (JSON):** `{"agent_id": "123e4567-e89b-12d3-a456-426614174000", "message": "Привіт", "session_id": "uuid-якщо-є"}`
**Response:** `text/event-stream` (потік повідомлень SSE).

---

## 🛠 3. Розподіл завдань (1 Потік = 1 Розробник)

Проєкт поділено на 3 незалежні потоки. **Над кожним потоком працює рівно ОДНА людина.** Ніхто не перетинається у файлах. Кожен бере свою гілку і виконує своє комплексне завдання від початку до кінця.

---

### 🔴 ПОТІК 1: Бекенд-інженер (Робота з БД та логікою)
**Відповідальний:** 1 людина
**Гілка:** `feature/supabase-backend`
**Зона відповідальності:** Папка `backend/`

**Твоє завдання:**
Тобі потрібно забезпечити збереження конфігурацій агентів та історії їхніх чатів у базу даних Supabase. Для цього додай `supabase-py` у залежності та створи в БД три таблиці: `agents` (для збереження промптів та інструментів), `sessions` (для сесій чату) та `messages` (для історії діалогу). 
Після цього напиши новий роут `POST /api/agents`, який буде приймати налаштування від фронтенду, зберігати їх у БД і повертати згенерований `agent_id`. Наостанок, ти маєш переписати існуючий роут `POST /api/chat/stream`: тепер він не повинен приймати промпт у тілі запиту, а має приймати `agent_id`, самостійно витягувати налаштування з БД, зберігати повідомлення користувача в таблицю `messages`, викликати ШІ і зберігати фінальну відповідь моделі назад у БД.

<details>
<summary>Натисни сюди, щоб скопіювати SQL схему для Supabase</summary>

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_prompt TEXT NOT NULL,
    tools JSONB DEFAULT '[]'::jsonb,
    max_iterations INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id),
    role VARCHAR(50) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
</details>

---

### 🟢 ПОТІК 2: Інженер Інтеграції (Embed Script & Iframe)
**Відповідальний:** 1 людина
**Гілка:** `feature/embed-widget`
**Зона відповідальності:** `frontend/public/embed.js` та `frontend/src/app/widget/`

**Твоє завдання:**
Твоя мета — зробити так, щоб створеного агента можна було вставити на будь-який сайт у світі. Напиши чистий Vanilla JS скрипт (`frontend/public/embed.js`), який клієнти будуть додавати на свої сайти. Цей скрипт має програмно створювати плаваючу кнопку (FAB) у кутку екрану та невидимий `<iframe>`, що завантажує наш віджет за посиланням `http://localhost:3000/widget/[agent_id]` (ID потрібно діставати з атрибута `data-agent` самого скрипта). 
Щоб iframe мав що завантажувати, створи окрему порожню сторінку в Next.js (`frontend/src/app/widget/[agent_id]/page.tsx`), на якій не буде нічого, окрім компонента `MockChatWidget`. Цей компонент має займати 100% ширини і висоти (без зовнішніх відступів чи меню), щоб ідеально вписатися у вікно iframe на клієнтському сайті.

---

### 🔵 ПОТІК 3: Frontend-інженер (UI/UX Конструктора)
**Відповідальний:** 1 людина
**Гілка:** `feature/builder-ui`
**Зона відповідальності:** `frontend/src/app/builder/` та `frontend/src/app/page.tsx`

**Твоє завдання:**
Твоя мета — завершити візуальний інтерфейс платформи та зв'язати його з бекендом. Зміни кнопку у візуальному конструкторі на "Save & Deploy", яка буде брати JSON-конфігурацію з Zustand-сховища і відправляти POST-запит на `http://localhost:8000/api/agents`. Після того, як бекенд поверне у відповідь `agent_id`, покажи користувачу гарне модальне вікно (Tailwind UI) з готовим HTML-кодом для копіювання (`<script src="http://localhost:3000/embed.js" data-agent="отриманий-uuid"></script>`). 
Також твоє завдання — створити презентабельний Landing Page на головній сторінці сайту з описом платформи "Agentic Studio" та кнопкою "Почати будівництво", а також зробити загальний "полішинг" інтерфейсу (тіні, градієнти, заокруглення) для фінальної презентації на хакатоні.
