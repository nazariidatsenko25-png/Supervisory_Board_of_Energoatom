# 📚 Agentic Studio: Максимально деталізований посібник для розробників та AI-асистентів

Цей документ створено для повного занурення в проєкт **Agentic Studio** нових розробників та їхніх AI-асистентів. Він містить детальну інформацію про архітектуру, API-контракти та покрокові інструкції з прикладами коду для кожного потоку розробки.

Усі використовувані інструменти (Gemini 2.0 Flash, Brave Search, Supabase, Vercel, Render) мають **повністю безкоштовні тарифи (Free Tiers)**, тому ніяких платіжних карток підключати не потрібно.

---

## 0. Підготовка до роботи (Quick Start)
**УВАГА:** Оскільки API-ключі не зберігаються в репозиторії (захищено через `.gitignore`), кожен розробник повинен налаштувати їх локально перед початком роботи:
1. Перейдіть у папку `backend/`.
2. Зробіть копію файлу `.env.example` та назвіть її `.env` (у терміналі: `cp .env.example .env`).
3. Відкрийте створений файл `.env` та вставте ваші власні безкоштовні ключі (Google Gemini та Brave Search). Без цього бекенд не зможе робити запити до ШІ.

---

## 🏗 1. Архітера Проєкту
- **Фронтенд (Папка `frontend/`):** 
  - Фреймворк: Next.js (App Router).
  - Стан: Zustand (управління графом `frontend/src/store/agentStore.ts`).
  - Візуалізація: React Flow (побудова логіки агента з Node-блоків).
  - Стилізація: Tailwind CSS.
- **Бекенд (Папка `backend/`):** 
  - Фреймворк: FastAPI (Python 3.10+).
  - LLM SDK: `google-genai` (офіційний SDK для Gemini 2.0 Flash).
  - HTTP-клієнт: `httpx` (для запитів до Brave Search API).
- **Оркестрація:** Замість LangChain ми використовуємо власний легкий цикл `ReAct`, який дозволяє перехоплювати інструменти та стрімити події в реальному часі через Server-Sent Events (SSE).

### 🔄 Життєвий цикл повідомлення (Як працює SSE)
Коли користувач відправляє повідомлення у віджеті, фронтенд зчитує `ReadableStream`.
Формат потоку від бекенду:
1. `data: {"type": "thought", "content": "Звертаюся до моделі..."}\n\n`
2. `data: {"type": "action", "tool": "web_search", "args": {"query": "..."}}\n\n`
3. `data: {"type": "observation", "content": "Результати пошуку..."}\n\n`
4. `data: {"type": "message", "content": "Фінальна відповідь користувачу"}\n\n`

**ВАЖЛИВО:** Цей формат не можна ламати, оскільки `MockChatWidget.tsx` містить складну логіку парсингу TCP-чанків, орієнтовану саме на розділювач `\n\n` та префікс `data: `.

---

## 🤝 2. Зафіксований API-Контракт

Для уникнення конфліктів команди розробляють свої частини, спираючись виключно на цей контракт.

