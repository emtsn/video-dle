import { LikeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Row, Skeleton, Space } from 'antd';
import React, { useMemo } from 'react';
import { CommentData } from '../models/video-data';
import './CommentsPanel.scss';
import { countFormatter } from '../utils/format-util';

type Props = {
    isVisible: boolean;
    comments: CommentData[];
};

function textFormatMultiline(text: string): React.ReactElement[] {
    return text.split('\n').map((x, index) => <span key={index}>{x}</span>);
}

const COMMENT_DISPLAY_COUNT = 3 as const;

export default function CommentsPanel({ isVisible, comments }: Props): React.ReactElement {
    const commentCols = useMemo(() => {
        const cols = new Array<React.ReactElement>(COMMENT_DISPLAY_COUNT);
        for (let index = 0; index < cols.length; index++) {
            if (index < comments.length) {
                const comment = comments[index];
                cols[index] = (
                    <Col key={index} span="8">
                        <Card>
                            <Card.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                description={
                                    <Space direction="vertical" style={{ color: '#000000' }}>
                                        {textFormatMultiline(comment.message)}
                                        <Space direction="horizontal">
                                            <LikeOutlined />
                                            {countFormatter(comment.likes)}
                                        </Space>
                                    </Space>
                                }
                            />
                        </Card>
                    </Col>
                );
            } else {
                cols[index] = (
                    <Col key={index} span="8">
                        <Card>
                            <Skeleton avatar={{ size: 32 }} title={false} paragraph={{ rows: 3 }} />
                        </Card>
                    </Col>
                );
            }
        }
        return cols;
    }, [comments]);
    return (
        <div className={isVisible ? 'comments-panel' : 'comments-panel hidden'}>
            <div className="comments-panel-title">Top Comments</div>
            <Row gutter={8}>{commentCols}</Row>
        </div>
    );
}
