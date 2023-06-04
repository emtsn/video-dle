/**
 * Metadata information about a Comment
 */
export interface CommentData {
    message: string;
    likes: number;
}

/**
 * Metadata information about the Original Video
 */
export interface OriginalVideo {
    videoFrom?: string;
    creatorName?: string;
}

/**
 * Metadata information about the YT Video
 */
export interface VideoData {
    url?: string;
    videoId: string;
    thumbnailUrl?: string;
    title: string;
    length: number;
    views: number;
    likes?: number;
    commentCount?: number;
    uploadDate: string;
    categories: string[];
    uploaderName: string;
    uploaderUser?: string;
    originalVideo?: OriginalVideo;
    currentDate: string;
    topComments?: CommentData[];
    additionalKeys?: string[];
}
