import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadImage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const modalRef = useRef(null);
    const submitButtonRef = useRef(null);

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [orderStatus, setOrderStatus] = useState("");

    const resetForm = () => {
        setForm({
            name: "",
            address: "",
            phone: "",
            quantity: "",
            tracking: "",
            status: "สั่งซื้อสำเร็จ",
        });
        setImage(null);
        setPreview(null);
        setUploadUrl("");
    };

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        quantity: "",
        tracking: "",
        status: "สั่งซื้อสำเร็จ",
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadUrl, setUploadUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);


    const compressImage = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_SIZE_MB = 5;

                let width = img.width;
                let height = img.height;
                let ratio = 1;

                if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                    ratio = Math.sqrt((MAX_SIZE_MB * 1024 * 1024) / file.size);
                }

                width *= ratio;
                height *= ratio;

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.9;

                const tryCompress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob.size > MAX_SIZE_MB * 1024 * 1024 && quality > 0.2) {
                                quality -= 0.1;
                                tryCompress();
                            } else {
                                const newFile = new File([blob], file.name, { type: file.type });
                                resolve(newFile);
                            }
                        },
                        file.type,
                        quality
                    );
                };

                tryCompress();
            };
        });
    };

    useEffect(() => {
        if (confirming && modalRef.current) {
            modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [confirming]);

    const handleFile = async (e) => {
        let file = e.target.files[0];
        setPreview(URL.createObjectURL(file));

        if (file.size > 5 * 1024 * 1024) {
            file = await compressImage(file);
        }

        setImage(file);
    };

    const handleSubmitConfirm = async () => {
        setLoading(true);
        const uploadedImageUrl = await uploadImage();
        if (!uploadedImageUrl) {
            alert("กรุณาอัปโหลดรูปก่อน");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("address", form.address);
        formData.append("phone", form.phone);
        formData.append("amount", form.quantity);
        formData.append("image_url", uploadedImageUrl);
        formData.append("tracking_number", form.tracking);
        formData.append("status", form.status);

        try {
            await axios.post(
                "https://archikoo-preorder-backend.vercel.app/orders",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // ✅ แสดง alert สำเร็จ
            alert("ส่งคำสั่งซื้อเรียบร้อย 🎉");

            setConfirming(false); // ปิด modal
            resetForm();           // รีเซ็ตฟอร์ม
            window.location.reload(); // รีเฟรชหน้า

        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };


    const uploadImage = async () => {
        if (!image) return alert("กรุณาเลือกรูปภาพก่อนอัปโหลด");

        setUploading(true); // ▶️ เริ่มอัปโหลด

        const formData = new FormData();
        formData.append("file", image);

        try {
            const res = await axios.post(
                "https://archikoo-preorder-backend.vercel.app/upload-image",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setUploadUrl(res.data.url);
            return res.data.url;

        } catch (err) {
            alert("อัปโหลดรูปไม่สำเร็จ");
            return null;

        } finally {
            setUploading(false); // ▶️ จบการอัปโหลด
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.quantity || Number(form.quantity) <= 0) {
            alert("กรุณากรอกจำนวนให้ถูกต้อง");
            return;
        }

        if (!form.name || !form.address || !form.phone || !form.status) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setLoading(true); // ▶️ เริ่มส่งคำสั่งซื้อ

        // อัปโหลดรูปก่อน
        const uploadedImageUrl = await uploadImage();

        if (!uploadedImageUrl) {
            alert("กรุณาอัปโหลดรูปก่อน");
            setLoading(false); // ▶️ หยุดโหลดถ้าผิดพลาด
            return;
        }

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("address", form.address);
        formData.append("phone", form.phone);
        formData.append("amount", form.quantity);
        formData.append("image_url", uploadedImageUrl);
        formData.append("tracking_number", form.tracking);
        formData.append("status", form.status);

        try {
            const res = await axios.post(
                "https://archikoo-preorder-backend.vercel.app/orders",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            alert("บันทึกสำเร็จ");
            resetForm();
            window.scrollTo(0, 0);

        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");

        } finally {
            setLoading(false); // ▶️ หยุดโหลด
        }
    };

    {
        showSuccessPopup && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fadeIn">
                ส่งคำสั่งซื้อเรียบร้อย 🎉
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex justify-center items-start">

            <div className="w-full max-w-xl bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-blue-100">

                {/* รูปตัวอย่างสินค้า */}
                <div className="text-center mb-6">
                    <img
                        src="IMG_3664.png"
                        alt="product-sample"
                        className="w-full rounded-xl shadow-lg object-contain border border-blue-100"
                    />
                </div>

                <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">
                    สร้างคำสั่งซื้อใหม่
                </h2>

                <button
                    onClick={() => navigate("/search")}
                    className="w-full mb-6 bg-green-200 text-green-700 p-3 rounded-xl hover:bg-green-300 transition"
                >
                    ไปที่หน้าตรวจสอบการสั่งซื้อ
                </button>

                <div className="space-y-5">

                    <input
                        className="w-full border-blue-200 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="ชื่อ"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <textarea
                        className="w-full border-blue-200 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="ที่อยู่"
                        rows={3}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />

                    <input
                        className="w-full border-blue-200 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="เบอร์โทร"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />

                    <input
                        type="number"
                        className="w-full border-blue-200 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="จำนวน"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    />

                    {/* QR Code สำหรับสแกนจ่าย */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-blue-500 mb-2">
                            สแกน QR เพื่อชำระเงินก่อนอัปโหลดสลิป
                        </p>
                        <img
                            src="qr_payment.JPEG" // <-- ใส่ path ของ QR Code ของคุณ
                            alt="QR Payment"
                            className="mx-auto rounded-xl shadow-lg border border-blue-200 w-full max-w-xs object-contain"
                        />
                    </div>


                    {/* Upload Slip */}
                    <div>
                        {/* <label className="block font-semibold text-blue-700 mb-2">
                            อัปโหลดสลิป
                        </label> */}

                        {/* ซ่อน input จริง */}
                        <input
                            type="file"
                            ref={fileInputRef}        // ใช้ ref เพื่อเรียก click
                            className="hidden"
                            onChange={handleFile}
                        />

                        {/* ปุ่มแทน */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}  // คลิก input
                            className="w-full bg-blue-200 text-blue-700 p-3 rounded-xl hover:bg-blue-300 transition"
                        >
                            อัปโหลดสลิป
                        </button>

                        {/* แสดง preview ถ้ามี */}
                        {preview && (
                            <img
                                src={preview}
                                alt="preview"
                                className="mt-4 rounded-xl shadow-lg border border-blue-200 w-full object-contain"
                            />
                        )}
                    </div>

                    {/* ปุ่มสั่งซื้อ */}
                    <button
                        ref={submitButtonRef}
                        onClick={() => setConfirming(true)}  // เปิด modal ยืนยัน
                        disabled={loading || uploading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "กำลังส่งคำสั่งซื้อ..." : uploading ? "กำลังอัปโหลดรูป..." : "สั่งซื้อ"}
                    </button>

                    {/* Modal สรุปข้อมูล */}
                    {confirming && (
                        <div
                            ref={modalRef}
                            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4"
                        >
                            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 animate-fadeIn">

                                {/* Header */}
                                <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">
                                    ยืนยันคำสั่งซื้อ
                                </h3>

                                {/* Grid ข้อมูล */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-gray-500 text-sm">ชื่อ</span>
                                        <span className="text-blue-700 font-semibold">{form.name}</span>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-gray-500 text-sm">เบอร์โทร</span>
                                        <span className="text-blue-700 font-semibold">{form.phone}</span>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm col-span-2">
                                        <span className="text-gray-500 text-sm">ที่อยู่</span>
                                        <span className="text-blue-700 font-semibold">{form.address}</span>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-gray-500 text-sm">จำนวน</span>
                                        <span className="text-blue-700 font-semibold">{form.quantity}</span>
                                    </div>
                                </div>

                                {/* Preview สลิป */}
                                {preview && (
                                    <div className="mb-6">
                                        <span className="text-gray-500 text-sm">สลิปชำระเงิน</span>
                                        <img
                                            src={preview}
                                            alt="preview"
                                            className="mt-2 rounded-xl shadow-lg border border-gray-200 w-full object-contain"
                                        />
                                    </div>
                                )}

                                {orderStatus && (
                                    <div className="text-center mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-xl font-semibold">
                                        {orderStatus}
                                    </div>
                                )}

                                {/* ปุ่ม */}
                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={() => setConfirming(false)}
                                        className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold transition"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setOrderStatus("กำลังส่งคำสั่งซื้อ..."); // แสดงสถานะก่อนส่ง
                                            // if (submitButtonRef.current) {
                                            //     submitButtonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                                            // }
                                            await handleSubmitConfirm();
                                            setConfirming(false); // ปิด modal หลังส่งสำเร็จ
                                        }}
                                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-md"
                                    >
                                        ยืนยันสั่งซื้อ
                                    </button>

                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );

}
