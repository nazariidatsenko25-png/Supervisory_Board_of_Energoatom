import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def mock_sse_generator():
    events = [
        {"type": "thought", "content": "Починаю аналіз запиту..."},
        {"type": "thought", "content": "Зрозумів завдання. Потрібно використати веб-пошук."},
        {"type": "action", "tool": "web_search", "args": {"query": "prices"}},
        {"type": "observation", "content": "Знайдено 5 результатів."},
        {"type": "message", "content": "Я знайшов інформацію. Ось результати пошуку."},
    ]
    
    for event in events:
        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(1.0) # Імітація затримки генерації

@app.get("/api/chat/stream")
async def chat_stream():
    return StreamingResponse(
        mock_sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

@app.get("/health")
async def health_check():
    return {"status": "ok"}
