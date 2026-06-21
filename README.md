<div align="center">

<h1>✦ Skillify</h1>

<p><strong>An AI-powered adaptive skill assessment & personalized learning roadmap platform.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Neon-Database-00E5BF?style=flat-square&logo=neon" />
  <img src="https://img.shields.io/badge/Groq-LLaMA-F55036?style=flat-square" />
  <img src="https://img.shields.io/badge/n8n-Automation-EF5E0E?style=flat-square&logo=n8n" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" />
  <img src="https://img.shields.io/badge/Better_Auth-Enabled-6366F1?style=flat-square" />
</p>

</div>

---

> [!WARNING]
> **Adaptive Test feature is locked in the deployed/hosted version** due to resource constraints.
> To use it, you must **run the project locally** with your own environment setup.

---

## 🧠 What is Skillify?

Skillify is a Next.js application that helps developers and learners in two powerful ways:

1. **Adaptive Skill Testing** — Takes a personalized test based on your domain, tech stack, and target role. The difficulty adapts in real-time based on your performance.
2. **Roadmap Generation** — Answers a few guided questions and gets a fully personalized learning roadmap tailored to your goals and current knowledge.

---

## ✨ Features

### 🎯 Adaptive Skill Test

- Input your **domain**, **tech stack**, and **target role**
- Get a dynamically generated, personalized test
- **Adaptive difficulty** — answer correctly → next question gets harder; answer wrong → it gets easier
- After the test, an **end-to-end n8n pipeline** kicks in automatically:
  - Detects your **weak topics**
  - Fetches the **best resource from the internet** (video or article) for each weak area
  - Delivers a **personalized resource report**

### 🗺️ Roadmap Generator

- Designed for people who know their interest but don't know where to start
- Asks **conversational, personalized questions** — each answer shapes the next question
- Example flow: *"I'm interested in Cybersecurity"* → *"Have you tried it before?"* → *"Do you know Python?"* → generates a **fully personalized roadmap**
- Works for **any domain** — web dev, AI/ML, cybersecurity, cloud, and more

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 |
| Database | Neon (Serverless Postgres) |
| Auth | Better Auth + Google OAuth |
| AI / LLM | Groq API + LLaMA |
| Automation | n8n (self-hosted via Docker) |
| Deployment | Vercel (app) + Docker (n8n) |

---

## ⚙️ Local Setup

### Prerequisites

- Node.js 18+
- Docker (for n8n)
- A [Neon](https://neon.tech) account
- A [Groq](https://console.groq.com) API key
- Google OAuth credentials

### 1. Clone the repository

```bash
git clone https://github.com/i-piiyush/skillified
cd skillified
npm install
```

### 2. Set up environment variables

Create a `.env.local` file at the root:

```env
# Database (Neon)
DATABASE_URL=""

# Better Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# n8n
NEXT_PUBLIC_N8N_URL=""
N8N_WEBHOOK_SECRET=""
LLAMA_API_SECRET_KEY=""

# Groq
GROQ_API_KEY=""

# Feature Flags
NEXT_PUBLIC_AI_FEATURES_ENABLED=true
```

### 3. Set up n8n with Docker

The n8n automation pipeline runs in its own Docker container. A separate GitHub repo is provided with the pre-configured Docker setup.

**Step 1 — Clone the n8n Docker repo:**

```bash
git clone https://github.com/i-piiyush/n8n-skillify.git
cd n8n-skillify
```

**Step 2 — Start the container:**

```bash
docker compose up -d
```

n8n will be available at **`http://localhost:5678`**.

**Step 3 — Download the workflow:**

Download the `workflow.json` file from the link below:

👉 **[Download workflow.json](https://drive.google.com/file/d/1qj2QPxIV3FtMwEgpETbsL4iMO9bxmsP2/view?usp=sharing)**

**Step 4 — Import the workflow into n8n:**

1. Open **`http://localhost:5678`** in your browser
2. Go to **Workflows** → **Import from file**
3. Select the downloaded `workflow.json`
4. Hit **Save** and **Activate** the workflow

**Step 5 — Update your `.env.local`:**

```env
NEXT_PUBLIC_N8N_URL=http://localhost:5678
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> ✅ All features, including the **Adaptive Test**, are fully unlocked when running locally.

---

## 🔁 Post-Test Pipeline (n8n)

After you complete the adaptive skill test, an automated n8n workflow runs:

```
Test Complete
     │
     ▼
Weak Topic Detection
     │
     ▼
Internet Resource Search (per weak topic)
     │
     ▼
Personalized Resource Report (video / article)
```

The `workflow.json` is available for download here: **[Download workflow.json](https://drive.google.com/file/d/1qj2QPxIV3FtMwEgpETbsL4iMO9bxmsP2/view?usp=sharing)**

The Docker setup for n8n is available at: **[github.com/i-piiyush/n8n-skillify](https://github.com/i-piiyush/n8n-skillify)**

Clone the repo, run `docker compose up -d`, then import the workflow — see the [Local Setup](#️-local-setup) section for the full step-by-step guide.

---

## 🔐 Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | ✅ |
| `BETTER_AUTH_SECRET` | Random secret for session encryption | ✅ |
| `BETTER_AUTH_URL` | Base URL used by Better Auth | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `NEXT_PUBLIC_N8N_URL` | URL of your n8n instance | ✅ |
| `N8N_WEBHOOK_SECRET` | Shared secret for n8n webhook auth | ✅ |
| `LLAMA_API_SECRET_KEY` | API key for LLaMA model service | ✅ |
| `GROQ_API_KEY` | Groq API key for LLM inference | ✅ |
| `NEXT_PUBLIC_AI_FEATURES_ENABLED` | Feature flag to enable AI features | Optional |

---

## 📁 Project Structure

```
skillify/
├── app/                  # Next.js app directory
├── components/           # Reusable UI components
├── lib/                  # Utilities, DB client, auth config
├── .env.example           # Your local environment variables
└── README.md
```

---


---

<div align="center">
  <p>Built with ❤️ using Next.js, Neon, Groq & n8n</p>
</div>