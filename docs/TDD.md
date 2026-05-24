Technical Design Document: AI-Driven Developer Portfolio (Solo Dev Edition)

1. System Architecture Overview
   The application will follow a Jamstack architecture, separating the presentation layer from backend logic.

Frontend Client: A Single Page Application (SPA) built with React and Vite.

Backend/API Layer: Vercel Serverless Functions (/api directory) to keep API keys hidden and securely proxy requests to third-party services.

Database: Firebase Firestore (NoSQL) to serve dynamic content (projects, skills) and log contact messages/chatbot interactions.

Deployment: Vercel (Auto-deployments triggered by pushing to the main branch).

Tech Stack Breakdown
Frontend Core: React 18, Vite, TypeScript.

Styling: Tailwind CSS, Framer Motion.

Database: Firebase Cloud Firestore.

Email Service: Resend.

AI Service: OpenAI API.

QA/Testing: Vitest (Local Unit/Component testing), Playwright (Local End-to-End testing).

2. Robust Data Model (Firestore)
   Using Firestore allows you to update your portfolio without needing to touch the codebase.

Collection: projects
JSON
{
"\_id": "doc_string_id",
"title": "E-Commerce QA Dashboard",
"purpose": "Internal tool to monitor automated test pass rates.",
"techStack": ["React", "Node.js", "Cypress", "Firestore"],
"role": "Full-Stack Developer & QA Lead",
"liveUrl": "https://dashboard.demo.com",
"githubUrl": "https://github.com/yourusername/repo",
"imageUrl": "https://link-to-hosted-image.jpg",
"order": 1,
"isFeatured": true
}
Collection: contact_messages
Backup database ensuring no messages are lost if the email service fails.

JSON
{
"\_id": "doc_string_id",
"senderName": "John Doe",
"senderEmail": "johndoe@company.com",
"message": "We would love to interview you...",
"status": "delivered",
"createdAt": "Timestamp (UTC)"
} 3. API Design & Integrations
3.1 Contact Form Endpoint
Route: POST /api/contact

Logic: Validate input -> Save to Firestore contact_messages -> Trigger Resend API to email you -> Return 200 OK.

3.2 AI Chatbot Endpoint
Route: POST /api/chat

Logic: Prepend a strict System Prompt with your resume data -> Send conversation history to OpenAI -> Stream response to frontend.

3.3 Dynamic Content Fetching
Route: Direct from Frontend to Firestore.

Logic: Fetch the public projects collection directly from the client using the Firebase Client SDK.

4. Security & Environment Variables
   Stored locally in .env and securely in the Vercel Dashboard:

Code snippet

# Firebase Client (Safe for Frontend)

VITE_FIREBASE_API_KEY=your_public_key
VITE_FIREBASE_PROJECT_ID=your_project_id

# Secure Keys (Vercel Functions Only - NEVER prefix with VITE\_)

OPENAI*API_KEY=sk-...
RESEND_API_KEY=re*...
PERSONAL_CONTACT_EMAIL=you@yourdomain.com 5. Quality Assurance & Local Testing Strategy
To prove your QA mindset, the repository will still feature a high standard of reliability, but tests will be run locally before you push to production.

Static Analysis: Strict TypeScript checking and ESLint/Prettier formatting.

Unit/Component Testing (Vitest):

Test the Contact Form validation logic.

Test the Dark Mode toggle state.

End-to-End Testing (Playwright):

Test 1: UI Navigation and Dark Mode toggle.

Test 2: Chatbot interaction (mocking the OpenAI response).

Test 3: Contact form submission success flow.

6. Deployment Workflow
   Source Control: GitHub.

Hosting: Vercel.

Deployment Flow:

Develop locally.

Run npm run test (Vitest/Playwright) locally to ensure nothing is broken.

Commit and push directly to the main branch.

Vercel automatically detects the push, builds the app, and deploys it to production instantly.
