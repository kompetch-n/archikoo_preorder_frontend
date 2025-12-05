import { useEffect, useState } from "react";

export default function PrintLayout() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem("printOrders");
        if (saved) setOrders(JSON.parse(saved));
    }, []);

    return (
        <div className="p-6">
            {/* หัวข้อและปุ่ม */}
            <h1 className="text-2xl font-bold mb-6 no-print">📦 ใบปะหน้าจัดส่ง</h1>
            
            <div className="space-y-6" id="print-content">
                {orders.map((order, idx) => (
                    <div
                        key={idx}
                        className="border border-gray-400 p-4 rounded-xl shadow-md"
                    >
                        <p><b>ชื่อ:</b> {order.name}</p>
                        <p><b>เบอร์โทร:</b> {order.phone}</p>
                        <p><b>ที่อยู่:</b> {order.address}</p>
                        <p><b>จำนวน:</b> {order.amount}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={() => window.print()}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition no-print"
            >
                🖨️ พิมพ์
            </button>

            {/* CSS สำหรับซ่อนส่วนที่ไม่ต้องการพิมพ์ */}
            <style>
                {`
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}
