import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Row, Space } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import GuessTable from './GuessTable';
import GuessInput from './GuessInput';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import CommentsPanel from './CommentsPanel';
import { useLocalStorageStateArray } from '../hooks/useLocalStorageState';
import './GameContent.scss';

const MAX_GUESSES = 6;

enum PlayState {
    Initializing,
    InProgress,
    Completed,
}

type Props = {
    vidData: Record<string, VideoData>;
    answer: AnswerData | null;
    gameKey: string;
    onGameOver: (isSuccess: boolean, guessCount: number, reset: () => void) => void;
    completed: boolean;
};

export default function GameContent({ vidData, answer, gameKey, onGameOver, completed }: Props): React.ReactElement {
    const [playState, setPlayState] = useState<PlayState>(PlayState.Initializing);
    const [showHint, setShowHint] = useState<boolean>(false);
    const [guessedVideos, setGuessedVideos] = useLocalStorageStateArray<string>(
        gameKey,
        [],
        (val) => typeof val === 'string'
    );
    const [heartAnimationPlaying, setHeartAnimationPlaying] = useState<boolean>(false);
    const hintCommentsCount =
        playState === PlayState.Completed ? Number.MAX_VALUE : Math.floor((guessedVideos.length + 1) / 2);

    const handleSelect = useCallback(
        (videoId: string): void => {
            setHeartAnimationPlaying(true);
            setGuessedVideos((prev) => [videoId, ...prev]);
        },
        [setGuessedVideos]
    );

    const reset = useCallback(() => {
        setGuessedVideos([]);
        setPlayState(PlayState.InProgress);
    }, [setPlayState, setGuessedVideos]);

    useEffect(() => {
        const guessCount = guessedVideos.length;
        if (answer && guessCount > 0 && playState === PlayState.InProgress) {
            const lastGuess = guessedVideos[0];
            if (lastGuess === answer.videoId) {
                setPlayState(PlayState.Completed);
                onGameOver(true, guessCount, reset);
            } else if (MAX_GUESSES <= guessCount) {
                setPlayState(PlayState.Completed);
                onGameOver(false, guessCount, reset);
            }
        }
    }, [answer, playState, guessedVideos, onGameOver, reset]);

    useEffect(() => {
        if (answer != null) {
            setPlayState((previous) => {
                if (completed) return PlayState.Completed;
                switch (previous) {
                    case PlayState.Initializing:
                        return PlayState.InProgress;
                    default:
                        return previous;
                }
            });
        }
    }, [answer, completed]);

    const hearts = useMemo(() => {
        return [...new Array(Math.max(0, MAX_GUESSES))].map((_, index) => (
            <HeartFilled
                key={index}
                className={
                    index < MAX_GUESSES - guessedVideos.length
                        ? 'heart'
                        : 'heart hidden' + (heartAnimationPlaying ? ' animated' : '')
                }
            />
        ));
    }, [guessedVideos, heartAnimationPlaying]);

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
                    <Space>{hearts}</Space>
                </Col>
                {answer && answer.topComments && hintCommentsCount > 0 && (
                    <Col span="4" style={{ display: 'flex', justifyContent: 'end' }}>
                        <Button className="hint-button" type="primary" onClick={() => setShowHint(!showHint)}>
                            Hints
                        </Button>
                    </Col>
                )}
            </Row>
            <CommentsPanel
                isVisible={showHint && !!answer && !!answer.topComments}
                comments={answer?.topComments?.slice(0, hintCommentsCount) ?? []}
            />
            <GuessTable
                vidData={vidData}
                guessedVideos={guessedVideos}
                answer={answer}
                showAnswer={playState === PlayState.Completed}
            ></GuessTable>
        </Space>
    );
}
