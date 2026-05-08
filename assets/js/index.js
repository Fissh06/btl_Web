
// 1. KHAI BÁO BIẾN CẤU HÌNH
// ==========================================
const API_URL = "http://localhost:3000/users";
let isLoggedIn = false;
let isRegisterMode = false;
let userData = null;

// DOM Elements
const header = document.getElementById('header');
const searchContainer = document.querySelector('.search-container');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const userBtn = document.getElementById('userBtn');
const userPopup = document.getElementById('userPopup');
const userMenuList = document.getElementById('userMenuList');
const authModal = document.getElementById('authModal');

// ==========================================
// 2. LOGIC HEADER & SEARCH
// ==========================================

// Ẩn/Hiện Header khi cuộn
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.classList.add('hide');
    } else {
        header.classList.remove('hide');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);

// Xử lý Search Container
searchContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = searchContainer.classList.contains('active');
    if (e.target === searchBtn && isActive) {
        searchContainer.classList.remove('active');
    } else if (!isActive) {
        searchContainer.classList.add('active');
        searchInput.focus();
    }
});

// ==========================================
// 3. LOGIC USER POPUP & MENU
// ==========================================

function renderMenu() {
    let menuHtml = "";
    if (!isLoggedIn) {
        menuHtml = `
            <li><i class="ti-layout-grid2"></i> Xem thể loại</li>
            <li><i class="ti-info-alt"></i> Xem chi tiết truyện</li>
            <li><i class="ti-book"></i> Đọc thử / đọc free</li>
            <li onclick="openAuthModal()"><i class="ti-key"></i> <strong>Đăng nhập / Đăng ký</strong></li>
        `;
    } else {
        menuHtml = `
            <li class="user-name-display"><i class="ti-user"></i> Chào, ${userData.username}</li>
            <li><i class="ti-heart"></i> Truyện theo dõi</li>
            <li><i class="ti-time"></i> Lịch sử đọc</li>
            <li><i class="ti-wallet"></i> Nạp tiền</li>
            <li onclick="handleLogout()"><i class="ti-export"></i> Đăng xuất</li>
        `;
    }
    userMenuList.innerHTML = menuHtml;
}

userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderMenu();
    userPopup.classList.toggle('active');
});

function handleLogout() {
    isLoggedIn = false;
    userData = null;
    renderMenu();
    userPopup.classList.remove('active');
    alert("Đã đăng xuất!");
}

// ==========================================
// 4. LOGIC MODAL ĐĂNG NHẬP / ĐĂNG KÝ (API)
// ==========================================

function openAuthModal() {
    // 1. Lấy phần tử trực tiếp khi hàm được gọi
    const modal = document.getElementById('authModal');
    const popup = document.getElementById('userPopup');

    // 2. Kiểm tra nếu tìm thấy modal thì mới thực hiện tiếp
    if (modal) {
        modal.style.display = 'flex'; // Hiện cửa sổ Đăng nhập/Đăng ký
        
        if (popup) {
            popup.classList.remove('active'); // Đóng cái popup nhỏ đi
        }
        
        switchMode('login'); // Đảm bảo luôn hiện form đăng nhập trước
        console.log("Đã mở cửa sổ đăng nhập thành công!");
    } else {
        console.error("Lỗi: Không tìm thấy thẻ có ID là 'authModal' trong HTML.");
    }
}

function closeAuthModal() {
    authModal.style.display = 'none';
}

function switchMode(mode) {
    const authTitle = document.getElementById('authTitle');
    const authSwitchText = document.getElementById('authSwitchText');

    if (mode === 'register') {
        isRegisterMode = true;
        authTitle.innerText = "Đăng Ký";
        authSwitchText.innerHTML = 'Đã có tài khoản? <a href="#" onclick="switchMode(\'login\')">Đăng nhập</a>';
    } else {
        isRegisterMode = false;
        authTitle.innerText = "Đăng Nhập";
        authSwitchText.innerHTML = 'Chưa có tài khoản? <a href="#" onclick="switchMode(\'register\')">Đăng ký ngay</a>';
    }
}

document.getElementById('btnSubmitAuth').addEventListener('click', async () => {
    const username = document.getElementById('authUser').value.trim();
    const password = document.getElementById('authPass').value.trim();

    if (username === "" || password === "") {
        alert("Vui lòng nhập đủ thông tin!");
        return;
    }

    try {
        if (isRegisterMode === true) {
            // XỬ LÝ ĐĂNG KÝ
            const resCheck = await fetch(API_URL + "?username=" + username);
            const listUsers = await resCheck.json();

            if (listUsers.length > 0) {
                alert("Tên tài khoản đã tồn tại!");
            } else {
                const newUser = { username, password, level: 1, history: [] };
                const resSave = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (resSave.ok) {
                    alert("Đăng ký thành công! Hãy đăng nhập.");
                    switchMode('login');
                }
            }
        } else {
            // XỬ LÝ ĐĂNG NHẬP
            const resLogin = await fetch(API_URL + "?username=" + username + "&password=" + password);
            const userResult = await resLogin.json();

            if (userResult.length > 0) {
                alert("Đăng nhập thành công!");
                isLoggedIn = true;
                userData = userResult[0];
                renderMenu();
                closeAuthModal();
            } else {
                alert("Sai tài khoản hoặc mật khẩu!");
            }
        }
    } catch (err) {
        alert("Lỗi kết nối Server! Kiểm tra json-server.");
    }
});

// ==========================================
// 5. SỰ KIỆN CLICK RA NGOÀI ĐỂ ĐÓNG TẤT CẢ
// ==========================================
window.addEventListener('click', (e) => {
    // Đóng Search
    searchContainer.classList.remove('active');
    // Đóng User Popup
    userPopup.classList.remove('active');
    // Đóng Modal khi click vào vùng xám bên ngoài
    if (e.target === authModal) {
        closeAuthModal();
    }
});