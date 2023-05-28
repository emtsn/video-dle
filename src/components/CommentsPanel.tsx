import { LikeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Row, Skeleton, Space } from 'antd';
import React from 'react';
import { CommentData } from '../models/video-data';
import './CommentsPanel.scss';
import { countFormatter } from '../utils/format-util';

type Props = {
    isVisible: boolean;
    comments: CommentData[];
};

function textFormatMultiline(text: string): React.ReactElement[] {
    return text.split('\n').map((x) => <span>{x}</span>);
}

const COMMENT_DISPLAY_COUNT = 3 as const;

export default function CommentsPanel({ isVisible, comments }: Props): React.ReactElement {
    const commentCols = comments.map((x) => {
        return (
            <Col span="8">
                <Card>
                    <Card.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        description={
                            <Space direction="vertical" style={{ color: '#000000' }}>
                                {textFormatMultiline(x.message)}
                                <Space direction="horizontal">
                                    <LikeOutlined />
                                    {countFormatter(x.likes)}
                                </Space>
                            </Space>
                        }
                    />
                </Card>
            </Col>
        );
    });
    for (let index = commentCols.length; index < COMMENT_DISPLAY_COUNT; index++) {
        commentCols.push(
            <Col span="8">
                <Card>
                    <Skeleton avatar={{ size: 32 }} title={false} paragraph={{ rows: 3 }} />
                </Card>
            </Col>
        );
    }
    return (
        <div className={isVisible ? 'comments-panel' : 'comments-panel hidden'}>
            <div className="comments-panel-title">Top Comments</div>
            <Row gutter={8}>{commentCols}</Row>
        </div>
    );
}
