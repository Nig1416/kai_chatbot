# Kai Chatbot

Kai is an advanced AI-powered chatbot designed to provide intelligent, empathetic, and context-aware conversations. Built with a modern tech stack, Kai uses Google's Gemini API to engage users in meaningful dialogue, remembering past interactions and adapting to the user's personality.

## Features

- **🧠 AI-Powered Conversations**: Leverages Google's Gemini-1.5-Flash model for fast and intelligent responses.
- **💾 Persistent Memory**: Remembers user facts and conversation history across sessions.
- **🔐 User Authentication**: Secure Signup and Login system.
- **📄 Multi-Session Management**: Create new chats, view history, and switch between conversations.
- **🎨 Modern UI**: Futuristic interface built with React, Tailwind CSS, and Framer Motion.
- **📱 Responsive Design**: Optimized for both desktop and mobile devices.
- **⚡ Lightweight Database**: Uses a local JSON-based database for easy setup and portability (no external DB required).

## Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- Lucide React (Icons)
- React Markdown (Rich text display)

**Backend:**
- Node.js
- Express.js
- Custom JSON Database (Local file-based storage)
- Google Generative AI SDK

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **NPM**: Included with Node.js.
- **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/).

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kai-chatbot
   ```

2. **Install Dependencies:**
   Since the project handles both frontend and backend, install dependencies for both:
   ```bash
   # Install root dependencies (Frontend + Backend shared)
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Running the Application

To start the application, you need to run both the backend server and the frontend client.

1. **Start the Backend Server:**
   ```bash
   npm run server
   ```
   The backend will start at `http://localhost:5000`.

2. **Start the Frontend Client:**
   Open a new terminal and run:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Folder Structure

```
STEN_PROJECT/
├── backend/            # Backend Routes & Models
│   ├── models/         # Database Models (JsonDB.js)
│   ├── routes/         # API Routes (chatRoutes.js)
│   └── utils/          # Helper functions (Gemini Service)
├── src/                # Frontend Source Code
│   ├── components/     # React Components
│   └── assets/         # Images and Static Files
├── database.json       # Local Database file
├── server.js           # Express Server Entry Point
└── package.json        # Project Dependencies & Scripts
```

## API Endpoints

- `POST /api/chat/signup` - Register a new user
- `POST /api/chat/login` - Authenticate user
- `POST /api/chat/message` - Send a message to Kai
- `GET /api/chat/sessions/:userId` - Get user chat sessions
- `GET /api/chat/history/:userId` - Get current chat history

## License

This project is open-source and available under the MIT License.
