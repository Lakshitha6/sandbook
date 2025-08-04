import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import Friend from './pages/Friend'
import Profile from './pages/Profile'
import About from './pages/About'
import SignUp from './pages/SignUp'
import Feedback from './pages/Feedback'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute';
import CreatePost from './pages/CreatePost';
import AddFriend from './pages/AddFriend';
import Request from './pages/Request';

function App() {

  const location = useLocation();
  const hideNavbarAndFooter = location.pathname ==='/' || location.pathname ==='/register';

  return (
      <div>
        {!hideNavbarAndFooter && <Navbar />}

        <div style={{paddingTop: hideNavbarAndFooter ? '0': '5rem' , height:'auto'}}>
          <Routes>
            <Route path='/' element = {<Login />} />
            <Route path='/home' element ={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path='/friends' element={<PrivateRoute><Friend /></PrivateRoute>} />
            <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path='/about' element={<PrivateRoute><About /></PrivateRoute>} />
            <Route path='/register' element ={<SignUp />} />
            <Route path='/feedback' element={<PrivateRoute><Feedback /></PrivateRoute>} />
            <Route path='/createPost' element ={<PrivateRoute><CreatePost /></PrivateRoute>} />
            <Route path='/addFriend' element ={<PrivateRoute><AddFriend /></PrivateRoute>} />
            <Route path='/request' element ={<PrivateRoute><Request /></PrivateRoute>} />
          </Routes>
        </div>

        {!hideNavbarAndFooter && <Footer />}
      </div>
  );
}

export default App;
