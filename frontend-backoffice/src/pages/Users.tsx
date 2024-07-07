import Navbar from '../components/Navbar.tsx';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getOpenConversations, getUsers } from '../services/api.ts';
import UsersTable from '../components/UsersTable.tsx';
import { IUser } from '../interfaces/IUser';
import NewUserForm from '../components/NewUserForm.tsx';
import { IMessage } from '../interfaces/IMessage';
import chime from '../assets/chime.mp3'
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';
import { IConversationList } from '../interfaces/IConversation';

const Users = () => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [users, setUsers] = useState<IUser[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);

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
    }, [50]);

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
            <NewUserForm
                // values={}
                open={isModalOpen}
                onClose={handleCloseModal}
            />
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