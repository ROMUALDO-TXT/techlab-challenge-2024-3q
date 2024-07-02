import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Conversation } from "./Conversation.js";
import { User } from "./User.js";

export enum ConversationMessageBy {
  Consumer = 'consumer',
  User = 'user',
  System = 'system',
}

@Entity('conversation_messages')
@Index(() => ({ conversation: 1, createdAt: -1 }))
export class ConversationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  content: string

  @Column('enum', { enum: ConversationMessageBy })
  by: ConversationMessageBy

  @ManyToOne(() => Conversation, { nullable: false })
  @JoinColumn()
  conversation: Relation<Conversation>

  @ManyToOne(() => User)
  @JoinColumn()
  user: User | null

  @CreateDateColumn()
  createdAt: Date
}
