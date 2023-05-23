import React from 'react';
import { Col, Layout, Menu, MenuProps, Row } from 'antd';
import './MainHeader.css';
import { Gamemode } from '../models/gamemode';

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
        },
        {
            label: 'Random',
            key: 'random',
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
                    <h1 style={{ margin: 0 }}>Video-dle</h1>
                </Col>
                <Col span={18}>
                    <Menu mode="horizontal" items={items} selectedKeys={selectedKeys} onClick={handleClick}></Menu>
                </Col>
            </Row>
        </Header>
    );
}
