import React from 'react';
import { Col, Layout, Menu, MenuProps, Row, Space } from 'antd';
import './MainHeader.scss';
import { Gamemode } from '../models/gamemode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-regular-svg-icons';
import { faPlay, faShuffle } from '@fortawesome/free-solid-svg-icons';
import { red } from '@ant-design/colors';

const { Header } = Layout;

type MenuClickHandler = ({ key }: { key: string }) => void;

type Props = {
    gamemode: Gamemode;
    handleChangeGamemode: (gamemode: Gamemode) => void;
};

export default function MainHeader({ gamemode, handleChangeGamemode }: Props): React.ReactElement {
    const items: MenuProps['items'] = [
        {
            label: 'Play',
            key: 'play',
            icon: <FontAwesomeIcon icon={faPlay} />,
        },
        {
            label: 'Random',
            key: 'random',
            icon: <FontAwesomeIcon icon={faShuffle} />,
        },
    ];
    const selectedKeys: string[] = gamemode === Gamemode.Random ? ['random'] : ['play'];
    const handleClick: MenuClickHandler = ({ key }) => {
        if (key === 'play') handleChangeGamemode(Gamemode.Playlist);
        else if (key === 'random') handleChangeGamemode(Gamemode.Random);
    };
    return (
        <Header className="main-header">
            <Row>
                <Col span={6}>
                    <Space>
                        <FontAwesomeIcon size={'lg'} icon={faCirclePlay} />
                        <div style={{ display: 'flex' }}>
                            <h1 style={{ margin: 0 }}>Video</h1>
                            <h1 style={{ margin: 0, color: red.primary }}>dle</h1>
                        </div>
                    </Space>
                </Col>
                <Col span={18}>
                    <Menu mode="horizontal" items={items} selectedKeys={selectedKeys} onClick={handleClick}></Menu>
                </Col>
            </Row>
        </Header>
    );
}
