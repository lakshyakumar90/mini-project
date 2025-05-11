import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, AlertCircle, ArrowLeft, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchConnections } from '@/store/slices/connectionSlice';
import {
  fetchMessages,
  setActiveChat,
  setChatPartners,
  addMessage
} from '@/store/slices/chatSlice';
import io from 'socket.io-client';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import useSwipeGesture from '@/hooks/useSwipeGesture';

const ChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userIdFromQuery = queryParams.get('userId');

  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages } = useSelector((state) => state.chat);
  const { connections } = useSelector((state) => state.connections);

  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if we're in mobile view - separated from sidebar logic to prevent loops
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener('resize', checkMobileView);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Handle sidebar visibility based on mobile view and selected chat
  useEffect(() => {
    // Only update sidebar visibility when these dependencies change
    // to prevent infinite loops
    if (isMobileView && selectedChat) {
      setShowSidebar(false);
    } else if (!isMobileView) {
      setShowSidebar(true);
    }
  }, [isMobileView, selectedChat]);

  // Fetch connections on component mount
  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch]);

  // Set connections as chat partners and handle userId from query params
  useEffect(() => {
    try {
      // Always run the hook, but conditionally perform actions
      if (!connections || !Array.isArray(connections) || connections.length === 0) {
        return; // Early return, but hook is still executed
      }

      // Filter out any null or invalid connections
      const validConnections = connections.filter(conn => conn && conn._id);

      if (validConnections.length > 0) {
        // Set chat partners only once when connections change
        dispatch(setChatPartners(validConnections));

        // Create a function to set up a chat with a connection
        const setupChatWithConnection = (connection) => {
          if (!connection || !connection._id) return;

          // Create a safe copy of the connection
          const safeConnection = {
            _id: connection._id,
            name: connection.name || 'Unknown User',
            profilePicture: connection.profilePicture || '',
            email: connection.email || '',
            bio: connection.bio || ''
          };

          setSelectedChat(safeConnection);
          dispatch(setActiveChat(safeConnection._id));
          dispatch(fetchMessages({ userId: safeConnection._id }));
        };

        // If we have a userId from query params and no chat is selected yet
        if (userIdFromQuery && !selectedChat) {
          const connectionFromQuery = validConnections.find(conn => conn._id === userIdFromQuery);
          if (connectionFromQuery) {
            setupChatWithConnection(connectionFromQuery);
          }
        }
        // Otherwise, if no active chat is selected, select the first connection
        else if (!activeChat && !selectedChat) {
          const firstConnection = validConnections[0];
          if (firstConnection) {
            setupChatWithConnection(firstConnection);
          }
        }
      }
    } catch (error) {
      console.error('Error setting up chat partners:', error);
    }
  // Only depend on connections, activeChat, selectedChat, and userIdFromQuery
  // Remove dispatch from dependencies as it's stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, activeChat, selectedChat, userIdFromQuery]);

  // Initialize Socket.IO connection - only once
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    try {
      const newSocket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
          newSocket.close();
        }
      };
    } catch (error) {
      console.error('Error initializing socket connection:', error);
    }
  // Empty dependency array ensures this runs only once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle socket events - always execute the hook but conditionally perform actions
  useEffect(() => {
    // Define message handler outside the effect to prevent recreating it on each render
    const handleIncomingMessage = (newMessage) => {
      if (!newMessage || !user || !user._id) return;

      try {
        // Only process messages that are actually from someone else
        // This prevents duplicate messages when you send a message
        const messageSender = newMessage.senderId || newMessage.sender;

        if (!messageSender) {
          return;
        }

        // For messages from other users, add them to the state
        if (user && user._id && messageSender !== user._id) {
          // Create a properly formatted message object
          const formattedMessage = {
            _id: newMessage._id || `received-${Date.now()}`, // Use real ID if available
            sender: messageSender,
            content: newMessage.text || newMessage.content || '',
            createdAt: newMessage.timestamp || new Date(),
            read: newMessage.read || false,
            readAt: newMessage.readAt || null
          };

          // Add the message to the chat with the sender's ID as the chatId
          dispatch(addMessage({
            chatId: messageSender,
            message: formattedMessage
          }));
        }
      } catch (error) {
        console.error('Error processing received message:', error);
      }
    };

    // Only set up socket events if we have a socket and user
    if (socket && user && user._id) {
      try {
        // Join a room for the current user to receive messages
        socket.emit('join_room', user._id);

        // Listen for incoming messages
        socket.on('receive_message', handleIncomingMessage);

        // Cleanup function
        return () => {
          socket.off('receive_message', handleIncomingMessage);
        };
      } catch (error) {
        console.error('Error setting up socket events:', error);
      }
    }

    // Always return a cleanup function, even if empty
    return () => {};
  // Remove dispatch from dependencies as it's stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show swipe hint for mobile users - with memoized dependencies to prevent loops
  useEffect(() => {
    let timer = null;

    // Determine if we should show the hint
    const shouldShowHint = isMobileView && selectedChat && !showSidebar;

    if (shouldShowHint) {
      // Check if we've shown the hint before
      const hasShownHint = localStorage.getItem('chatSwipeHintShown');

      if (!hasShownHint) {
        // Show the hint
        setShowSwipeHint(true);

        // Hide after 3 seconds
        timer = setTimeout(() => {
          setShowSwipeHint(false);
          // Remember that we've shown the hint
          localStorage.setItem('chatSwipeHintShown', 'true');
        }, 3000);
      } else {
        // Make sure hint is hidden if user has seen it before
        setShowSwipeHint(false);
      }
    } else {
      // Hide the hint in all other cases
      setShowSwipeHint(false);
    }

    // Always return a cleanup function
    return () => {
      if (timer) clearTimeout(timer);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileView, selectedChat, showSidebar]);

  // Handle chat selection
  const handleSelectChat = (connection) => {
    if (!connection || !connection._id) {
      return;
    }

    try {
      // Make a safe copy of the connection to avoid null reference issues
      const safeConnection = {
        _id: connection._id,
        name: connection.name || 'Unknown User',
        profilePicture: connection.profilePicture || '',
        email: connection.email || '',
        bio: connection.bio || ''
      };

      setSelectedChat(safeConnection);
      dispatch(setActiveChat(safeConnection._id));

      // Fetch messages for this chat
      dispatch(fetchMessages({ userId: safeConnection._id }));

      // On mobile, hide the sidebar when a chat is selected
      // Use the isMobileView state instead of checking window.innerWidth again
      if (isMobileView) {
        setShowSidebar(false);
        // We don't need to set showSwipeHint here as it's handled by the useEffect
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error('Error selecting chat:', error);
    }
  };

  // Toggle sidebar visibility (for mobile)
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();

    // Validate all required data is present
    if (!message || !message.trim() || !activeChat) return;
    if (!user || !user._id) return;

    try {
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
        timestamp: timestamp, // For compatibility with new schema
        read: false,
        readAt: null
      };

      // Add the message to the local state immediately
      // For sent messages, use the activeChat (recipient) as the chatId
      dispatch(addMessage({
        chatId: activeChat,
        message: tempMessage
      }));

      // Only use the socket to send messages to avoid duplicates
      // The backend will save the message to the database
      if (socket) {
        socket.emit('send_message', {
          room: activeChat, // The recipient's ID as the room
          content: messageContent, // Backend will map this to 'text'
          sender: user._id, // For old schema
          senderId: user._id, // For new schema
          receiver: activeChat,
          timestamp: timestamp
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

  // Define swipe handlers with useCallback to prevent unnecessary re-renders
  const handleSwipeLeft = useCallback(() => {
    // On swipe left, show chat (hide sidebar) if we're in mobile and have a selected chat
    if (isMobileView && selectedChat && showSidebar) {
      setShowSidebar(false);
    }
  }, [isMobileView, selectedChat, showSidebar]);

  const handleSwipeRight = useCallback(() => {
    // On swipe right, show sidebar if we're in mobile
    if (isMobileView && !showSidebar) {
      setShowSidebar(true);
    }
  }, [isMobileView, showSidebar]);

  // Use the updated hook API - pass arguments directly instead of as an object
  // This hook must be called in every render, not conditionally
  const swipeRef = useSwipeGesture(
    handleSwipeLeft,
    handleSwipeRight,
    70, // Threshold - require a bit more movement for a swipe
    300 // Timeout
  );

  // If no connections, show a message
  if (connections && connections.length === 0) {
    return (
      <div
        className="h-[calc(100vh-8rem)] flex items-center justify-center p-4"
        ref={swipeRef} // Still attach the ref even in the "no connections" view
      >
        <Card className="w-full max-w-md p-4 md:p-6">
          <CardHeader>
            <CardTitle className="text-center">No Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm md:text-base">
                You need to connect with other users before you can chat with them.
              </AlertDescription>
            </Alert>
            <p className="text-center mt-4 text-muted-foreground text-sm md:text-base">
              Go to the <a href="/dashboard" className="text-primary hover:underline">Developer Network</a> to find and connect with other developers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4"
      ref={swipeRef}
    >
      {/* Mobile Header - Only visible on mobile when chat is selected and sidebar is hidden */}
      {isMobileView && selectedChat && !showSidebar && (
        <div className="md:hidden flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden relative group"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-primary/10 rounded-full px-1 whitespace-nowrap">
              Swipe right
            </span>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedChat?.profilePicture} alt={selectedChat?.name || 'User'} />
              <AvatarFallback>{selectedChat?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{selectedChat?.name || 'Unknown User'}</span>
          </div>
        </div>
      )}

      {/* Swipe Hint - Only shown on mobile for first-time users */}
      {showSwipeHint && isMobileView && selectedChat && !showSidebar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg z-50 text-center"
        >
          <p className="text-sm">Swipe right to see contacts</p>
          <div className="flex justify-center mt-1">
            <motion.div
              animate={{ x: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Responsive Layout Container */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar - Hidden on mobile when a chat is selected */}
        {(showSidebar || !isMobileView) && (
          <Card className="w-full md:w-80 flex-shrink-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Messages</CardTitle>
              {isMobileView && selectedChat && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)]">
              <div className="space-y-4 p-4">
                {connections && Array.isArray(connections) && connections.length > 0 ? (
                  connections.map((connection) => {
                    // Skip rendering if connection is null or doesn't have an _id
                    if (!connection || !connection._id) return null;

                    return (
                      <motion.div
                        key={connection._id}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer ${
                          activeChat === connection._id ? 'bg-primary/10' : 'hover:bg-accent'
                        }`}
                        onClick={() => handleSelectChat(connection)}
                      >
                        <Avatar>
                          <AvatarImage src={connection.profilePicture} alt={connection.name || 'User'} />
                          <AvatarFallback>{connection.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{connection.name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {connection.bio || `Chat with ${connection.name || 'this user'}`}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No connections found
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* Chat Area - Hidden on mobile when showing sidebar */}
        {(!showSidebar || !isMobileView || !selectedChat) && (
          <Card className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Fixed Header - Hidden on mobile when we show the top bar */}
                <CardHeader className="border-b py-4 flex-shrink-0 hidden md:block">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={selectedChat?.profilePicture}
                        alt={selectedChat?.name || 'User'}
                      />
                      <AvatarFallback>{selectedChat?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedChat?.name || 'Unknown User'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedChat?.email || ''}
                      </p>
                    </div>
                    {/* Mobile toggle button to show contacts */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      className="ml-auto md:hidden relative group"
                    >
                      <Users className="h-5 w-5" />
                      <span className="absolute -left-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-primary/10 rounded-full px-1 whitespace-nowrap">
                        Swipe left
                      </span>
                    </Button>
                  </div>
                </CardHeader>

                {/* Scrollable Content Area */}
                <div className="flex-grow overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      <AnimatePresence>
                        {messages && activeChat && messages[activeChat] ? (
                          // Sort messages by timestamp (oldest first)
                          [...messages[activeChat]]
                            .sort((a, b) => {
                              const timeA = a && a.createdAt ? new Date(a.createdAt).getTime() : 0;
                              const timeB = b && b.createdAt ? new Date(b.createdAt).getTime() : 0;
                              return timeA - timeB; // Ascending order (oldest first)
                            })
                            .map((msg, index) => {
                            // Determine if this is a sent message (from current user)
                            // Handle both string IDs and object IDs with _id property
                            const senderId = msg && msg.sender ?
                              (typeof msg.sender === 'object' ?
                                (msg.sender && msg.sender._id ? msg.sender._id : null)
                                : msg.sender)
                              : null;
                            const isSentByMe = senderId && user && user._id ? senderId === user._id : false;

                            return (
                              <motion.div
                                key={msg && msg._id ? msg._id : `msg-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
                                    isSentByMe
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-accent'
                                  }`}
                                >
                                  <p className="break-words">{msg && msg.content ? msg.content : ''}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs opacity-70">
                                      {msg && msg.createdAt ? formatMessageTime(msg.createdAt) : ''}
                                    </p>
                                    {isSentByMe && (
                                      <p className="text-xs opacity-70 ml-2">
                                        {msg && msg.read ? 'Read' : 'Sent'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        ) : (
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
                <div className="p-2 sm:p-4 border-t flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      autoComplete="off"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!message.trim()}
                      className="transition-transform active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {connections && connections.length > 0
                    ? "Select a connection to start chatting"
                    : "Connect with other users to start chatting"}
                </p>
                {isMobileView && connections && connections.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={toggleSidebar}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Show Connections
                  </Button>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatPage;