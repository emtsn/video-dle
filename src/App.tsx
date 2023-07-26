import React, { useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import PlaylistGameWrapper from './components/PlaylistGameWrapper';
import RandomGameWrapper from './components/RandomGameWrapper';
import { VideoData } from './models/video-data';
import { AnswerData } from './models/answer-data';
import PageLayout from './components/PageLayout';
import ErrorPageContent from './components/ErrorPageContent';
import './App.scss';

function App(): React.ReactElement {
    const [videoData, setVideoData] = useState<Record<string, VideoData>>({});
    const [answerData, setAnswerData] = useState<AnswerData[] | null>(null);
    useEffect(() => {
        fetch('./video-data.json')
            .then((response) => response.json())
            .then((json) => {
                setVideoData(json);
            });
        fetch('./answer-data.json')
            .then((response) => response.json())
            .then((json) => {
                const ans = json['answers'];
                if (ans != null) {
                    setAnswerData(ans);
                }
            });
    }, []);
    const router = createBrowserRouter([
        {
            path: '/',
            loader: () => redirect('/play'),
            errorElement: (
                <PageLayout>
                    <ErrorPageContent />
                </PageLayout>
            ),
        },
        {
            path: '/play',
            element: (
                <PageLayout>
                    <PlaylistGameWrapper videoData={videoData} answerData={answerData} />
                </PageLayout>
            ),
        },
        {
            path: '/random',
            element: (
                <PageLayout>
                    <RandomGameWrapper videoData={videoData} />
                </PageLayout>
            ),
        },
    ]);
    return <RouterProvider router={router} />;
}

export default App;
