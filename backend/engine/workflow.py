"""
Workflow executor — runs a sequence of agent steps, passing each step's output
as context to the next step.  Each "step" is essentially a mini-agent with its
own system prompt, tools, knowledge, etc.
"""

import json
from .react_loop import execute_agent


async def execute_workflow(
    steps: list[dict],
    user_message: str,
):
    """
    Execute a multi-step workflow sequentially.

    Each step in `steps` is a dict with:
      - step_id: str
      - label: str (human-readable label for the step)
      - system_prompt: str
      - tools: list[str]
      - max_iterations: int
      - knowledge_sources: list[dict] | None
      - output_format: dict | None
      - api_integrations: list[dict] | None
      - memory_config: dict | None
      - conditions: list[dict] | None

    The user_message feeds into step 0.  Each subsequent step receives the
    previous step's final output as its input.

    Yields SSE-formatted strings (same protocol as execute_agent), plus
    additional step_start / step_end events so the frontend can show progress.
    """
    total_steps = len(steps)
    context = user_message  # rolling context passed between steps

    for i, step in enumerate(steps):
        step_id = step.get("step_id", f"step-{i}")
        label = step.get("label", f"Step {i + 1}")

        # ── Announce step start ──
        yield f"data: {json.dumps({'type': 'step_start', 'step_index': i, 'total_steps': total_steps, 'step_id': step_id, 'step_label': label})}\n\n"

        # ── Run this step's agent ──
        step_final_message = ""

        async for chunk in execute_agent(
            system_prompt=step.get("system_prompt", ""),
            tools_config=step.get("tools", []),
            max_iterations=step.get("max_iterations", 5),
            user_message=context,
            output_format=step.get("output_format"),
            knowledge_sources=step.get("knowledge_sources"),
            api_integrations=step.get("api_integrations"),
            memory_config=step.get("memory_config"),
            conditions=step.get("conditions"),
            conversation_history=None,
        ):
            # Forward all SSE events from the inner agent to the client
            yield chunk

            # Capture the final message so we can pass it to the next step
            try:
                if chunk.startswith("data: "):
                    event_data = json.loads(chunk[6:].strip())
                    if event_data.get("type") == "message":
                        step_final_message = event_data.get("content", "")
            except Exception:
                pass

        # ── Announce step end ──
        output_preview = (step_final_message[:200] + "...") if len(step_final_message) > 200 else step_final_message
        yield f"data: {json.dumps({'type': 'step_end', 'step_index': i, 'step_id': step_id, 'output_preview': output_preview})}\n\n"

        # ── Pass this step's output as context to the next step ──
        if step_final_message:
            context = (
                f"Previous step ({label}) produced this output:\n\n"
                f"{step_final_message}\n\n"
                f"Now continue with the current step's instructions."
            )
