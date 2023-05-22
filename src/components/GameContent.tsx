import React, { useCallback, useEffect, useState } from 'react';
import { App, Button, Col, Layout, Row, Space } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, HeartFilled } from '@ant-design/icons';
import GuessTable from './GuessTable';
import GuessInput from './GuessInput';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { Gamemode } from '../models/gamemode';
import CommentsPanel from './CommentsPanel';
import { ModalFunc } from 'antd/es/modal/confirm';
import { green, red } from '@ant-design/colors';
const { Content } = Layout;

const MAX_GUESSES = 6;

enum PlayState {
    Initializing,
    InProgress,
    Completed,
}

/**
 * Display modal for when the game completes
 * @param modal ANT UI modal
 * @param isSuccess Player successfully completed the game
 * @param answerVidData VideoData of the real answer
 * @param title Title of modal
 * @param extraText Extra text in the body
 */
function createGameOverModal(
    modal: { info: ModalFunc },
    isSuccess: boolean,
    answerVidData: VideoData,
    title: string,
    extraText?: string
): void {
    const videoUrl = answerVidData.url ? answerVidData.url : `https://www.youtube.com/watch?v=${answerVidData.videoId}`;
    const thumbnailUrl = answerVidData.thumbnailUrl
        ? answerVidData.thumbnailUrl
        : `https://i.ytimg.com/vi/${answerVidData.videoId}/hqdefault.jpg`;
    const icon = isSuccess ? (
        <CheckCircleFilled style={{ color: green.primary }} />
    ) : (
        <CloseCircleFilled style={{ color: red.primary }} />
    );
    modal.info({
        className: 'gameover-modal',
        title: title,
        icon: icon,
        content: (
            <Space style={{ marginLeft: '-34px' }} direction="vertical">
                <hr style={{ height: '1px', borderWidth: 0, backgroundColor: '#5c5c5c' }} />
                {extraText && <div>{extraText}</div>}
                <div>
                    <b>{answerVidData.title}</b>
                    {' by ' + answerVidData.uploaderName}
                </div>
                <a href={videoUrl} target="_blank" rel="noreferrer">
                    <img alt="Thumbnail of the video" style={{ maxWidth: '100%' }} src={thumbnailUrl} />
                </a>
            </Space>
        ),
        width: 500,
        centered: true,
    });
}

export default function GameContent({ gamemode }: { gamemode?: Gamemode }): React.ReactElement {
    if (gamemode === undefined) gamemode = Gamemode.Playlist;
    const { modal } = App.useApp();
    const [answer, setAnswer] = useState<AnswerData | null>(null);
    const [guessedVideos, setGuessedVideos] = useState<string[]>([]);
    const [vidData, setVideoData] = useState<Record<string, VideoData>>({});
    const [playState, setPlayState] = useState<PlayState>(PlayState.Initializing);
    const [showHint, setShowHint] = useState<boolean>(false);
    const hintCommentsCount = Math.floor((guessedVideos.length + 1) / 2);

    const handleSelect = useCallback(
        (videoId: string): void => {
            if (answer == null) return;
            const guessCount = guessedVideos.length + 1;
            if (videoId === answer.videoId) {
                setPlayState(PlayState.Completed);
                createGameOverModal(
                    modal,
                    true,
                    vidData[answer.videoId],
                    `Congrats! You found the right video in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}!`
                );
            } else if (MAX_GUESSES <= guessCount) {
                setPlayState(PlayState.Completed);
                createGameOverModal(
                    modal,
                    false,
                    vidData[answer.videoId],
                    'You ran out of guesses...',
                    'The correct answer was:'
                );
            }
            setGuessedVideos((prev) => [videoId, ...prev]);
        },
        [modal, vidData, answer, guessedVideos]
    );

    useEffect(() => {
        fetch('./video-data.json')
            .then((response) => response.json())
            .then((json) => {
                setVideoData(json);
            });
    }, []);

    useEffect(() => {
        const videos = Object.values(vidData);
        if (videos.length > 0) {
            if (gamemode === Gamemode.Playlist) {
                fetch('./answer-data.json')
                    .then((response) => response.json())
                    .then((json) => {
                        const ans = json['answers'][0];
                        if (ans != null) {
                            setAnswer(ans);
                            setPlayState(PlayState.InProgress);
                        }
                    });
            } else if (gamemode === Gamemode.Random) {
                const ans = videos[Math.floor(Math.random() * videos.length)].videoId;
                setAnswer({
                    videoId: ans,
                });
                setPlayState(PlayState.InProgress);
            }
        }
    }, [gamemode, vidData]);

    return (
        <Content>
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
        </Content>
    );
}
