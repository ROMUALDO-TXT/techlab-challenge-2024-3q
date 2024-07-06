import { IConversationList } from "./IConversation";

export interface IMessagesPaginationData {
    items: IMessage[];
    totalItems: number;
    page: number;
    limit: number;
}

export interface IConversationsPaginationData {
    items: IConversationList[];
    totalItems: number;
    page: number;
    limit: number;
}