import { useState } from 'react'
import './App.css'
import UploadImage from './UploadImage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <UploadImage />
    </>
  )
}

export default App
