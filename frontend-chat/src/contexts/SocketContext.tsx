import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useCookies } from 'react-cookie';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [cookies] = useCookies(['techlab-chat-token']);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = cookies['techlab-chat-token'];
        const apiUrl = import.meta.env.VITE_API_URL;
    
        if (token && apiUrl) {
            const newSocket = io(apiUrl, {
                auth: {
                    token: "Bearer " + token,
                },
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
            });
    
            newSocket.on('disconnect', (reason) => {
                console.log(`Disconnected: ${reason}`);
                if (reason === 'io server disconnect') {
                    newSocket.connect();
                }
            });

            newSocket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error.message);
            });
    
            newSocket.on('reconnect_attempt', (attempt) => {
                console.log(`Reconnect attempt #${attempt}`);
            });
    
            newSocket.on('reconnecting', (attempt) => {
                console.log(`Reconnecting: attempt #${attempt}`);
            });
    
            newSocket.on('reconnect_failed', () => {
                console.error('Reconnection failed');
            });
    
            newSocket.on('reconnect_error', (error) => {
                console.error('Reconnection error:', error.message);
            });
    
            newSocket.on('error', (error) => {
                console.error('Socket error:', error.message);
            });
    
            newSocket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error.message);
            });
    
            setSocket(newSocket);
    
            return () => {
                console.log('close')
                newSocket.close();
            };
        }
    }, [cookies]);
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
