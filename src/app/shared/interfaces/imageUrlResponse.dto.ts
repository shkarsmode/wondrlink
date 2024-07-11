export interface ImageUrlResponseDto {
	readonly imageUrl: IImageUrl;
}

interface IImageUrl {
	readonly api_key: string;
	readonly asset_id: string;
	readonly bytes: number;
	readonly created_at: string;
	readonly etag: string;
	readonly folder: string;
	readonly format: string;
	readonly height: number;
	readonly original_filename: string;
	readonly placeholder: boolean;
	readonly public_id: string;
	readonly resource_type: string;
	readonly secure_url: string;
	readonly signature: string;
	readonly tags: string[];
	readonly type: string;
	readonly url: string;
	readonly version: number;
	readonly version_id: string;
	readonly width: number;
}