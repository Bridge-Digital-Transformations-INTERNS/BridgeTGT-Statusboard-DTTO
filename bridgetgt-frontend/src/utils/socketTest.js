import socket from './socket';

/**
 * Test Socket.IO connection and event listeners
 * Call this in browser console: window.testSocket()
 */
export function testSocketConnection() {
  console.log('\n========== Socket.IO Test ==========');
  console.log('Socket ID:', socket.id);
  console.log('Socket Connected:', socket.connected);
  console.log('Socket URL:', socket.io.uri);
  console.log('====================================\n');
  
  // List all registered event listeners
  const events = ['task:created', 'task:updated', 'task:deleted', 'taskAssignee:added', 'taskAssignee:removed'];
  console.log('Checking registered listeners:');
  events.forEach(event => {
    const listeners = socket.listeners(event);
    console.log(`  ${event}: ${listeners.length} listener(s)`);
  });
  
  return {
    connected: socket.connected,
    id: socket.id,
    listeners: events.reduce((acc, event) => {
      acc[event] = socket.listeners(event).length;
      return acc;
    }, {})
  };
}

// Attach to window for console testing
if (typeof window !== 'undefined') {
  window.testSocket = testSocketConnection;
}
