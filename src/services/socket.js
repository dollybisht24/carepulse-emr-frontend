import { io } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '/';

const socket = io(rawSocketUrl, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export default socket;
