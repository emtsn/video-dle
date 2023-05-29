import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, App as AntApp } from 'antd';
import GameContent from '../components/GameContent';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { createGameOverModal } from './GameOverModal';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
const { Content } = Layout;

type Props = {
    videoData: Record<string, VideoData>;
};

const LS_KEY_ANSWER = 'random-quiz-answer';
const LS_KEY_GUESSED = 'random-quiz-guessed';

export default function RandomGameWrapper({ videoData }: Props): React.ReactElement {
    const { modal } = AntApp.useApp();
    const [answerId, setAnswerId] = useLocalStorageState<string | undefined>(
        LS_KEY_ANSWER,
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
        (isSuccess: boolean, guessCount: number, reset: () => void) => {
            if (answer != null) {
                let onNext = (): void => {
                    const videos = Object.values(videoData);
                    setAnswerId(videos[Math.floor(Math.random() * videos.length)].videoId);
                    reset();
                };
                createGameOverModal(modal, isSuccess, videoData[answer.videoId], guessCount, onNext);
            }
        },
        [modal, videoData, answer, setAnswerId]
    );
    return (
        <Content className="main-layout-content">
            <div className="content-holder">
                <GameContent
                    key={'random-quiz-content'}
                    vidData={videoData}
                    answer={answer}
                    gameKey={LS_KEY_GUESSED}
                    onGameOver={handleGameOver}
                    completed={false}
                />
            </div>
        </Content>
    );
}
