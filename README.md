# 🧠 AI Chatbot with Authentication (React + Node.js + MongoDB)

A full-stack AI chatbot powered by the LLaMA model via Groq API. Includes authentication, persistent chat history, and a sleek React-based interface.

## 🔧 Built With

- 💬 **React** frontend (ChatGPT-style UI)
- 🔐 **Authentication** (Signup, Login, Protected Routes)
- ⚙️ **Node.js + Express** backend
- 🧠 **Groq API (LLaMA model)** for intelligent AI responses
- 🛢️ **MongoDB** for storing users & chats

---

## 🚀 Features

### ✅ AI Chat
- Real-time chat with the Groq-powered LLaMA model
- Markdown support, auto-scroll, streaming bot replies
- Export chat history to PDF

### 🔐 Authentication
- Secure signup & login using **bcrypt** password hashing
- Protected routes for user profiles & chat sessions
- **JWT** tokens stored in **HttpOnly cookies**

---

## 🌐 Tech Stack

| Layer      | Technologies                              |
|------------|-------------------------------------------|
| Frontend   | React, Tailwind CSS, React Router         |
| Backend    | Node.js, Express                          |
| Database   | MongoDB (MongoDB Compass for GUI)         |
| AI Model   | LLaMA via Groq API                        |
| Auth       | JWT, bcrypt, HttpOnly Cookies             |

---

## 📁 Project Structure

chatbot/ ├── backend/ │ ├── models/ │ ├── routes/ │ ├── config/ │ ├── server.js │ └── .env ├── frontend/ │ ├── src/ │ ├── public/ │ └── .env └── README.md


---

## ⚙️ Getting Started

### 🔌 Backend Setup

1. Navigate to the backend folder:
```bash
cd backend

Install dependencies:

bash
Copy
Edit
npm install
Create a .env file:

env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_key
Start the server:

bash
Copy
Edit
npm start
💻 Frontend Setup
Navigate to the frontend folder:

bash
Copy
Edit
cd ../frontend
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file:

env
Copy
Edit
VITE_API_URL=http://localhost:5000
Start the frontend app:

bash
Copy
Edit
npm run dev
📸 Screenshots
Add UI snapshots of your chatbot, login, signup, and chat interface here.

📦 Future Improvements
✅ Google OAuth login

✅ File upload support (PDF, DOC)

✅ Deployment (Vercel + Render)

✅ Bhashini API integration for translation & speech

🤝 Contributing
Pull requests are welcome! Feel free to fork the repo and submit improvements or bug fixes.

📜 License
This project is licensed under the MIT License.

Made with ❤️ by Harsha P.

yaml
Copy
Edit

---

Let me know if you'd like:

- Deployment instructions (Vercel/Render)
- GitHub badges (build status, license, etc.)
- License file content
- Example `.env` files
- Screenshots layout section

I can add those too!
