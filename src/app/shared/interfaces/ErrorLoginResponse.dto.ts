export interface ErrorLoginResponseDto {
	readonly error: string;
	readonly message: string[];
	readonly statusCode: number;
}