# Math Problem Generator - Developer Assessment Starter Kit

## Overview

This is a starter kit for building an AI-powered math problem generator application. The goal is to create a standalone prototype that uses AI to generate math word problems suitable for Primary 5 students, saves the problems and user submissions to a database, and provides personalized feedback.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd math-problem-generator
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to find your:
   - Project URL (starts with `https://`)
   - Anon/Public Key

### 3. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database.sql`
3. Click "Run" to create the tables and policies

### 4. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and add your actual keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   GOOGLE_API_KEY=your_actual_google_api_key
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Your Task

### 1. Implement Frontend Logic (`app/page.tsx`)

Complete the TODO sections in the main page component:

- **generateProblem**: Call your API route to generate a new math problem
- **submitAnswer**: Submit the user's answer and get feedback

### 2. Create Backend API Route (`app/api/math-problem/route.ts`)

Create a new API route that handles:

#### POST /api/math-problem (Generate Problem)
- Use Google's Gemini AI to generate a math word problem
- The AI should return JSON with:
  ```json
  {
    "problem_text": "A bakery sold 45 cupcakes...",
    "final_answer": 15
  }
  ```
- Save the problem to `math_problem_sessions` table
- Return the problem and session ID to the frontend

#### POST /api/math-problem/submit (Submit Answer)
- Receive the session ID and user's answer
- Check if the answer is correct
- Use AI to generate personalized feedback based on:
  - The original problem
  - The correct answer
  - The user's answer
  - Whether they got it right or wrong
- Save the submission to `math_problem_submissions` table
- Return the feedback and correctness to the frontend

### 3. Requirements Checklist

- [ ] AI generates appropriate Primary 5 level math problems
- [ ] Problems and answers are saved to Supabase
- [ ] User submissions are saved with feedback
- [ ] AI generates helpful, personalized feedback
- [ ] UI is clean and mobile-responsive
- [ ] Error handling for API failures
- [ ] Loading states during API calls

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Assessment Submission

When submitting your assessment, provide:

1. **GitHub Repository URL**: https://github.com/evbermudez/ottodot-coding-task-full-stack
2. **Live Demo URL**: https://ottodot-coding-task-full-stack-git-main-eric-vincents-projects.vercel.app?_vercel_share=SMS1ltPdngNSLWY8ZkThcB89jhX2Enlj
3. **Supabase Credentials**: Add these to your README for testing:
   ```
   SUPABASE_URL: https://qinlfuuxvweeffjaivuw.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbmxmdXV4dndlZWZmamFpdnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTUyODAsImV4cCI6MjA3NjMzMTI4MH0.W96BRCIJzb0hHyIAkoipkfeamyGQw5t7Z7FutWojeHE
   ```

## Implementation Notes

*Please fill in this section with any important notes about your implementation, design decisions, challenges faced, or features you're particularly proud of.*

### My Implementation:

- AI-powered generation via Gemini with strict JSON output parsing and validation to guarantee we always persist structured problems.
- Sessions and submissions persisted in Supabase tables using server-side routes under `app/api/math-problem`.
- Frontend wiring uses modular components under `app/components` to keep the UI expressive for kids while wiring up loading/error states and feedback flows.
- Added selectable difficulty levels (Easy/Medium/Hard) that flow from the UI through the AI prompt to Supabase storage, ensuring repeatable problem difficulty control.
- Implemented a problem history view that surfaces the 20 most recent sessions alongside submission outcomes for quick review.
- Score tracking summary card keeps a live total of attempts, correct answers, and accuracy, backed by a dedicated API endpoint.
- Operation filters let users choose addition, subtraction, multiplication, division, or mixed problems; the selection is enforced by the AI prompt and stored with each session.
- Added an AI-powered hint system that generates strategy-focused nudges stored with each submission and surfaced in the UI/history.
- Generated step-by-step solutions stored with each submission, displayed to the learner and in the history view for review.
- Introduced reset functionality to clear Supabase tables from the UI, plus responsive adjustments and emoji-based controls to keep things playful on mobile.

## Additional Features (Optional)

If you have time, consider adding:

- [x] Difficulty levels (Easy/Medium/Hard)
- [x] Problem history view
- [x] Score tracking
- [x] Different problem types (addition, subtraction, multiplication, division)
- [x] Hints system
- [x] Step-by-step solution explanations

---

Good luck with your assessment! 🎯
