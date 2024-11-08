import {Link} from 'react-router-dom';
import { HistoryOutlined } from '@ant-design/icons';

const HistoryIcon: React.FC = () => {
  return (
    <Link to={'/profile/history'} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#333333' }}>
      <HistoryOutlined style={{ marginTop: 3, fontSize: '20px' }} />
    </Link>
  );
};

export default HistoryIcon;
