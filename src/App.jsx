import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Playlist from './pages/Playlist'
import Artist from './pages/Artist'
import Album from './pages/Album'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

function PrivateRoute({ children }) {
  const isLoggedIn = true
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
          <Route path="/library" element={<PrivateRoute><Library /></PrivateRoute>} />
          <Route path="/playlist/:id" element={<PrivateRoute><Playlist /></PrivateRoute>} />
          <Route path="/artist/:id" element={<PrivateRoute><Artist /></PrivateRoute>} />
          <Route path="/album/:id" element={<PrivateRoute><Album /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