### 2.1. Створення Агента (`POST /api/agents`)
Викликається фронтендом при натисканні "Save & Deploy" у конструкторі.
**Request Body (JSON):**
```json
{
  "system_prompt": "Ви - аналітик...",
  "tools": ["web_search"],
  "max_iterations": 5
}
```
**Response (200 OK):**
```json
{
  "agent_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 2.2. Потік Чату (`POST /api/chat/stream`)
Викликається віджетом під час розмови.
**Request Body (JSON):**
```json
{
  "agent_id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Яка погода?",
  "session_id": "999e4567-e89b-12d3-a456-426614174000" // Опціонально (передається якщо чат вже триває)
}
```
**Response:** `text/event-stream` (потік повідомлень). Якщо `session_id` не передано в запиті, бекенд повинен надіслати першим пакетом:
`data: {"type": "session_created", "session_id": "новий_uuid"}\n\n`

---

## 🛠 3. Гілки та Завдання (Stream Assignments)

Кожен розробник (або AI-асистент) повинен перемкнутися на свою гілку (наприклад, `git checkout feature/supabase-backend`) і працювати **тільки** у вказаних папках.

---

### 🔴 ПОТІК 1: База Даних Supabase та Бекенд
**Гілка:** `feature/supabase-backend`
**Директорія:** `backend/`
**Вимоги:**
1. **Інсталяція:** Додайте `supabase-py==2.3.4` у `backend/requirements.txt`.
2. **Схема БД (Виконати в Supabase SQL Editor):**
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
3. **Реалізація `/api/agents` у `main.py`:**
   Зчитати `SUPABASE_URL` та `SUPABASE_KEY` з `.env`. Ініціалізувати клієнт `supabase.create_client()`. Реалізувати збереження `ChatRequest` (старого) як конфігурації у БД.
4. **Оновлення `/api/chat/stream`:**
   - Змінити `ChatRequest` на `StreamRequest` (має поля `agent_id`, `message`, `session_id`).
   - По `agent_id` дістати з БД `system_prompt` і `tools`.
   - Зберегти `message` від юзера в таблицю `messages` з `role='user'`.
   - Викликати `execute_agent()`.
   - По завершенню генерації (після `type: message`) зберегти фінальну відповідь моделі в БД.

---

### 🟢 ПОТІК 2: Віджет-Сніпет (Embed Script) та Iframe
**Гілка:** `feature/embed-widget`
**Директорія:** `frontend/public/` та `frontend/src/app/widget/`
**Вимоги:**
1. **Створення Vanilla JS Сніпета:** Написати `frontend/public/embed.js`. Логіка:
   - Знайти скрипт, через який він завантажився: `const scriptTag = document.currentScript;`
   - Витягнути `data-agent`: `const agentId = scriptTag.getAttribute('data-agent');`
   - Створити контейнер `<div>` (fixed, bottom-0, right-0, z-index: 999999).
   - Всередині контейнера створити `<iframe>` зі стилями (ширина 380px, висота 600px, border: none, border-radius).
   - Встановити `iframe.src = 'http://localhost:3000/widget/' + agentId;`
   - Додати плаваючу кнопку (круглий `<button>`), яка робить iframe видимим/невидимим (`display: none` або `opacity: 0`).
2. **Створення ізольованого роута в Next.js:** 
   - Створити файл `frontend/src/app/widget/[agent_id]/page.tsx`.
   - На сторінці відрендерити **тільки** `MockChatWidget` (передавши `agent_id` як пропс або через Context). На цій сторінці не повинно бути відступів браузера (`margin: 0`), хедерів сайту чи футерів, оскільки вона житиме всередині iframe.
3. **Доробка `MockChatWidget.tsx`:** Він повинен приймати `agentId` та прибирати власну плаваючу кнопку, залишаючи лише саме вікно чату (оскільки кнопка відкриття тепер управляється клієнтським `embed.js`).

---

### 🔵 ПОТІК 3: UI Конструктора та Збереження Агента
**Гілка:** `feature/builder-ui`
**Директорія:** `frontend/src/app/builder/` та `frontend/src/app/page.tsx`
**Вимоги:**
1. **Кнопка "Save & Deploy":** 
   - У `frontend/src/app/builder/page.tsx` додати кнопку, яка збирає дані з графа: `const config = getAgentConfig();`
   - Зробити асинхронний запит: `fetch('http://localhost:8000/api/agents', { method: 'POST', body: JSON.stringify(config) })`.
2. **Модальне вікно успіху:**
   - Коли бекенд повертає `agent_id`, показати діалогове вікно.
   - Вікно має містити красивий блок коду з кнопкою "Copy to Clipboard":
     ```html
     <!-- Paste this script before the closing </body> tag -->
     <script src="http://localhost:3000/embed.js" data-agent="ТУТ_UUID" defer></script>
     ```
3. **Landing Page:** 
   - Оновити `frontend/src/app/page.tsx`. Зробити красивий лендінг.
   - Заголовок: "Agentic Studio — Будуй AI Агентів Візуально".
   - Опис: "Створюй автономних агентів, налаштовуй інструменти (Web Search) і вбудовуй їх на свій сайт за 1 хвилину."
   - Кнопка: "Почати створення (Start Building)", яка веде на `/builder`.
4. **UX Покращення:** У `agentStore.ts` та нодах додати стилізацію (Tailwind), щоб конструктор виглядав преміально (shadows, gradients, border-radius).

---
**Ключове правило для всіх AI-асистентів:** Ваше завдання — писати чистий, модульний код. Кожна гілка — це незалежний функціонал, тому **не намагайтеся редагувати файли з іншого потоку**. Після виконання потоку зміни будуть злиті (merged) у `main`.
