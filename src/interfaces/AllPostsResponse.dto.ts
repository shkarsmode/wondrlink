import { IPost } from "./IPost";

export interface AllPostsResponseDto {
	readonly posts: IPost[];
	readonly allPostsCount: number;
}