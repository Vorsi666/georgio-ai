# Georgio AI Python Agent Service

This is a Python-based agent service built with LangChain and LangGraph that provides advanced reasoning capabilities for the Georgio AI application.

## Features

- Uses LangChain and LangGraph for structured reasoning
- Integrates with OpenAI-compatible APIs (including Pollinations AI and Alibaba Cloud Qwen via BaiLian)
- Provides a simple REST API for chat interactions
- Designed to work alongside the existing Georgio AI frontend (React/TypeScript)
- Includes basic error handling and logging

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   # Edit .env to add your API keys
   ```

3. Run the service:
   ```bash
   python src/main.py
   ```

   The service will be available at `http://localhost:8000`

## API Endpoints

- `POST /chat` - Main chat endpoint
  - Request body: `ChatRequest` (list of messages, optional mode)
  - Response: `ChatResponse` (the assistant's response)

- `GET /health` - Health check endpoint

## Integration with Georgio AI Frontend

The frontend can be configured to use this Python agent service by setting the `VITE_AGENT_URL` environment variable to point to this service's URL (e.g., `http://localhost:8000` when running locally).

The existing `streamAgentReply` function in `src/lib/agui-client.ts` will automatically use this endpoint when available.

## Environment Variables

See `.env.example` for required variables:
- `OPENAI_API_KEY`: Your OpenAI API key (or leave empty for Pollinations)
- `OPENAI_API_BASE`: Base URL for the API (default: Pollinations endpoint)
- `MODEL_NAME`: Model name to use (default: `openai-chat` for Pollinations)
- Optional LangSmith tracing variables for monitoring

## Notes

- This service is intended to replace the demo brain (`src/lib/demo-brain.ts`) for more advanced reasoning.
- The frontend continues to handle UI, video generation (via Remotion), and other client-side responsibilities.
- For production deployment, consider using a proper ASGI server and setting up HTTPS.