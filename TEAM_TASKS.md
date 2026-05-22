# 📚 Agentic Studio: Ультимативний Технічний Посібник (Для Команди та ШІ)

Цей документ створено для абсолютного та безшовного занурення команди і їхніх AI-асистентів у проєкт **Agentic Studio**. Якщо ви використовуєте ШІ (Cursor, Claude, ChatGPT, GitHub Copilot тощо), просто скопіюйте ВВЕСЬ ЦЕЙ ФАЙЛ йому в контекст. Тут описано все: від концепції до конкретних рядків коду, які потрібно написати.

---

## 1. Про Проєкт (Що таке Agentic Studio?)
**Agentic Studio** — це no-code платформа для візуального створення, налаштування та миттєвого розгортання автономних AI-агентів. 
Три головні "кілер-фічі" платформи:
1. **React Flow Builder:** Користувачі збирають логіку агента як пазл (Нода Промпту -> Нода Інструментів -> Нода Обмежень).
2. **Live Thought Tracking:** У віджеті чату користувач бачить не просто відповідь, а ВЕСЬ процес мислення ШІ в реальному часі (як він думає, які інструменти викликає, які дані отримує).
3. **Deploy Anywhere:** Створений агент генерує 1 рядок JS-коду. Клієнт вставляє його на свій сайт (Wordpress, Shopify, кастомний HTML) і там миттєво з'являється плаваючий віджет чату.

Проєкт будується виключно на **безкоштовних технологіях**: Google Gemini 2.0 Flash (ШІ), Brave Search (пошук), Supabase (PostgreSQL БД), Vercel (деплой фронту), Render (деплой бекенду).

---

## 2. Поточний стан (Що вже працює в гілці `main`)
Ядро (Core) вже написане.
- **Фронтенд (`frontend/`):** Next.js (App Router). Вже є інтегрований React Flow (`/builder`), є `zustand` для зберігання конфігу (`agentStore.ts`), і є `MockChatWidget.tsx` (віджет чату).
- **Бекенд (`backend/`):** FastAPI. Вже є кастомний `ReAct` цикл (ми навмисно **не використовуємо** LangChain). Модель Gemini вміє викликати інструмент пошуку Brave.
- **Магія SSE (Server-Sent Events):** Бекенд стрімить дані на клієнт у суворому форматі:
  `data: {"type": "thought|action|observation|message", "content": "..."}\n\n`
  *ШІ-Асистентам заборонено ламати парсинг цих чанків у віджеті!*

---

## 3. Quick Start (Як запустити локально)
API-ключі не пушаться в Git, тому кожен розробник має зробити це локально:
1. У терміналі: `cd backend`
2. Створіть `.env`: `cp .env.example .env`
3. Вставте ваші ключі від Gemini та Brave у файл `.env`. Без них ШІ-агент не зможе генерувати відповіді.

---

## 4. API-Контракт (Не порушувати!)
Щоб бекенд і фронтенд не зламали роботу один одного, ось суворі формати:

### 4.1. POST `/api/agents` (Збереження конфігурації)
- **Request Body:** `{"system_prompt": "...", "tools": ["web_search"], "max_iterations": 5}`
- **Response:** `{"agent_id": "uuid-v4-string"}`

### 4.2. POST `/api/chat/stream` (Спілкування з агентом)
- **Request Body:** `{"agent_id": "uuid-v4", "message": "Привіт", "session_id": null}`
- **Response:** Потік `text/event-stream`.

---

## 🛠 5. ЗОНИ ВІДПОВІДАЛЬНОСТІ (3 ПОТОКИ = 3 ЛЮДИНИ)
Увага! Кожен розробник бере СВОЮ гілку і виконує СВОЄ комплексне завдання. Не лізьте у файли чужого потоку, щоб не було merge-конфліктів.

---

### 🔴 ПОТІК 1: Backend & Supabase Database
**Відповідальний:** 1 розробник
**Гілка:** `feature/supabase-backend`
**Зона відповідальності:** ТІЛЬКИ папка `backend/`

**Твоє комплексне завдання:**
Зараз бекенд працює без пам'яті. Твоя мета — підключити базу даних Supabase (PostgreSQL) за допомогою бібліотеки `supabase-py` (додай її в `requirements.txt`). 
У Supabase SQL Editor створи таблиці: `agents` (id, system_prompt, tools, max_iterations), `sessions` (id, agent_id), `messages` (id, session_id, role, content). 
У `main.py` створи Pydantic-моделі для API-контракту (див. пункт 4). Напиши ендпоінт `/api/agents`, який приймає конфіг від фронту, інсертить його в таблицю `agents` і повертає `agent_id`. 
Потім перепиши `/api/chat/stream`. Замість промпту він має приймати `agent_id`. Твій код має зробити SELECT з таблиці `agents`, щоб дістати промпт та інструменти. Якщо `session_id` не передано — створи новий запис у `sessions`. Збережи повідомлення юзера в `messages`. Виклич існуючу функцію `execute_agent`, і коли вона згенерує фінальну відповідь (`type: message`), збережи її в `messages` як роль `assistant`.

<details>
<summary>👨‍💻 Шпаргалка для ШІ: SQL та Pydantic (розгорнути)</summary>

