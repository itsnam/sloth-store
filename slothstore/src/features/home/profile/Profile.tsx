import { Button } from 'antd'
import { Link } from 'react-router-dom'
import './Profile.css'

const Profile: React.FC = () => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20, width: 200}}>
        <Link to ='/profile/history'>
            <Button type={'default'} block htmlType="submit" className="btn-profile">
                Lịch sửa mua hàng
            </Button>
        </Link>
        <Link to ='/profile/address'>
            <Button type={'default'} block htmlType="submit" className="btn-profile">
                Cập nhật địa chỉ
            </Button>
        </Link>
        <Link to ='/profile/change-password'>
            <Button type={'default'} block htmlType="submit" className="btn-profile">
                Thay đổi mật khẩu
            </Button>
        </Link>

  </div>
  )
}

export default Profile
