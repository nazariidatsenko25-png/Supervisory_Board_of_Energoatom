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
