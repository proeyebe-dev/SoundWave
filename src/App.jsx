import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'

// Pages — seront implémentées par les autres membres
// En attendant, des placeholders fonctionnels
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Playlist from './pages/Playlist'
import Artist from './pages/Artist'
import Album from './pages/Album'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

// PrivateRoute simple — sera remplacé par celui du Membre 2
function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('sb-auth-token')
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages publiques (sans layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages protégées avec layout principal */}
        <Route
          path="/"
          element={
            <MainLayout />
          }
        >
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="playlist/:id" element={<Playlist />} />
          <Route path="artist/:id" element={<Artist />} />
          <Route path="album/:id" element={<Album />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}