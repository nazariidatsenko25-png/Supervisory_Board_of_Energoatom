import os
import httpx
from pydantic import BaseModel, Field

async def web_search(query: str) -> str:
    """
    Search the web for current information using Brave Search API.
    
    Args:
        query: The search query to look up on the internet.
    """
    api_key = os.getenv("BRAVE_API_KEY")
    if not api_key:
        return "Error: BRAVE_API_KEY is not configured in environment."
        
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": api_key
    }
    params = {"q": query, "count": 5}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            results = data.get("web", {}).get("results", [])
            if not results:
                return "No results found."
                
            formatted_results = []
            for r in results:
                formatted_results.append(f"Title: {r.get('title')}\nURL: {r.get('url')}\nDescription: {r.get('description')}")
                
            return "\n\n".join(formatted_results)
    except Exception as e:
        return f"Error during web search: {str(e)}"
