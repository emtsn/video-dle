import React, { useCallback, useMemo, useState } from 'react';
import { Layout, App as AntApp } from 'antd';
import GameContent from '../components/GameContent';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { createGameOverModal } from './gameOverModal';
const { Content } = Layout;

type Props = {
    videoData: Record<string, VideoData>;
};

export default function RandomGameWrapper({ videoData }: Props): React.ReactElement {
    const { modal } = AntApp.useApp();
    const answer: AnswerData | null = useMemo(() => {
        const videos = Object.values(videoData);
        if (videos.length > 0) {
            const ans = videos[Math.floor(Math.random() * videos.length)].videoId;
            return {
                videoId: ans,
            };
        }
        return null;
    }, [videoData]);
    const [genkey, setGenKey] = useState(Date.now());
    const handleGameOver = useCallback(
        (isSuccess: boolean, guessCount: number) => {
            if (answer != null) {
                let onNext = (): void => setGenKey(Date.now());
                createGameOverModal(modal, isSuccess, videoData[answer.videoId], guessCount, onNext);
            }
        },
        [modal, videoData, answer]
    );
    return (
        <Content className="main-layout-content">
            <GameContent
                key={genkey + '-' + answer?.videoId}
                vidData={videoData}
                answer={answer}
                onGameOver={handleGameOver}
                completed={false}
            />
        </Content>
    );
}
