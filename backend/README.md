# DevTinder Backend

A Node.js Express backend for the DevTinder application, a platform for developers to connect, collaborate, and chat with each other.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [User Routes](#user-routes)
  - [Connection Routes](#connection-routes)
  - [Message Routes](#message-routes)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [Socket.IO Integration](#socketio-integration)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register, login, logout, password reset functionality
- **User Profiles**: Create and update user profiles with skills, bio, and social links
- **Connection System**: Send, accept, and reject connection requests
- **Real-time Chat**: Instant messaging between connected users
- **User Discovery**: Browse other developers in a feed-like interface
- **JWT Authentication**: Secure API endpoints with JWT tokens
- **Socket.IO**: Real-time communication for chat and notifications

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Socket.IO**: Real-time bidirectional event-based communication
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **cookie-parser**: Cookie parsing middleware
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management

## Project Structure

```
backend/
├── config/             # Configuration files
│   └── database.js     # MongoDB connection setup
├── controllers/        # Route controllers
│   ├── userController.js
│   ├── connectionController.js
│   └── messageController.js
├── middleware/         # Custom middleware
│   └── authMiddleware.js
├── models/             # Database models
│   ├── User.js
│   ├── Connection.js
│   ├── Message.js
│   └── Chat.js
├── routes/             # API routes
│   ├── userRoutes.js
│   ├── connectionRoutes.js
│   └── messageRoutes.js
├── utils/              # Utility functions
│   └── socket.js       # Socket.IO setup
├── .env                # Environment variables
├── index.js            # Entry point
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lakshyakumar90/mini-project.git
   cd mini-project/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/devtinder
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### User Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/logout` - Logout a user
- `POST /api/users/forgotpassword` - Request password reset
- `PUT /api/users/resetpassword/:resetToken` - Reset password with token
- `GET /api/users/profile` - Get current user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/feed` - Get all users for discovery feed (protected)
- `GET /api/users/:id` - Get user by ID (protected)

### Connection Routes

- `POST /api/connections/request/:userId` - Send connection request (protected)
- `POST /api/connections/accept/:userId` - Accept connection request (protected)
- `POST /api/connections/reject/:userId` - Reject connection request (protected)
- `GET /api/connections/requests` - Get all connection requests (protected)
- `GET /api/connections` - Get all connections (protected)
- `DELETE /api/connections/:userId` - Remove connection (protected)

### Message Routes

- `GET /api/messages/:userId` - Get messages with a specific user (protected)
- `POST /api/messages/:userId` - Send message to a user (protected)
- `GET /api/messages/unread/count` - Get count of unread messages (protected)

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token, which is stored in an HTTP-only cookie or can be provided in the Authorization header.

Authentication flow:
1. User registers or logs in
2. Server creates a JWT token and sends it in an HTTP-only cookie
3. For protected routes, the `authMiddleware.js` verifies the token
4. If valid, the user is attached to the request object (`req.user`)

## Database Models

### User Model
- Basic info: name, email, password
- Profile: bio, skills, profile picture
- Social links: GitHub, LinkedIn
- Password reset fields

### Connection Model
- Requester (User reference)
- Recipient (User reference)
- Status (pending, accepted, rejected)

### Chat Model
- Participants (array of User references)
- Messages (embedded array of message objects)

### Message Model
- Sender (User reference)
- Receiver (User reference)
- Content
- Room ID
- Read status

## Socket.IO Integration

The backend uses Socket.IO for real-time communication:
- Chat messaging
- Connection notifications
- Message read status updates

Socket events:
- `join_room`: Join a user's personal room
- `join_chat`: Join a chat room with another user
- `send_message`: Send a message to another user
- `message_received`: Notify when a message is received

## Error Handling

The API uses consistent error responses with the following format:
```json
{
  "success": false,
  "message": "Error message details"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
