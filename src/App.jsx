import './App.css'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import Favorites from './pages/Favorites'
import Navbar from './components/Navbar'
import { FavoriteProvider } from './contexts/Favorites'

function App() {
  return (
    <div>
      <Navbar />
      <FavoriteProvider>
        <main className='main-content'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/favorites' element={<Favorites />} />
          </Routes>
        </main>
      </FavoriteProvider>
    </div>
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
