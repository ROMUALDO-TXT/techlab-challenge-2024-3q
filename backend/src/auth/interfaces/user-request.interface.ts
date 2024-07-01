import { User as UserEntity } from "../../domain/entities/User";

export type RequestWithUser = Request & { user: UserEntity }