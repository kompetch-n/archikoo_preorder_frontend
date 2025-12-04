import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadImage from "./UploadImage";
import OrderSearch from "./OrderSearch";
import OrderAdmin from "./OrderAdmin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* หน้า upload */}
        <Route path="/" element={<UploadImage />} />

        <Route path="/search" element={<OrderSearch />} />

        <Route path="/admin" element={<OrderAdmin/>} />

      </Routes>
    </BrowserRouter>
  );
}
