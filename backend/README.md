# Backend API for Mini Project

This is the backend server for the Mini Project application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization with JWT
- Real-time messaging with Socket.io
- RESTful API endpoints for user profiles, connections, and messages
- MongoDB database integration with Mongoose

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## Socket.io Events

- `connection` - Client connects to the server
- `disconnect` - Client disconnects from the server
- `join` - User joins a chat room
- `message` - User sends a message