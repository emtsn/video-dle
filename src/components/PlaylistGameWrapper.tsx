import React, { useCallback, useMemo } from 'react';
import { Layout, App as AntApp, Pagination } from 'antd';
import GameContent from '../components/GameContent';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { useLocalStorageStateArray, useLocalStorageStateNumber } from '../hooks/useLocalStorageState';
import { createGameOverModal } from './GameOverModal';
import './PlaylistGameWrapper.scss';
const { Content } = Layout;

type Props = {
    videoData: Record<string, VideoData>;
    answerData: AnswerData[] | null;
};

enum CompletionState {
    InProgress,
    Success,
    Failed,
}

function isCompletion(val: any): val is CompletionState {
    return (
        typeof val === 'number' &&
        [CompletionState.InProgress, CompletionState.Success, CompletionState.Failed].includes(val)
    );
}

function isCompleted(val: CompletionState): boolean {
    return val === CompletionState.Success || val === CompletionState.Failed;
}

export default function PlaylistGameWrapper({ videoData, answerData }: Props): React.ReactElement {
    const { modal } = AntApp.useApp();
    const [quizNum, setQuizNum] = useLocalStorageStateNumber('playlist-quiz-num', 0, (val) => val >= 0);
    const [completedQuizzes, setCompletedQuizzes] = useLocalStorageStateArray<CompletionState>(
        'playlist-quiz-completed',
        [],
        isCompletion
    );
    const [totalCompleteGuessCount, setTotalCompleteGuessCount] = useLocalStorageStateNumber(
        'playlist-guess-total',
        0,
        (val) => val >= 0
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
                setTotalCompleteGuessCount((x) => x + guessCount);
                const successCount =
                    completedQuizzes.filter((x) => x === CompletionState.Success).length + (isSuccess ? 1 : 0);
                const completedCount = completedQuizzes.filter((x) => isCompleted(x)).length + 1;
                createGameOverModal(modal, isSuccess, videoData[answer.videoId], guessCount, onNext, {
                    successGames: successCount,
                    totalGames: completedCount,
                    guessCompleteCount: totalCompleteGuessCount + guessCount,
                });
                setCompletedQuizzes((prevCompleted) => {
                    const completed = new Array<CompletionState>(answerData.length);
                    for (let index = 0; index < completed.length; index++) {
                        if (index === quizNum) {
                            completed[index] = isSuccess ? CompletionState.Success : CompletionState.Failed;
                        } else if (
                            index < prevCompleted.length &&
                            prevCompleted[index] !== CompletionState.InProgress
                        ) {
                            completed[index] = prevCompleted[index];
                        } else {
                            completed[index] = CompletionState.InProgress;
                        }
                    }
                    return completed;
                });
            }
        },
        [
            modal,
            videoData,
            answerData,
            answer,
            quizNum,
            completedQuizzes,
            totalCompleteGuessCount,
            setQuizNum,
            setCompletedQuizzes,
            setTotalCompleteGuessCount,
        ]
    );

    const getCompletionClass = useCallback(
        (quiz: number) => {
            if (quiz >= completedQuizzes.length) return 'page-not-completed';
            switch (completedQuizzes[quiz]) {
                case CompletionState.Success:
                    return 'page-completed-success';
                case CompletionState.Failed:
                    return 'page-completed-failed';
                default:
                    return 'page-not-completed';
            }
        },
        [completedQuizzes]
    );

    return (
        <Content className="main-layout-content">
            <div className="content-holder">
                <div className="playlist-header">
                    <h2 style={{ margin: 0 }}>Video #{quizNum + 1}</h2>
                    <Pagination
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
                                    <a className={getCompletionClass(page - 1)} rel="no-follow">
                                        #{page}
                                    </a>
                                );
                            }
                            return element;
                        }}
                    />
                </div>
                <GameContent
                    key={quizNum}
                    vidData={videoData}
                    answer={answer}
                    gameKey={'playlist-quiz-guessed-' + quizNum}
                    onGameOver={handleGameOver}
                    completed={quizNum < completedQuizzes.length && isCompleted(completedQuizzes[quizNum])}
                />
            </div>
        </Content>
    );
}
