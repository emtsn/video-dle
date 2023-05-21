import { LikeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Row, Skeleton, Space } from 'antd';
import React from 'react';
import { CommentData } from '../models/video-data';
import './CommentsPanel.css';

type Props = {
    comments: [CommentData, CommentData, CommentData];
    showCount: number;
};

function textFormatMultiline(text: string): React.ReactElement[] {
    return text.split('\n').map((x) => <span>{x}</span>);
}

export default function CommentsPanel({ comments, showCount }: Props): React.ReactElement {
    const commentCols = comments.map((x, index) => {
        if (index >= showCount) {
            return (
                <Col span="8">
                    <Card>
                        <Skeleton avatar={{ size: 32 }} title={false} paragraph={{ rows: 3 }} />
                    </Card>
                </Col>
            );
        }
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
                                    {x.likes}
                                </Space>
                            </Space>
                        }
                    />
                </Card>
            </Col>
        );
    });
    return (
        <div style={{ background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'scroll' }}>
            <Row style={{ padding: '8px', minWidth: '600px' }}>{commentCols}</Row>
        </div>
    );
}
