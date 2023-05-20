/**
 * Metadata information about a Comment
 */
export interface CommentData {
    message: string;
    likes: number;
}

/**
 * Metadata information about the YT Video
 */
export interface VideoData {
    url: string;
    videoId: string;
    title: string;
    length: number;
    views: number;
    likes?: number;
    commentCount?: number;
    uploadDate: string;
    categories: string[];
    uploaderName: string;
    uploaderUser?: string;
    originalCreator?: string;
    currentDate: string;
    topComments?: CommentData[];
}
