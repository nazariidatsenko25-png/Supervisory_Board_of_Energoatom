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

class KnowledgeSource(BaseModel):
    source_type: str = "url"
    source_value: str = ""

class OutputFormat(BaseModel):
    format: str = "markdown"
    output_schema: str = ""

class ApiIntegration(BaseModel):
    method: str = "GET"
    url: str = ""
    headers: str = ""
    body: str = ""

class MemoryConfig(BaseModel):
    memory_type: str = "session"
    ttl_minutes: int = 60

class ConditionConfig(BaseModel):
    expression: str = ""

class AgentConfig(BaseModel):
    name: str = "Unnamed Agent"
    system_prompt: str
    tools: List[str] = []
    max_iterations: int = 5
    knowledge_sources: Optional[List[KnowledgeSource]] = []
    output_format: Optional[OutputFormat] = None
    api_integrations: Optional[List[ApiIntegration]] = []
    memory_config: Optional[MemoryConfig] = None
    conditions: Optional[List[ConditionConfig]] = []

class StreamRequest(BaseModel):
    agent_id: Optional[str] = None
    message: str
    session_id: Optional[str] = None
    system_prompt: Optional[str] = None
    tools: Optional[List[str]] = None
    max_iterations: Optional[int] = 5
    mock: Optional[bool] = False
    output_format: Optional[OutputFormat] = None
    knowledge_sources: Optional[List[KnowledgeSource]] = []
    api_integrations: Optional[List[ApiIntegration]] = []
    memory_config: Optional[MemoryConfig] = None
    conditions: Optional[List[ConditionConfig]] = []


# ─── AGENT CRUD ───

@app.post("/api/agents")
async def create_agent(config: AgentConfig):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    response = supabase.table("agents").insert({
        "name": config.name,
        "system_prompt": config.system_prompt,
        "tools": config.tools,
        "max_iterations": config.max_iterations,
        "knowledge_sources": [ks.dict() for ks in (config.knowledge_sources or [])],
        "output_format": config.output_format.dict() if config.output_format else None,
        "api_integrations": [ai.dict() for ai in (config.api_integrations or [])],
        "memory_config": config.memory_config.dict() if config.memory_config else None,
        "conditions": [c.dict() for c in (config.conditions or [])],
    }).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create agent")
        
    return {"agent_id": response.data[0]["id"]}


@app.get("/api/agents")
async def list_agents():
    """List all created agents."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    response = supabase.table("agents").select("*").execute()
    
    return {"agents": response.data or []}


@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent by ID."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    # First delete related sessions and messages
    sessions = supabase.table("sessions").select("id").eq("agent_id", agent_id).execute()
    if sessions.data:
        for session in sessions.data:
            supabase.table("messages").delete().eq("session_id", session["id"]).execute()
        supabase.table("sessions").delete().eq("agent_id", agent_id).execute()
    
    # Delete the agent
    response = supabase.table("agents").delete().eq("id", agent_id).execute()
    
    return {"status": "deleted", "agent_id": agent_id}


# ─── CHAT STREAMING ───

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
    await asyncio.sleep(0.3)
    yield f"data: {json.dumps({'type': 'status', 'content': 'Підключення до AI моделі...'})}\n\n"
    await asyncio.sleep(0.5)
    yield f"data: {json.dumps({'type': 'thought', 'content': f'Користувач запитує про \"{user_message}\". Мені потрібно проаналізувати, чи потребує це актуальних даних з інтернету, чи я можу відповісти з наявних знань.'})}\n\n"
    await asyncio.sleep(1.0)
    yield f"data: {json.dumps({'type': 'thought', 'content': 'Це питання потребує актуальної інформації. Вирішую скористатися пошуком Tavily для отримання свіжих даних.'})}\n\n"
    await asyncio.sleep(0.6)
    yield f"data: {json.dumps({'type': 'action', 'tool': 'web_search', 'args': {'query': user_message}})}\n\n"
    yield f"data: {json.dumps({'type': 'status', 'content': 'Виконую web_search...'})}\n\n"
    await asyncio.sleep(1.5)
    yield f"data: {json.dumps({'type': 'observation', 'content': f'Знайдено 5 релевантних результатів. Джерела: Wikipedia, Reuters, офіційні портали. Дані актуальні станом на 2026 рік.'})}\n\n"
    await asyncio.sleep(0.8)
    yield f"data: {json.dumps({'type': 'thought', 'content': 'Тепер у мене є актуальні дані з кількох авторитетних джерел. Синтезую інформацію у структуровану відповідь.'})}\n\n"
    await asyncio.sleep(1.0)
    yield f"data: {json.dumps({'type': 'message', 'content': f'На основі аналізу актуальних даних щодо \"{user_message}\":\\n\\n📊 **Ключові висновки:**\\n1. Тема активно обговорюється в експертному середовищі.\\n2. Знайдено кілька авторитетних джерел з актуальними даними.\\n3. Основні тренди вказують на позитивну динаміку.\\n\\n💡 *Це демонстрація Live Tracking — ви бачили процес мислення агента в реальному часі!*'})}\n\n"


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
        output_format_data = agent.get("output_format", None)
        knowledge_sources_data = agent.get("knowledge_sources", [])
        api_integrations_data = agent.get("api_integrations", [])
        memory_config_data = agent.get("memory_config", None)
        conditions_data = agent.get("conditions", [])
        
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

        # 4. Fetch conversation history when memory is enabled
        conversation_history = None
        if memory_config_data and session_id and not is_new_session:
            try:
                hist_resp = supabase.table("messages").select("role, content").eq("session_id", session_id).order("created_at", desc=False).limit(20).execute()
                if hist_resp.data and len(hist_resp.data) > 1:
                    conversation_history = hist_resp.data[:-1]  # Exclude the message we just inserted
            except Exception:
                pass  # Non-critical, continue without history
    else:
        # Direct mode (no DB, from builder preview)
        system_prompt = request.system_prompt or ""
        tools_config = request.tools or []
        max_iterations = request.max_iterations or 5
        output_format_data = request.output_format.dict() if request.output_format else None
        knowledge_sources_data = [ks.dict() for ks in (request.knowledge_sources or [])]
        api_integrations_data = [ai.dict() for ai in (request.api_integrations or [])]
        memory_config_data = request.memory_config.dict() if request.memory_config else None
        conditions_data = [c.dict() for c in (request.conditions or [])]
        session_id = None
        is_new_session = False
        conversation_history = None
    
    # 4. Generate response
    generator = execute_agent(
        system_prompt=system_prompt,
        tools_config=tools_config,
        max_iterations=max_iterations,
        user_message=request.message,
        output_format=output_format_data,
        knowledge_sources=knowledge_sources_data if knowledge_sources_data else None,
        api_integrations=api_integrations_data if api_integrations_data else None,
        memory_config=memory_config_data,
        conditions=conditions_data if conditions_data else None,
        conversation_history=conversation_history,
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
