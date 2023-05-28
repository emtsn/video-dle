import React, { useEffect, useState } from 'react';
import { Layout, Space } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import MainHeader from './components/MainHeader';
import PlaylistGameWrapper from './components/PlaylistGameWrapper';
import RandomGameWrapper from './components/RandomGameWrapper';
import { VideoData } from './models/video-data';
import { AnswerData } from './models/answer-data';
import { Gamemode } from './models/gamemode';
import './App.scss';
const { Footer } = Layout;

function App(): React.ReactElement {
    const [gamemode, setGamemode] = useState<Gamemode>(Gamemode.Playlist);
    const [videoData, setVideoData] = useState<Record<string, VideoData>>({});
    const [answerData, setAnswerData] = useState<AnswerData[] | null>(null);
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
    return (
        <Layout className="main-layout">
            <MainHeader gamemode={gamemode} handleChangeGamemode={(gamemode) => setGamemode(gamemode)} />
            {gamemode === Gamemode.Playlist ? (
                <PlaylistGameWrapper videoData={videoData} answerData={answerData} />
            ) : (
                <RandomGameWrapper videoData={videoData} />
            )}
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
