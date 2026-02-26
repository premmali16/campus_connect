# 🎓 Campus Connect — Student Community Platform

A full-stack **MERN** application for students to connect, collaborate, share resources, create study groups, and communicate in real time.

![Campus Connect](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Stack](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based registration and login
- Password hashing with bcrypt
- Role-based access control (Student / Admin)
- Protected routes

### 👤 User Profiles
- Complete profile with name, college, branch, year, skills, interests, bio
- Edit profile functionality
- View other student profiles
- Gamification: Points, badges, leaderboard

### 💬 Community Posts
- Create, edit, delete posts
- Like and comment system
- Tags and categories
- Trending posts section
- Search and pagination

### 👥 Study Groups
- Create and join study groups
- Group descriptions and member lists
- Group chat with Socket.io
- File sharing inside groups

### 📚 Resource Sharing
- Upload notes, PDFs, and links
- Subject-wise categorization
- Download tracking and rating system
- Search and filter

### 💬 Real-Time Chat
- One-to-one messaging
- Group messaging
- Online/offline status
- Message timestamps

### 🚀 Opportunities
- Post internships, hackathons, events, scholarships
- Apply or save opportunities
- Type-based filtering

### 🔔 Notifications
- Real-time notifications for likes, comments, messages
- Mark as read / mark all read

### 🛡️ Admin Dashboard
- Manage users
- Delete inappropriate posts
- Analytics overview (total users, posts, groups)

### 🌙 Dark Mode
- Toggle between light and dark themes
- Persistent preference

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Redux Toolkit |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **Real-time** | Socket.io |
| **File Upload** | Multer / Cloudinary |
| **State Management** | Redux Toolkit |

---

## 📁 Project Structure

```
campus-connect/
├── backend/
│   ├── config/          # DB, Cloudinary, Socket.io
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error handling, upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Token generation, notifications
│   ├── uploads/         # Uploaded files
│   ├── seed.js          # Database seeder
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store & slices
│   │   ├── services/    # API configuration
│   │   ├── App.jsx      # Main app with routing
│   │   └── main.jsx     # Entry point
│   ├── vite.config.js   # Vite configuration
│   └── index.html
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/campus-connect.git
cd campus-connect
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus-connect
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database
```bash
npm run seed
```
This creates demo users, posts, groups, resources, and opportunities.

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusconnect.com | admin123 |
| Student | aarav@student.com | student123 |

### 4. Setup Frontend
```bash
cd ../frontend
npm install
```

### 5. Run the Application
**Backend** (from `backend/` directory):
```bash
npm run dev
```

**Frontend** (from `frontend/` directory):
```bash
npm run dev
```

Visit: **http://localhost:5173**

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Get post |
| PUT | `/api/posts/:id/like` | Like/unlike post |
| POST | `/api/posts/:id/comments` | Add comment |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create group |
| PUT | `/api/groups/:id/join` | Join group |
| PUT | `/api/groups/:id/leave` | Leave group |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Get resources |
| POST | `/api/resources` | Upload resource |
| PUT | `/api/resources/:id/rate` | Rate resource |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get conversations |
| POST | `/api/messages` | Send message |
| GET | `/api/messages/:id` | Get messages |

---

## 🚢 Deployment

### Backend (Render / Railway)
1. Connect your GitHub repo
2. Set environment variables
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Connect your GitHub repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` environment variable

### Database
- Use **MongoDB Atlas** for cloud hosting

---

## 📄 License

MIT License — feel free to use for your portfolio!

---

**Built with ❤️ for students, by students.**
