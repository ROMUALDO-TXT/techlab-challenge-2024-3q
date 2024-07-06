import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Profiles } from "../constants/profiles";

@Entity('consumers')
export class Consumer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('character varying', { nullable: true })
  firstName: string | null

  @Column('character varying', { nullable: true })
  lastName: string | null

  @Column('character varying', { unique: true })
  document: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column('timestamp without time zone', { nullable: true })
  birthDate: Date | null

  @Column({
    default: 'consumer'
  })
  profile: Profiles;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date | null
}
