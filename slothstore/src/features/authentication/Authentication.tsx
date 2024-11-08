import Logo from '../../assets/logo.png';
import { Route, Routes, Link } from 'react-router-dom';
import './Authentication.css';
import SignIn from './signin/SignIn';
import SignUp from './signup/SignUp';
import ResetPassword from './resetpassword/ResetPassword';
import OTPPage from './resetpassword/OTPPage';
import UpdatePassword from './resetpassword/UpdatePassword';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Authentication = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          navigate('/');
        }
    }, [navigate]);
    return (
        <div className='authentication-container'>
            <div className="left-side">
                <Routes>
                    <Route path="/*" element={<SignIn />} />
                    <Route path="sign-up" element={<SignUp />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="otp-page" element={<OTPPage />} />
                    <Route path="update-password" element={<UpdatePassword />} />
                </Routes>
            </div>
            <div className="right-side">
                <Link to = '/'><img src={Logo} alt="Logo"/></Link>
            </div>
        </div>
    );
}

export default Authentication;