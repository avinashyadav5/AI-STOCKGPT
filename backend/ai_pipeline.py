import os
import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.prebuilt import create_react_agent
from langchain.tools import tool

# Import external services
from services import get_finnhub_news, get_fmp_metrics, get_fmp_profile

# Import RAG (graceful fallback if not available)
try:
    from rag import query_rag
    RAG_ENABLED = True
except Exception:
    RAG_ENABLED = False

groq_api_key = os.getenv("GROQ_API_KEY")

# Initialize LLMs
llm = ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile", groq_api_key=groq_api_key)
nlp_llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=groq_api_key)

# ---------------------------------------------------------
# Agent Tools Definition
# ---------------------------------------------------------

@tool
def fetch_news_tool(ticker: str) -> str:
    """Fetch the latest news articles and headlines for a given stock ticker."""
    news = get_finnhub_news(ticker)
    if not news:
        return f"No recent news found for {ticker}."
    docs = []
    for n in news[:5]:
        headline = n.get('headline')
        summary = n.get('summary')
        if headline:
            docs.append(f"Headline: {headline}\nSummary: {summary}")
    return "\n\n".join(docs)

@tool
def fetch_financials_tool(ticker: str) -> str:
    """Fetch key financial metrics (PE ratio, Market Cap, PB Ratio) for a given stock ticker."""
    metrics = get_fmp_metrics(ticker)
    if not metrics:
        return f"No financial metrics found for {ticker}."
    return f"Financial Metrics for {ticker}: PE Ratio: {metrics.get('peRatio', 'N/A')}, Market Cap: {metrics.get('marketCap', 'N/A')}, PB Ratio: {metrics.get('pbRatio', 'N/A')}"

@tool
def fetch_profile_tool(ticker: str) -> str:
    """Fetch the company profile and business description for a given stock ticker."""
    profile = get_fmp_profile(ticker)
    if not profile:
        return f"No company profile found for {ticker}."
    return f"Company Profile for {ticker}: {profile.get('description', 'N/A')}"

@tool
def filing_rag_tool(query: str) -> str:
    """Search the annual report / 10-K database for specific details about a company. 
    Use this for detailed fundamental questions like revenue breakdown, risks, CEO commentary, 
    segment performance, or long-term strategy. Available for AAPL, MSFT, NVDA, TSLA."""
    if not RAG_ENABLED:
        return "Annual report database is not currently available."
    result = query_rag(query)
    if not result:
        return f"No relevant annual report data found for query: {query}"
    return f"From Annual Reports:\n{result}"

tools = [fetch_news_tool, fetch_financials_tool, fetch_profile_tool, filing_rag_tool]

# ---------------------------------------------------------
# Agent Executor Setup
# ---------------------------------------------------------

system_instruction = (
    "You are an expert AI financial analyst. "
    "You have tools to fetch real-time news, financial metrics, and company profiles. "
    "Use them when necessary. Do NOT give financial advice. "
    "Synthesize the data returned by the tools into a professional, well-formatted markdown response.\n\n"
)

def run_ai_agent(message: str, ai_model: str = "llama-3.3-70b-versatile", prompt_addon: str = "") -> str:
    """Executes the multi-agent workflow."""
    try:
        req_llm = ChatGroq(temperature=0, model_name=ai_model, groq_api_key=groq_api_key)
        agent_executor = create_react_agent(req_llm, tools=tools)
    except Exception as e:
        print(f"Failed to initialize AgentExecutor: {e}")
        return "Agent system is currently unavailable."
        
    full_instruction = system_instruction + "\n" + prompt_addon
    try:
        # Pass system message at invocation time to avoid version incompatibilities in create_react_agent
        result = agent_executor.invoke({
            "messages": [
                SystemMessage(content=full_instruction),
                HumanMessage(content=message)
            ]
        })
        # The result is a dict with "messages" array. The last message is the AI response.
        return result["messages"][-1].content
    except Exception as e:
        print(f"Agent Error: {e}")
        return "I encountered an error while coordinating my agents to answer your query."

# ---------------------------------------------------------
# Utilities
# ---------------------------------------------------------

def get_intent_and_ticker(message: str) -> str:
    prompt_tpl = ChatPromptTemplate.from_messages([
        ("system", "Extract the stock ticker symbol or company name the user is asking about. If none, output NONE. Return ONLY the ticker or name."),
        ("user", "{message}")
    ])
    chain = prompt_tpl | nlp_llm
    try:
        res = chain.invoke({"message": message})
        val = res.content.strip()
        if val == "NONE":
            return None
        return val
    except Exception as e:
        print(f"NLP Error: {e}")
        return None

def analyze_news_sentiment(articles: list) -> list:
    if not articles:
        return []
    
    news_text = ""
    for idx, a in enumerate(articles[:10]):
        news_text += f"[{idx}] {a.get('headline', '')} - {a.get('summary', '')[:200]}\n"
        
    prompt_tpl = ChatPromptTemplate.from_messages([
        ("system", "You are an expert financial AI. Analyze the sentiment of the following news articles.\n"
                   "Respond ONLY with a valid JSON array of objects. Each object MUST have:\n"
                   "- 'id': the integer index of the article\n"
                   "- 'sentiment': strictly 'Positive', 'Negative', or 'Neutral'\n"
                   "- 'impact': a concise 1-sentence explanation of the market impact.\n\n"
                   "Articles:\n{news_text}"),
        ("user", "Analyze the sentiment.")
    ])
    
    chain = prompt_tpl | nlp_llm
    try:
        res = chain.invoke({"news_text": news_text})
        content = res.content.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "", 1)
        if content.endswith("```"):
            content = content[:-3]
        
        parsed = json.loads(content.strip())
        
        for item in parsed:
            i = item.get("id")
            if i is not None and isinstance(i, int) and i < len(articles):
                articles[i]["sentiment"] = item.get("sentiment", "Neutral")
                articles[i]["impact"] = item.get("impact", "")
                
        for a in articles:
            if "sentiment" not in a:
                a["sentiment"] = "Neutral"
                a["impact"] = "Analysis unavailable."
                
        return articles
    except Exception as e:
        print(f"Sentiment Analysis Error: {e}")
        for a in articles:
            a["sentiment"] = "Neutral"
            a["impact"] = "AI could not determine impact."
        return articles
