import { IConsumer } from "./IConsumer.js"
import { IMessage } from "./IMessage.js";

export interface IConversation {
  id: string
  subject: string
  consumer: IConsumer
}

export interface IConversationList {
  id: string;
  consumer: IConsumer;
  subject: string
  status: string;
  closingReason?: string;
  rate?: number;
  lastMessage: IMessage;
  startedAt: Date;
  finishedAt: Date;
  createdAt: Date;
  deletedAt?: Date;
}