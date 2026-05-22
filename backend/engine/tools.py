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
