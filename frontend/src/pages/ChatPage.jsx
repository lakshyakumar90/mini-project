import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import io from 'socket.io-client';

const ChatPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock chat data - replace with actual API data
  const chats = [
    {
      id: 1,
      name: 'Alice Johnson',
      avatar: 'https://github.com/shadcn.png',
      lastMessage: 'Thanks for the help with React!',
      unread: 2,
    },
    {
      id: 2,
      name: 'Bob Wilson',
      avatar: 'https://github.com/shadcn.png',
      lastMessage: 'When are you free to discuss the project?',
      unread: 0,
    },
  ];

  const mockMessages = [
    {
      id: 1,
      senderId: 1,
      text: 'Hey, I saw your profile and I think we could collaborate on some interesting projects!',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      senderId: user?.id,
      text: 'That sounds great! What kind of projects do you have in mind?',
      timestamp: '10:32 AM',
    },
  ];

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (newMessage) => {
        // Handle incoming message
      });
    }
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mockMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (socket) {
      socket.emit('message', {
        chatId: activeChat,
        text: message,
        senderId: user.id,
      });
    }

    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 p-4">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer ${
                  activeChat === chat.id ? 'bg-primary/10' : 'hover:bg-accent'
                }`}
              >
                <Avatar>
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{chat.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {chat.unread}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          {activeChat && (
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Chat Avatar"
                />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Alice Johnson</CardTitle>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              <AnimatePresence>
                {mockMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;