
export interface INewMessage {
  conversationId: string;
  content: string;
  by: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  content: string;
  by: string;
  createdAt: string;
}
