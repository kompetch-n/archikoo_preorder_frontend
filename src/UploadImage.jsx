import { useState } from "react";
import axios from "axios";

export default function UploadImage() {
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

    const handleSubmit = async () => {
        let imageUrl = uploadUrl;

        if (!imageUrl) {
            imageUrl = await uploadImage();
        }

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("address", form.address);
        formData.append("phone", form.phone);
        formData.append("amount", Number(form.quantity));
        formData.append("image_url", imageUrl);
        formData.append("tracking_number", form.tracking);
        formData.append("status", form.status);

        await axios.post("https://archikoo-preorder-backend.vercel.app/create-order", formData);

        alert("บันทึกข้อมูลสำเร็จ!");
    };

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                สร้างคำสั่งซื้อใหม่
            </h2>

            <div className="space-y-4">

                <input
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    placeholder="ชื่อ"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <textarea
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    placeholder="ที่อยู่"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                />

                <input
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    placeholder="เบอร์โทร"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <input
                    type="number"
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    placeholder="จำนวน"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />

                <input
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    placeholder="เลขพัสดุ"
                    value={form.tracking}
                    onChange={(e) => setForm({ ...form, tracking: e.target.value })}
                />

                <select
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                    <option>สั่งซื้อสำเร็จ</option>
                    <option>รอจัดส่ง</option>
                    <option>จัดส่งแล้ว</option>
                </select>

                <div>
                    <label className="block font-semibold text-gray-600 mb-2">
                        อัปโหลดรูปสินค้า
                    </label>
                    <input
                        type="file"
                        className="w-full"
                        onChange={handleFile}
                    />

                    {preview && (
                        <img
                            src={preview}
                            alt="preview"
                            className="mt-3 rounded-lg shadow-md w-40"
                        />
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition"
                >
                    บันทึกลงระบบ
                </button>
            </div>
        </div>
    );
}
