
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import io, { Socket } from 'socket.io-client';

let sharedSocket: Socket | null = null;

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
  isHost1?: boolean;
  onBothHostsConnected?: () => void;
  onStatusChange?: (status: 'connecting' | 'waiting-peer' | 'connected' | 'disconnected' | 'error') => void;
  hidden?: boolean;
}

export const ChatInterface = ({ userName, otherUserName, onConnect, isHost1, onBothHostsConnected, onStatusChange, hidden }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost2Connected, setIsHost2Connected] = useState(false);
  const [displayName] = useState(userName);
  const [receivedOtherUserName, setReceivedOtherUserName] = useState(otherUserName);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    let socketInstance: Socket;
    if (!sharedSocket) {
      sharedSocket = io('https://livechat-p5h3.onrender.com', {
        transports: ['websocket', 'polling']
      });
    }
    socketInstance = sharedSocket;
    setIsConnected(!!socketInstance.connected);

    socketInstance.on('connect', () => {
      console.log('HOST 1 - Socket connected');
      setIsConnected(true);
      onConnect?.();
      onStatusChange?.('waiting-peer');
      
      // Emit appropriate connection event
      if (isHost1) {
        console.log('HOST 1 - Emitting host1-connected and name');
        socketInstance.emit('host1-connected');
        socketInstance.emit('host1-name', displayName);
      } else {
        console.log('Emitting host2-connected');
        socketInstance.emit('host2-connected');
      }
    });

    // Specific event listeners for Host 2 connection detection
    socketInstance.on('host2-connected', () => {
      console.log('HOST 1 - Host2 connected event received');
      if (isHost1) {
        console.log('HOST 1 - Setting host2 connected via host2-connected event');
        setIsHost2Connected(true);
        onStatusChange?.('connected');
        onBothHostsConnected?.();
      }
    });

    socketInstance.on('host2-name', (host2Name) => {
      console.log('HOST 1 - Received host2-name:', host2Name);
      setReceivedOtherUserName(host2Name);
      if (isHost1) {
        console.log('HOST 1 - Setting host2 connected via host2-name event');
        setIsHost2Connected(true);
        onStatusChange?.('connected');
        onBothHostsConnected?.();
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.log('HOST 1 - connect_error', err);
      onStatusChange?.('error');
    });

    socketInstance.on('message', (data) => {
      console.log('HOST 1 - Message received:', data);
      const message: Message = {
        id: Date.now().toString(),
        text: data.text,
        file: data.file,
        sender: 'other',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('host1-name', (hostName) => {
      console.log('HOST 1 - Received host1-name:', hostName);
      setReceivedOtherUserName(hostName);
    });

    socketInstance.on('disconnect', () => {
      console.log('HOST 1 - Socket disconnected');
      setIsConnected(false);
      setIsHost2Connected(false);
      onStatusChange?.('disconnected');
    });

    setSocket(socketInstance);

    return () => {
      // Do not disconnect shared socket; remove listeners added by this component
      socketInstance.off('connect');
      socketInstance.off('message');
      socketInstance.off('host1-name');
      socketInstance.off('host2-connected');
      socketInstance.off('host2-name');
      socketInstance.off('connect_error');
      socketInstance.off('disconnect');
    };
  }, [onConnect, isHost1, onBothHostsConnected]);

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
    socket.emit('message', { sender: displayName, text: newMessage });
    setNewMessage('');
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (hidden) {
    return null;
  }

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
               {receivedOtherUserName || 'Chat Partner'}
             </h2>
             <div className="flex items-center space-x-1">
               <div className={cn(
                 "w-2 h-2 rounded-full",
                 isHost2Connected ? "bg-green-500" : "bg-gray-400"
               )} />
               <span className="text-sm text-muted-foreground">
                 {isHost2Connected ? 'Online' : 'Offline'}
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
