import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatInterface } from '@/components/ChatInterface';

const Host2 = () => {
  const [showChat, setShowChat] = useState(false);
  const [hostName, setHostName] = useState('');

  const handleJoinChat = () => {
    setShowChat(true);
  };

  const handleChatConnect = () => {
    // This will be called when the socket connects
    // You could fetch the host name from the server here
    setHostName('Arjav'); // Placeholder
  };

  if (showChat) {
    return (
      <ChatInterface 
        userName="Host 2" 
        otherUserName={hostName}
        onConnect={handleChatConnect}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Join Chat Room
          </CardTitle>
          <p className="text-muted-foreground">
            Ready to connect with the waiting user?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleJoinChat}
            className="w-full h-12 text-lg"
          >
            Join Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Host2;