
export interface INewMessage {
  conversationId: string;
  content: string;
  by: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  content: string;
  file: IFile;
  type: string;
  by: string;
  createdAt: Date;
}

export interface IFile{
  id: string;
}
