# DevTinder Frontend

A modern React frontend for the DevTinder application, a platform for developers to connect, collaborate, and chat with each other.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Pages and Components](#pages-and-components)
- [State Management](#state-management)
- [Styling](#styling)
- [Authentication Flow](#authentication-flow)
- [Routing](#routing)
- [Real-time Communication](#real-time-communication)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register, login, logout, password reset functionality
- **User Profiles**: View and edit user profiles with skills, bio, and social links
- **Connection System**: Send, accept, and reject connection requests
- **Real-time Chat**: Instant messaging between connected users
- **User Discovery**: Browse other developers in a feed-like interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Theme toggle for user preference
- **Animations**: Smooth transitions and animations using Framer Motion

## Tech Stack

- **React**: UI library
- **Vite**: Build tool and development server
- **Redux Toolkit**: State management
- **React Router**: Navigation and routing
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library based on Radix UI
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **date-fns**: Date utility library

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable components
│   │   ├── ui/         # UI components (buttons, inputs, etc.)
│   │   └── layout/     # Layout components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── services/       # API service functions
│   ├── store/          # Redux store and slices
│   │   ├── slices/     # Redux slices
│   │   └── store.js    # Redux store configuration
│   ├── App.jsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lakshyakumar90/mini-project.git
   cd mini-project/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root of the frontend directory with the following variables:

```
VITE_API_URL=http://localhost:3000/api
```

## Pages and Components

### Main Pages
- **Landing Page**: Introduction to the application
- **Login/Signup Pages**: User authentication
- **Dashboard**: User discovery feed
- **Profile Page**: User's own profile
- **User Profile Page**: View other users' profiles
- **Connections Page**: View and manage connections
- **Requests Page**: View and manage connection requests
- **Chat Page**: Real-time messaging with connections

### Key Components
- **Navbar**: Navigation and user menu
- **Sidebar**: Navigation for authenticated users
- **UserCard**: Display user information in the feed
- **ConnectionCard**: Display connection information
- **ChatWindow**: Real-time chat interface
- **ProfileForm**: Edit user profile information
- **ThemeToggle**: Switch between light and dark mode

## State Management

The application uses Redux Toolkit for state management with the following slices:

- **authSlice**: User authentication state
- **feedSlice**: User discovery feed state
- **connectionSlice**: User connections and requests state
- **chatSlice**: Chat messages and active conversations state
- **userProfileSlice**: User profile data state

## Styling

The application uses Tailwind CSS for styling with a custom theme configuration:

- **Theme**: Light and dark mode support
- **Colors**: Custom color palette
- **Typography**: Custom font configuration
- **Components**: Styled using Shadcn UI and Tailwind utilities
- **Animations**: Framer Motion for transitions and animations

## Authentication Flow

1. User registers or logs in through the respective pages
2. Authentication state is stored in Redux
3. Protected routes check for authentication status
4. Automatic redirection to login page for unauthenticated users
5. JWT token is stored in HTTP-only cookies for security

## Routing

The application uses React Router for navigation:

- **Public Routes**: Landing page, login, signup, password reset
- **Protected Routes**: Dashboard, profile, connections, chat
- **Layout Routes**: Main layout with sidebar for authenticated users
- **Not Found Route**: 404 page for invalid URLs

## Real-time Communication

The application uses Socket.IO for real-time features:

- **Chat Messaging**: Send and receive messages in real-time
- **Connection Notifications**: Receive notifications for new connection requests
- **Message Status**: Track message delivery and read status

## Deployment

The frontend can be deployed to various platforms:

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy the `dist` directory to your preferred hosting service:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3
   - Firebase Hosting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
