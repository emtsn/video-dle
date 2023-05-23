import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row, Space } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import GuessTable from './GuessTable';
import GuessInput from './GuessInput';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import CommentsPanel from './CommentsPanel';

const MAX_GUESSES = 6;

enum PlayState {
    Initializing,
    InProgress,
    Completed,
}

type Props = {
    vidData: Record<string, VideoData>;
    answer: AnswerData | null;
    onGameOver: (isSuccess: boolean, guessCount: number) => void;
};

export default function GameContent({ vidData, answer, onGameOver }: Props): React.ReactElement {
    const [guessedVideos, setGuessedVideos] = useState<string[]>([]);
    const [playState, setPlayState] = useState<PlayState>(PlayState.Initializing);
    const [showHint, setShowHint] = useState<boolean>(false);
    const hintCommentsCount =
        playState === PlayState.Completed ? Number.MAX_VALUE : Math.floor((guessedVideos.length + 1) / 2);

    const handleSelect = useCallback(
        (videoId: string): void => {
            if (answer == null) return;
            const guessCount = guessedVideos.length + 1;
            if (videoId === answer.videoId) {
                setPlayState(PlayState.Completed);
                onGameOver(true, guessCount);
            } else if (MAX_GUESSES <= guessCount) {
                setPlayState(PlayState.Completed);
                onGameOver(false, guessCount);
            }
            setGuessedVideos((prev) => [videoId, ...prev]);
            localStorage.setItem('playlist-guessed-1', JSON.stringify([videoId, ...guessedVideos]));
        },
        [answer, guessedVideos, onGameOver]
    );

    useEffect(() => {
        if (answer != null) {
            setPlayState((previous) => (previous === PlayState.Initializing ? PlayState.InProgress : previous));
        }
    }, [answer]);

    return (
        <Space direction="vertical" style={{ display: 'flex' }}>
            <Row align="middle" justify="start" gutter={8}>
                <Col span="12">
                    <GuessInput
                        vidData={Object.values(vidData)}
                        handleSelect={handleSelect}
                        disabled={playState !== PlayState.InProgress}
                    ></GuessInput>
                </Col>
                <Col span="8">
                    <Space>
                        {new Array(Math.max(0, MAX_GUESSES - guessedVideos.length)).fill(
                            <HeartFilled style={{ color: 'red' }} />
                        )}
                    </Space>
                </Col>
                {answer && answer.topComments && hintCommentsCount > 0 && (
                    <Col span="4" style={{ display: 'flex', justifyContent: 'end' }}>
                        <Button type="primary" onClick={() => setShowHint(!showHint)}>
                            Hint
                        </Button>
                    </Col>
                )}
            </Row>
            {showHint && answer && answer.topComments && (
                <CommentsPanel comments={answer.topComments} showCount={hintCommentsCount} />
            )}
            <GuessTable vidData={vidData} guessedVideos={guessedVideos} answer={answer}></GuessTable>
        </Space>
    );
}
