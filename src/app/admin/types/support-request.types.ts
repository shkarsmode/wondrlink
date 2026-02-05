export enum SupportRequestStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    PENDING_APPROVAL = 'pending_approval',
    REJECTED = 'rejected',
    CLOSED = 'closed',
}

export enum SupportMessageStatus {
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum SupportMessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
}

export interface AdminSupportRequest {
    id: number;
    requestId: string;
    status: SupportRequestStatus;
    firstName?: string;
    email: string;
    age: number;
    gender?: string;
    location: string;
    city?: string;
    state?: string;
    diagnosis?: string;
    situation?: string;
    whoNeedsSupport?: string;
    caregiverRelationship?: string;
    journeyStage: string;
    contextTags?: string[];
    hospital?: string;
    isAnonymous: boolean;
    comfortZones?: string[];
    additionalNote?: string;
    hearts: number;
    shares: number;
    comments: number;
    lat?: number;
    lng?: number;
    createdAt: Date;
    verifiedAt?: Date;
}

export interface AdminSupportMessage {
    id: number;
    requestId: string;
    status: SupportMessageStatus;
    fromName: string;
    email: string;
    location: string;
    city?: string;
    organization?: string;
    type: SupportMessageType;
    message?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    anonymous: boolean;
    createdAt: Date;
    likes: number;
    lat?: number;
    lng?: number;
}

export interface AdminListResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export interface UpdateSupportRequestDto {
    firstName?: string;
    age?: number;
    gender?: string;
    location?: string;
    city?: string;
    state?: string;
    diagnosis?: string;
    situation?: string;
    whoNeedsSupport?: string;
    caregiverRelationship?: string;
    journeyStage?: string;
    contextTags?: string[];
    hospital?: string;
    isAnonymous?: boolean;
    comfortZones?: string[];
    additionalNote?: string;
    status?: SupportRequestStatus;
}

export interface UpdateSupportMessageDto {
    fromName?: string;
    email?: string;
    location?: string;
    city?: string;
    organization?: string;
    message?: string;
    anonymous?: boolean;
    status?: SupportMessageStatus;
}
