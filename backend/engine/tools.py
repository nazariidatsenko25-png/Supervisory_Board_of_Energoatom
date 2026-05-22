import os
import asyncio
from pydantic import BaseModel, Field
from tavily import TavilyClient

async def web_search(query: str) -> str:
    """
    Search the web for current information using Tavily API.
    
    Args:
        query: The search query to look up on the internet.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Error: TAVILY_API_KEY is not configured in environment."
        
    try:
        client = TavilyClient(api_key=api_key)
        response = await asyncio.to_thread(
            client.search,
            query=query,
            search_depth="advanced"
        )
        
        results = response.get("results", [])
        if not results:
            return "No results found."
            
        formatted_results = []
        for r in results:
            formatted_results.append(f"Title: {r.get('title')}\nURL: {r.get('url')}\nContent: {r.get('content')}")
            
        return "\n\n".join(formatted_results)
    except Exception as e:
        return f"Error during web search: {str(e)}"


async def calculator(expression: str) -> str:
    """
    Calculate a mathematical expression and return the result.
    
    Args:
        expression: The mathematical expression to evaluate (e.g., '2 + 2', '15 * 3.14', 'sqrt(144)').
    """
    import math
    try:
        # Safe subset of math functions
        safe_dict = {
            "abs": abs, "round": round, "min": min, "max": max,
            "sqrt": math.sqrt, "pow": pow, "log": math.log,
            "sin": math.sin, "cos": math.cos, "tan": math.tan,
            "pi": math.pi, "e": math.e,
        }
        result = eval(expression, {"__builtins__": {}}, safe_dict)
        return f"Result: {expression} = {result}"
    except Exception as e:
        return f"Error calculating '{expression}': {str(e)}"


async def call_api(url: str, method: str = "GET", headers: str = "", body: str = "") -> str:
    """
    Make an HTTP request to an external API and return the response.

    Args:
        url: The full URL to send the request to.
        method: HTTP method (GET, POST, PUT, PATCH, DELETE).
        headers: JSON string of HTTP headers, e.g. '{"Authorization": "Bearer ..."}'.
        body: JSON string of the request body (for POST/PUT/PATCH).
    """
    import httpx
    import json as _json

    try:
        parsed_headers = {}
        if headers and headers.strip():
            try:
                parsed_headers = _json.loads(headers)
            except _json.JSONDecodeError:
                return "Error: headers must be a valid JSON string."

        parsed_body = None
        if body and body.strip() and method.upper() in ("POST", "PUT", "PATCH"):
            try:
                parsed_body = _json.loads(body)
            except _json.JSONDecodeError:
                parsed_body = body  # Send as raw string

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.request(
                method=method.upper(),
                url=url,
                headers=parsed_headers,
                json=parsed_body if isinstance(parsed_body, dict) else None,
                content=parsed_body if isinstance(parsed_body, str) else None,
            )

        # Truncate large responses
        text = response.text[:2000] if len(response.text) > 2000 else response.text
        return f"Status: {response.status_code}\nResponse:\n{text}"

    except httpx.TimeoutException:
        return f"Error: Request to {url} timed out (15s limit)."
    except Exception as e:
        return f"Error calling API: {str(e)}"
