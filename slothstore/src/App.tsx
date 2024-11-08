import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './features/authentication/Authentication';
import HomeLayout from './features/home/HomeLayout';
import ProfileLayout from './features/home/profile/ProfileLayout';
import Cart from './features/home/cart/Cart';
import { store } from './store/store';
import { Provider } from 'react-redux';
import AdminLayout from './features/admin/AdminLayout';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/*" element={<HomeLayout />} />
          <Route path="/auth/*" element={<Authentication />} />
          <Route path="/profile/*" element= {<ProfileLayout />} />
          <Route path="/cart/*" element= {<Cart />}/>
          <Route path="/admin/*" element = {<AdminLayout />} />
        </Routes>
      </Router>
    </Provider>

  );
}

export default App;