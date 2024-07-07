import Navbar from '../components/Navbar.tsx';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getConsumers, getOpenConversations, getQueueCount } from '../services/api.ts';
import ConsumersTable from '../components/ConsumersTable.tsx';
import { IConsumer } from '../interfaces/IConsumer';
import chime from '../assets/chime.mp3'
import { IConversationList } from '../interfaces/IConversation';
import { IMessage } from '../interfaces/IMessage';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useCookies } from 'react-cookie';

const Consumers = () => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [consumers, setConsumers] = useState<IConsumer[]>([])
    
    const [cookies] = useCookies(['techlab-backoffice-user']);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();
    const [queueCount, setQueueCount] = useState(0);

    useEffect(() => {
        if (socket) {
            socket.on('lastMessage', (message: IMessage) => {
                getOpenConversations(0, limit).then((result) => {
                    if (result.data)
                        setConversations(result.data.items);
                })

                if (message.by !== 'user' && conversations.find((m) => m.id === message.conversationId)) {
                    if (audioRef.current) {
                        audioRef.current.play().catch(error => {
                            console.error('Audio playback error:', error.message);
                        });
                    }
                }
            });

            socket.on('userAssigned', ({ userId }: { userId: string, conversationId: string }) => {
                if (userId === cookies['techlab-backoffice-user'].id) {
                    getOpenConversations(0, limit).then((result) => {
                        if (result.data)
                            setConversations(result.data.items);
                    })

                    if (audioRef.current) {
                        audioRef.current.play().catch(error => {
                            console.error('Audio playback error:', error.message);
                        });
                    }
                }
            });

            socket.on('queueCount', ({ queueSize }: { queueSize: number }) => {
                setQueueCount(queueSize);
            });

            return () => {
                socket.off('lastMessage');
                socket.off('userAssigned')
                socket.off('queueCount');
            };
        }
    }, [socket, audioRef]);


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

        getQueueCount().then((result) => {
            if (result.data) {
                setQueueCount(result.data);
            }
        })
    }, [page, limit]);


    return (
        <div>
            <audio ref={audioRef} style={{ display: 'none' }} src={chime} />
            <Navbar
                queueCount={queueCount}
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