import os
import json
import asyncio
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client

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

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
    print("Warning: SUPABASE_URL or SUPABASE_KEY is missing in .env")

class AgentConfig(BaseModel):
    system_prompt: str
    tools: List[str] = []
    max_iterations: int = 5

class StreamRequest(BaseModel):
    agent_id: Optional[str] = None
    message: str
    session_id: Optional[str] = None
    system_prompt: Optional[str] = None
    tools: Optional[List[str]] = None
    max_iterations: Optional[int] = 5
    mock: Optional[bool] = False

@app.post("/api/agents")
async def create_agent(config: AgentConfig):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    response = supabase.table("agents").insert({
        "system_prompt": config.system_prompt,
        "tools": config.tools,
        "max_iterations": config.max_iterations
    }).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create agent")
        
    return {"agent_id": response.data[0]["id"]}

async def sse_generator_wrapper(generator, session_id: Optional[str]):
    """Wraps the execute_agent generator to intercept the final message and save it."""
    final_message = ""
    async for chunk in generator:
        yield chunk
        try:
            if chunk.startswith("data: "):
                event_data = json.loads(chunk[6:].strip())
                if event_data.get("type") == "message":
                    final_message = event_data.get("content", "")
        except Exception:
            pass
            
    if final_message and supabase and session_id:
        supabase.table("messages").insert({
            "session_id": session_id,
            "role": "assistant",
            "content": final_message
        }).execute()

async def mock_generator(user_message: str):
    """Презентаційний Mock Mode: імітує повний ReAct цикл без реального LLM API."""
    import random
    await asyncio.sleep(0.5)
    yield f"data: {json.dumps({'type': 'thought', 'content': 'Аналізую запит користувача та визначаю стратегію відповіді...'})}\n\n"
    await asyncio.sleep(1.2)
    yield f"data: {json.dumps({'type': 'thought', 'content': 'Вирішую скористатися пошуком в інтернеті для отримання актуальної інформації.'})}\n\n"
    await asyncio.sleep(0.8)
    yield f"data: {json.dumps({'type': 'action', 'tool': 'web_search', 'args': {'query': user_message}})}\n\n"
    await asyncio.sleep(1.5)
    yield f"data: {json.dumps({'type': 'observation', 'content': f'Знайдено 5 релевантних результатів для запиту: {user_message}. Джерела включають аналітичні портали та офіційні сайти.'})}\n\n"
    await asyncio.sleep(1.0)
    yield f"data: {json.dumps({'type': 'thought', 'content': 'Синтезую отриману інформацію у фінальну відповідь...'})}\n\n"
    await asyncio.sleep(1.5)
    yield f"data: {json.dumps({'type': 'message', 'content': f'На основі аналізу актуальних даних щодо \"{user_message}\", ось що я знайшов:\n\n📊 **Ключові висновки:**\n1. Тема активно обговорюється в експертному середовищі.\n2. Знайдено кілька авторитетних джерел з актуальними даними.\n3. Основні тренди вказують на позитивну динаміку.\n\n💡 Це демонстрація Live Tracking — ви бачили процес мислення агента в реальному часі!'})}\n\n"


@app.post("/api/chat/stream")
async def chat_stream(request: StreamRequest):
    # Mock Mode — секретний триггер для безпечної презентації
    if request.mock:
        return StreamingResponse(
            mock_generator(request.message),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    if request.agent_id:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
            
        # 1. Fetch agent config
        response = supabase.table("agents").select("*").eq("id", request.agent_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        agent = response.data[0]
        system_prompt = agent.get("system_prompt", "")
        tools_config = agent.get("tools", [])
        max_iterations = agent.get("max_iterations", 5)
        
        # 2. Handle session
        session_id = request.session_id
        is_new_session = False
        if not session_id:
            response = supabase.table("sessions").insert({"agent_id": request.agent_id}).execute()
            session_id = response.data[0]["id"]
            is_new_session = True
            
        # 3. Save user message
        supabase.table("messages").insert({
            "session_id": session_id,
            "role": "user",
            "content": request.message
        }).execute()
    else:
        # Mock/Demo mode (no DB)
        system_prompt = request.system_prompt or ""
        tools_config = request.tools or []
        max_iterations = request.max_iterations or 5
        session_id = None
        is_new_session = False
    
    # 4. Generate response
    generator = execute_agent(
        system_prompt=system_prompt,
        tools_config=tools_config,
        max_iterations=max_iterations,
        user_message=request.message
    )
    
    async def final_generator():
        if is_new_session:
            yield f"data: {json.dumps({'type': 'session_created', 'session_id': session_id})}\n\n"
        
        async for chunk in sse_generator_wrapper(generator, session_id):
            yield chunk

    return StreamingResponse(
        final_generator(),
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
