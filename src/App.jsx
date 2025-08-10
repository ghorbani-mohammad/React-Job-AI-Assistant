import './App.css'
import Home from './pages/Home'
import {Routes, Route} from 'react-router-dom'
import Favorites from './pages/Favorites'

function App() {
  return (
    <main className='main-content'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/favorites' element={<Favorites />} />
      </Routes>
    </main>
  )
}

function WelcomeLabel({name}) {
  return (
    <div>
      <h1>Hello {name}, Welcome to the app</h1>
    </div>
  )
}

export default App
