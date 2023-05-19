export const VideoCategories = [
    'Activism',
    'Advertisement',
    'Animation',
    'Animals',
    'Comedy',
    'Cooking',
    'Controversial',
    'Documentary',
    'Education',
    'Essay',
    'Events',
    'Film & TV',
    'Gaming',
    'History',
    'Home Video',
    'Horror',
    'Music',
    'News',
    'Other',
    'Parody',
    'Politics',
    'Science',
    'Shorts',
    'Sports',
    'Technology',
    'Vlog',
] as const;

export type VideoCategoriesType = typeof VideoCategories[number];

export interface Dictionary {
    [Key: string]: string
}

export type VideoCategoriesDictionary = {
    [Key in VideoCategoriesType]: string
}

export const TagDescDictionary: VideoCategoriesDictionary = {
    Activism: '',
    Advertisement: 'Produced by an organization for the purpose of promoting a product or idea',
    Animation: 'Features any form of animation',
    Animals: 'Features real or fake animals',
    Comedy: '',
    Cooking: '',
    Controversial: 'Features people and ideas with questionable values or validity',
    Documentary: '',
    Education: '',
    Essay: 'Video essays',
    Events: 'Large events and conferences',
    'Film & TV': 'Features footage from or references Film or TV shows',
    Gaming: 'Features footage of or references to a video or board game',
    History: '',
    'Home Video': 'Amateur video created to be viewed by friends and family',
    Horror: '',
    Music: 'Focuses on music or dance',
    News: '',
    Other: 'Does not fit in another category',
    Parody: 'Imitates or mocks another work, person, or idea',
    Politics: 'Features or references a politician or political event',
    Science: '',
    Shorts: 'Originally created for short video platforms like Vine, TikTok, etc...',
    Sports: 'Features a sport being played or an athlete',
    Technology: 'Features and focuses on tech device, software, company, or person',
    Vlog: 'A diary-style video with a single person talking directly to the camera'
} as const;
