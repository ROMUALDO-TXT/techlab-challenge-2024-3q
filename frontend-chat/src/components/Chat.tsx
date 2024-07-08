import { useEffect, useRef, useState } from "react";
import { Box, Typography, List, ListItem, Button, Link, Divider, useTheme } from "@mui/material";
import { getMessages } from "../services/api";
import { IMessage } from "../interfaces/IMessage";
import { useCookies } from "react-cookie";
import { IMessagesPaginationData } from "../interfaces/IPagination";
import FileDisplay from "./FileDisplay";
import AudioDisplay from "./AudioDisplay";
import { ImageDisplay } from "./ImageDisplay";
import { useSocket } from "../contexts/SocketContext";
import { IConversationList } from "../interfaces/IConversation";
import { ChatInput } from "./ChatInput";
import { LikertScale } from "./LikertScale";

export interface IConversationMessageInput {
  content: string
}

interface ConversationProps {
  conversation: IConversationList
}

export function Chat({ conversation }: ConversationProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [cookies] = useCookies(['techlab-chat-user']);
  const { socket } = useSocket()

  const limit = 50;
  const [messagesData, setMessagesData] = useState<IMessagesPaginationData>({
    items: [],
    totalItems: 0,
    page: 0,
    limit: 0,
  });

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [_, setIsTyping] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: IMessage) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on('isTyping', (data) => {
        if (data.conversationId === conversation.id && data.user !== cookies['techlab-chat-user'].id) {
          setIsTyping(true);
        }
      });

      return () => {
        socket.off('message');
        socket.off('isTyping');
      };
    }
  }, [socket]);


  const fetchMessages = async (conversationId: string, page: number, limit: number) => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
      });
    }
    getMessages(conversationId, page, limit).then((result) => {
      if (messagesData.totalItems === 0 && result.data.messages.totalItems !== 0) {
        setMessages(result.data.messages.items)
      }
      setMessagesData(result.data.messages);
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
        });
      }
    }).catch((error) => {
      console.log(error);
    })
  };

  useEffect(() => {
    fetchMessages(conversation.id, 0, limit);
  }, [conversation.id, limit]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight * 10,
      });
    }
  }, [messages])

  const handleLoadMore = () => {
    if ((messagesData.page + 1 * limit) <= messagesData.totalItems) {
      getMessages(conversation.id, messagesData.page + 1, limit).then((result) => {
        setMessages(result.data.messages.items.concat(messages))
        setMessagesData({
          page: result.data.messages.page,
          limit: result.data.messages.limit,
          items: messages,
          totalItems: result.data.messages.totalItems
        })
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  const theme = useTheme();

  const borderColor = theme.palette.mode === 'light' ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box sx={{
        display: 'flex',
        height: '80px',
        borderBottom: '1px solid ' + borderColor
      }}>
        <Box sx={{
          paddingTop: 2,
          paddingBottom: 1,
          width: '25%',
          borderRight: '1px solid ' + borderColor
        }}>
          <Typography align="center">
            <strong>Atendente</strong>
          </Typography>
          <Typography align="center">
            {conversation.user ? conversation.user.username : "aguardando"}
          </Typography>
        </Box>
        <Box sx={{
          paddingTop: 2,
          paddingBottom: 1,
          width: '50%',
          borderRight: '1px solid ' + borderColor
        }}>
          <Typography align="center">
            <strong>Assunto do atendimento</strong>
          </Typography>
          <Typography align="center">
            {conversation.subject}
          </Typography>
        </Box>
        <Box sx={{
          paddingTop: 2,
          paddingBottom: 1,
          width: '25%',
          borderRight: '1px solid ' + borderColor
        }}>
          <Typography align="center">
            <strong>Status do atendimento</strong>
          </Typography>
          <Typography align="center">
            {(() => {
              switch (conversation.status) {
                case 'pending':
                  return "Pendente";
                case 'open':
                  return "Aberto";
                case 'closed':
                  return "Encerrado";
              }
            })()}
          </Typography>
        </Box>
      </Box>
      <Box height='75%'>
        <List ref={listRef} sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 240px)',
          padding: '10px',
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

          {(messagesData.page * limit) < messagesData.totalItems && (
            <Button
              component={Link}
              underline="always"
              onClick={(e) => { e.preventDefault(); handleLoadMore() }}
              sx={{ align: 'center', color: 'inherit', padding: 0, textTransform: 'none', fontWeight: 'normal' }}
            >
              Carregar mais mensagens
            </Button>
          )}
          {messages.map((message) => (
            <ListItem
              key={`messages:${message.id}`}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.by === 'consumer' ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  backgroundColor: message.by === 'consumer' ? 'rgba(220, 248, 198, 0.363)' : 'rgba(224, 224, 224, 0.319)',
                  borderRadius: '10px',
                  padding: '10px',
                  maxWidth: '70%',
                  textAlign: 'left',
                }}
              >
                {(() => {
                  switch (message.type) {
                    default:
                      return (<Typography variant='body1'>{message.content}</Typography>)
                      break;
                    case 'file':
                      if (message.file)
                        return (<FileDisplay id={message.file.id}></FileDisplay>)
                      break;
                    case 'audio':
                      if (message.file)
                        return (<AudioDisplay id={message.file.id}></AudioDisplay>)
                      break;
                    case 'image':
                      if (message.file)
                        return (<ImageDisplay id={message.file.id}></ImageDisplay>)
                      break;
                    case 'rate':
                      return (<LikertScale conversation={conversation} message={message}/>)
                      break;
                  }
                })()}
              </div>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {(() => {
                  switch (message.by) {
                    case 'system':
                      return (
                        <Typography variant='body2' mr={2} fontStyle='italic' color="GrayText">
                          Mensagem Automática
                        </Typography>
                      )
                    case 'consumer':
                      return (
                        <Typography variant='body2' mr={2} color="GrayText">
                          Eu
                        </Typography>
                      )
                    case 'user':
                      return (
                        <Typography variant='body2' mr={2} color="GrayText">
                          Agente
                        </Typography>
                      )
                  }
                })()}
                <Typography
                  variant='overline'
                  sx={{
                    alignSelf: message.by === 'consumer' ? 'flex-end' : 'flex-start',
                    marginTop: '5px',
                    color: 'text.secondary',
                  }}
                >
                  {new Date(message.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </ListItem>
          ))}

        </List>
      </Box>
      <Divider />
      {conversation.status !== 'closed' ? (
        <ChatInput conversationId={conversation.id} />
      ) : (
        <Typography variant={'h6'} py={3} align="center" sx={{
          paddingTop: 2,
          marginBottom: -6,
        }}>
          Esta conversa foi encerrada.
        </Typography>
      )}
    </Box>
  )
}
