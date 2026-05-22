import os
import json
import asyncio
from google import genai
from google.genai import types
from .tools import web_search, calculator

def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")
    return genai.Client(api_key=api_key)

async def execute_agent(system_prompt: str, tools_config: list[str], max_iterations: int, user_message: str):
    """
    Executes the ReAct loop using Gemini 2.0 Flash.
    Yields events formatted as SSE JSON strings.
    """
    try:
        client = get_client()
    except Exception as e:
        yield f"data: {json.dumps({'type': 'message', 'content': f'Помилка ініціалізації: {str(e)}'})}\n\n"
        return

    model = "gemini-2.0-flash"
    
    # Map requested tools to actual functions
    tool_funcs = []
    if "web_search" in tools_config:
        tool_funcs.append(web_search)
    if "calculator" in tools_config:
        tool_funcs.append(calculator)
        
    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        temperature=0.7,
        tools=tool_funcs if tool_funcs else None,
    )
    
    chat = client.chats.create(model=model, config=config)
    messages = [user_message]
    
    for i in range(max_iterations):
        yield f"data: {json.dumps({'type': 'thought', 'content': f'Ітерація {i+1} з {max_iterations}. Звертаюся до моделі...'})}\n\n"
        
        try:
            # We use send_message which takes the user message or tool response
            message_to_send = messages.pop() if messages else ""
            response = chat.send_message(message_to_send)
        except Exception as e:
            error_msg = str(e)
            # Retry once on rate limit (429) with backoff
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                yield f"data: {json.dumps({'type': 'thought', 'content': 'API ліміт. Повторюю через 3 секунди...'})}\n\n"
                await asyncio.sleep(3)
                try:
                    response = chat.send_message(message_to_send)
                except Exception as retry_e:
                    yield f"data: {json.dumps({'type': 'message', 'content': f'Помилка API: {str(retry_e)}'})}\n\n"
                    break
            else:
                yield f"data: {json.dumps({'type': 'message', 'content': f'Помилка API: {error_msg}'})}\n\n"
                break
            
        if response.function_calls:
            for function_call in response.function_calls:
                tool_name = function_call.name
                tool_args = function_call.args
                
                yield f"data: {json.dumps({'type': 'action', 'tool': tool_name, 'args': tool_args})}\n\n"
                
                # Execute tool
                if tool_name == "web_search":
                    result = await web_search(**tool_args)
                elif tool_name == "calculator":
                    result = await calculator(**tool_args)
                else:
                    result = f"Unknown tool: {tool_name}"
                    
                # Shorten observation for UI if needed
                obs_preview = str(result)[:300] + "..." if len(str(result)) > 300 else str(result)
                yield f"data: {json.dumps({'type': 'observation', 'content': obs_preview})}\n\n"
                
                # We need to send the tool result back to the model in the next iteration
                # Gemini expects it as a Part with function_response
                messages.append(
                    types.Part.from_function_response(
                        name=tool_name,
                        response={"result": result}
                    )
                )
            continue # go to next iteration to send the observation
            
        elif response.text:
            yield f"data: {json.dumps({'type': 'message', 'content': response.text})}\n\n"
            break # Done
            
    else:
        yield f"data: {json.dumps({'type': 'message', 'content': 'Досягнуто ліміт ітерацій.'})}\n\n"
