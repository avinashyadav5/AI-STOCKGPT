import requests

try:
    res = requests.post(
        "http://127.0.0.1:8000/api/chat",
        json={"message": "What is the current PE ratio of AAPL?", "livePrice": {}}
    )
    print("Status:", res.status_code)
    print("Response:", res.json())
except Exception as e:
    print("Error:", e)
