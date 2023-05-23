import React, { useCallback, useMemo } from 'react';
import { Layout, App as AntApp, Pagination } from 'antd';
import GameContent from '../components/GameContent';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { useLocalStorageStateArray, useLocalStorageStateNumber } from '../hooks/useLocalStorageState';
import { createGameOverModal } from './gameOverModal';
import './PlaylistGameWrapper.css';
const { Content } = Layout;

type Props = {
    videoData: Record<string, VideoData>;
    answerData: AnswerData[] | null;
};

export default function PlaylistGameWrapper({ videoData, answerData }: Props): React.ReactElement {
    const { modal } = AntApp.useApp();
    const [quizNum, setQuizNum] = useLocalStorageStateNumber('playlist-quiz-num', 0, (val) => val >= 0);
    const [completedQuizzes, setCompletedQuizzes] = useLocalStorageStateArray<boolean>(
        'playlist-quiz-completed',
        [],
        (val) => typeof val == 'boolean'
    );
    const answer = useMemo(() => {
        const videos = Object.values(videoData);
        if (videos.length > 0) {
            if (answerData != null) {
                const num = Math.min(answerData.length - 1, Math.max(0, quizNum));
                setQuizNum(num);
                return answerData[num];
            }
        }
        return null;
    }, [videoData, answerData, quizNum, setQuizNum]);
    const handleGameOver = useCallback(
        (isSuccess: boolean, guessCount: number) => {
            if (answerData != null && answer != null) {
                let onNext = undefined;
                if (quizNum < answerData.length - 1) {
                    onNext = () => {
                        setQuizNum((val) => Math.min(answerData.length - 1, val + 1));
                    };
                }
                createGameOverModal(modal, isSuccess, videoData[answer.videoId], guessCount, onNext);
                setCompletedQuizzes((prevCompleted) => {
                    const completed = new Array<boolean>(answerData.length);
                    for (let index = 0; index < completed.length; index++) {
                        completed[index] = index === quizNum || (index < prevCompleted.length && prevCompleted[index]);
                    }
                    return completed;
                });
            }
        },
        [modal, videoData, answerData, answer, quizNum, setQuizNum, setCompletedQuizzes]
    );
    return (
        <Content className="main-layout-content">
            <div className="content-holder">
                <GameContent
                    key={quizNum + '-' + answer?.videoId}
                    vidData={videoData}
                    answer={answer}
                    gameKey={'playlist-quiz-guessed-' + quizNum}
                    onGameOver={handleGameOver}
                    completed={quizNum < completedQuizzes.length && completedQuizzes[quizNum]}
                />
                <div className="content-separator" />
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
                            return (
                                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                <a
                                    className={
                                        page - 1 < completedQuizzes.length && completedQuizzes[page - 1]
                                            ? 'page-completed'
                                            : 'page-not-completed'
                                    }
                                    rel="no-follow"
                                >
                                    #{page}
                                </a>
                            );
                        }
                        return element;
                    }}
                />
            </div>
        </Content>
    );
}
