import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OrderAdmin() {
    const navigate = useNavigate();
    const API = "https://archikoo-preorder-backend.vercel.app";

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [selectedOrders, setSelectedOrders] = useState([]); // ✅ เก็บ order ที่เลือก

    const loadOrders = async () => {
        setLoading(true);
        const res = await axios.get(`${API}/orders`);
        setOrders(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = orders.filter((o) => {
        const q = query.toLowerCase();
        return (
            o.name.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            o.address.toLowerCase().includes(q) ||
            (o.tracking_number || "").toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q)
        );
    });

    const handleDelete = async (id) => {
        if (!confirm("ต้องการลบออเดอร์นี้หรือไม่?")) return;
        await axios.delete(`${API}/orders/${id}`);
        loadOrders();
    };

    const startEdit = (order) => {
        setEditing(order._id);
        setForm(order);
    };

    const submitEdit = async () => {
        const updatedForm = { ...form };
        if (updatedForm.tracking_number && updatedForm.tracking_number.trim() !== "") {
            updatedForm.status = "จัดส่งแล้ว";
        }

        const formData = new FormData();
        Object.keys(updatedForm).forEach((key) => formData.append(key, updatedForm[key]));

        await axios.put(`${API}/orders/${editing}`, formData);
        setEditing(null);
        loadOrders();
    };

    // ✅ toggle checkbox
    const toggleSelectOrder = (order) => {
        setSelectedOrders((prev) => {
            if (prev.find((o) => o._id === order._id)) {
                return prev.filter((o) => o._id !== order._id);
            } else {
                return [...prev, order];
            }
        });
    };

    // ✅ ไปหน้าพิมพ์
    const handlePrint = () => {
        if (selectedOrders.length === 0) return alert("กรุณาเลือกออเดอร์ก่อนพิมพ์");
        localStorage.setItem("printOrders", JSON.stringify(selectedOrders));
        navigate("/print"); // สร้างหน้า /print สำหรับ layout
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-cyan-200 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-slate-700 mb-4">
                    🛒 ระบบจัดการข้อมูลการสั่งซื้อ (Admin)
                </h1>

                <div className="flex justify-between items-center mb-6 flex-col md:flex-row gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="bg-slate-600 text-white px-6 py-2 rounded-xl shadow hover:bg-slate-700 transition"
                    >
                        ⬅️ กลับหน้าแรก
                    </button>

                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ / เบอร์ / ที่อยู่ / Tracking / สถานะ..."
                        className="flex-1 p-4 rounded-2xl border shadow bg-white"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    <button
                        onClick={handlePrint}
                        className="bg-green-600 text-white px-6 py-2 rounded-xl shadow hover:bg-green-700 transition"
                    >
                        🖨️ พิมพ์ใบปะหน้า
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-xl text-blue-600 animate-pulse">กำลังโหลด...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order._id}
                                className={`bg-white rounded-3xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1 ${selectedOrders.find((o) => o._id === order._id) ? "border-green-500" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        checked={!!selectedOrders.find((o) => o._id === order._id)}
                                        onChange={() => toggleSelectOrder(order)}
                                    />
                                    <span className="font-semibold text-lg">เลือกพิมพ์</span>
                                </div>

                                <div className="w-full h-48 overflow-hidden rounded-2xl mb-4 bg-gray-100 flex items-center justify-center">
                                    <img
                                        src={order.image_url}
                                        alt="payment-slip"
                                        className="object-contain w-full h-full"
                                    />
                                </div>

                                <h2 className="text-2xl font-semibold mb-1">{order.name}</h2>
                                <p className="text-gray-600"><b>เบอร์:</b> {order.phone}</p>
                                <p className="text-gray-600"><b>ที่อยู่:</b> {order.address}</p>
                                <p className="text-gray-600"><b>จำนวน:</b> {order.amount}</p>

                                <div className="mt-3 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                                    <p className="font-semibold text-blue-800">📦 ที่อยู่ในการจัดส่ง</p>
                                    <p className="text-gray-700 mt-1">
                                        {order.name} {order.phone}
                                        <br />
                                        {order.address}
                                    </p>
                                </div>

                                <p className="mt-2">
                                    <b>สถานะ:</b> <span className="text-blue-600">{order.status}</span>
                                </p>

                                <p>
                                    <b>Tracking:</b>{" "}
                                    {order.tracking_number || <span className="text-orange-500">กำลังดำเนินการ</span>}
                                </p>

                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => startEdit(order)}
                                        className="flex-1 bg-yellow-500 text-white py-2 rounded-xl shadow hover:bg-yellow-600 transition"
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order._id)}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-xl shadow hover:bg-red-600 transition"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {editing && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-fadeIn">
                            <h2 className="text-2xl font-bold text-center mb-4">✏️ แก้ไขคำสั่งซื้อ</h2>
                            <div className="space-y-3">
                                {["name", "address", "phone", "amount", "tracking_number"].map((field) => (
                                    <input
                                        key={field}
                                        type="text"
                                        value={form[field] || ""}
                                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                        placeholder={field}
                                        className="w-full p-3 border rounded-xl bg-gray-100"
                                    />
                                ))}

                                <select
                                    value={form.status || ""}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full p-3 border rounded-xl bg-gray-100"
                                >
                                    <option value="">เลือกสถานะ</option>
                                    <option value="สั่งซื้อสำเร็จ">สั่งซื้อสำเร็จ</option>
                                    <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setEditing(null)}
                                    className="flex-1 bg-gray-400 text-white py-2 rounded-xl hover:bg-gray-500 transition"
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    onClick={submitEdit}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-xl shadow hover:bg-green-700 transition"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
