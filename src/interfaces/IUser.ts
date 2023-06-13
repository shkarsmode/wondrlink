import { UserRoleEnum } from "./UserRoleEnum";

export interface IUser {
	readonly id: number;
	readonly role: UserRoleEnum;
	readonly password: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly email: string;
	readonly phone: string;
	readonly hospital_name: string;
	readonly companyName: string;
	readonly location: string;
	readonly avatar: string;
}