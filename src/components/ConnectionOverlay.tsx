import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type ConnectionPhase = 'connecting' | 'waiting-peer' | 'connected' | 'disconnected' | 'error';

interface Props {
  phase: ConnectionPhase;
}

export const ConnectionOverlay = ({ phase }: Props) => {
  const titleMap: Record<ConnectionPhase, string> = {
    connecting: 'Connecting to server',
    'waiting-peer': 'Waiting for Connection',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Connection Error',
  };

  const descMap: Record<ConnectionPhase, string> = {
    connecting: 'Establishing a secure connection…',
    'waiting-peer': 'Waiting for the other participant to join…',
    connected: 'You are connected. Preparing chat…',
    disconnected: 'Lost connection. Attempting to reconnect…',
    error: 'We could not connect. Please retry.',
  };

  if (phase === 'connected') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {titleMap[phase]}
          </CardTitle>
          <p className="text-muted-foreground">{descMap[phase]}</p>
        </CardHeader>
        <CardContent>
          {phase !== 'error' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
