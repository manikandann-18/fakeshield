import os
import re
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def extract_features(url):
    # Feature 1: URL Length
    length = len(url)
    
    # Feature 2: Number of Dots
    dots = url.count('.')
    
    # Feature 3: Number of Hyphens
    hyphens = url.count('-')
    
    # Feature 4: Presence of IP Address
    # Check for IPv4 pattern
    ip_pattern = re.compile(r'(?:http[s]?://)?(?:\d{1,3}\.){3}\d{1,3}')
    is_ip = 1 if ip_pattern.match(url) else 0
    
    # Feature 5: HTTPS Usage
    is_https = 1 if url.lower().startswith('https') else 0
    
    return [length, dots, hyphens, is_ip, is_https]

def train_model():
    print("Generating synthetic URL phishing dataset...")
    
    # Safe URLs templates
    safe_domains = [
        "google.com", "wikipedia.org", "github.com", "amazon.in", "rbi.org.in",
        "isro.gov.in", "microsoft.com", "apple.com", "yahoo.com", "netflix.com",
        "youtube.com", "facebook.com", "twitter.com", "linkedin.com", "instagram.com",
        "medium.com", "stackoverflow.com", "reddit.com", "zoom.us", "dropbox.com"
    ]
    
    # Suspicious/Malicious URLs templates
    malicious_keywords = ["login", "verify", "update", "secure", "bank", "free", "gift", "prize", "account", "rbi-claim"]
    malicious_tlds = [".info", ".cc", ".ru", ".xyz", ".top", ".buzz", ".work", ".click"]
    
    data = []
    
    # 1. Generate Safe URLs (typically shorter, HTTPS, fewer hyphens, no IPs)
    for domain in safe_domains:
        for _ in range(50):
            # standard safe urls
            proto = "https://"
            path = np.random.choice(["", "/index.html", "/help", "/about", "/contact", "/terms"])
            url = f"{proto}{domain}{path}"
            features = extract_features(url)
            data.append(features + [0]) # 0 = Safe
            
    # 2. Generate Malicious/Phishing URLs (long, many hyphens, HTTP, contains IPs, suspicious TLDs)
    # Generate IP based URLs
    for _ in range(250):
        ip = f"{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}"
        path = "-" + "-".join(np.random.choice(malicious_keywords, np.random.randint(2, 4)))
        url = f"http://{ip}/{path}"
        features = extract_features(url)
        data.append(features + [1]) # 1 = Malicious
        
    # Generate domain based phishing URLs
    for _ in range(750):
        proto = np.random.choice(["http://", "https://"], p=[0.7, 0.3])
        sub = "-".join(np.random.choice(malicious_keywords, np.random.randint(2, 5)))
        domain = np.random.choice(safe_domains).replace(".com", "").replace(".org", "").replace(".in", "")
        tld = np.random.choice(malicious_tlds)
        url = f"{proto}{sub}-{domain}{tld}/verify-account"
        features = extract_features(url)
        data.append(features + [1]) # 1 = Malicious

    df = pd.DataFrame(data, columns=['length', 'dots', 'hyphens', 'is_ip', 'is_https', 'label'])
    
    X = df[['length', 'dots', 'hyphens', 'is_ip', 'is_https']]
    y = df['label']
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Save the model
    model_path = "phishing_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Model trained successfully and saved to {model_path}")
    print("Feature importances:")
    for feature, imp in zip(X.columns, model.feature_importances_):
        print(f" - {feature}: {imp:.4f}")

if __name__ == "__main__":
    train_model()
