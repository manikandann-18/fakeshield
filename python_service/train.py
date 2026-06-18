import pandas as pd
import joblib
from datasets import load_dataset
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import classification_report, accuracy_score
from preprocess import clean_text

def train_model():
    print("Fetching McIntire dataset from GitHub...")
    df_us = pd.read_csv("https://raw.githubusercontent.com/lutzhamel/fake-news/master/data/fake_or_real_news.csv")

    # In McIntire, label is 'FAKE' or 'REAL'
    df_us['label'] = df_us['label'].apply(lambda x: 1 if x == 'FAKE' else 0)

    if 'title' in df_us.columns and 'text' in df_us.columns:
        df_us['full_text'] = df_us['title'] + " " + df_us['text']
    else:
        df_us['full_text'] = df_us['text']
    
    df_us = df_us[['full_text', 'label']]

    print("Loading Indian synthesized dataset...")
    df_in = pd.read_csv("indian_news_dataset.csv")
    df_in['full_text'] = df_in['text']
    # 'Fake' -> 1, 'True' -> 0, 'General' -> 2
    def map_label(x):
        if x == 'Fake': return 1
        elif x == 'General': return 2
        return 0
    df_in['label'] = df_in['label'].apply(map_label)
    df_in = df_in[['full_text', 'label']]

    print("Merging datasets into a global hybrid dataset...")
    df = pd.concat([df_us, df_in], ignore_index=True)

    print("Cleaning text...")
    df['clean_text'] = df['full_text'].apply(clean_text)

    X = df['clean_text']
    y = df['label']

    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Vectorizing...")
    vectorizer = TfidfVectorizer(max_features=50000)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    print("Training Triple-Check Ensemble Model (Voting Classifier)...")
    lr = LogisticRegression(random_state=42, max_iter=500)
    nb = MultinomialNB()
    dt = DecisionTreeClassifier(max_depth=20, random_state=42)

    model = VotingClassifier(
        estimators=[('lr', lr), ('nb', nb), ('dt', dt)],
        voting='soft'
    )
    model.fit(X_train_tfidf, y_train)

    print("Evaluating...")
    y_pred = model.predict(X_test_tfidf)
    print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
    print(classification_report(y_test, y_pred, target_names=['True', 'Fake', 'General']))

    print("Saving model and vectorizer...")
    joblib.dump(model, 'fake_news_model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')
    print("Saved fake_news_model.pkl and vectorizer.pkl successfully.")

if __name__ == '__main__':
    train_model()
