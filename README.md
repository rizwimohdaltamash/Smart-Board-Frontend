# SmartBoard Frontend

AI-powered task management platform with intelligent card recommendations, drag-and-drop interface, and team collaboration.

## 🚀 How to Run the Project

### Requirements
- Node.js 18+
- npm
- Backend should already be running (check the server folder)

### Steps to run locally

1. **Install packages**
   ```bash
   npm install
   ```

2. **Add environment file (optional)**
   If you want to use a custom backend URL, create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   **App runs on:** `http://localhost:5173`

4. **Create production build**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Project Structure (Simplified)
```
client/
├── src/
│   ├── components/   → Reusable UI elements
│   ├── pages/        → Full pages/screens
│   ├── context/      → App state using React Context
│   ├── utils/        → API calls and helper functions
│   ├── App.jsx       → Main app component
│   └── main.jsx      → Entry file
├── public/           → Static files
├── package.json      → Scripts + dependencies
└── vercel.json       → Deployment config
```

---

## 🏗 Architecture (Explained in My Words)

The frontend is made using **React + Vite**. The idea is to keep things simple:

### **Components folder**
All UI pieces like cards, board layout, buttons, modals, etc.

### **Pages folder**
These are full screens like Dashboard, Board Page, Login, etc.  
Each page uses smaller components from `/components`.

### **Context folder**
Manages global state such as user info, logged-in status, and board/task data.  
Instead of using Redux, the project uses **React Context** for lightweight management.

### **Utils folder**
Contains functions that talk to the backend (API calls using fetch/axios).  
This keeps API logic separated from UI.

### **Vite**
Provides super-fast dev server and bundling.

### The main flow:
**UI → calls API through utils → backend returns data → context stores it → UI updates.**

---

## 🗂 Database Schema (Simple Explanation)

The database structure (from backend) is designed around three main entities:

### **1. User**
- Stores basic user details
- Login-related info (email, password hash)
- Linked to boards the user owns

### **2. Board**
- Each board belongs to a user
- Contains multiple lists/columns (like TODO, In Progress, Done)
- Stores metadata like board name, created date

### **3. Card / Task**
- Each task belongs to a board
- Contains title, description, status, and priority
- Used in drag-and-drop
- AI uses the description/status to generate suggestions or improvements

### **Relationships:**
- One User → Many Boards
- One Board → Many Cards/Tasks

This structure makes it easy to manage tasks, update their positions, and run AI analysis on them.

## 🌐 Deployment to Vercel

### Quick Steps:

1. **Push to GitHub** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables** (if needed)
   - Add in Vercel dashboard under Settings → Environment Variables:
     - `VITE_API_URL` = your backend API URL (e.g., `https://your-backend.render.com`)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Important Files:
- ✅ `vercel.json` - Already created (handles routing)
- ✅ `package.json` - Contains build scripts
- ✅ `vite.config.js` - Vite configuration

### Update API URL After Backend Deployment:
1. Deploy your backend first (Render/Railway)
2. Get the backend URL
3. Update `VITE_API_URL` in Vercel environment variables
4. Redeploy frontend

### Vercel CLI (Alternative):
```bash
npm install -g vercel
cd client
vercel
```

---

## Backend Deployment (Render)

Deploy your backend separately:

### Render.com:
1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `GEMINI_PROJECT_NAME`
   - `GEMINI_PROJECT_NUMBER`
   - `PORT=5000`

---

**Done! SmartBoard app is now live! 🚀**
