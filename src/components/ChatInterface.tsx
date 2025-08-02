import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import io, { Socket } from 'socket.io-client';

interface Message {
  id: string;
  text?: string;
  file?: {
    name: string;
    data: string;
    type: string;
  };
  sender: 'user' | 'other';
  timestamp: Date;
}

interface ChatInterfaceProps {
  userName: string;
  otherUserName?: string;
  onConnect?: () => void;
}

export const ChatInterface = ({ userName, otherUserName, onConnect }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const socketInstance = io('https://livechat-p5h3.onrender.com', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      onConnect?.();
    });

    socketInstance.on('message', (data) => {
      const message: Message = {
        id: Date.now().toString(),
        text: data.text,
        file: data.file,
        sender: 'other',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [onConnect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    socket.emit('message', { text: newMessage, sender: userName });
    setNewMessage('');
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !socket) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        name: file.name,
        data: reader.result as string,
        type: file.type
      };

      const message: Message = {
        id: Date.now().toString(),
        file: fileData,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, message]);
      socket.emit('message', { file: fileData, sender: userName });
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-chat-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">
              {otherUserName ? otherUserName[0].toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {otherUserName || 'Waiting for connection...'}
            </h2>
            <div className="flex items-center space-x-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-chat-online" : "bg-muted-foreground"
              )} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Online' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                  message.sender === 'user'
                    ? "bg-chat-bubble-sent text-chat-bubble-sent-foreground ml-auto"
                    : "bg-chat-bubble-received text-chat-bubble-received-foreground"
                )}
              >
                {message.text && (
                  <p className="break-words">{message.text}</p>
                )}
                {message.file && (
                  <div className="space-y-2">
                    {message.file.type.startsWith('image/') ? (
                      <img
                        src={message.file.data}
                        alt={message.file.name}
                        className="max-w-full h-auto rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-background/10 rounded-lg">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm truncate">{message.file.name}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-2">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-chat-input border-border pr-20"
              disabled={!isConnected}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-8 w-8 p-0"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || !isConnected}
            className="h-10 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <Card className="p-1">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};