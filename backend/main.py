import asyncio
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from dotenv import load_dotenv

from engine.react_loop import execute_agent

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    system_prompt: str = "Ви - корисний AI-асистент."
    tools: list[str] = []
    max_iterations: int = 5
    message: str

async def mock_sse_generator():
    events = [
        {"type": "thought", "content": "Починаю аналіз запиту..."},
        {"type": "thought", "content": "Зрозумів завдання. Потрібно використати веб-пошук."},
        {"type": "action", "tool": "web_search", "args": {"query": "приклад запиту"}},
        {"type": "observation", "content": "Знайдено 5 результатів."},
        {"type": "message", "content": "Я знайшов інформацію. Ось результати пошуку (Mock Mode)."},
    ]
    
    for event in events:
        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(1.0) # Імітація затримки генерації

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest, mock: bool = Query(False)):
    if mock:
        generator = mock_sse_generator()
    else:
        generator = execute_agent(
            system_prompt=request.system_prompt,
            tools_config=request.tools,
            max_iterations=request.max_iterations,
            user_message=request.message
        )
        
    return StreamingResponse(
        generator,
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
