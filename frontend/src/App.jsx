import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { NotificationProvider } from './context/NotificationContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExploreClubs from './pages/ExploreClubs';
import ClubDetails from './pages/ClubDetails';
import CreateClub from './pages/CreateClub';
import EditClub from './pages/EditClub';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function AppShell() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  return (
    <>
      <Navbar />
      <main className={isLanding ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<ExploreClubs />} />
          <Route path="/clubs/:id" element={<ClubDetails />} />
          <Route path="/clubs/new" element={<CreateClub />} />
          <Route path="/clubs/:id/edit" element={<EditClub />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppShell />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
