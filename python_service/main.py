from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import re
from preprocess import clean_text

app = FastAPI(title="FakeShield Detection API")

# Load model and vectorizer at startup
model = None
vectorizer = None
phishing_model = None

# Define input schemas
class PostInput(BaseModel):
    text: str

class UrlInput(BaseModel):
    url: str

@app.on_event("startup")
def load_model():
    global model, vectorizer, phishing_model
    model_path = "fake_news_model.pkl"
    vectorizer_path = "vectorizer.pkl"
    phishing_model_path = "phishing_model.pkl"
    
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        print("Model and vectorizer loaded successfully.")
    else:
        print("Warning: Model files not found. Please run train.py first.")
        
    if os.path.exists(phishing_model_path):
        phishing_model = joblib.load(phishing_model_path)
        print("Phishing model loaded successfully.")
    else:
        print("Warning: Phishing model file not found.")

def extract_url_features(url: str):
    length = len(url)
    dots = url.count('.')
    hyphens = url.count('-')
    ip_pattern = re.compile(r'(?:http[s]?://)?(?:\d{1,3}\.){3}\d{1,3}')
    is_ip = 1 if ip_pattern.match(url) else 0
    is_https = 1 if url.lower().startswith('https') else 0
    return [length, dots, hyphens, is_ip, is_https]

@app.post("/predict")
def predict_fake_news(post: PostInput):
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
    
    if not post.text or len(post.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Preprocess the input text
    cleaned = clean_text(post.text)
    
    # Vectorize
    vectorized_text = vectorizer.transform([cleaned])
    
    # Predict
    prediction_idx = model.predict(vectorized_text)[0]
    probabilities = model.predict_proba(vectorized_text)[0]
    
    # 0 = True, 1 = Fake, 2 = General
    label_map = {0: "True", 1: "Fake", 2: "General"}
    confidence = probabilities[prediction_idx] * 100
    
    return {
        "prediction": label_map.get(prediction_idx, "Unknown"),
        "confidence": round(confidence, 2)
    }

@app.post("/scan-url")
def scan_url(input_data: UrlInput):
    if phishing_model is None:
        raise HTTPException(status_code=503, detail="Phishing model not loaded.")
        
    url = input_data.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")
        
    features = extract_url_features(url)
    prediction = phishing_model.predict([features])[0]
    probabilities = phishing_model.predict_proba([features])[0]
    
    confidence = probabilities[prediction] * 100
    
    # Map predictions (0 = Safe, 1 = Malicious/Suspicious)
    if prediction == 0:
        status = "Safe"
    else:
        # If confidence is moderate, label as Suspicious
        if confidence < 75:
            status = "Suspicious"
        else:
            status = "Malicious"
            
    return {
        "status": status,
        "confidence": round(confidence, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
