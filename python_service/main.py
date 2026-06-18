from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from preprocess import clean_text

app = FastAPI(title="FakeShield Detection API")

# Load model and vectorizer at startup
model = None
vectorizer = None

# Define input schema
class PostInput(BaseModel):
    text: str

@app.on_event("startup")
def load_model():
    global model, vectorizer
    model_path = "fake_news_model.pkl"
    vectorizer_path = "vectorizer.pkl"
    
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        print("Model and vectorizer loaded successfully.")
    else:
        print("Warning: Model files not found. Please run train.py first.")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
