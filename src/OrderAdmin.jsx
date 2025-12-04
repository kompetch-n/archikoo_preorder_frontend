import { useEffect, useState } from "react";
import axios from "axios";

export default function OrderAdmin() {
    const API = "https://archikoo-preorder-backend.vercel.app";

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});

    // Load orders
    const loadOrders = async () => {
        setLoading(true);
        const res = await axios.get(`${API}/orders`);
        setOrders(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // Delete order
    const handleDelete = async (id) => {
        if (!confirm("ต้องการลบออเดอร์นี้หรือไม่?")) return;

        await axios.delete(`${API}/orders/${id}`);
        loadOrders();
    };

    // Start editing
    const startEdit = (order) => {
        setEditing(order._id);
        setForm(order);
    };

    // Submit edit
    const submitEdit = async () => {
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            formData.append(key, form[key]);
        });

        await axios.put(`${API}/orders/${editing}`, formData);
        setEditing(null);
        loadOrders();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-200 p-8">

            <h1 className="text-4xl font-bold text-slate-700 mb-6 text-center">
                🛒 ระบบจัดการข้อมูลการสั่งซื้อ (Admin)
            </h1>

            {loading ? (
                <p className="text-center text-xl text-blue-600">กำลังโหลด...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition"
                        >
                            <div className="w-full max-h-[80vh] overflow-auto rounded-2xl shadow mb-4 bg-black/5 p-2">
                                <img
                                    src={order.image_url}
                                    alt="payment-slip"
                                    className="w-full h-auto object-contain"
                                />
                            </div>

                            <h2 className="text-2xl font-semibold">{order.name}</h2>
                            <p><b>เบอร์:</b> {order.phone}</p>
                            <p><b>ที่อยู่:</b> {order.address}</p>
                            <p><b>จำนวน:</b> {order.amount}</p>

                            <p className="mt-2">
                                <b>สถานะ:</b>{" "}
                                <span className="text-blue-600">{order.status}</span>
                            </p>

                            <p>
                                <b>Tracking:</b>{" "}
                                {order.tracking_number || (
                                    <span className="text-orange-500">กำลังดำเนินการ</span>
                                )}
                            </p>

                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => startEdit(order)}
                                    className="flex-1 bg-yellow-500 text-white py-2 rounded-xl shadow hover:bg-yellow-600"
                                >
                                    แก้ไข
                                </button>

                                <button
                                    onClick={() => handleDelete(order._id)}
                                    className="flex-1 bg-red-500 text-white py-2 rounded-xl shadow hover:bg-red-600"
                                >
                                    ลบ
                                </button>
                            </div>
                        </div>

                    ))}
                </div>
            )}

            {/* EDIT MODAL */}
            {editing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold text-center mb-4">
                            ✏️ แก้ไขคำสั่งซื้อ
                        </h2>

                        <div className="space-y-3">

                            {/* Input Fields */}
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

                            {/* SELECT: STATUS */}
                            <select
                                value={form.status || ""}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full p-3 border rounded-xl bg-gray-100"
                            >
                                <option value="">เลือกสถานะ</option>
                                <option value="สั่งซื้อสำเร็จ">สั่งซื้อสำเร็จ</option>
                                <option value="รอจัดส่ง">รอจัดส่ง</option>
                                <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                            </select>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setEditing(null)}
                                className="flex-1 bg-gray-400 text-white py-2 rounded-xl"
                            >
                                ยกเลิก
                            </button>

                            <button
                                onClick={submitEdit}
                                className="flex-1 bg-green-600 text-white py-2 rounded-xl shadow hover:bg-green-700"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
