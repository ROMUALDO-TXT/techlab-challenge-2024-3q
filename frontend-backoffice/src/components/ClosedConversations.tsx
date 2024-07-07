import { Dispatch, SetStateAction } from 'react';
import { Box, List, ListItemText, Typography, ListItemButton, Divider } from '@mui/material';
import { IConversationList } from '../interfaces/IConversation';

interface ISidebarProps {
    conversations: IConversationList[];
    onSelectConversation: Dispatch<SetStateAction<IConversationList | undefined>>;
    selectedConversation: IConversationList | undefined;
}


export const ClosedConversations = ({ conversations, selectedConversation, onSelectConversation }: ISidebarProps) => {

    return (
        <Box
            sx={{
                width: 240,
                flexShrink: 0,
                height: '100vh',
                borderRight: '1px solid rgba(0, 0, 0, 0.12);'
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <Typography variant="h6" align="center" sx={{ padding: '18px 0' }}>
                    Conversas concluídas
                </Typography>
                <Divider />
                <List sx={{
                    overflowY: 'scroll',
                    maxHeight: 'calc(100vh - 160px)',
                    paddingBottom: 0,
                    paddingTop: 0,
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
                    },
                    '&::-moz-scrollbar': {
                        width: '4px',
                    },
                    '&::-moz-scrollbar-track': {
                        background: '#f1f1f1',
                    },
                    '&::-moz-scrollbar-thumb': {
                        background: '#888',
                    },
                    '&::-moz-scrollbar-thumb:hover': {
                        background: '#555',
                    },
                }}>

                    {conversations ? conversations.map((conversation, index) => (
                        <ListItemButton
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                backgroundColor: selectedConversation && conversation.id == selectedConversation.id ? 'action.hover' : 'inherit',
                            }}
                            key={index}
                            onClick={() => onSelectConversation(conversation)}
                        >
                            <ListItemText primary={conversation.subject} />
                            <ListItemText sx={{
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'elipsis',
                                maxWidth: '100%'
                            }} secondary={`Cliente: ${conversation.consumer.firstName} ${conversation.consumer.lastName}`} />
                        </ListItemButton>
                    )) : ""}
                </List>
            </Box>
        </Box>
    );
};

