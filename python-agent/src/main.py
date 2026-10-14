import os
import logging
import re
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# LangChain and LangGraph imports
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import Tool
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from langchain_community.tools import DuckDuckGoSearchRun, WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain.tools import Tool as LangchainTool

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Georgio AI Agent Service", 
    version="1.0.0",
    description="Enhanced AI agent with tools, memory, guardrails, and tracing"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatMessage(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    mode: Optional[str] = "tanya"  # or "ringkas"

class ChatResponse(BaseModel):
    response: str
    tools_used: List[str] = []
    # Optional metadata for debugging

# Guardrail functions
def input_guardrail(text: str) -> str:
    """Input validation and sanitization."""
    if not text or not text.strip():
        raise ValueError("Input cannot be empty")
    # Limit length to prevent overly long inputs
    if len(text) > 2000:
        text = text[:2000] + "..."
    # Remove potential prompt injection attempts (basic)
    text = re.sub(r'(?i)(system\s*:|you\s+are\s+now|ignore\s+previous\s+instructions)', '', text)
    return text.strip()

def output_guardrail(text: str) -> str:
    """Output validation and sanitization."""
    if not text:
        return ""
    # Limit output length
    if len(text) > 3000:
        text = text[:3000] + "..."
    # Basic profanity filter (example words in Indonesian/English)
    profanity_list = ['tolol', 'goblok', 'idiot', 'stupid', 'fuck', 'shit', 'kontol', 'memek', 'anjay']
    lower_text = text.lower()
    for word in profanity_list:
        if word in lower_text:
            # Replace with asterisks
            text = re.sub(re.escape(word), '*' * len(word), text, flags=re.IGNORECASE)
    return text.strip()

# Initialize the LLM
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://text.pollinations.ai/openai/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "openai-chat")

# Check for LangSmith tracing
LANGCHAIN_TRACING = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
if LANGCHAIN_TRACING:
    logger.info("LangSmith tracing enabled")

llm = ChatOpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_API_BASE,
    model=MODEL_NAME,
    temperature=0.7,
)

# Initialize tools
def calculator_tool(query: str) -> str:
    """Simple calculator tool for basic arithmetic expressions."""
    try:
        # Only allow safe characters
        allowed = re.compile(r'^[0-9+\-*/().\s]+$')
        if not allowed.match(query):
            return "Error: Only basic arithmetic expressions are allowed."
        # Evaluate safely
        result = eval(query, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"Error in calculation: {str(e)}"

calc_tool = LangchainTool(
    name="Calculator",
    func=calculator_tool,
    description="Useful for answering mathematical questions. Input should be a mathematical expression like '2+2' or '(5*3)/2'."
)

# Search tools
try:
    search_tool = DuckDuckGoSearchRun()
    logger.info("DuckDuckGo search tool initialized")
except Exception as e:
    logger.warning(f"Could not initialize DuckDuckGoSearch: {e}")
    search_tool = None

try:
    wiki_wrapper = WikipediaAPIWrapper()
    wiki_tool = WikipediaQueryRun(api_wrapper=wiki_wrapper)
    logger.info("Wikipedia tool initialized")
except Exception as e:
    logger.warning(f"Could not initialize Wikipedia tool: {e}")
    wiki_tool = None

tools = [calc_tool]
tool_names = ["Calculator"]
if search_tool:
    tools.append(LangchainTool(
        name="DuckDuckGoSearch",
        func=search_tool.run,
        description="Useful for answering questions about current events, weather, or general knowledge search."
    ))
    tool_names.append("DuckDuckGoSearch")
if wiki_tool:
    tools.append(LangchainTool(
        name="Wikipedia",
        func=wiki_tool.run,
        description="Useful for getting summaries of topics from Wikipedia."
    ))
    tool_names.append("Wikipedia")

# System prompt builder
def build_system_prompt(mode: str) -> str:
    """Build system prompt based on mode."""
    if mode == "ringkas":
        return """Anda adalah Georgio AI, asisten yang membantu dan berpengetahuan luas.
Anda berkomunikasi dalam Bahasa Indonesia dengan gaya yang ringkas dan langsung ke inti.
Berikan jawaban yang singkat, padah, dan hanya informasi yang diperlukan.
Jika tidak yakin, katakan dengan jujur bahwa Anda tidak tahu.
Hindari bertele-tele atau detail yang tidak diperlukan."""
    else:  # default to "tanya"
        return """Anda adalah Georgio AI, asisten yang membantu, natural, dan berpengetahuan luas.
Anda berkomunikasi dalam Bahasa Indonesia dengan gaya yang ramah dan informatif.
Berikan jawaban yang jelas, terstruktur, dan berguna. 
Jika tidak yakin, katakan dengan jujur bahwa Anda tidak tahu dan tanyakan klarifikasi jika diperlukan.
Hindari bertele-tele, tapi juga jangan terlalu singkat sehingga kurang informatif.
Gunakan format yang mudah dibaca dengan paragraf dan poin bila sesuai."""

# Function to create agent chain with given mode and memory
def get_agent_chain(mode: str, memory: ConversationBufferMemory):
    """Create an agent chain with the specified mode and memory."""
    system_prompt = build_system_prompt(mode)
    return initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        memory=memory,
        handle_parsing_errors=True,
        max_iterations=5,
        early_stopping_method="generate",
        agent_kwargs={"system_message": system_prompt}
    )

