# 🚀 VibeMatch
### AI-Powered Hackathon Preparation Platform

> Prepare smarter. Build better. Win more hackathons.

VibeMatch is an AI-powered platform designed to help hackathon participants prepare efficiently from idea generation to final submission. It combines multiple AI-driven modules into a single application that assists users with skill assessment, team formation, project validation, architecture planning, roadmap generation, feature prioritization, pitch preparation, judge simulation, and documentation generation.

---

## 🌐 Live Demo

**Live Application:**  
https://vibematch-snowy-five.vercel.app/

---

# 📖 Overview

Hackathon participants often struggle with:

- Finding the right teammates
- Identifying missing technical skills
- Validating project ideas
- Planning system architecture
- Prioritizing features
- Creating professional presentations
- Writing documentation under time pressure

VibeMatch solves these challenges by providing AI-powered assistance throughout the complete hackathon preparation journey.

---

# ✨ Features

## 🧠 Skill Analyzer
- AI-powered skill assessment
- Detects strengths and skill gaps
- Personalized learning recommendations
- Radar chart visualization

---

## 👥 Team Builder
- Suggests complementary teammates
- Skill compatibility analysis
- Role recommendations
- Team balance scoring

---

## 💡 Project Validator
- Feasibility analysis
- Originality scoring
- Risk detection
- Improvement suggestions

---

## 🏗️ Architecture Generator
- System architecture recommendations
- Technology stack suggestions
- Component relationships
- Deployment guidance

---

## 📅 Roadmap Generator
- Development milestones
- Timeline planning
- Task dependency mapping
- Effort estimation

---

## ⭐ Feature Prioritizer
- MoSCoW prioritization
- Impact vs Effort analysis
- MVP planning
- Feature ranking

---

## 🎤 Pitch Generator
- Complete hackathon pitch
- Problem statement
- Solution explanation
- Market opportunity
- Demo flow
- Closing statement

---

## 🏆 Judge Simulator
- Simulated hackathon judges
- Project scoring
- AI feedback
- Improvement recommendations

---

## 📄 Documentation Generator
- Automatic README generation
- Technical documentation
- Setup instructions
- Architecture description
- Markdown export

---

# 🛠 Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide Icons

## Backend

- Vercel Serverless Functions
- Edge Runtime

## Database

- Supabase
- PostgreSQL

## Authentication

- Supabase Auth

## AI

- Google Gemini 3.5 Flash Lite
- Google Generative AI API

## Deployment

- Vercel

---

# ⚙️ Project Architecture

```
User
   │
   ▼
React Frontend
   │
   ▼
Vercel Serverless API
   │
   ▼
Google Gemini API
   │
   ▼
AI Response (Streaming)
   │
   ▼
Frontend UI
```

---

# 📂 Project Structure

```
VibeMatch/
│
├── api/
│   ├── chat.js
│   └── health.js
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── lib/
│   ├── prompts/
│   ├── hooks/
│   └── utils/
│
├── public/
│
├── vercel.json
├── package.json
└── README.md
```

---

# 🔄 Application Workflow

```
Create Account
      │
      ▼
Setup Profile
      │
      ▼
Analyze Skills
      │
      ▼
Find Team
      │
      ▼
Validate Project
      │
      ▼
Generate Architecture
      │
      ▼
Create Roadmap
      │
      ▼
Prioritize Features
      │
      ▼
Generate Pitch
      │
      ▼
Practice with AI Judge
      │
      ▼
Generate Documentation
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/yourusername/VibeMatch.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file.

```env
GEMINI_API_KEY=your_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## Run Locally

```bash
npm run dev
```

---

## Build Project

```bash
npm run build
```

---

# 📦 Deployment

The application is deployed using **Vercel**.

Deployment includes:

- Frontend Hosting
- Serverless Functions
- Edge Runtime
- Environment Variables
- Automatic Builds

---

# 🤖 AI Integration

VibeMatch uses **Google Gemini 3.5 Flash Lite** through serverless functions.

Features include:

- Streaming AI responses
- Context-aware prompts
- Structured JSON outputs
- Module-specific prompt engineering
- Server-Sent Events (SSE)

---

# 🔐 Security

- Supabase Authentication
- Row-Level Security (RLS)
- Secure Environment Variables
- HTTPS Deployment
- Server-side API Keys

---

# 📈 Future Improvements

- Real-time collaboration
- Team workspace
- GitHub integration
- Notion integration
- Mobile application
- AI analytics dashboard
- Project templates
- Community sharing
- Premium features

---

# 🎯 Target Users

- Students
- Developers
- Designers
- Startup founders
- Hackathon participants
- Educational institutions
- Hackathon organizers

---

# 📊 Expected Impact

- Faster hackathon preparation
- Better team formation
- Improved project quality
- Higher presentation scores
- Professional documentation
- AI-assisted planning

---

