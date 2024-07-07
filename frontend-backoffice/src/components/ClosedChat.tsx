import { useEffect, useRef, useState } from "react";
import { Box, Typography, List, ListItem, Button, Link, useTheme } from "@mui/material";
import { getMessages } from "../services/api";
import { IMessage } from "../interfaces/IMessage";
import { IMessagesPaginationData } from "../interfaces/IPagination";
import { IConversationList } from "../interfaces/IConversation";
import { LikertIcon } from "./LikertIcon";
// import FileDisplay from "./FileDisplay";
// import AudioDisplay from "./AudioDisplay";
// import { ImageDisplay } from "./ImageDisplay";

interface ConversationProps {
  conversation: IConversationList
}

export function ClosedChat({ conversation }: ConversationProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const limit = 200;
  const [messagesData, setMessagesData] = useState<IMessagesPaginationData>({
    items: [],
    totalItems: 0,
    page: 0,
    limit: 0,
  });

  const [messages, setMessages] = useState<IMessage[]>([]);

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
  }, [conversation, limit]);

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

  function calculateTimeDifference(start: Date, finish: Date) {
    if (!(start instanceof Date) || !(finish instanceof Date)) {
      return 'Datas inválidas';
    }

    const diffMilliseconds = finish.getTime() - start.getTime();

    const seconds = Math.floor(diffMilliseconds / 1000) % 60;
    const minutes = Math.floor(diffMilliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(diffMilliseconds / (1000 * 60 * 60));

    const formattedTime = `${hours}h ${minutes}m ${seconds}s`;
    return formattedTime;
  }

  const theme = useTheme();

  const borderColor = theme.palette.mode === 'light' ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";

  return (
    <Box display="flex" flexDirection="column" height="100%" width='100%'>
      <Box sx={{
        display: 'flex',
        height: '80px',
        borderBottom: '1px solid ' + borderColor,
      }}>
        <Box sx={{
          paddingTop: 2,
          paddingBottom: 1,
          width: '25%',
          borderRight: '1px solid ' + borderColor,
        }}>
          <Typography align="center">
            <strong>Cliente</strong>
          </Typography>
          <Typography align="center">
            {conversation.consumer.firstName} {conversation.consumer.lastName}
          </Typography>
        </Box>
        <Box sx={{
          paddingTop: 2,
          paddingBottom: 1,
          width: '25%',
          borderRight: '1px solid ' + borderColor,
        }}>
          <Typography align="center">
            <strong>Tempo de espera:</strong>
          </Typography>
          <Typography align="center">
            {calculateTimeDifference(new Date(conversation.createdAt), new Date(conversation.startedAt))}
          </Typography>
        </Box>
        <Box sx={{
          paddingTop: 2,
          paddingBottom: 1,
          width: '30%',
          borderRight: '1px solid ' + borderColor,
        }}>
          <Typography align="center">
            <strong>Duração do atendimento:</strong>
          </Typography>
          <Typography align="center">
            {calculateTimeDifference(new Date(conversation.finishedAt), new Date(conversation.startedAt))}
          </Typography>
        </Box>
        <Typography variant="body1" align="center" sx={{ margin: 'auto' }}>
          <LikertIcon value={conversation.rate} />
        </Typography>
      </Box>
      <Box height='100%'>
        <List ref={listRef} sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 140px)',
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

          {(messagesData.page + 1 * limit) < messagesData.totalItems && (
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
                alignItems: message.by !== 'consumer' ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
              }}
            >
              {message.by === 'system' && (
                <Typography variant='body2' fontStyle='italic' color="GrayText" gutterBottom>
                  Mensagem Automática
                </Typography>
              )}
              <div
                style={{
                  backgroundColor: message.by !== 'consumer' ? 'rgba(220, 248, 198, 0.363)' : 'rgba(224, 224, 224, 0.319)',
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
                        // return (<FileDisplay id={message.file.id}></FileDisplay>)
                        break;
                    case 'audio':
                      if (message.file)
                        // return (<AudioDisplay id={message.file.id}></AudioDisplay>)
                        break;
                    case 'image':
                      if (message.file)
                        // return (<ImageDisplay id={message.file.id}></ImageDisplay>)
                        break;
                    case 'rate':
                      // return (<Likert></Likert>)

                      break;
                  }
                })()}
              </div>
              <Typography
                variant='overline'
                sx={{
                  alignSelf: message.by !== 'consumer' ? 'flex-end' : 'flex-start',
                  marginTop: '5px',
                  color: 'text.secondary',
                }}
              >
                {new Date(message.createdAt).toLocaleString()}
              </Typography>
            </ListItem>
          ))}

        </List>
      </Box>
    </Box>
  )
}