# Fallback to simple LLM if agent fails
def simple_llm_response(messages: List[Dict[str, Any]], mode: str) -> str:
    """Fallback to direct LLM call if agent fails."""
    system_prompt = build_system_prompt(mode)
    lc_messages = [SystemMessage(content=system_prompt)]
    for msg in messages:
        if msg["role"] == "user":
            lc_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            lc_messages.append(AIMessage(content=msg["content"]))
    try:
        response = llm.invoke(lc_messages)
        return response.content
    except Exception as e:
        logger.error(f"LLM invocation failed: {e}")
        return "Maaf, saya sedang mengalami gangguan teknis. Silakan coba lagi nanti."

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint with tool usage and memory."""
    try:
        logger.info(f"Received request with {len(request.messages)} messages")
        
        # Extract the latest user message
        user_messages = [msg for msg in request.messages if msg.role == "user"]
        if not user_messages:
            raise ValueError("No user message found")
        latest_user_msg = user_messages[-1].content
        
        # Apply input guardrail
        try:
            cleaned_input = input_guardrail(latest_user_msg)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Determine mode from request (look for system message with "mode:")
        mode = "tanya"  # default
        for msg in request.messages:
            if msg.role == "system" and msg.content.startswith("mode:"):
                requested_mode = msg.content.split(":", 1)[1].strip()
                if requested_mode in ["tanya", "ringkas"]:
                    mode = requested_mode
                break
        
        # Prepare chat history for memory (excluding the latest user message)
        history_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages[:-1]  # exclude latest
        ]
        
        # Create memory and load history
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        for msg in history_messages:
            if msg["role"] == "user":
                memory.chat_memory.add_user_message(msg["content"])
            else:
                memory.chat_memory.add_ai_message(msg["content"])
        
        # Initialize agent chain with the determined mode and memory
        agent_chain = get_agent_chain(mode, memory)
        
        # Run the agent
        logger.info(f"Running agent in mode '{mode}' with tools...")
        result = agent_chain.run(input=cleaned_input)
        
        # For simplicity, we assume all tools might be used (in a real system we'd track this)
        tools_used = tool_names
        
        # Apply output guardrail
        cleaned_output = output_guardrail(result.strip())
        
        logger.info("Agent completed successfully")
        return ChatResponse(response=cleaned_output, tools_used=tools_used)
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        # Fallback to simple LLM response with the same mode and memory
        try:
            # Recreate memory for fallback (since we might have cleared it in the agent chain)
            memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
            history_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in request.messages[:-1]  # exclude latest
            ]
            for msg in history_messages:
                if msg["role"] == "user":
                    memory.chat_memory.add_user_message(msg["content"])
                else:
                    memory.chat_memory.add_ai_message(msg["content"])
            
            fallback_response = simple_llm_response(
                [{"role": msg.role, "content": msg.content} for msg in request.messages],
                mode
            )
            cleaned_output = output_guardrail(fallback_response.strip())
            return ChatResponse(response=cleaned_output)
        except Exception as fallback_error:
            logger.error(f"Fallback also failed: {str(fallback_error)}")
            raise HTTPException(status_code=500, detail="Agent service unavailable")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    tool_status = {
        "calculator": True,
        "duckduckgo": search_tool is not None,
        "wikipedia": wiki_tool is not None
    }
    return {
        "status": "healthy", 
        "service": "Georgio AI Agent",
        "version": "1.0.0",
        "tools": tool_status,
        "memory_enabled": True,
        "tracing_enabled": LANGCHAIN_TRACING,
        "note": "Agent chains are created per request with mode-specific system prompts"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)