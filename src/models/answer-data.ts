import { CommentData } from './video-data';

/**
 * Model of a game answer
 */
export interface AnswerData {
    videoId: string;
    topComments?: [CommentData, CommentData, CommentData];
}
