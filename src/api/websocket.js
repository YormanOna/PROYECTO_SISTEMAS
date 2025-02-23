export const connectWebSocket = (endpoint, onMessage) => {
    let isActive = true;
    const ws = new WebSocket(`wss://9f26-177-53-215-61.ngrok-free.app/ws/${endpoint}`);
  
    const handleMessage = (event) => {
      if (!isActive) return;
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  
    ws.onopen = () => console.log(`Connected to ${endpoint}`);
    ws.onmessage = handleMessage;
    
    const cleanup = () => {
      isActive = false;
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  
    ws.onerror = (error) => {
      if (isActive) {
        console.error(`WebSocket error (${endpoint}):`, error);
        cleanup();
      }
    };
  
    ws.onclose = () => {
      if (isActive) {
        console.log(`Disconnected from ${endpoint}`);
        cleanup();
      }
    };
  
    return cleanup;
  };