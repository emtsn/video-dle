import { HomeOutlined } from '@ant-design/icons';
import { Button, Layout, Space } from 'antd';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
const { Content } = Layout;

export default function ErrorPageContent(): React.ReactElement {
    const navigate = useNavigate();
    const error = useRouteError();
    console.error(error);

    if (isRouteErrorResponse(error)) {
        const message =
            error.status === 404 ? 'The page you visited does not exist.' : 'An unexpected error has occurred';
        return (
            <Content className="main-layout-content">
                <Space direction="vertical">
                    <h2>{error.status + ' ' + error.statusText}</h2>
                    <p>{message}</p>
                    <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
                        Back to home page
                    </Button>
                </Space>
            </Content>
        );
    }
    return (
        <Content className="main-layout-content">
            <h2>Error</h2>
        </Content>
    );
}
