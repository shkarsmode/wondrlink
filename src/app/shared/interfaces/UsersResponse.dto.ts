import { IUser } from "./IUser";

export interface UsersResponseDto {
	readonly users: IUser[];
	readonly allUsersCount: number;
}