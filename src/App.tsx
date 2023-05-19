import React, { useEffect, useState } from 'react';
// import './App.css';
import GuessTable from './components/GuessTable';
import GuessInput from './components/GuessInput';
import { VideoData } from './models/video-data';
import { AnswerData } from './models/answer-data';
import { Col, Layout, Row, Space, message } from 'antd';
import MainHeader from './components/MainHeader';
import { HeartFilled } from '@ant-design/icons';
import './App.css';
const { Content } = Layout;

const MAX_GUESSES = 6;

enum PlayState {
  InProgress,
  Completed
}

function App(): React.ReactElement {
  const [messageApi, contextHolder] = message.useMessage();
  const [answer, setAnswer] = useState<AnswerData>({
    videoId: 'dQw4w9WgXcQ'
  });
  const [guessedVideos, setGuessedVideos] = useState<string[]>([]);
  const [vidData, setVideoData] = useState<Record<string, VideoData>>({});
  const [playState, setPlayState] = useState<PlayState>(PlayState.InProgress);

  function handleSelect(videoId: string): void {
    console.log('onSelect', videoId);
    setGuessedVideos(prev => [...prev, videoId]);
    if (videoId === answer.videoId) {
      setPlayState(PlayState.Completed);
      messageApi.open({
        type: 'success',
        content: 'Congrats! You found the right video!'
      });
    } else if (MAX_GUESSES <= guessedVideos.length) {
      setPlayState(PlayState.Completed);
      messageApi.open({
        type: 'error',
        content: 'Oh no! You ran out of guesses...'
      });
    }
  }

  useEffect(() => {
    fetch('./video-data.json')
      .then(response => response.json())
      .then(json => {
        setVideoData(json);
      });
  }, []);

  return (
    <div className="App">
      {contextHolder}
      <Layout style={{ backgroundColor: 'transparent' }}>
        <MainHeader></MainHeader>
        <Content style={{ paddingTop: '16px', paddingLeft: '5%', paddingRight: '5%' }}>
          <Space direction='vertical' style={{ display: 'flex' }}>
            <Row align='middle' justify='start' gutter={8}>
              <Col span='12'>
                <GuessInput vidData={Object.values(vidData)} handleSelect={handleSelect} disabled={playState === PlayState.Completed}></GuessInput>
              </Col>
              <Col span='8'>
                <Space>
                  {new Array(MAX_GUESSES - guessedVideos.length).fill(<HeartFilled style={{ color: 'red' }} />)}
                </Space>
              </Col>
            </Row>
            <GuessTable vidData={vidData} guessedVideos={guessedVideos} answer={answer}></GuessTable>
          </Space>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
