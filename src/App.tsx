import React, { useCallback, useEffect, useState } from 'react';
import { Col, Layout, Row, Space, message } from 'antd';
import { GithubOutlined, HeartFilled } from '@ant-design/icons';
import MainHeader from './components/MainHeader';
import GuessTable from './components/GuessTable';
import GuessInput from './components/GuessInput';
import { VideoData } from './models/video-data';
import { AnswerData } from './models/answer-data';
import { Gamemode } from './models/gamemode';
import './App.css';
const { Content, Footer } = Layout;

const MAX_GUESSES = 6;

enum PlayState {
    Initializing,
    InProgress,
    Completed,
}

function App({ gamemode }: { gamemode?: Gamemode }): React.ReactElement {
    if (gamemode === undefined) gamemode = Gamemode.Playlist;
    const [messageApi, contextHolder] = message.useMessage();
    const [answer, setAnswer] = useState<AnswerData | null>(null);
    const [guessedVideos, setGuessedVideos] = useState<string[]>([]);
    const [vidData, setVideoData] = useState<Record<string, VideoData>>({});
    const [playState, setPlayState] = useState<PlayState>(PlayState.Initializing);

    const handleSelect = useCallback(
        (videoId: string): void => {
            if (answer == null) return;
            if (videoId === answer.videoId) {
                setPlayState(PlayState.Completed);
                messageApi.open({
                    type: 'success',
                    content: 'Congrats! You found the right video!',
                    duration: 3,
                });
            } else if (MAX_GUESSES <= guessedVideos.length + 1) {
                setPlayState(PlayState.Completed);
                messageApi.open({
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
        [messageApi, vidData, answer, guessedVideos]
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
                        setAnswer(json[0]);
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
        <div className="App">
            {contextHolder}
            <Layout className="main-layout">
                <MainHeader></MainHeader>
                <Content style={{ paddingTop: '16px', paddingLeft: '5%', paddingRight: '5%' }}>
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
                <Footer>
                    <a href="https://github.com/emtsn" style={{ color: '#828282' }}>
                        <Space>
                            <GithubOutlined />
                            emtsn
                        </Space>
                    </a>
                </Footer>
            </Layout>
        </div>
    );
}

export default App;
