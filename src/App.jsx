import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import UploadImage from "./UploadImage";
import OrderSearch from "./OrderSearch";
import OrderAdmin from "./OrderAdmin";
import { useEffect } from "react";

// ฟังก์ชันป้องกันหน้า admin
function ProtectedAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    const pass = prompt("กรุณากรอกรหัสผ่านเพื่อเข้า Admin");

    if (pass !== "1234") {
      alert("รหัสผ่านไม่ถูกต้อง!");
      navigate("/");  // ส่งกลับหน้าแรก
    }
  }, []);

  return <OrderAdmin />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<UploadImage />} />

        <Route path="/search" element={<OrderSearch />} />

        {/* Protect admin page */}
        <Route path="/admin" element={<ProtectedAdmin />} />

      </Routes>
    </BrowserRouter>
  );
}
