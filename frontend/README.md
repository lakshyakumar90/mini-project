# DevConnect (Frontend)

The frontend for DevConnect is a modern, responsive React application designed to help developers connect, view profiles, and chat in real-time. It is built using Vite for fast development and optimized builds.

## Features

- **Modern UI:** Built with Tailwind CSS and Radix UI primitives for accessible, high-quality components.
- **State Management:** Utilizes Redux Toolkit for predictable state management across the app.
- **Real-Time Communication:** Integrated with `socket.io-client` to support real-time messaging with connected developers.
- **Form Handling & Validation:** Efficiently manages forms and input data for login, registration, and profile updates.
- **Responsive Design:** Fully responsive layout, ensuring a great experience on both mobile and desktop.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **UI Components:** Radix UI (`@radix-ui/react-avatar`, `@radix-ui/react-label`, `@radix-ui/react-scroll-area`, etc.)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router DOM (v7)
- **Icons:** Lucide React & React Icons
- **HTTP Client:** Axios
- **Real-Time:** Socket.io Client
- **Utilities:** `clsx`, `tailwind-merge`, `date-fns`

## Folder Structure

```text
frontend/
├── public/          # Static assets that bypass Vite's asset handling
├── src/             # Application source code
│   ├── assets/      # Images, fonts, and other static files
│   ├── components/  # Reusable React components (UI, layout)
│   ├── pages/       # Route-level components (Home, Login, Profile, etc.)
│   ├── store/       # Redux store configuration and slices
│   ├── utils/       # Utility functions and API helpers
│   ├── App.jsx      # Main application component
│   └── main.jsx     # React entry point
├── .env.example     # Environment variable template
├── vite.config.js   # Vite configuration file
└── package.json     # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A running instance of the DevConnect backend.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory based on the provided `.env.example`:

   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
   *(Update the URLs if your backend is running on a different port or domain.)*

### Scripts

- **Start Development Server:**
  Runs the application in development mode with Hot Module Replacement (HMR).
  ```bash
  npm run dev
  ```
- **Build for Production:**
  Creates an optimized production build in the `dist` folder.
  ```bash
  npm run build
  ```
- **Lint Code:**
  Runs ESLint to analyze the code for potential errors.
  ```bash
  npm run lint
  ```
- **Preview Production Build:**
  Locally preview the built application.
  ```bash
  npm run preview
  ```

## UI/UX Libraries
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **Radix UI:** Unstyled, accessible UI components.
- **Lucide React:** Beautiful and consistent icon set.
- **Prism React Renderer:** For syntax highlighting (if code blocks are shared).