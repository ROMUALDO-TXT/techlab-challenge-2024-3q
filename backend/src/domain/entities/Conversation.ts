import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Consumer } from "./Consumer.js";
import { ConversationMessage } from "./ConversationMessage.js";
import { User } from "./User.js";

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  subject: string

  @ManyToOne(() => Consumer, { nullable: false })
  @JoinColumn()
  consumer: Consumer

  @ManyToOne(() => User)
  @JoinColumn()
  user: User | null

  @OneToMany(() => ConversationMessage, message => message.conversation, { cascade: ['insert'] })
  messages: ConversationMessage[]

  @Column({
    enum: ['pending', 'opened', 'closed'],
    default: 'pending'
  }) //pending //opened //closed
  status: string;

  @Column({
    nullable: true,
  })
  rate: number | null;

  //concluded | timedout |
  @Column({
    nullable: true,
  })
  closingReason: string | null;

  @Column({
    nullable: true,
  }) //Service Started
  startedAt: Date | null;

  @Column({
    nullable: true,
  }) //Service Finished
  finishedAt: Date | null

  @CreateDateColumn() //Awaiting Started
  createdAt: Date

  @DeleteDateColumn()
  deletedAt: Date | null
}
