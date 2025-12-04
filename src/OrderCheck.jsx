import { useState } from "react";
import axios from "axios";

export default function OrderCheck() {
    const [phone, setPhone] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!phone.trim()) return;

        setLoading(true);
        setError("");
        setOrders([]);

        try {
            const res = await axios.get(`http://localhost:8000/orders?phone=${phone}`);
            if (res.data.length === 0) {
                setError("ไม่พบข้อมูลคำสั่งซื้อ");
            } else {
                setOrders(res.data);
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการค้นหา");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-blue-100">

                <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">
                    ตรวจสอบสถานะคำสั่งซื้อ
                </h2>

                {/* Search Box */}
                <div className="flex gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="กรอกเบอร์โทร"
                        className="flex-1 border-blue-200 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-5 rounded-xl shadow hover:opacity-90 active:scale-95 transition"
                    >
                        ค้นหา
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <p className="text-center text-blue-600">กำลังค้นหา...</p>
                )}

                {/* Error */}
                {error && (
                    <p className="text-center text-red-500">{error}</p>
                )}

                {/* Orders List */}
                {orders.length > 0 && (
                    <div className="space-y-4 mt-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="p-4 bg-white border border-blue-100 rounded-xl shadow"
                            >
                                <p><span className="font-bold text-blue-700">ชื่อ:</span> {order.name}</p>
                                <p><span className="font-bold text-blue-700">ที่อยู่:</span> {order.address}</p>
                                <p><span className="font-bold text-blue-700">เบอร์โทร:</span> {order.phone}</p>
                                <p><span className="font-bold text-blue-700">จำนวน:</span> {order.quantity}</p>

                                <p className="mt-2">
                                    <span className="font-bold text-blue-700">สลิปชำระเงิน:</span>
                                </p>

                                {order.slip_url ? (
                                    <img
                                        src={order.slip_url}
                                        alt="payment-slip"
                                        className="mt-2 w-full rounded-lg border shadow"
                                    />
                                ) : (
                                    <p className="text-gray-500">ไม่มีรูปสลิป</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
