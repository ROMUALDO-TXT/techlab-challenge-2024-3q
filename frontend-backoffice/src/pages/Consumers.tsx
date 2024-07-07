import Navbar from '../components/Navbar.tsx';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getConsumers, getOpenConversations } from '../services/api.ts';
import ConsumersTable from '../components/ConsumersTable.tsx';
import { IConsumer } from '../interfaces/IConsumer';
import chime from '../assets/chime.mp3'
import { io, Socket } from 'socket.io-client';
import { useCookies } from 'react-cookie';
import { IConversationList } from '../interfaces/IConversation';
import { IMessage } from '../interfaces/IMessage';

const Consumers = () => {
    let [cookies] = useCookies(['techlab-backoffice-token'])
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [consumers, setConsumers] = useState<IConsumer[]>([])

    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();
    const audio = new Audio(chime);

    const socketRef = useRef<Socket>(
        io(import.meta.env.VITE_API_URL, {
            auth: {
                token: "Bearer " + cookies['techlab-backoffice-token'],
            },
            transports: ['websocket'],
            timeout: 20000,
        })
    );

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
            getOpenConversations(0, limit).then((result) => {
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
    }, [socketRef.current, limit]);


    useEffect(() => {
        getOpenConversations(0, limit).then((result) => {
            if (result.data)
                setConversations(result.data.items);
        })

        getConsumers(page, limit).then((result) => {
            console.log(result);
            if (result.data) {
                setConsumers(result.data.items);
                setPage(result.data.page);
            }
        })
    }, [page, limit]);


    return (
        <div>
            <Navbar
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
            />
            <Box display='flex' flexDirection='column' py={2} sx={{
                maxWidth: 'calc(100% - 240px)',
                height: "calc(100vh - 64px)",
                alignContent: 'flex-end',
                marginRight: '0',
                marginLeft: 'auto'
            }}>
                <ConsumersTable
                    consumers={consumers}
                    limit={limit}
                    page={page}
                    setLimit={setLimit}
                    setPage={setPage}
                ></ConsumersTable>
            </Box>
        </div>
    );
}

export default Consumers;