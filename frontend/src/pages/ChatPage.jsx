import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchConnections } from '@/store/slices/connectionSlice';
import {
  fetchMessages,
  sendMessage as sendChatMessage,
  setActiveChat,
  setChatPartners,
  addMessage
} from '@/store/slices/chatSlice';
import io from 'socket.io-client';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const ChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userIdFromQuery = queryParams.get('userId');

  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages, chatPartners, loading, error } = useSelector((state) => state.chat);
  const { connections } = useSelector((state) => state.connections);

  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch connections on component mount
  useEffect(() => {
    console.log('Fetching connections...');
    dispatch(fetchConnections())
      .then((resultAction) => {
        if (fetchConnections.fulfilled.match(resultAction)) {
          console.log('Connections fetched successfully:', resultAction.payload);
        } else {
          console.error('Failed to fetch connections:', resultAction.error);
        }
      });
  }, [dispatch]);

  // Set connections as chat partners and handle userId from query params
  useEffect(() => {
    console.log('Connections changed or component mounted:', connections);

    if (connections && connections.length > 0) {
      console.log('Setting chat partners with connections:', connections);
      dispatch(setChatPartners(connections));

      // If we have a userId from query params, select that user
      if (userIdFromQuery) {
        console.log('Looking for connection with ID from query params:', userIdFromQuery);
        const connectionFromQuery = connections.find(conn => conn._id === userIdFromQuery);
        if (connectionFromQuery) {
          console.log('Found connection from query params:', connectionFromQuery);
          setSelectedChat(connectionFromQuery);
          dispatch(setActiveChat(connectionFromQuery._id));
          dispatch(fetchMessages({ userId: connectionFromQuery._id }));
        } else {
          console.warn('Connection not found for ID:', userIdFromQuery);
        }
      }
      // Otherwise, if no active chat is selected, select the first connection
      else if (!activeChat && !selectedChat) {
        console.log('No active chat, selecting first connection:', connections[0]);
        const firstConnection = connections[0];
        setSelectedChat(firstConnection);
        dispatch(setActiveChat(firstConnection._id));
        dispatch(fetchMessages({ userId: firstConnection._id }));
      }
    } else {
      console.log('No connections available or connections array is empty');
    }
  }, [connections, dispatch, activeChat, selectedChat, userIdFromQuery]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  // Handle socket events
  useEffect(() => {
    if (socket && user) {
      // Join a room for the current user to receive messages
      socket.emit('join_room', user._id);
      console.log(`Joined room: ${user._id}`);

      // Listen for incoming messages
      socket.on('receive_message', (newMessage) => {
        console.log('Received message via socket:', newMessage);

        // Only process messages that are actually from someone else
        // This prevents duplicate messages when you send a message
        const messageSender = newMessage.senderId || newMessage.sender;

        if (!messageSender) {
          console.error('Message has no sender ID:', newMessage);
          return;
        }

        // For messages from other users, add them to the state
        if (messageSender !== user._id) {
          console.log('Processing incoming message from another user');

          // Create a properly formatted message object
          const formattedMessage = {
            _id: newMessage._id || `received-${Date.now()}`, // Use real ID if available
            sender: messageSender,
            content: newMessage.text || newMessage.content,
            createdAt: newMessage.timestamp || new Date()
          };

          console.log('Formatted message:', formattedMessage);

          // Add the message to the chat with the sender's ID as the chatId
          dispatch(addMessage({
            chatId: messageSender,
            message: formattedMessage
          }));

          // Scroll to bottom to show new message
          scrollToBottom();
        } else {
          // For messages from the current user, we only need to update the ID
          // if it was a temporary ID before
          if (newMessage._id && newMessage._id.toString().startsWith('temp-')) {
            console.log('Received confirmation of our own message with real ID:', newMessage._id);
            // We could update the message ID here if needed
          } else {
            console.log('Ignoring message from self (already displayed)');
          }
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, user, dispatch]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle chat selection
  const handleSelectChat = (connection) => {
    if (!connection || !connection._id) {
      console.error('Invalid connection object:', connection);
      return;
    }

    console.log('Selecting chat with user:', connection);
    setSelectedChat(connection);
    dispatch(setActiveChat(connection._id));

    // Fetch messages for this chat
    dispatch(fetchMessages({ userId: connection._id }))
      .then((resultAction) => {
        if (fetchMessages.fulfilled.match(resultAction)) {
          console.log('Messages fetched successfully:', resultAction.payload);
        } else {
          console.error('Failed to fetch messages:', resultAction.error);
        }
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const timestamp = new Date();
    const messageContent = message.trim();

    // Create a temporary message object for immediate display
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      sender: user._id, // For UI display
      senderId: user._id, // For compatibility with new schema
      content: messageContent, // For UI display
      text: messageContent, // For compatibility with new schema
      createdAt: timestamp, // For UI display
      timestamp: timestamp // For compatibility with new schema
    };

    console.log('Sending message:', tempMessage);

    // Add the message to the local state immediately
    // For sent messages, use the activeChat (recipient) as the chatId
    dispatch(addMessage({
      chatId: activeChat,
      message: tempMessage
    }));

    // Send message via API but don't add it to the state again
    dispatch(sendChatMessage({
      userId: activeChat,
      content: messageContent
    })).then((resultAction) => {
      if (sendChatMessage.fulfilled.match(resultAction)) {
        console.log('Message sent via API, response:', resultAction.payload);
        // We could update the temporary message with the real ID here if needed
      }
    }).catch(error => {
      console.error('Error sending message via API:', error);
    });

    // Also emit via socket for real-time delivery to the recipient
    // The socket will only emit to the recipient, not back to the sender
    if (socket) {
      console.log(`Emitting message to room ${activeChat}`);
      socket.emit('send_message', {
        room: activeChat, // The recipient's ID as the room
        content: messageContent, // Backend will map this to 'text'
        sender: user._id, // For old schema
        senderId: user._id, // For new schema
        receiver: activeChat,
        timestamp: timestamp
      });
    }

    // Clear the input field
    setMessage('');

    // Scroll to bottom to show the new message
    setTimeout(scrollToBottom, 100);
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };

  // If no connections, show a message
  if (connections && connections.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-center">No Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                You need to connect with other users before you can chat with them.
              </AlertDescription>
            </Alert>
            <p className="text-center mt-4 text-muted-foreground">
              Go to the <a href="/dashboard" className="text-primary hover:underline">Developer Network</a> to find and connect with other developers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4">
      {/* Sidebar */}
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 p-4">
            {console.log('Rendering connections list:', connections)}
            {connections && connections.length > 0 ? (
              connections.map((connection) => (
                <motion.div
                  key={connection._id}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer ${
                    activeChat === connection._id ? 'bg-primary/10' : 'hover:bg-accent'
                  }`}
                  onClick={() => handleSelectChat(connection)}
                >
                  <Avatar>
                    <AvatarImage src={connection.profilePicture} alt={connection.name} />
                    <AvatarFallback>{connection.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{connection.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {connection.bio || `Chat with ${connection.name}`}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No connections found
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area - Using flex column to manage fixed header/footer with scrollable content */}
      <Card className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Fixed Header */}
            <CardHeader className="border-b py-4 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={selectedChat.profilePicture}
                    alt={selectedChat.name}
                  />
                  <AvatarFallback>{selectedChat.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedChat.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.email}
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  <AnimatePresence>
                    {messages && activeChat && messages[activeChat] ? (
                      messages[activeChat].map((msg, index) => {
                        // Determine if this is a sent message (from current user)
                        // Handle both string IDs and object IDs with _id property
                        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                        const isSentByMe = senderId === user?._id;
                        console.log(`Message ${index}:`, msg.content, 'sender:', senderId, 'current user:', user?._id, 'sent by me:', isSentByMe);

                        return (
                          <motion.div
                            key={msg._id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isSentByMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-accent'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })) : (
                      <div className="text-center py-10 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Fixed Footer/Input Area */}
            <div className="p-4 border-t flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a connection to start chatting</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatPage;