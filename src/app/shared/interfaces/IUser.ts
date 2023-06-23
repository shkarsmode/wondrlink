import { UserRoleEnum } from "./UserRoleEnum";
import { UserTypeEnum } from "./UserTypeEnum";

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
	readonly type: UserTypeEnum;
	readonly status: string;
}