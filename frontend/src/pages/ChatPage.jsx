import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle, ArrowLeft, Users, Check, CheckCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchConnections } from "@/store/slices/connectionSlice";
import {
  fetchMessages,
  setActiveChat,
  setChatPartners,
  addMessage,
  loadMoreMessages,
  updateMessageStatus,
  markChatMessagesRead,
} from "@/store/slices/chatSlice";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useLocation } from "react-router-dom";
import useSwipeGesture from "@/hooks/useSwipeGesture";
import socketService from "@/services/socketService";
import { setUsersStatusMap } from "@/store/slices/presenceSlice";
import userService from "@/services/userService";
import messageService from "@/services/messageService";

const PeerChannelItem = memo(({ connection, isOnline, isTyping, isSelected, onSelect }) => {
  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-[8px] cursor-pointer transition-all ${
        isSelected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-secondary/70 border border-transparent"
      }`}
      onClick={() => onSelect(connection)}
    >
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src={connection.profilePicture} alt={connection.name || "User"} />
          <AvatarFallback className="bg-secondary font-semibold text-xs text-foreground">
            {connection.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${
            isOnline ? "bg-[#16a34a]" : "bg-muted-foreground/40"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-satoshi font-semibold truncate text-foreground">
            {connection.name || "Unknown User"}
          </p>
        </div>
        {isTyping ? (
          <p className="text-[11px] text-[#2563eb] font-geist animate-pulse">Typing...</p>
        ) : (
          <p className="text-[11px] text-muted-foreground truncate font-geist">
            {connection.bio || `Chat with ${connection.name || "peer"}`}
          </p>
        )}
      </div>
    </div>
  );
});

PeerChannelItem.displayName = "PeerChannelItem";

const MessageBubble = memo(({ msg, isSentByMe, showDateDivider, msgDateStr, formatMessageTime, renderStatusTicks }) => {
  return (
    <div className="w-full space-y-2">
      {showDateDivider && msgDateStr && (
        <div className="flex justify-center my-3 w-full">
          <span className="px-3.5 py-1 rounded-full bg-secondary/80 border border-border/80 text-muted-foreground text-[11px] font-satoshi font-medium shadow-subtle backdrop-blur-sm select-none">
            {msgDateStr}
          </span>
        </div>
      )}
      <div
        className={`flex ${isSentByMe ? "justify-end" : "justify-start"} w-full animate-in slide-in-from-bottom-2 duration-200`}
      >
        <div
          className={`max-w-[85%] sm:max-w-[70%] rounded-[12px] px-3.5 py-2 shadow-subtle relative ${
            isSentByMe
              ? "bg-[#2563eb] text-white"
              : "bg-secondary border border-border text-foreground"
          }`}
        >
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-inter pr-12 sm:pr-14">
            {msg.content}
          </p>
          <div
            className={`flex items-center justify-end gap-1 mt-1 -mb-0.5 text-[10px] font-geist select-none ${
              isSentByMe ? "text-blue-100/90" : "text-muted-foreground/80"
            }`}
          >
            <span>{formatMessageTime(msg.createdAt || msg.timestamp)}</span>
            {isSentByMe && (
              <span className="inline-flex items-center ml-0.5" title={`Status: ${msg.status || 'sent'}`}>
                {renderStatusTicks(msg.status || 'sent')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

const ChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userIdFromQuery = queryParams.get("userId");

  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages, loading, pagination, chatPartners } = useSelector(
    (state) => state.chat
  );
  const { connections } = useSelector((state) => state.connections);
  const { onlineUsers, typingMap, lastSeenMap } = useSelector((state) => state.presence);

  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [extraPartners, setExtraPartners] = useState([]);
  const [chatError, setChatError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Stable socket accessor — always reads the live socket from the singleton
  const getSocket = useCallback(() => socketService.getSocket(), []);

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
    messageService.getConversations()
      .then((data) => {
        if (data && data.success && Array.isArray(data.conversations)) {
          setExtraPartners(data.conversations);
        }
      })
      .catch((err) => console.error("Error loading recent conversations:", err));
  }, [dispatch]);

  const allPartners = useMemo(() => {
    const map = new Map();
    const validConns = (connections || []).filter((conn) => conn && conn._id);
    validConns.forEach((c) => {
      map.set(c._id.toString(), c);
    });
    const validChatPartners = (chatPartners || []).filter((conn) => conn && conn._id);
    validChatPartners.forEach((c) => {
      if (c && c._id && !map.has(c._id.toString())) {
        map.set(c._id.toString(), c);
      }
    });
    (extraPartners || []).forEach((c) => {
      if (c && c._id && !map.has(c._id.toString())) {
        map.set(c._id.toString(), c);
      }
    });
    if (selectedChat && selectedChat._id && !map.has(selectedChat._id.toString())) {
      map.set(selectedChat._id.toString(), selectedChat);
    }
    return Array.from(map.values());
  }, [connections, chatPartners, extraPartners, selectedChat]);

  const partnerIdsStr = useMemo(() => {
    return (allPartners || []).map(c => c && c._id).filter(Boolean).sort().join(',');
  }, [allPartners]);

  // Request online status whenever unique partner IDs actually change
  useEffect(() => {
    const s = getSocket();
    if (partnerIdsStr && s && s.connected) {
      const ids = partnerIdsStr.split(',').filter(Boolean);
      if (ids.length > 0) {
        s.emit('get_users_status', ids, (statusMap) => {
          if (statusMap) {
            dispatch(setUsersStatusMap(statusMap));
          }
        });
      }
    }
  }, [partnerIdsStr, dispatch, getSocket]);

  useEffect(() => {
    if (allPartners && allPartners.length > 0) {
      dispatch(setChatPartners(allPartners));
    }
  }, [partnerIdsStr, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      if (allPartners && allPartners.length > 0) {
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
          const connectionFromQuery = allPartners.find(
            (conn) => conn._id === userIdFromQuery
          );
          if (connectionFromQuery) {
            setupChatWithConnection(connectionFromQuery);
          }
        } else if (!activeChat && !selectedChat) {
          const firstConnection = allPartners[0];
          if (firstConnection) {
            setupChatWithConnection(firstConnection);
          }
        }
      }
    } catch (error) {
      console.error("Error setting up chat partners:", error);
    }
  }, [allPartners, activeChat, selectedChat, userIdFromQuery, dispatch]);

  // Allow chat with userIdFromQuery even if not in allPartners initially (for job posters messaging applicants)
  useEffect(() => {
    if (userIdFromQuery && !selectedChat && user && user._id) {
      const isAlreadyPartner = allPartners && allPartners.some(conn => conn._id === userIdFromQuery);
      
      if (!isAlreadyPartner) {
        userService.getUserById(userIdFromQuery)
          .then(data => {
            if (data && data.success && data.user) {
              const safeConnection = {
                _id: data.user._id,
                name: data.user.name || "Unknown User",
                profilePicture: data.user.profilePicture || "",
                email: data.user.email || "",
                bio: data.user.bio || (data.user.role ? `Role: ${data.user.role}` : "Job Applicant / Poster"),
              };
              setSelectedChat(safeConnection);
              dispatch(setActiveChat(safeConnection._id));
              dispatch(fetchMessages({ userId: safeConnection._id }));
            }
          })
          .catch(err => {
            console.error('Error fetching user for chat:', err);
            setChatError('Could not load user details for messaging.');
          });
      }
    }
  }, [userIdFromQuery, selectedChat, allPartners, user, dispatch]);

  const scrollToBottom = useCallback((instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
    }
  }, []);

  // Global socket chat listeners are consolidated in socketService.js to prevent re-attachment on re-render.

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !activeChat || isLoadingMore) return;

    const { scrollTop, scrollHeight } = messagesContainerRef.current;

    if (scrollTop <= 50 && pagination.page < pagination.pages) {
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
              newScrollHeight - previousScrollHeight + scrollTop;
          }
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [activeChat, pagination, isLoadingMore, dispatch]);

  useEffect(() => {
    if (messages && activeChat && messages[activeChat] && !isLoadingMore) {
      const msgs = messages[activeChat];
      if (msgs.length > 0) {
        const container = messagesContainerRef.current;
        if (container) {
          const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
          const lastMsg = msgs[msgs.length - 1];
          const isMyMsg = lastMsg && (lastMsg.sender === user?._id || lastMsg.senderId === user?._id);
          if (isNearBottom || isMyMsg) {
            setTimeout(() => scrollToBottom(false), 80);
          }
        } else {
          setTimeout(() => scrollToBottom(true), 80);
        }
      }
    }
  }, [messages, activeChat, user?._id, scrollToBottom, isLoadingMore]);

  useEffect(() => {
    if (activeChat) {
      setTimeout(() => scrollToBottom(true), 120);
    }
  }, [activeChat, scrollToBottom]);

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

  useEffect(() => {
    socketService.setActiveChatId(activeChat);
    const s = getSocket();
    if (activeChat && s && s.connected && user && user._id) {
      s.emit("join_chat", { userId: user._id, targetUserId: activeChat });
      s.emit("mark_messages_read", { senderId: activeChat });
      dispatch(markChatMessagesRead({ chatId: activeChat, senderId: activeChat }));
    }
  }, [activeChat, user, dispatch, getSocket]);

  useEffect(() => {
    return () => {
      socketService.setActiveChatId(null);
    };
  }, []);

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

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    const s = getSocket();
    if (!s || !s.connected || !activeChat || !user?._id) return;

    s.emit("typing_start", { receiverId: activeChat, chatId: activeChat });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const s2 = getSocket();
      if (s2 && s2.connected) {
        s2.emit("typing_stop", { receiverId: activeChat, chatId: activeChat });
      }
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message || !message.trim() || !activeChat) return;
    if (!user || !user._id) return;

    setChatError(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const s = getSocket();
    if (s && s.connected) {
      s.emit("typing_stop", { receiverId: activeChat, chatId: activeChat });
    }

    try {
      const now = new Date();
      const timestamp = now.toISOString();
      const messageContent = message.trim();

      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        tempId: tempId,
        sender: user._id,
        senderId: user._id,
        content: messageContent,
        createdAt: timestamp,
        timestamp: timestamp,
        status: "sent",
      };

      // Add message to local state immediately for better UX
      dispatch(
        addMessage({
          chatId: activeChat,
          message: tempMessage,
        })
      );

      // Send message via socketService if connected, otherwise fallback to REST API
      const sentViaSocket = socketService.sendChatMessage(activeChat, messageContent, tempId);
      if (!sentViaSocket) {
        await messageService.sendMessage(activeChat, messageContent);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatError(typeof error === 'string' ? error : error?.message || "Failed to send message.");
    }

    setMessage("");

    setTimeout(scrollToBottom, 100);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return format(date, "h:mm a");
  };

  const formatDateHeader = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      if (isToday(date)) return "Today";
      if (isYesterday(date)) return "Yesterday";
      return format(date, "MMMM d, yyyy");
    } catch (e) {
      return "";
    }
  };

  const renderStatusTicks = (status) => {
    if (status === "read") {
      return <CheckCheck className="w-3.5 h-3.5 text-[#38bdf8] drop-shadow-[0_0_2px_rgba(56,189,248,0.4)] shrink-0" />;
    }
    if (status === "delivered") {
      return <CheckCheck className="w-3.5 h-3.5 opacity-80 shrink-0" />;
    }
    return <Check className="w-3.5 h-3.5 opacity-80 shrink-0" />;
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

  const displayChannels = allPartners;

  if (displayChannels.length === 0 && !userIdFromQuery && !selectedChat) {
    return (
      <div
        className="h-[calc(100vh-8rem)] flex items-center justify-center p-4 max-w-[1100px] mx-auto animate-fade-bg-in"
        ref={swipeRef}
      >
        <div className="dub-card w-full max-w-md p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-satoshi font-semibold text-lg text-foreground">No Active Connections</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              You need to connect with other developers and have your request accepted before opening real-time chat rooms.
            </p>
          </div>
          <a href="/dashboard" className="block pt-2">
            <button className="dub-btn-primary text-xs py-2 px-5">
              Explore Developer Directory
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-6rem)] max-w-[1100px] mx-auto py-2 px-2 sm:px-4 flex flex-col gap-4 font-inter animate-fade-bg-in"
      ref={swipeRef}
    >
      {/* Mobile Header */}
      {isMobileView && selectedChat && !showSidebar && (
        <div className="md:hidden flex items-center justify-between p-3 dub-card border border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="dub-btn-ghost p-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={selectedChat?.profilePicture} alt={selectedChat?.name || "User"} />
                <AvatarFallback className="bg-secondary text-xs">{selectedChat?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="font-satoshi font-semibold text-sm text-foreground">
                {selectedChat?.name || "Unknown User"}
              </span>
            </div>
          </div>
          <span className="dub-pill text-[10px] py-0.5 px-2 bg-secondary">
            {onlineUsers[selectedChat?._id] === "online" ? "Online" : "Offline"}
          </span>
        </div>
      )}

      {/* Swipe Hint */}
      {showSwipeHint && isMobileView && selectedChat && !showSidebar && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-border text-white px-4 py-2.5 rounded-[10px] z-50 text-center animate-in fade-in duration-300 shadow-subtle text-xs">
          <p>Swipe right to view peer channels</p>
          <div className="flex justify-center mt-1 text-[#2563eb]">
            <ArrowLeft className="h-4 w-4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Responsive Layout Container */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar */}
        {(showSidebar || !isMobileView) && (
          <div className="dub-card w-full md:w-80 shrink-0 flex flex-col min-h-0 border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <h2 className="font-satoshi font-semibold text-base text-foreground">Peer Channels</h2>
              {isMobileView && selectedChat && (
                <button onClick={toggleSidebar} className="dub-btn-ghost p-1">
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
                {displayChannels && Array.isArray(displayChannels) && displayChannels.length > 0 ? (
                  displayChannels.map((connection) => {
                    if (!connection || !connection._id) return null;
                    const isOnline = onlineUsers[connection._id] === 'online';
                    const isTyping = typingMap[connection._id];
                    const isSelected = activeChat === connection._id;

                    return (
                      <PeerChannelItem
                        key={connection._id}
                        connection={connection}
                        isOnline={isOnline}
                        isTyping={isTyping}
                        isSelected={isSelected}
                        onSelect={handleSelectChat}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No peer channels found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat Area */}
        {(!showSidebar || !isMobileView || !selectedChat) && (
          <div className="dub-card flex-1 flex flex-col min-h-0 border border-border">
            {selectedChat ? (
              <>
                {/* Fixed Header */}
                <div className="p-4 border-b border-border flex items-center justify-between shrink-0 hidden md:flex">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={selectedChat?.profilePicture} alt={selectedChat?.name || "User"} />
                      <AvatarFallback className="bg-secondary font-semibold text-xs text-foreground">
                        {selectedChat?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-satoshi font-semibold text-base text-foreground">
                        {selectedChat?.name || "Unknown User"}
                      </h3>
                      {onlineUsers[selectedChat?._id] === "online" ? (
                        <p className="text-[11px] text-[#16a34a] font-geist flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
                          Online now
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground font-geist">
                          {lastSeenMap[selectedChat?._id]
                            ? `Last seen ${formatDistanceToNow(new Date(lastSeenMap[selectedChat?._id]), { addSuffix: true })}`
                            : "Offline"}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="md:hidden dub-btn-ghost p-2"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                </div>

                {/* Scrollable Messages Area */}
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto flex flex-col min-h-0 p-4 pb-6 space-y-3"
                >
                  {chatError && (
                    <div className="p-2.5 bg-destructive/15 border border-destructive/30 rounded-lg text-xs text-destructive flex items-center justify-between shrink-0 mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{chatError}</span>
                      </div>
                      <button onClick={() => setChatError(null)} className="font-bold px-1.5 hover:opacity-75">✕</button>
                    </div>
                  )}
                  {isLoadingMore && (
                    <div className="text-center py-2 text-xs text-muted-foreground font-geist">
                      Loading prior messages...
                    </div>
                  )}
                  <div className="space-y-3 flex-1">
                    {messages && activeChat && messages[activeChat] ? (
                      messages[activeChat].map((msg, index) => {
                        if (!msg) return null;

                        const senderId = msg.sender || msg.senderId;
                        const isSentByMe = senderId === user._id;

                        // Check if we need to show date divider above this message
                        let showDateDivider = false;
                        const msgDateStr = formatDateHeader(msg.createdAt || msg.timestamp);
                        if (index === 0) {
                          showDateDivider = true;
                        } else {
                          const prevMsg = messages[activeChat][index - 1];
                          if (prevMsg) {
                            const prevDateStr = formatDateHeader(prevMsg.createdAt || prevMsg.timestamp);
                            if (msgDateStr !== prevDateStr) {
                              showDateDivider = true;
                            }
                          }
                        }

                        return (
                          <MessageBubble
                            key={msg._id || `msg-${index}`}
                            msg={msg}
                            isSentByMe={isSentByMe}
                            showDateDivider={showDateDivider}
                            msgDateStr={msgDateStr}
                            formatMessageTime={formatMessageTime}
                            renderStatusTicks={renderStatusTicks}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-xs text-muted-foreground font-geist">
                        {loading ? "Loading message history..." : "No messages yet. Say hello to initiate discussion!"}
                      </div>
                    )}
                  </div>
                  {typingMap[selectedChat?._id] && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-[10px] w-fit text-[11px] text-[#2563eb] font-geist animate-pulse">
                      <span>{selectedChat.name} is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="shrink-0 h-px" />
                </div>

                {/* Footer Input Area */}
                <div className="p-3 border-t border-border shrink-0 bg-card">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={handleInputChange}
                      placeholder="Type a message or code snippet..."
                      className="dub-input flex-1 text-xs sm:text-sm py-2.5"
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="dub-btn-primary px-4 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
                  <Users className="h-6 w-6 text-[#2563eb]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-satoshi font-semibold text-base text-foreground">No Chat Selected</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {displayChannels && displayChannels.length > 0
                      ? "Select a peer channel from the left sidebar to open real-time Socket.IO discussion."
                      : "Connect with verified developers or message job applicants to initiate conversation."}
                  </p>
                </div>
                {isMobileView && displayChannels && displayChannels.length > 0 && (
                  <button onClick={toggleSidebar} className="dub-btn-outline text-xs py-2 px-4 mt-2">
                    Show Peer Channels
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
