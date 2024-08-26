import { SmileOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import React from 'react';

const MessagePage: React.FC = () => {
  return (
    <Result
    icon={<SmileOutlined />}
    title="Parfait, Merci pour votre retour ! N'hésitez pas à nous contacter si besoin."
    // extra={<Button type="primary">Next</Button>}
  />
  );
};

export default MessagePage;
