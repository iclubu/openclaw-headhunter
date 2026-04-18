# 🧠 OpenClaw Headhunter (Clawbot)

AI-powered job hunting agent that acts like a cybersecurity headhunter.

This bot searches real job listings, analyzes them using an LLM, and returns the best matches based on a candidate profile.

---

## 🚀 Features

- 🔍 Real-time job search using SearXNG
- 🤖 AI-powered job matching (GPT-4o)
- 🧠 Candidate-aware scoring using profile JSON
- 🔄 Multi-agent switching (`/agent headhunter`, `/agent main`)
- 💬 Telegram bot interface
- 📊 Match scoring + skill gap analysis

---

```markdown
## 🧱 Architecture
User (Telegram)
/agent headhunter
↓
Clawbot (Node.js)
↓
SearXNG (job search aggregation)
↓
GPT-4o (ranking + reasoning)
↓
Structured job results

---

## ⚙️ Setup

### 1. Clone repo
git clone https://github.com/iclubu/openclaw-headhunter.git
cd openclaw-headhunter

### 2. Install dependencies
npm install

### 3. Set environment variables
Create:
nano ~/.openclaw/profile.env
Add:
GITHUB_TOKEN=your_token_here

### 4. Start bot
node soc-bot.js
💬 Usage
Switch agent
/agent headhunter
Example query
Find me 5 remote SOC Analyst jobs
📄 Output Example
Job Title
Company
Match Score %
Why it matches
Missing skills
Direct job URL
🧠 Candidate Profile

The bot uses:
openclaw-config/headhunter_profile.json
You can customize this file to tailor job matching.

🔐 Security
No secrets stored in repo
Uses environment variables for tokens
.gitignore prevents credential leaks

🛠️ Tech Stack
Node.js
TeleBot (Telegram API)
Axios
SearXNG
GPT-4o (via GitHub Models API)

🚧 Future Improvements
Job deduplication
Auto-apply workflow
Resume + cover letter generation
Job tracking dashboard


⭐ Why this project matters
This project demonstrates:
Job Search + AI integration
Real-time data processing
Automation of job intelligence workflows
Multi-agent system design
