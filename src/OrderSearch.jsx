import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OrderSearch() {
    const [searched, setSearched] = useState(false);

    const [query, setQuery] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const API = "https://archikoo-preorder-backend.vercel.app";
    const navigate = useNavigate();

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);  // ✅ กดค้นหาแล้ว

        try {
            const res = await axios.get(`${API}/orders`);
            const allOrders = res.data;

            const filtered = allOrders.filter(
                (o) =>
                    o.phone.includes(query) ||
                    o.name.toLowerCase().includes(query.toLowerCase())
            );

            setOrders(filtered);
        } catch (e) {
            console.log("error", e);
        }

        setLoading(false);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 p-4 flex justify-center">

            <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/30 mt-4 mb-10">

                {/* Back button */}
                <button
                    onClick={() => navigate("/")}
                    className="mb-4 text-slate-600 font-semibold flex items-center gap-2 hover:text-slate-900 transition"
                >
                    <span className="text-xl">←</span> กลับไปหน้าการสั่งซื้อ
                </button>

                {/* Header */}
                <h1 className="text-center text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 drop-shadow-sm">
                    ตรวจสอบคำสั่งซื้อ
                </h1>

                {/* Search box - mobile friendly */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="พิมพ์ชื่อ หรือ เบอร์โทร..."
                        className="w-full rounded-2xl p-4 bg-white/70 backdrop-blur-md 
        border border-slate-200 text-lg shadow-inner 
        focus:ring-2 focus:ring-blue-400 outline-none transition"
                        value={query}
                        onChange={(e) => {
                            const text = e.target.value;
                            setQuery(text);

                            // ถ้าพิมพ์ /admin ให้ไปหน้า admin ทันที
                            if (text.trim() === "/admin") {
                                navigate("/admin");
                            }
                        }}
                    />

                    <button
                        onClick={handleSearch}
                        className="w-full md:w-auto bg-blue-600 px-7 py-3 text-white 
              text-lg font-semibold rounded-2xl shadow-lg 
              hover:bg-blue-700 active:scale-95 transition"
                    >
                        ค้นหา
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <p className="text-center text-blue-600 animate-pulse text-lg">
                        กำลังค้นหา...
                    </p>
                )}

                {/* Not found */}
                {searched && !loading && orders.length === 0 && (
                    <p className="text-center text-slate-500 text-lg">
                        ไม่พบคำสั่งซื้อ
                    </p>
                )}

                {/* Result list */}
                <div className="space-y-5">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="border border-slate-200 rounded-2xl p-5 bg-white 
                shadow-md hover:shadow-xl transition transform 
                hover:-translate-y-1 hover:border-blue-300"
                        >
                            <p className="text-xl font-semibold text-slate-800">
                                {order.name}
                            </p>

                            <p className="text-lg mt-1 text-slate-700">
                                <b>จำนวน:</b> {order.amount}
                            </p>

                            <p className="text-lg mt-1">
                                <b>สถานะ:</b>{" "}
                                <span className="text-blue-600">{order.status}</span>
                            </p>

                            {order.tracking_number ? (
                                <p className="text-green-600 text-lg mt-1">
                                    <b>Tracking:</b> {order.tracking_number}
                                </p>
                            ) : (
                                <p className="text-orange-500 text-lg mt-1">
                                    <b>Tracking:</b> กำลังดำเนินการ
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
