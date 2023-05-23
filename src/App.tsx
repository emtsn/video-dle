import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, Space, App as AntApp, Row, Pagination, Image } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, GithubOutlined } from '@ant-design/icons';
import MainHeader from './components/MainHeader';
import './App.css';
import GameContent from './components/GameContent';
import { VideoData } from './models/video-data';
import { AnswerData } from './models/answer-data';
import { Gamemode } from './models/gamemode';
import { useLocalStorageStateNumber } from './hooks/useLocalStorageState';
import { green, red } from '@ant-design/colors';
import { ModalFunc } from 'antd/es/modal/confirm';
const { Content, Footer } = Layout;

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
    extraText?: string,
    onNext?: () => void
): void {
    console.log(modal);
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
                    <Image
                        // alt="Thumbnail of the video"
                        style={{ minHeight: '200px', maxWidth: '100%' }}
                        src={thumbnailUrl}
                        preview={false}
                        placeholder={true}
                    />
                </a>
            </Space>
        ),
        maskClosable: true,
        okText: onNext ? 'Next' : 'Close',
        onOk: onNext,
        width: 500,
        centered: true,
    });
}

function App(): React.ReactElement {
    const { modal } = AntApp.useApp();
    const [gamemode, setGamemode] = useState<Gamemode>(Gamemode.Playlist);
    const [videoData, setVideoData] = useState<Record<string, VideoData>>({});
    const [answerData, setAnswerData] = useState<AnswerData[] | null>(null);
    const [quizNum, setQuizNum] = useLocalStorageStateNumber('playlist-quiz-num', 0, (val) => val >= 0);
    const isLastQuiz: boolean = quizNum >= (answerData ? answerData?.length - 1 : 0);
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
    const answer = useMemo(() => {
        const videos = Object.values(videoData);
        if (videos.length > 0) {
            if (gamemode === Gamemode.Playlist) {
                if (answerData != null) {
                    const num = Math.min(answerData.length - 1, Math.max(0, quizNum));
                    setQuizNum(num);
                    return answerData[num];
                }
            } else if (gamemode === Gamemode.Random) {
                const ans = videos[Math.floor(Math.random() * videos.length)].videoId;
                return {
                    videoId: ans,
                };
            }
        }
        return null;
    }, [gamemode, videoData, answerData, quizNum, setQuizNum]);
    const handleGameOver = useCallback(
        (isSuccess: boolean, guessCount: number) => {
            if (answer != null) {
                const title = isSuccess
                    ? `Congrats! You found the right video in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}!`
                    : 'You ran out of guesses...';
                const extraText = isSuccess ? undefined : 'The correct answer was:';
                createGameOverModal(
                    modal,
                    isSuccess,
                    videoData[answer.videoId],
                    title,
                    extraText,
                    isLastQuiz
                        ? undefined
                        : () => {
                              setQuizNum((val) => Math.min(answerData ? answerData.length - 1 : 0, val + 1));
                          }
                );
            }
        },
        [modal, videoData, answerData, answer, setQuizNum, isLastQuiz]
    );
    return (
        <Layout className="main-layout">
            <MainHeader />
            <Content className="main-layout-content">
                <div className="content-holder">
                    {/* <Space style={{ width: '100%' }} direction="vertical"> */}
                    <GameContent
                        key={quizNum + '-' + answer?.videoId}
                        vidData={videoData}
                        answer={answer}
                        onGameOver={handleGameOver}
                    />
                    <div className="content-separator" />
                    {gamemode === Gamemode.Playlist && (
                        <Pagination
                            style={{ alignSelf: 'end' }}
                            defaultCurrent={quizNum + 1}
                            current={quizNum + 1}
                            pageSize={1}
                            defaultPageSize={1}
                            total={answerData ? answerData.length : 10}
                            onChange={(page) => setQuizNum(page - 1)}
                            itemRender={(page, type, element) => {
                                if (type === 'page') {
                                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                    return <a rel="no-follow">#{page}</a>;
                                }
                                return element;
                            }}
                        />
                    )}
                    {/* </Space> */}
                </div>
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
    );
}

export default App;
