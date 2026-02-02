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
    location: string;
    diagnosis?: string;
    journeyStage: string;
    createdAt: Date;
    verifiedAt?: Date;
    hearts: number;
    comments: number;
    shares: number;
}

export interface AdminSupportMessage {
    id: number;
    requestId: string;
    status: SupportMessageStatus;
    fromName: string;
    email: string;
    location: string;
    type: SupportMessageType;
    message?: string;
    mediaUrl?: string;
    createdAt: Date;
    likes: number;
}

export interface AdminListResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}
