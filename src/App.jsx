import './App.css'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Subscription from './pages/Subscription'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { FavoriteProvider } from './contexts/Favorites'
import { AuthProvider } from './contexts/Auth'
import { SubscriptionProvider } from './contexts/Subscription'

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
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
                <Route path='/subscription' element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </FavoriteProvider>
        </div>
      </SubscriptionProvider>
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
