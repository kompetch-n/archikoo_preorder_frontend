import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadImage() {
    const navigate = useNavigate();
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

    const handleFile = async (e) => {
        let file = e.target.files[0];
        setPreview(URL.createObjectURL(file));

        if (file.size > 5 * 1024 * 1024) {
            file = await compressImage(file);
        }

        setImage(file);
    };

    const uploadImage = async () => {
        if (!image) return alert("กรุณาเลือกรูปภาพก่อนอัปโหลด");

        const formData = new FormData();
        formData.append("file", image);

        const res = await axios.post(
            "https://archikoo-preorder-backend.vercel.app/upload-image",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        setUploadUrl(res.data.url);
        return res.data.url;
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

        // 🔥 อัปโหลดรูปก่อนส่งข้อมูล
        const uploadedImageUrl = await uploadImage();

        if (!uploadedImageUrl) {
            alert("กรุณาอัปโหลดรูปก่อน");
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
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        }
    };

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
                    className="w-full mb-6 bg-green-600 text-white p-3 rounded-xl shadow hover:bg-green-700 transition"
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

                    {/* Upload Slip */}
                    <div>
                        <label className="block font-semibold text-blue-700 mb-2">
                            อัปโหลดสลิป
                        </label>

                        <input
                            type="file"
                            className="w-full text-blue-600"
                            onChange={handleFile}
                        />

                        {preview && (
                            <img
                                src={preview}
                                alt="preview"
                                className="mt-4 rounded-xl shadow-lg border border-blue-200 w-full object-contain"
                            />
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition"
                    >
                        บันทึกลงระบบ
                    </button>
                </div>
            </div>
        </div>
    );

}
