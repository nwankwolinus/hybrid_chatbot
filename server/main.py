from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import httpx
import os
from dotenv import load_dotenv

print(f"Starting server on port {os.getenv('PORT')}")  # Print port for debugging

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CSE_ID = os.getenv("GOOGLE_CSE_ID")

# Ensure all required environment variables are set
assert openai.api_key, "Missing OpenAI API key!"
assert GOOGLE_API_KEY, "Missing Google API key!"
assert CSE_ID, "Missing Google CSE ID!"

# Create FastAPI app
app = FastAPI()

# Add CORS middleware for frontend integration (adjust origin in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route to avoid 404 at /
@app.get("/")
async def root():
    return {"message": "Welcome to the chatbot API. Use the /chat endpoint to interact."}

# In-memory chat history
chat_history = []

# Request model
class ChatRequest(BaseModel):
    message: str

# Google Search function
async def google_search(query):
    url = f"https://www.googleapis.com/customsearch/v1?key={GOOGLE_API_KEY}&cx={CSE_ID}&q={query}"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        data = res.json()
        return "\n".join(item["snippet"] for item in data.get("items", [])[:3]) or "No results."

# Build prompt for OpenAI
def build_prompt(history, message, search_results):
    prompt = "You are a helpful assistant.\n"
    for msg in history:
        prompt += f"User: {msg['user']}\nAI: {msg['ai']}\n"
    prompt += f"User: {message}\nRelevant info:\n{search_results}\nAI:"
    return prompt

# POST endpoint for chatbot
@app.post("/chat")
async def chat(req: ChatRequest):
    search = await google_search(req.message)
    prompt = build_prompt(chat_history, req.message, search)
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=300,
        temperature=0.7,
        stop=["User:", "AI:"]
    )
    answer = response.choices[0].text.strip()
    chat_history.append({"user": req.message, "ai": answer})
    return {"response": answer}
