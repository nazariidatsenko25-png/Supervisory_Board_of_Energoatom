import os
import json
import asyncio
from google import genai
from google.genai import types
from .tools import web_search, calculator

# ReAct system prompt that forces the model to "think out loud"
REACT_SYSTEM_PREFIX = """You are an autonomous AI agent that solves tasks step-by-step using the ReAct framework.

## Your Process
For EVERY user request, follow this cycle:

1. **THINK** — Analyze the request. What do you know? What do you need to find out? Which tool would help?
   Write your reasoning clearly, starting with "THINK:"

2. **ACT** — If you need external information, call an available tool.

3. **OBSERVE** — Analyze the tool's output. Did it answer the question? Do you need another tool call?

4. **RESPOND** — Once you have enough information, provide a comprehensive final answer.

## Rules
- ALWAYS start your first response with "THINK:" followed by your genuine reasoning
- Be specific in your thinking — mention what you're considering and why
- If a tool returns an error, explain what happened and try a different approach
- After receiving tool results, ALWAYS think again before responding ("THINK: Now that I have the search results...")
- Your final answer should synthesize all gathered information

## Example
User: "What is the current population of Tokyo?"
You: "THINK: The user wants the current population of Tokyo. This is a factual question about current data, so I should use web_search to find the most up-to-date information rather than relying on my training data which may be outdated."
[Then you call web_search]
After results: "THINK: I found several sources. According to the most recent data..."
[Then you give a final answer]
"""


def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")
    return genai.Client(api_key=api_key)


def extract_thoughts(text: str) -> tuple[list[str], str]:
    """
    Extract THINK: blocks from model text.
    Returns (list_of_thoughts, remaining_text_without_thinks).
    """
    thoughts = []
    remaining_lines = []
    
    lines = text.split('\n')
    current_think = None
    
    for line in lines:
        stripped = line.strip()
        if stripped.upper().startswith('THINK:'):
            if current_think is not None:
                thoughts.append(current_think.strip())
            current_think = stripped[6:].strip()
        elif current_think is not None:
            # Continue multi-line think block
            if stripped == '' or stripped.upper().startswith(('ACTION:', 'OBSERVE:', 'RESPOND:')):
                thoughts.append(current_think.strip())
                current_think = None
                if stripped and not stripped.upper().startswith('THINK:'):
                    remaining_lines.append(line)
            else:
                current_think += ' ' + stripped
        else:
            remaining_lines.append(line)
    
    # Flush last think block
    if current_think is not None:
        thoughts.append(current_think.strip())
    
    remaining = '\n'.join(remaining_lines).strip()
    return thoughts, remaining


async def execute_agent(system_prompt: str, tools_config: list[str], max_iterations: int, user_message: str):
    """
    Executes the ReAct loop using Gemini 2.0 Flash.
    Yields SSE events with real model reasoning.
    """
    try:
        client = get_client()
    except Exception as e:
        yield f"data: {json.dumps({'type': 'message', 'content': f'Помилка ініціалізації: {str(e)}'})}\n\n"
        return

    model = "gemini-2.0-flash"
    
    # Combine ReAct prefix with user's custom system prompt
    full_system_prompt = REACT_SYSTEM_PREFIX
    if system_prompt and system_prompt.strip():
        full_system_prompt += f"\n\n## Additional Instructions from Agent Creator\n{system_prompt}"

    # Map requested tools to actual functions
    tool_funcs = []
    if "web_search" in tools_config:
        tool_funcs.append(web_search)
    if "calculator" in tools_config:
        tool_funcs.append(calculator)
        
    config = types.GenerateContentConfig(
        system_instruction=full_system_prompt,
        temperature=0.7,
        tools=tool_funcs if tool_funcs else None,
    )
    
    # Status: connecting
    yield f"data: {json.dumps({'type': 'status', 'content': 'Підключення до AI моделі...'})}\n\n"
    
    chat = client.chats.create(model=model, config=config)
    messages = [user_message]
    
    for i in range(max_iterations):
        yield f"data: {json.dumps({'type': 'status', 'content': f'Крок {i+1}/{max_iterations} — модель аналізує...'})}\n\n"
        
        try:
            message_to_send = messages.pop() if messages else ""
            response = chat.send_message(message_to_send)
        except Exception as e:
            error_msg = str(e)
            # Retry once on rate limit (429)
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                yield f"data: {json.dumps({'type': 'status', 'content': 'API ліміт. Повторюю через 3 секунди...'})}\n\n"
                await asyncio.sleep(3)
                try:
                    response = chat.send_message(message_to_send)
                except Exception as retry_e:
                    yield f"data: {json.dumps({'type': 'message', 'content': f'Помилка API: {str(retry_e)}'})}\n\n"
                    break
            else:
                yield f"data: {json.dumps({'type': 'message', 'content': f'Помилка API: {error_msg}'})}\n\n"
                break
            
        # --- Process tool calls ---
        if response.function_calls:
            # If there's also text with THINK: blocks, extract and emit them first
            if response.text:
                thoughts, _ = extract_thoughts(response.text)
                for thought in thoughts:
                    if thought:
                        yield f"data: {json.dumps({'type': 'thought', 'content': thought})}\n\n"
            
            for function_call in response.function_calls:
                tool_name = function_call.name
                tool_args = function_call.args
                
                yield f"data: {json.dumps({'type': 'action', 'tool': tool_name, 'args': tool_args})}\n\n"
                yield f"data: {json.dumps({'type': 'status', 'content': f'Виконую {tool_name}...'})}\n\n"
                
                # Execute tool
                if tool_name == "web_search":
                    result = await web_search(**tool_args)
                elif tool_name == "calculator":
                    result = await calculator(**tool_args)
                else:
                    result = f"Unknown tool: {tool_name}"
                    
                # Shorten observation for UI
                obs_preview = str(result)[:500] + "..." if len(str(result)) > 500 else str(result)
                yield f"data: {json.dumps({'type': 'observation', 'content': obs_preview})}\n\n"
                
                # Send tool result back to model
                messages.append(
                    types.Part.from_function_response(
                        name=tool_name,
                        response={"result": result}
                    )
                )
            continue  # Next iteration to process tool results
            
        # --- Process text response ---
        elif response.text:
            thoughts, remaining = extract_thoughts(response.text)
            
            # Emit each thought as a separate SSE event
            for thought in thoughts:
                if thought:
                    yield f"data: {json.dumps({'type': 'thought', 'content': thought})}\n\n"
            
            # Emit the final message (text without THINK: blocks)
            final_text = remaining if remaining else response.text
            if final_text.strip():
                yield f"data: {json.dumps({'type': 'message', 'content': final_text})}\n\n"
            break  # Done
            
    else:
        yield f"data: {json.dumps({'type': 'message', 'content': 'Досягнуто ліміт ітерацій. Спробуйте збільшити максимальну кількість кроків.'})}\n\n"
