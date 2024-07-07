import Navbar from '../components/Navbar.tsx';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getClosedConversations, getOpenConversations } from '../services/api.ts';
import { ClosedChat } from '../components/ClosedChat.tsx';
import { IConversationList } from '../interfaces/IConversation';
import { ClosedConversations } from '../components/ClosedConversations.tsx';
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';
import { IMessage } from '../interfaces/IMessage';
import chime from '../assets/chime.mp3'

const Conversations = () => {
    let [cookies] = useCookies(['techlab-chat-token'])
    const socketRef = useRef<Socket>(
        io(import.meta.env.VITE_API_URL, {
            auth: {
                token: "Bearer " + cookies['techlab-chat-token'],
            },
            transports: ['websocket'],
            timeout: 20000,
        })
    );
    const audio = new Audio(chime);
    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();
    useEffect(() => {
        getOpenConversations(0, 50).then((result) => {
            if (result.data) {
                setConversations(result.data.items);
            }
        })
    }, []);

    const setupSocket = () => {
        socketRef.current.connect();

        socketRef.current.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        socketRef.current.on('connect_error', (error: Error) => {
            console.error('WebSocket connection error:', error.message);
        });

        socketRef.current.on('error', (error: Error) => {
            console.error('WebSocket error:', error.message);
        });
    };

    useEffect(() => {
        setupSocket();

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        socketRef.current.on('message', (message: IMessage) => {
            getOpenConversations(0, 50).then((result) => {
                if (result.data)
                    setConversations(result.data.items);
            })

            if (message.by !== 'user') {
                audio.play();
            }
        });

        return () => {
            socketRef.current.off('message');
        };
    }, [socketRef.current]);

    const [closedConversations, setClosedConversations] = useState<IConversationList[]>([]);
    const [selectedClosedConversation, setSelectedClosedConversation] = useState<IConversationList>();
    const limit = 300
    useEffect(() => {
        getClosedConversations(0, limit).then((result) => {
            console.log(result);
            if (result.data)
                setClosedConversations(result.data.items);
        })
    }, [limit]);


    return (
        <div>
            <Navbar
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
            />
            <Box display='flex' flexDirection='row' py={2} sx={{
                maxWidth: 'calc(100% - 240px)',
                height: "calc(100vh - 64px)",
                alignContent: 'flex-end',
                marginRight: '0',
                marginLeft: 'auto',
                paddingTop: 0
            }}>
                <ClosedConversations
                    conversations={closedConversations}
                    onSelectConversation={setSelectedClosedConversation}
                    selectedConversation={selectedClosedConversation}
                />
                {selectedClosedConversation ? (
                    <ClosedChat
                        key={selectedClosedConversation.id}
                        conversation={selectedClosedConversation}
                    />
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '80%',
                        width: '100%',
                    }}>
                        <Typography align="center" variant={'h5'}> Selecione uma conversa <br /> para visualizar o histórico</Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
}

export default Conversations;