require("dotenv").config()

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const initializeSocket = require("./utils/socket");
const app = express();
const server = http.createServer(app);


// Connect to database
require('./config/database');

// Middleware
app.use(cors({
    origin: 'https://mini-project-devtinder.vercel.app/',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

initializeSocket(server);

// Start server
server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
