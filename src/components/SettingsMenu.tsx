import React from 'react';
import { Button, Modal, Popconfirm, Space } from 'antd';
import './SettingsMenu.scss';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function SettingsMenu({ isOpen, onClose }: Props): React.ReactElement {
    return (
        <Modal
            className="settings-modal"
            title="Settings"
            closable={false}
            open={isOpen}
            footer={false}
            maskClosable={true}
            onCancel={onClose}
        >
            <Space direction="vertical">
                <hr className="modal-separator" />
                <Space direction="vertical">
                    <h3>Reset All Data</h3>
                    <div>This includes guesses, scores, and other statistics.</div>
                    <Popconfirm
                        title="Reset All Data"
                        description={
                            <>
                                <div>Are you sure you want to reset all data?</div>
                                <div></div>
                            </>
                        }
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        placement="right"
                    >
                        <Button danger type="primary">
                            Reset data
                        </Button>
                    </Popconfirm>
                </Space>
            </Space>
        </Modal>
    );
}
