
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatInterface } from '@/components/ChatInterface';

import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [name, setName] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [bothHostsConnected, setBothHostsConnected] = useState(false);
  const { toast } = useToast();
  const [phase, setPhase] = useState<'connecting' | 'waiting-peer' | 'connected' | 'disconnected' | 'error'>('connecting');

  // Debug logging - more detailed
  console.log('INDEX - Current state:', { showChat, bothHostsConnected, isWaiting, phase });
  console.log('INDEX - Render decision - showChat && phase!=="connected":', showChat && phase !== 'connected');

  const handleBothHostsConnected = () => {
    console.log('INDEX - handleBothHostsConnected called! Setting bothHostsConnected to true');
    console.log('INDEX - Current bothHostsConnected state before update:', bothHostsConnected);
    setBothHostsConnected(true);
    setPhase('connected');
    console.log('INDEX - Called setBothHostsConnected(true) and setPhase("connected")');
  };

  const handleStartChat = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }

    setIsWaiting(true);

    try {
      const response = await fetch('https://livechat-p5h3.onrender.com/start-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        setShowChat(true);
      } else {
        throw new Error('Failed to start chat');
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server",
        variant: "destructive"
      });
      setIsWaiting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartChat();
    }
  };

  if (showChat) {
    return (
      <div className="relative">
        <ChatInterface 
          userName={name}
          otherUserName="Arjav"
          isHost1={true}
          onConnect={() => setPhase('waiting-peer')}
          onBothHostsConnected={handleBothHostsConnected}
          onStatusChange={(s) => setPhase(s as any)}
        />
        
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Start Live Chat
          </CardTitle>
          <p className="text-muted-foreground">
            Enter your name to begin chatting
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Enter your name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your name"
              className="bg-chat-input border-border"
              disabled={isWaiting}
            />
          </div>
          <Button 
            onClick={handleStartChat} 
            disabled={isWaiting || !name.trim()}
            className="w-full h-12 text-lg"
          >
            {isWaiting ? 'Connecting...' : 'Chat'}
          </Button>
          {isWaiting && (
            <p className="text-center text-muted-foreground text-sm">
              Waiting for Arjav to respond...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
