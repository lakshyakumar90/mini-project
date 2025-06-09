import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle, ArrowLeft, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchConnections } from "@/store/slices/connectionSlice";
import {
  fetchMessages,
  setActiveChat,
  setChatPartners,
  addMessage,
  loadMoreMessages,
} from "@/store/slices/chatSlice";
import io from "socket.io-client";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import useSwipeGesture from "@/hooks/useSwipeGesture";

const ChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userIdFromQuery = queryParams.get("userId");

  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages, loading, pagination } = useSelector(
    (state) => state.chat
  );
  const { connections } = useSelector((state) => state.connections);

  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();

    window.addEventListener("resize", checkMobileView);

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  useEffect(() => {
    if (isMobileView && selectedChat) {
      setShowSidebar(false);
    } else if (!isMobileView) {
      setShowSidebar(true);
    }
  }, [isMobileView, selectedChat]);

  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch]);

  useEffect(() => {
    try {
      if (
        !connections ||
        !Array.isArray(connections) ||
        connections.length === 0
      ) {
        return;
      }

      const validConnections = connections.filter((conn) => conn && conn._id);

      if (validConnections.length > 0) {
        dispatch(setChatPartners(validConnections));

        const setupChatWithConnection = (connection) => {
          if (!connection || !connection._id) return;

          const safeConnection = {
            _id: connection._id,
            name: connection.name || "Unknown User",
            profilePicture: connection.profilePicture || "",
            email: connection.email || "",
            bio: connection.bio || "",
          };

          setSelectedChat(safeConnection);
          dispatch(setActiveChat(safeConnection._id));
          dispatch(fetchMessages({ userId: safeConnection._id }));
        };

        if (userIdFromQuery && !selectedChat) {
          const connectionFromQuery = validConnections.find(
            (conn) => conn._id === userIdFromQuery
          );
          if (connectionFromQuery) {
            setupChatWithConnection(connectionFromQuery);
          }
        } else if (!activeChat && !selectedChat) {
          const firstConnection = validConnections[0];
          if (firstConnection) {
            setupChatWithConnection(firstConnection);
          }
        }
      }
    } catch (error) {
      console.error("Error setting up chat partners:", error);
    }
  }, [connections, activeChat, selectedChat, userIdFromQuery]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    try {
      const newSocket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
          newSocket.close();
        }
      };
    } catch (error) {
      console.error("Error initializing socket connection:", error);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const handleIncomingMessage = (newMessage) => {
      if (!newMessage || !user || !user._id) return;

      try {
        const messageSender = newMessage.senderId || newMessage.sender;

        if (!messageSender) {
          console.log('No sender found in message:', newMessage);
          return;
        }

        // Only process messages from other users
        if (messageSender !== user._id) {
          const formattedMessage = {
            _id: newMessage._id || `received-${Date.now()}`,
            sender: messageSender,
            senderId: messageSender,
            content: newMessage.text || newMessage.content || "",
            createdAt: newMessage.timestamp || new Date().toISOString(),
            timestamp: newMessage.timestamp || new Date().toISOString()
          };

          console.log('Adding received message:', formattedMessage);

          dispatch(
            addMessage({
              chatId: messageSender,
              message: formattedMessage,
            })
          );

          // Auto-scroll to bottom when receiving new message
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Error processing received message:", error);
      }
    };

    const handleMessageSent = (data) => {
      console.log('Message sent confirmation:', data);
      // Handle message sent confirmation if needed
    };

    const handleMessageError = (error) => {
      console.error('Socket message error:', error);
    };

    if (socket && user && user._id) {
      try {
        socket.emit("join_room", user._id);

        socket.on("receive_message", handleIncomingMessage);
        socket.on("message_sent", handleMessageSent);
        socket.on("message_error", handleMessageError);

        return () => {
          socket.off("receive_message", handleIncomingMessage);
          socket.off("message_sent", handleMessageSent);
          socket.off("message_error", handleMessageError);
        };
      } catch (error) {
        console.error("Error setting up socket events:", error);
      }
    }

    return () => {};
  }, [socket, user, dispatch, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !activeChat || isLoadingMore) return;

    const { scrollTop, scrollHeight } = messagesContainerRef.current;

    if (scrollTop === 0 && pagination.page < pagination.pages) {
      const previousScrollHeight = scrollHeight;
      setIsLoadingMore(true);

      dispatch(
        loadMoreMessages({
          userId: activeChat,
          page: pagination.page + 1,
          limit: pagination.limit,
        })
      )
        .then(() => {
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop =
              newScrollHeight - previousScrollHeight;
          }
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [activeChat, pagination, isLoadingMore, dispatch]);

  useEffect(() => {
    if (messages && activeChat && messages[activeChat]) {
      const lastMessage = messages[activeChat][messages[activeChat].length - 1];
      if (lastMessage && lastMessage.sender === user._id) {
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages, activeChat, user._id, scrollToBottom]);

  useEffect(() => {
    let timer = null;

    const shouldShowHint = isMobileView && selectedChat && !showSidebar;

    if (shouldShowHint) {
      const hasShownHint = localStorage.getItem("chatSwipeHintShown");

      if (!hasShownHint) {
        setShowSwipeHint(true);

        timer = setTimeout(() => {
          setShowSwipeHint(false);

          localStorage.setItem("chatSwipeHintShown", "true");
        }, 3000);
      } else {
        setShowSwipeHint(false);
      }
    } else {
      setShowSwipeHint(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isMobileView, selectedChat, showSidebar]);

  const handleSelectChat = (connection) => {
    if (!connection || !connection._id) {
      return;
    }

    try {
      const safeConnection = {
        _id: connection._id,
        name: connection.name || "Unknown User",
        profilePicture: connection.profilePicture || "",
        email: connection.email || "",
        bio: connection.bio || "",
      };

      setSelectedChat(safeConnection);
      dispatch(setActiveChat(safeConnection._id));

      dispatch(fetchMessages({ userId: safeConnection._id }));

      if (isMobileView) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message || !message.trim() || !activeChat) return;
    if (!user || !user._id) return;

    try {
      const now = new Date();
      const timestamp = now.toISOString();
      const messageContent = message.trim();

      const tempMessage = {
        _id: `temp-${Date.now()}`,
        sender: user._id,
        senderId: user._id,
        content: messageContent,
        createdAt: timestamp,
        timestamp: timestamp,
      };

      // Add message to local state immediately for better UX
      dispatch(
        addMessage({
          chatId: activeChat,
          message: tempMessage,
        })
      );

      // Send message via socket
      if (socket && socket.connected) {
        socket.emit("send_message", {
          content: messageContent,
          sender: user._id,
          receiver: activeChat,
          timestamp: timestamp,
          _id: tempMessage._id,
        });
      } else {
        console.error("Socket not connected");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setMessage("");

    setTimeout(scrollToBottom, 100);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return format(date, "h:mm a");
  };

  const handleSwipeLeft = useCallback(() => {
    if (isMobileView && selectedChat && showSidebar) {
      setShowSidebar(false);
    }
  }, [isMobileView, selectedChat, showSidebar]);

  const handleSwipeRight = useCallback(() => {
    if (isMobileView && !showSidebar) {
      setShowSidebar(true);
    }
  }, [isMobileView, showSidebar]);

  const swipeRef = useSwipeGesture(handleSwipeLeft, handleSwipeRight, 70, 300);

  if (connections && connections.length === 0) {
    return (
      <div
        className="h-[calc(100vh-8rem)] flex items-center justify-center p-4"
        ref={swipeRef}
      >
        <Card className="w-full max-w-md p-4 md:p-6">
          <CardHeader>
            <CardTitle className="text-center">No Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm md:text-base">
                You need to connect with other users before you can chat with
                them.
              </AlertDescription>
            </Alert>
            <p className="text-center mt-4 text-muted-foreground text-sm md:text-base">
              Go to the{" "}
              <a href="/dashboard" className="text-primary hover:underline">
                Developer Network
              </a>{" "}
              to find and connect with other developers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-6rem)] flex flex-col gap-4"
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
              <AvatarImage
                src={selectedChat?.profilePicture}
                alt={selectedChat?.name || "User"}
              />
              <AvatarFallback>{selectedChat?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {selectedChat?.name || "Unknown User"}
            </span>
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
      <div className="flex flex-1 gap-4 min-h-0">
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
                {connections &&
                Array.isArray(connections) &&
                connections.length > 0 ? (
                  connections.map((connection) => {
                    if (!connection || !connection._id) return null;

                    return (
                      <motion.div
                        key={connection._id}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer ${
                          activeChat === connection._id
                            ? "bg-primary/10"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => handleSelectChat(connection)}
                      >
                        <Avatar>
                          <AvatarImage
                            src={connection.profilePicture}
                            alt={connection.name || "User"}
                          />
                          <AvatarFallback>
                            {connection.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {connection.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {connection.bio ||
                              `Chat with ${connection.name || "this user"}`}
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
          <Card className="flex-1 flex flex-col min-h-0">
            {selectedChat ? (
              <>
                {/* Fixed Header - Hidden on mobile when we show the top bar */}
                <CardHeader className="border-b py-4 flex-shrink-0 hidden md:block">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={selectedChat?.profilePicture}
                        alt={selectedChat?.name || "User"}
                      />
                      <AvatarFallback>
                        {selectedChat?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {selectedChat?.name || "Unknown User"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedChat?.email || ""}
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
                <div className="flex-1 overflow-hidden">
                  <ScrollArea
                    ref={messagesContainerRef}
                    className="h-full"
                    onScroll={handleScroll}
                  >
                    <div className="space-y-4 p-4 pb-6">
                      {isLoadingMore && (
                        <div className="text-center py-2">
                          <p className="text-sm text-muted-foreground">
                            Loading more messages...
                          </p>
                        </div>
                      )}
                      <AnimatePresence>
                        {messages && activeChat && messages[activeChat] ? (
                          messages[activeChat].map((msg, index) => {
                            if (!msg) return null;

                            const senderId = msg.sender || msg.senderId;
                            const isSentByMe = senderId === user._id;

                            return (
                              <motion.div
                                key={msg._id || `msg-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex ${
                                  isSentByMe ? "justify-end" : "justify-start"
                                } w-full`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    isSentByMe
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm break-words">
                                    {msg.content}
                                  </p>
                                  <p className="text-xs mt-1 opacity-70">
                                    {formatMessageTime(
                                      msg.createdAt || msg.timestamp
                                    )}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            {loading
                              ? "Loading messages..."
                              : "No messages yet"}
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
