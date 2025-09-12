import './App.css'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { FavoriteProvider } from './contexts/Favorites'
import { AuthProvider } from './contexts/Auth'

function App() {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <FavoriteProvider>
          <main className='main-content'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/favorites' element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path='/profile' element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </FavoriteProvider>
      </div>
    </AuthProvider>
  )
}

function WelcomeLabel({ name }) {
  return (
    <div>
      <h1>Hello {name}, Welcome to the app</h1>
    </div>
  )
}

export default App
