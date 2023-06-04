import React from 'react';
import { Card, Col, Image, Row, Space, Statistic } from 'antd';
import { ModalFunc } from 'antd/es/modal/confirm';
import { OriginalVideo, VideoData } from '../models/video-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import './GameOverModal.scss';

type GameStats = {
    /* number of won games */
    successGames: number;
    /* number of total complete games */
    totalGames: number;
    /* number of guesses in complete games */
    guessCompleteCount: number;
};

/**
 * Format the text for the original video information
 * @param originalVideo
 * @returns
 */
function formatOriginalVideo(originalVideo: OriginalVideo): string {
    if (originalVideo.videoFrom) return `(Original from ${originalVideo.videoFrom})`;
    return `(Original by ${originalVideo.creatorName})`;
}

/**
 * Display modal for when the game completes
 * @param modal ANT UI modal
 * @param isSuccess Player successfully completed the game
 * @param answerVidData VideoData of the real answer
 * @param title Title of modal
 * @param extraText Extra text in the body
 * @param onNext Callback on when 'Next' button is pressed
 */
export function createGameOverModal(
    modal: { info: ModalFunc },
    isSuccess: boolean,
    answerVidData: VideoData,
    guessCount: number,
    onNext?: () => void,
    stats?: GameStats
): void {
    const title = isSuccess
        ? `Congrats! You found the right video in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}!`
        : 'You ran out of guesses...';
    const extraText = isSuccess ? undefined : 'The correct answer was:';
    const videoUrl = answerVidData.url ? answerVidData.url : `https://www.youtube.com/watch?v=${answerVidData.videoId}`;
    const thumbnailUrl = answerVidData.thumbnailUrl
        ? answerVidData.thumbnailUrl
        : `https://i.ytimg.com/vi/${answerVidData.videoId}/hqdefault.jpg`;
    const icon = isSuccess ? (
        <FontAwesomeIcon className="green-primary" icon={faCircleCheck} />
    ) : (
        <FontAwesomeIcon className="red-primary" icon={faXmarkCircle} />
    );
    modal.info({
        className: 'gameover-modal',
        wrapClassName: 'gameover-modal-wrap',
        title: (
            <>
                <span className={'gameover-icon'}>{icon}</span>
                <span>{title}</span>
            </>
        ),
        icon: <></>,
        content: (
            <Space direction="vertical">
                <hr className="modal-separator" />
                {extraText && <div>{extraText}</div>}
                <div>
                    <b>{answerVidData.title}</b>
                    {' by ' + answerVidData.uploaderName}
                    {!!answerVidData.originalVideo && (
                        <>
                            <br />
                            {' ' + formatOriginalVideo(answerVidData.originalVideo)}
                        </>
                    )}
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
                {!!stats && (
                    <Row gutter={8}>
                        <Col span={12}>
                            <Card>
                                <Statistic
                                    title="Win Percentage"
                                    value={(stats.successGames * 100) / stats.totalGames}
                                    precision={1}
                                    suffix="%"
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic
                                    title="Avg. Guesses"
                                    value={stats.guessCompleteCount / stats.totalGames}
                                    precision={1}
                                    // suffix=" tries"
                                />
                            </Card>
                        </Col>
                    </Row>
                )}
            </Space>
        ),
        maskClosable: true,
        okText: onNext ? 'Next' : 'Close',
        onOk: onNext,
        width: 500,
        centered: true,
    });
}
