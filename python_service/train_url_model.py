import os
import re
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Key phishing indicator terms
PHISHING_KEYWORDS = [
    "login", "verify", "update", "secure", "bank", "free", "gift", "prize", 
    "account", "claim", "signin", "support", "billing", "recovery", "webscr"
]

def extract_features(url):
    url_lower = url.lower()
    
    # Feature 1: URL Length
    length = len(url)
    
    # Feature 2: Number of Dots
    dots = url.count('.')
    
    # Feature 3: Number of Hyphens
    hyphens = url.count('-')
    
    # Feature 4: Presence of IP Address
    ip_pattern = re.compile(r'(?:http[s]?://)?(?:\d{1,3}\.){3}\d{1,3}')
    is_ip = 1 if ip_pattern.match(url) else 0
    
    # Feature 5: HTTPS Usage
    is_https = 1 if url_lower.startswith('https') else 0
    
    # Feature 6: Count of phishing keywords
    num_keywords = sum(1 for kw in PHISHING_KEYWORDS if kw in url_lower)
    
    # Feature 7: Presence of custom port
    has_port = 1 if re.search(r':[0-9]+', url.replace('https://', '').replace('http://', '')) else 0
    
    return [length, dots, hyphens, is_ip, is_https, num_keywords, has_port]

def train_model():
    print("Generating comprehensive URL phishing dataset...")
    
    safe_domains = [
        "google.com", "wikipedia.org", "github.com", "amazon.in", "rbi.org.in",
        "isro.gov.in", "microsoft.com", "apple.com", "yahoo.com", "netflix.com",
        "youtube.com", "facebook.com", "twitter.com", "linkedin.com", "instagram.com",
        "medium.com", "stackoverflow.com", "reddit.com", "zoom.us", "dropbox.com"
    ]
    
    data = []
    
    # 1. Safe URLs (0)
    for domain in safe_domains:
        for _ in range(50):
            # Normal URL
            path = np.random.choice(["", "/index.html", "/help", "/about", "/contact", "/terms"])
            url = f"https://{domain}{path}"
            data.append(extract_features(url) + [0])
            
            # Safe URL with parameters (no phishing keywords)
            param = np.random.choice(["?q=search", "?category=books", "?ref=nav", "?lang=en"])
            url = f"https://{domain}/{param}"
            data.append(extract_features(url) + [0])

    # 2. Malicious/Phishing URLs (1)
    # IP-based malicious URLs (with and without paths/hyphens)
    for _ in range(300):
        ip = f"{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}"
        path = np.random.choice(["", "/login", "/verify", "/update-details", "/bank-access"])
        proto = np.random.choice(["http://", "https://"], p=[0.8, 0.2])
        url = f"{proto}{ip}{path}"
        data.append(extract_features(url) + [1])
        
    # Domain-based phishing (e.g., impersonation, subdomain spamming)
    for _ in range(700):
        proto = np.random.choice(["http://", "https://"], p=[0.7, 0.3])
        # Brand name + phishing keywords
        brand = np.random.choice(["paypal", "netflix", "amazon", "google", "rbi", "bankofamerica", "apple"])
        keyword = np.random.choice(PHISHING_KEYWORDS)
        tld = np.random.choice([".info", ".xyz", ".top", ".ru", ".cc", ".click", ".buzz"])
        
        pattern = np.random.choice([
            f"{brand}-{keyword}{tld}",
            f"{keyword}-{brand}{tld}",
            f"verification-{brand}-details{tld}"
        ])
        
        url = f"{proto}{pattern}/login"
        data.append(extract_features(url) + [1])

    # Custom ports on suspicious IPs/domains
    for _ in range(200):
        ip = f"{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}"
        port = np.random.choice(["8080", "8888", "8000", "5000"])
        url = f"http://{ip}:{port}/claim"
        data.append(extract_features(url) + [1])

    df = pd.DataFrame(data, columns=['length', 'dots', 'hyphens', 'is_ip', 'is_https', 'num_keywords', 'has_port', 'label'])
    
    X = df[['length', 'dots', 'hyphens', 'is_ip', 'is_https', 'num_keywords', 'has_port']]
    y = df['label']
    
    print(f"Total dataset size: {len(df)} samples")
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    model_path = "phishing_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Model successfully saved to {model_path}")
    print("Feature importances:")
    for feature, imp in zip(X.columns, model.feature_importances_):
        print(f" - {feature}: {imp:.4f}")

if __name__ == "__main__":
    train_model()
