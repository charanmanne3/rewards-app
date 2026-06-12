import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Rewards from './pages/Rewards'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rewards" element={<Rewards />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
