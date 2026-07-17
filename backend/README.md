# DevConnect API (Backend)

This is the backend server for DevConnect, a social connection platform for developers. It is built with Node.js, Express 5, and MongoDB, providing a robust RESTful API and real-time capabilities via Socket.io.

## Features

- **User Authentication:** Secure registration and login using JWT and bcryptjs.
- **Real-time Messaging:** Bidirectional real-time chat with connections using Socket.io and Redis adapter.
- **Connection Management:** Endpoints to send, accept, reject, and fetch developer connections.
- **Profile Management:** Update user profiles, including image uploads handled via Multer and Cloudinary.
- **Email Notifications:** Email services integrated using Nodemailer.
- **Rate Limiting:** Protects endpoints from abuse using `express-rate-limit`.

## Tech Stack

- **Node.js** - JavaScript runtime environment.
- **Express (v5.1)** - Web application framework.
- **MongoDB & Mongoose** - NoSQL database and object modeling.
- **Socket.io** - Real-time event-based communication.
- **Redis (`ioredis`)** - Used for caching and Socket.io multi-node adaptation.
- **Cloudinary & Multer** - Media asset management and file uploading.
- **JWT & bcryptjs** - Authentication and password hashing.
- **Nodemailer** - Email sending.

## Folder Structure

```text
backend/
├── config/         # Configuration files (Database, Redis, etc.)
├── controllers/    # API endpoint logic
├── middleware/     # Custom Express middlewares (Auth, upload, error handling)
├── models/         # Mongoose schema definitions
├── routes/         # Express route definitions
├── uploads/        # Local upload directory (if applicable)
├── utils/          # Utility functions and helpers
├── index.js        # Entry point of the application
└── package.json    # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB Database (Local or Atlas)
- Redis Server
- Cloudinary Account
- Gmail account with an App Password (for Nodemailer)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on the provided `.env.example`:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173

   # Nodemailer Email Configuration (Gmail + App Password)
   EMAIL_USER=devtinder93@gmail.com
   EMAIL_PASS=your_gmail_16_character_app_password
   EMAIL_RECEIVER=devtinder93@gmail.com

   # Add your Cloudinary/Redis environment variables if needed
   ```

### Scripts

- **Development mode (auto-reload usually requires nodemon, currently runs node):**
  ```bash
  npm run dev
  ```
- **Production mode:**
  ```bash
  npm start
  ```

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/accept` - Accept connection request
- `PUT /api/connections/reject` - Reject connection request

### Messages
- `GET /api/messages/:connectionId` - Get messages for a connection
- `POST /api/messages` - Send a new message

*(Note: Prefixes might vary based on your route configuration in `index.js`)*

## Socket.io Events

- `connection` - Client connects to the server
- `disconnect` - Client disconnects from the server
- `join` - User joins a chat room
- `message` - User sends/receives a message