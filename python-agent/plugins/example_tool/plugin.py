from langchain.tools import Tool as LangchainTool

def hello_world_tool(query: str) -> str:
    """A simple tool that returns a greeting message."""
    # Extract name from query if provided, otherwise use "World"
    name = query.strip() if query.strip() else "World"
    return f"Hello, {name}!"

def get_tools():
    """Return a list of tools provided by this plugin."""
    return [
        LangchainTool(
            name="HelloWorld",
            func=hello_world_tool,
            description="Useful for saying hello to someone. Input should be a name (optional)."
        )
    ]