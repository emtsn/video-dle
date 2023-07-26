import React from 'react';
import { Layout, Space } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import MainHeader from './MainHeader';
const { Footer } = Layout;

type Props = {
    children: React.ReactNode;
};

export default function PageLayout({ children }: Props): React.ReactElement {
    return (
        <Layout className="main-layout">
            <MainHeader />
            {children}
            <Footer>
                <a className="text-subtext" href="https://github.com/emtsn">
                    <Space>
                        <GithubOutlined />
                        emtsn
                    </Space>
                </a>
            </Footer>
        </Layout>
    );
}
