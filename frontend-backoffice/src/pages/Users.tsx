import Navbar from '../components/Navbar.tsx';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getOpenConversations, getQueueCount, getUsers } from '../services/api.ts';
import UsersTable from '../components/UsersTable.tsx';
import { IUser } from '../interfaces/IUser';
import NewUserForm from '../components/NewUserForm.tsx';
import { IMessage } from '../interfaces/IMessage';
import chime from '../assets/chime.mp3'
import { IConversationList } from '../interfaces/IConversation';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useCookies } from 'react-cookie';

const Users = () => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [users, setUsers] = useState<IUser[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [cookies] = useCookies(['techlab-backoffice-user']);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();
    const [queueCount, setQueueCount] = useState(0);
    useEffect(() => {
        getOpenConversations(0, 50).then((result) => {
            if (result.data) {
                setConversations(result.data.items);
            }
        })
        getQueueCount().then((result) => {
            if (result.data) {
                setQueueCount(result.data);
            }
        })
    }, [50]);

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
        getUsers(page, limit).then((result) => {
            console.log(result);
            if (result.data) {
                setUsers(result.data.items);
                setPage(result.data.page);
            }
        })
    }, [page, limit]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <audio ref={audioRef} style={{ display: 'none' }} src={chime} />
            <NewUserForm
                // values={}
                open={isModalOpen}
                onClose={handleCloseModal}
            />
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
                <UsersTable
                    users={users}
                    limit={limit}
                    page={page}
                    setLimit={setLimit}
                    setPage={setPage}
                    onCreateNewUser={handleOpenModal}
                ></UsersTable>
            </Box>
        </div>
    );
}

export default Users;