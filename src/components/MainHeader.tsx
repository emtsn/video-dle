import React from 'react';
import { Col, Layout, Row, } from 'antd';
import './MainHeader.css';

const { Header } = Layout;

export default function MainHeader(): React.ReactElement {
    // const items: MenuProps['items'] = [
    //   {
    //     label: 'Play',
    //     key: 'play'
    //   }
    // ];
    return <Header className='main-header'>
        <Row>
            <Col span={6}><h1 style={{ margin: 0 }}>Video-dle</h1></Col>
            <Col span={18}>
                {/* <Menu mode='horizontal' items={items}></Menu> */}
            </Col>
        </Row>
    </Header>;
}
