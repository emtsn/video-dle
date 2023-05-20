import React, { useCallback, useEffect, useState } from 'react';
import { App, Col, Layout, Row, Space } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import GuessTable from './GuessTable';
import GuessInput from './GuessInput';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { Gamemode } from '../models/gamemode';
const { Content } = Layout;

const MAX_GUESSES = 6;

enum PlayState {
    Initializing,
    InProgress,
    Completed,
}

export default function GameContent({ gamemode }: { gamemode?: Gamemode }): React.ReactElement {
    if (gamemode === undefined) gamemode = Gamemode.Playlist;
    const { message } = App.useApp();
    const [answer, setAnswer] = useState<AnswerData | null>(null);
    const [guessedVideos, setGuessedVideos] = useState<string[]>([]);
    const [vidData, setVideoData] = useState<Record<string, VideoData>>({});
    const [playState, setPlayState] = useState<PlayState>(PlayState.Initializing);

    const handleSelect = useCallback(
        (videoId: string): void => {
            if (answer == null) return;
            if (videoId === answer.videoId) {
                setPlayState(PlayState.Completed);
                message.open({
                    type: 'success',
                    content: 'Congrats! You found the right video!',
                    duration: 3,
                });
            } else if (MAX_GUESSES <= guessedVideos.length + 1) {
                setPlayState(PlayState.Completed);
                message.open({
                    type: 'error',
                    content:
                        'You ran out of guesses. The correct answer was ' +
                        vidData[answer.videoId].title +
                        ' by ' +
                        vidData[answer.videoId].uploaderName,
                    duration: 3,
                });
            }
            setGuessedVideos((prev) => [videoId, ...prev]);
        },
        [message, vidData, answer, guessedVideos]
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
            }
            if (gamemode === Gamemode.Random) {
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
                </Row>
                <GuessTable vidData={vidData} guessedVideos={guessedVideos} answer={answer}></GuessTable>
            </Space>
        </Content>
    );
}
