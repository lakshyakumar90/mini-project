# DevConnect

DevConnect is a full-stack social connection platform designed for developers. It enables users to register, create profiles, find other developers, send connection requests, and engage in real-time chat.

The project is structured as a monorepo containing both the frontend and backend applications.

## Project Structure

```text
.
├── backend/       # Node.js, Express, MongoDB, Socket.io
└── frontend/      # React (Vite), Redux Toolkit, Tailwind CSS
```

## Features

- **User Authentication:** Secure JWT-based authentication with password hashing using bcrypt.
- **Profile Management:** Users can customize their profiles, upload avatars (via Cloudinary), and share their tech stack.
- **Developer Matching / Connections:** Browse through developer profiles, send, accept, or reject connection requests.
- **Real-time Messaging:** Chat in real-time with connected developers using Socket.io.
- **Responsive UI:** A modern, mobile-friendly interface built with React, Tailwind CSS, and Radix UI components.

## Tech Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS, Radix UI components, `clsx`, `tailwind-merge`
- **Routing:** React Router DOM
- **Other:** `socket.io-client`, `axios`, `date-fns`

### Backend
- **Framework:** Node.js with Express 5
- **Database:** MongoDB (with Mongoose)
- **Real-time & Caching:** Socket.io, Redis (via `ioredis` & `@socket.io/redis-adapter`)
- **Authentication:** JWT, bcryptjs, Better Auth
- **File Uploads:** Multer, Cloudinary
- **Email Services:** Nodemailer

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)
- Redis instance (for Socket.io adapter)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Backend Setup:**
   Navigate to the backend directory, install dependencies, and configure environment variables.
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file based on `backend/.env.example`.

3. **Frontend Setup:**
   Navigate to the frontend directory, install dependencies, and configure environment variables.
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file based on `frontend/.env.example`.

### Running the Application

You can run the frontend and backend servers separately.

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will typically run on `http://localhost:5173` and the backend on the port specified in your `.env` file (e.g., `http://localhost:5000`).

## Documentation

For more detailed information about the frontend and backend setups, please refer to their respective README files:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## License
ISC
