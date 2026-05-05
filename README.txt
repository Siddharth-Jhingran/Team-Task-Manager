Team Task Manager (TTM)
=======================

A full-stack, role-based project and task management application built with the MERN stack.

Overview
--------
Team Task Manager (TTM) is a comprehensive web application designed to help teams collaborate effectively. It allows users to create projects, assign tasks, and track progress seamlessly. With robust Role-Based Access Control (RBAC) and secure JWT authentication, TTM ensures that your team's data remains private and securely managed.

The application boasts a premium, responsive UI featuring an interactive 3D background and smooth animations, providing an exceptional user experience out of the box.

Key Features
------------
* Secure Authentication: User signup, login, and secure sessions via JWT (JSON Web Tokens) and bcrypt password hashing.
* Role-Based Access Control (RBAC): Differentiated access levels for Admins, Managers, and Team Members.
* Project Management: Create, update, and oversee projects from a unified dashboard.
* Task Tracking: Assign tasks to team members, set deadlines, and track status (e.g., Todo, In Progress, Done).
* Premium UI/UX: Responsive React frontend powered by Vite, featuring a modern design, dynamic 3D backgrounds, and micro-animations.
* Ready for Deployment: Configuration ready for deploying the backend and database to Railway.

Tech Stack
----------
### Frontend
* Framework: React 19 + Vite
* Routing: React Router v7
* HTTP Client: Axios
* Notifications: React Hot Toast
* Icons: React Icons

### Backend
* Environment: Node.js
* Framework: Express.js 5
* Database: MongoDB with Mongoose
* Security: jsonwebtoken, bcryptjs, cors
* Validation: express-validator

Project Structure
-----------------
TTM/
├── TTM_frontend/          # React/Vite frontend application
│   ├── src/               # React components, pages, context, and styles
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
└── TTM_backend/           # Node.js/Express backend application
    ├── models/            # Mongoose schemas (User, Project, Task)
    ├── routes/            # Express API routes (auth, projects, tasks)
    ├── controllers/       # Business logic for routes
    ├── middleware/        # JWT auth, error handling
    ├── server.js          # Entry point for backend
    ├── railway.toml       # Railway deployment config
    └── package.json       # Backend dependencies

Getting Started
---------------
Follow these steps to set up the project locally on your machine.

### Prerequisites
Ensure you have the following installed:
* Node.js (v18 or higher recommended)
* MongoDB (Local installation or a MongoDB Atlas URI)
* Git

### 1. Clone the Repository
git clone https://github.com/your-username/Team-Task-Manager.git
cd Team-Task-Manager

### 2. Backend Setup
Open a terminal and navigate to the backend directory:
cd TTM_backend
npm install

Environment Variables:
Create a .env file in the TTM_backend directory and add the following:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

Start the backend development server:
npm run dev

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
cd TTM_frontend
npm install

Environment Variables:
Create a .env file in the TTM_frontend directory to point to your backend API:
VITE_API_URL=http://localhost:5000/api

Start the Vite development server:
npm run dev

API Endpoints (Brief Overview)
------------------------------
### Authentication
* POST /api/auth/register - Register a new user
* POST /api/auth/login - Authenticate user & get token

### Projects
* GET /api/projects - Get all projects
* POST /api/projects - Create a new project (Admin/Manager)
* GET /api/projects/:id - Get specific project details
* PUT /api/projects/:id - Update a project

### Tasks
* GET /api/tasks - Get tasks assigned to user / project tasks
* POST /api/tasks - Create a task within a project
* PUT /api/tasks/:id/status - Update task status

Deployment
----------
This project is configured for easy deployment on Railway. 

1. Push your code to a GitHub repository.
2. Link your GitHub repo to a new Railway project.
3. Provision a MongoDB database directly in Railway or use MongoDB Atlas.
4. Set up your Environment Variables (MONGODB_URI, JWT_SECRET, etc.) in the Railway dashboard.
5. The railway.toml file in the backend directory will automatically handle the build and start commands.

License
-------
This project is open-source and available under the ISC License.

--------------------------------------------------
Built with ❤️ by Siddharth Jhingran
