import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, App as AntApp } from 'antd';
import GameContent from '../components/GameContent';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { createGameOverModal } from './gameOverModal';
import { useLocalStorageState, useLocalStorageStateNumber } from '../hooks/useLocalStorageState';
const { Content } = Layout;

type Props = {
    videoData: Record<string, VideoData>;
};

export default function RandomGameWrapper({ videoData }: Props): React.ReactElement {
    const { modal } = AntApp.useApp();
    const [genkey, setGenKey] = useLocalStorageStateNumber('random-quiz-key', Date.now());
    const [answerId, setAnswerId] = useLocalStorageState<string | undefined>(
        'random-quiz-answer',
        undefined,
        (val) => val === undefined || typeof val === 'string'
    );
    useEffect(() => {
        const videos = Object.values(videoData);
        if (videos.length > 0 && answerId === undefined) {
            const ans = videos[Math.floor(Math.random() * videos.length)].videoId;
            setAnswerId(ans);
        }
    }, [videoData, answerId, setAnswerId]);
    const answer: AnswerData | null = useMemo(() => {
        return answerId ? { videoId: answerId } : null;
    }, [answerId]);
    const handleGameOver = useCallback(
        (isSuccess: boolean, guessCount: number) => {
            if (answer != null) {
                let onNext = (): void => {
                    setGenKey(Date.now());
                    const videos = Object.values(videoData);
                    setAnswerId(videos[Math.floor(Math.random() * videos.length)].videoId);
                };
                createGameOverModal(modal, isSuccess, videoData[answer.videoId], guessCount, onNext);
            }
        },
        [modal, videoData, answer, setGenKey, setAnswerId]
    );
    return (
        <Content className="main-layout-content">
            <GameContent
                key={genkey + '-' + answer?.videoId}
                vidData={videoData}
                answer={answer}
                gameKey={'random-quiz-guessed-' + genkey}
                onGameOver={handleGameOver}
                completed={false}
            />
        </Content>
    );
}
