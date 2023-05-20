import React from 'react';
import { Layout, Space, App as AntApp } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import MainHeader from './components/MainHeader';
import './App.css';
import GameContent from './components/GameContent';
const { Footer } = Layout;

function App(): React.ReactElement {
    return (
        <AntApp>
            <Layout className="main-layout">
                <MainHeader></MainHeader>
                <GameContent></GameContent>
                <Footer>
                    <a href="https://github.com/emtsn" style={{ color: '#828282' }}>
                        <Space>
                            <GithubOutlined />
                            emtsn
                        </Space>
                    </a>
                </Footer>
            </Layout>
        </AntApp>
    );
}

export default App;
