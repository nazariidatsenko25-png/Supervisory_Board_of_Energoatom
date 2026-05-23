"""
Demo Mode — scripted SSE generator for pitch-safe live demos.

When the demo prompt is detected, this module returns a pre-scripted
perfect sequence of events that simulates the agent thinking, using
web search, and generating a structured answer.  Uses asyncio.sleep()
to simulate natural streaming speed.

Activate by sending a message that starts with the DEMO_TRIGGER prefix,
or by setting the environment variable DEMO_MODE=1.
"""

import json
import asyncio
import os

# ── The trigger prompt (case-insensitive prefix match) ──
DEMO_TRIGGER = "проаналізуй конкурентів"

# ── Check if demo mode is forced globally ──
def is_demo_mode() -> bool:
    return os.getenv("DEMO_MODE", "").strip() in ("1", "true", "yes")

def should_use_demo(user_message: str) -> bool:
    """Check if the user message triggers demo mode."""
    if is_demo_mode():
        return True
    return user_message.strip().lower().startswith(DEMO_TRIGGER)


async def execute_demo(user_message: str):
    """
    Async generator that yields pre-scripted SSE events.
    Mimics the exact same event format as execute_agent().
    """
    # ── Step 1: Thinking ──
    thought_text = (
        "Для виконання цього завдання мені потрібно:\n"
        "1. Знайти інформацію про основних конкурентів у цій сфері\n"
        "2. Проаналізувати їхні продукти та ціни\n"
        "3. Скласти порівняльну таблицю\n\n"
        "Почну з пошуку актуальної інформації в інтернеті."
    )
    yield f"data: {json.dumps({'type': 'thought', 'content': thought_text})}\n\n"
    await asyncio.sleep(1.2)

    # ── Step 2: Tool Call — Web Search ──
    yield f"data: {json.dumps({'type': 'action', 'tool': 'web_search', 'input': {'query': 'top AI agent platforms 2026 pricing comparison'}})}\n\n"
    await asyncio.sleep(0.5)

    yield f"data: {json.dumps({'type': 'status', 'content': '🔍 Виконується пошук...'})}\n\n"
    await asyncio.sleep(1.8)

    observation_text = (
        "Title: AI Agent Platforms Comparison 2026\n"
        "URL: https://techreview.com/ai-agents-2026\n"
        "Content: The leading AI agent platforms in 2026 include:\n"
        "1. AutoGPT Enterprise — $299/month, limited tool integrations\n"
        "2. LangFlow Pro — $199/month, complex setup required\n"
        "3. CrewAI Cloud — $149/month, Python-only\n"
        "4. AgentGPT — Free tier available, basic features only\n\n"
        "Title: No-Code AI Agent Builder Market Report\n"
        "URL: https://ainews.io/no-code-agents\n"
        "Content: The no-code AI agent market is growing 340% YoY. "
        "Key differentiators include visual builders, real-time execution "
        "tracking, and one-click deployment capabilities."
    )
    yield f"data: {json.dumps({'type': 'observation', 'content': observation_text})}\n\n"
    await asyncio.sleep(0.8)

    # ── Step 3: Second thought ──
    thought2 = (
        "Отримав дані про конкурентів. Тепер проаналізую їхні "
        "сильні та слабкі сторони порівняно з Agentic Studio і "
        "сформую структурований звіт."
    )
    yield f"data: {json.dumps({'type': 'thought', 'content': thought2})}\n\n"
    await asyncio.sleep(1.0)

    # ── Step 4: Final structured answer (streamed token-by-token) ──
    final_answer = """## 📊 Аналіз конкурентів: AI Agent Platforms 2026

### Порівняльна таблиця

| Платформа | Ціна | Візуальний конструктор | Live Tracking | Deploy Anywhere |
|-----------|------|----------------------|---------------|-----------------|
| **AutoGPT Enterprise** | $299/міс | ❌ Тільки код | ❌ | ❌ |
| **LangFlow Pro** | $199/міс | ⚠️ Обмежений | ❌ | ⚠️ REST API |
| **CrewAI Cloud** | $149/міс | ❌ Python only | ❌ | ❌ |
| **AgentGPT** | Безкоштовно | ⚠️ Базовий | ❌ | ❌ |
| **Agentic Studio** | — | ✅ Повний no-code | ✅ Реальний час | ✅ JS-віджет |

### Ключові висновки

🔹 **Agentic Studio** — єдина платформа з повноцінним візуальним конструктором на базі React Flow, де агент збирається перетягуванням блоків за 60 секунд.

🔹 **Live Tracking** — конкурентна перевага №1. Жоден конкурент не показує процес "мислення" агента в реальному часі (Thought → Action → Observation).

🔹 **Deploy Anywhere** — вбудовування через JS-віджет (iframe) одним рядком коду, без необхідності інтеграції з конкретною платформою.

🔹 **Вартість входу** — конкуренти вимагають $149–$299/міс за базовий функціонал. Agentic Studio працює на безкоштовних LLM (Claude API).

### Рекомендація
Agentic Studio займає унікальну нішу **no-code AI agent builder** з повною прозорістю виконання, що не має прямих аналогів на ринку."""

    # Stream the final answer token by token
    tokens = final_answer.split(" ")
    accumulated = ""
    for i, token in enumerate(tokens):
        accumulated += (" " if i > 0 else "") + token
        yield f"data: {json.dumps({'type': 'token', 'content': token + ' '})}\n\n"
        # Variable speed: faster for common words, slower for markdown headers
        delay = 0.03 if not token.startswith("#") else 0.08
        await asyncio.sleep(delay)

    # Send the complete message
    yield f"data: {json.dumps({'type': 'message', 'content': accumulated})}\n\n"
    yield f"data: {json.dumps({'type': 'done'})}\n\n"
