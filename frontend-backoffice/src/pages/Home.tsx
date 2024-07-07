import Navbar from '../components/Navbar.tsx';
import { Box, Typography } from '@mui/material';
import { useCookies } from 'react-cookie';
import { useEffect, useRef, useState } from 'react';
import { getConversations, getOpenConversations } from '../services/api.ts';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { IMessage } from '../interfaces/IMessage';
import { IConversationList } from '../interfaces/IConversation';
import { IConversationsPaginationData } from '../interfaces/IPagination';
import chime from '../assets/chime.mp3'
import { Chat } from '../components/Chat.tsx';

const Home = () => {

    //SOCKETS
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

    let { param } = useParams();
    const audio = new Audio(chime);

    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();

    const limit = 50;

    useEffect(() => {
        getOpenConversations(0, limit).then((result) => {
            if (result.data) {
                setConversations(result.data.items);
                if (param) {
                    const selectedParam = result.data.items.find((c: IConversationList) => {
                        console.log(c.id);
                        return c.id === param
                    });
                    if (selectedParam) setSelectedConversation(selectedParam);
                    param = undefined;
                }
            }
        })
    }, [limit, param]);

    const setupSocket = () => {
        socketRef.current.connect();

        socketRef.current.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        socketRef.current.on('connect_error', (error: Error) => {
            socketRef.current.disconnect();
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
            getOpenConversations(0, limit).then((result) => {
                if (result.data)
                    setConversations(result.data.items);
            })
            console.log('message:');

            if (message.by !== 'user') {
                audio.play();
            }
        });

        return () => {
            socketRef.current.off('message');
        };
    }, [socketRef.current, limit]);



    return (
        <div>
            <Navbar
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
            />
            <Box display='flex' flexDirection='column' sx={{
                maxWidth: 'calc(100% - 240px)',
                height: "calc(100vh - 110px)",
                alignContent: 'flex-end',
                marginRight: '0',
                marginLeft: 'auto',
            }}>
                {selectedConversation ? (
                    <Chat
                        key={selectedConversation.id}
                        conversation={selectedConversation}
                    />
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '80%'
                    }}>
                        {/* <LikertScale conversation={selectedConversation}></LikertScale> */}
                        <Typography variant={'h4'}> Selecione ou crie uma nova conversa</Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
}

export default Home;