```python
# Pydantic моделі для FastAPI
from pydantic import BaseModel
from typing import List, Optional

class AgentConfig(BaseModel):
    system_prompt: str
    tools: List[str] = []
    max_iterations: int = 5

class StreamRequest(BaseModel):
    agent_id: str
    message: str
    session_id: Optional[str] = None
```
```sql
-- Виконати в Supabase
CREATE TABLE agents (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), system_prompt TEXT, tools JSONB, max_iterations INT);
CREATE TABLE sessions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), agent_id UUID REFERENCES agents(id));
CREATE TABLE messages (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), session_id UUID REFERENCES sessions(id), role VARCHAR(50), content TEXT);
```
</details>

---

### 🟢 ПОТІК 2: Iframe & Widget Integration
**Відповідальний:** 1 розробник
**Гілка:** `feature/embed-widget`
**Зона відповідальності:** `frontend/public/` та `frontend/src/app/widget/`

**Твоє комплексне завдання:**
Твоя мета — зробити так, щоб агента можна було вставити куди завгодно через Vanilla JS сніпет. 
Створи файл `frontend/public/embed.js`. Це чистий JavaScript (без React). У ньому знайди скрипт, через який його викликали (`document.currentScript`), і витягни атрибут `data-agent`. Програмно через `document.createElement` створи `<div>` контейнер (позиція `fixed`, `bottom-5`, `right-5`, `z-index: 999999`). У ньому створи кнопку "Чат" та невидимий `<iframe>`. Коли юзер клікає на кнопку, iframe має ставати видимим. Атрибут `src` у iframe має бути: `http://localhost:3000/widget/[agent_id]`.
Щоб iframe завантажував наш React-додаток, створи ізольовану сторінку в Next.js: файл `frontend/src/app/widget/[agent_id]/page.tsx` (в директорії app). На цій сторінці має рендеритися ТІЛЬКИ компонент `MockChatWidget`. Прибери звідти всі глобальні хедери, відступи (`margin: 0`), і зроби віджет на 100% ширини і висоти екрану (`w-full h-screen`). Сторінка має зчитувати `agent_id` з URL-параметра (через `params.agent_id` в Next.js) і передавати його як пропс у `MockChatWidget`, щоб віджет знав, з яким агентом він спілкується.

<details>
<summary>👨‍💻 Шпаргалка для ШІ: Логіка embed.js (розгорнути)</summary>

```javascript
(function() {
    // Шукаємо свій тег script
    const currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    const agentId = currentScript.getAttribute('data-agent');

    // Створюємо iframe
    const iframe = document.createElement('iframe');
    iframe.src = `http://localhost:3000/widget/${agentId}`;
    iframe.style.cssText = 'position: fixed; bottom: 80px; right: 20px; width: 380px; height: 600px; border: none; border-radius: 12px; display: none; z-index: 999999; box-shadow: 0 10px 25px rgba(0,0,0,0.1);';
    
    // Створюємо кнопку
    const btn = document.createElement('button');
    btn.innerHTML = '💬';
    btn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border-radius: 25px; border: none; background: #000; color: #fff; cursor: pointer; z-index: 999999; font-size: 24px;';
    
    btn.onclick = () => { iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none'; };

    document.body.appendChild(iframe);
    document.body.appendChild(btn);
})();
```
</details>

---

### 🔵 ПОТІК 3: Frontend Builder UI & Landing Page
**Відповідальний:** 1 розробник
**Гілка:** `feature/builder-ui`
**Зона відповідальності:** `frontend/src/app/builder/`, `frontend/src/app/page.tsx` та загальний UI

**Твоє комплексне завдання:**
Твоя мета — завершити візуальну частину платформи (React Flow) і зв'язати її з бекендом, а також зробити красивий лендінг.
У файлі `frontend/src/app/builder/page.tsx` зроби кнопку "Save & Deploy". При натисканні витягни конфіг із Zustand (`getAgentConfig()`) і відправ POST-запит на `http://localhost:8000/api/agents` за допомогою `fetch`. Коли бекенд поверне `{ "agent_id": "uuid..." }`, відкрий гарне Tailwind-модальне вікно (Dialog). У ньому покажи користувачу HTML-код: `<script src="http://localhost:3000/embed.js" data-agent="отриманий-uuid"></script>` з кнопкою "Скопіювати в буфер" (`navigator.clipboard.writeText`).
Друга частина — Лендінг. Перепиши `frontend/src/app/page.tsx`. Зроби там презентацію продукту "Agentic Studio" з емоційним копірайтингом, описом фіч (Візуальний конструктор, Live Thought Tracking, Deploy Anywhere) і великою кнопкою "Build Agent", яка веде на `/builder`. Доведи UI до ідеалу: додай Tailwind-тіні (`shadow-lg`), градієнтні фони, сучасний вигляд нодам у React Flow. Продукт має виглядати дорого.

<details>
<summary>👨‍💻 Шпаргалка для ШІ: Fetch запит (розгорнути)</summary>

```typescript
const handleDeploy = async () => {
    const config = getAgentConfig(); // Функція з Zustand
    try {
        const res = await fetch('http://localhost:8000/api/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const data = await res.json();
        // data.agent_id - це те, що потрібно вставити в модалку з embed-скриптом
        setShowSuccessModal(true);
        setGeneratedScript(`<script src="http://localhost:3000/embed.js" data-agent="${data.agent_id}" defer></script>`);
    } catch (e) {
        console.error(e);
    }
};
```
</details>
