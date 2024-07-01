import { User } from "../entities/User.js";

export interface IProfile {
  scopes: (user: User) => string | string[]
  allowToCreate: string[]
}


export type Profiles = keyof typeof profiles;

export const profiles = {
  sudo: {
    scopes: () => '*',
    allowToCreate: ['sudo', 'standard']
  },
  standard: {
    scopes: (user: User) => [
      `users:${user.id}:*`,
      'conversations:*',
    ],
    allowToCreate: ['sudo', 'standard']
  },
} satisfies Record<string, IProfile>
