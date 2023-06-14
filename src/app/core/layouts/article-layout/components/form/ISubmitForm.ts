export interface ISubmitForm {
	readonly firstName: string;
	readonly lastName: string;
	readonly isMySelf?: boolean;
	readonly phone: string;
	readonly location: string;
	readonly email: string;
	readonly hospital?: string;
	readonly company?: string;
	readonly password?: string;
}