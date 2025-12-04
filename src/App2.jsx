import { useState } from 'react'
import './App.css'
import UploadImage from './UploadImage'
import OrderSearch from './OrderSearch'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <UploadImage /> */}
      <OrderSearch/>
    </>
  )
}

export default App
