import pandas as pd
import random

# Knowledge Base for True News
true_subjects = ["ISRO", "RBI", "Election Commission", "Lok Sabha", "Supreme Court", "Sensex", "Nifty 50", "Indian Army", "Finance Ministry", "PM Modi", "Tata Motors", "Reliance Industries", "DRDO"]
true_actions = ["announces", "successfully launches", "reports", "declares", "concludes", "passes new bill on", "inaugurates", "invests in"]
true_objects = ["new space mission", "quarterly monetary policy", "election dates for assembly", "economic growth data", "infrastructure project", "green energy initiative", "foreign direct investment"]

# Knowledge Base for Fake News (WhatsApp Rumors)
hoax_intros = ["Forward to 10 people!", "Breaking News:", "Hidden truth!", "Urgent warning:", "BCCI sources claim:", "Leaked document:"]
fake_subjects = ["UNESCO", "WHO", "RBI", "Government", "Secret society", "Local doctor", "WhatsApp CEO"]
fake_actions = ["declares Indian National Anthem best in the world", "puts nano GPS chip in ₹2000 notes", "bans WhatsApp starting tonight", "finds cure for all viruses using lemon water", "will charge money for every message", "declares lockdown from tomorrow"]

data = []

# Generate 3000 True News
for _ in range(3000):
    text = f"{random.choice(true_subjects)} {random.choice(true_actions)} {random.choice(true_objects)}."
    data.append({"text": text, "label": "True"})

# Generate 3000 Fake News
for _ in range(3000):
    text = f"{random.choice(hoax_intros)} {random.choice(fake_subjects)} {random.choice(fake_actions)}."
    data.append({"text": text, "label": "Fake"})

# Knowledge Base for Casual Social Media Text
casual_subjects = ["I", "We", "My friends and I", "Just", "Anyone", "Who else", "So"]
casual_actions = ["went to", "had", "bought", "watched", "am thinking about", "love", "hate", "miss"]
casual_objects = ["the gym today", "a great coffee", "a new movie", "dinner at a restaurant", "the weekend", "this weather", "sleeping all day", "working on a project"]
casual_endings = ["!", "...", " :)", " lol", " tbh", "", " anyone?"]
casual_extras = ["Hello world this is a test post.", "Testing the app.", "Just checking if this works.", "Hi guys what's up.", "Good morning everyone!"]

# Generate 5000 Casual/Neutral posts
for _ in range(4000):
    text = f"{random.choice(casual_subjects)} {random.choice(casual_actions)} {random.choice(casual_objects)}{random.choice(casual_endings)}"
    data.append({"text": text, "label": "General"})

for _ in range(1000):
    data.append({"text": random.choice(casual_extras), "label": "General"})

df = pd.DataFrame(data)

# Shuffle the dataset
df = df.sample(frac=1).reset_index(drop=True)

df.to_csv("indian_news_dataset.csv", index=False)
print(f"Successfully generated {len(df)} rows of synthetic Indian news dataset.")
