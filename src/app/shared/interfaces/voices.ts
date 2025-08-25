export enum VoiceStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface IVoice {
    id: number;
    createdAt: string | Date;
    status: VoiceStatus;

    firstName?: string | null;
    email?: string | null;
    location?: string | null;
    creditTo?: string | null;

    what?: string[] | null;
    express?: string[] | null;
    note?: string | null;

    /** URL to the uploaded image/file (you said you'll pass a ready URL) */
    img: string;

    consent: boolean;
}

export interface VoicesListResponse {
    items: IVoice[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateVoiceRequest {
    firstName?: string;
    email?: string;
    location?: string;
    creditTo?: string;
    what?: string[];
    express?: string[];
    note?: string;
    /** Required: URL of the image/file */
    img: string;
    /** Required: must be true to submit */
    consent: boolean;
}

export type UpdateVoiceRequest = Partial<Omit<CreateVoiceRequest, 'consent' | 'img'>> & {
    /** Optionally allow changing img if needed */
    img?: string;
    consent?: boolean;
};
