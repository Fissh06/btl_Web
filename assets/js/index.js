
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
const searchResultList = document.getElementById('searchResultList');
// ==========================================
// 2. LOGIC HEADER & SEARCH
// ==========================================

// Xử lý Search Container (Đóng/Mở thanh nhập)
searchContainer.addEventListener('click', (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài window
    if (!searchContainer.classList.contains('active')) {
        searchContainer.classList.add('active');
        searchInput.focus();
    }
});

// Hàm hiển thị kết quả tìm kiếm
function displaySearchResults(results) {
    searchResultList.innerHTML = '';
    searchResultList.style.display = 'block';

    if (results.length === 0) {
        searchResultList.innerHTML = '<div class="search-no-result">Không tìm thấy kết quả...</div>';
        return;
    }

    results.forEach(story => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `
            <img src="${story.thumbnail}" alt="${story.title}">
            <div class="search-item-info">
                <div class="search-item-title">${story.title}</div>
                <div class="search-item-meta">Chương: ${story.chapters || '??'}</div>
            </div>
        `;
        
        item.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `detail.html?id=${story.id}`;
        };
        
        searchResultList.appendChild(item);
    });
}

// Sự kiện khi gõ phím
searchInput.addEventListener('input', async (e) => {
    const keyword = e.target.value.trim().toLowerCase();
    
    if (keyword.length === 0) {
        searchResultList.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/stories'); 
        const stories = await response.json();

        const filtered = stories.filter(s => 
            s.title.toLowerCase().includes(keyword)
        );

        displaySearchResults(filtered);
    } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
    }
});

// ==========================================
// 3. LOGIC USER POPUP & MENU (ĐÃ FIX LỖI CẬP NHẬT SỐ DƯ)
// ==========================================

// Hàm fetch dữ liệu mới nhất từ Server để đồng bộ số dư
// ==========================================
// 3. LOGIC USER POPUP & MENU (BẢN FIX TRIỆT ĐỂ)
// ==========================================

// Hàm đồng bộ dữ liệu: Lấy số dư và danh sách theo dõi mới nhất từ db.json
async function syncUserData() {
    // Chỉ chạy nếu đã đăng nhập và có ID hợp lệ
    if (!isLoggedIn || !userData || !userData.id) return;

    try {
        const response = await fetch(`${API_URL}/${userData.id}`);
        if (response.ok) {
            const latestData = await response.json();
            
            // Cập nhật biến toàn cục và máy cục bộ
            userData = latestData;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Vẽ lại menu với dữ liệu mới nhất (số dư, tên...)
            renderMenu();
        }
    } catch (error) {
        console.error("Lỗi đồng bộ từ server:", error);
    }
}

function renderMenu() {
    // Kiểm tra xem phần tử chứa menu có tồn tại trong HTML không
    if (!userMenuList) return;

    let menuHtml = "";
    
    // Kiểm tra trạng thái đăng nhập thực tế
    if (!isLoggedIn || !userData) {
        menuHtml = `
            <li><a href="list.html" style="color: inherit; text-decoration: none; display: flex; align-items: center; width: 100%; height: 100%;">
                <i class="ti-layout-grid2"></i> Xem thể loại
            </a></li>
            <li onclick="location.href='list.html?type=free'" style="cursor: pointer;">
                <i class="ti-book"></i> Đọc free
            </li>
            <li onclick="openAuthModal()"><i class="ti-key"></i> <strong>Đăng nhập / Đăng ký</strong></li>
        `;
    } else {
        // Đảm bảo balance và username không bị undefined bằng cách dùng giá trị mặc định
        const balance = (userData.balance || 0).toLocaleString();
        const name = userData.username || "Thành viên";

        menuHtml = `
            <li class="user-name-display"><i class="ti-user"></i> Chào, ${name}</li>
            <li class="user-balance"><i class="ti-wallet"></i> Số dư: ${balance}đ</li>
            <li><a href="list.html" style="color: inherit; text-decoration: none; display: flex; align-items: center; width: 100%; height: 100%;">
                <i class="ti-layout-grid2"></i> Xem thể loại
            </a></li>
            <li><a href="followed-list.html" style="color: inherit; text-decoration: none; display: flex; align-items: center; width: 100%; height: 100%;">
                <i class="ti-heart"></i> Truyện theo dõi
            </a></li>
            <li><a href="user-wallet.html" style="color: inherit; text-decoration: none; display: flex; align-items: center;">
                <i class="ti-wallet"></i> Nạp tiền
            </a></li>
            <li onclick="location.href='user-wallet.html'"><i class="ti-exchange-vertical"></i> Lịch sử giao dịch</li>
            <li onclick="handleLogout()" style="cursor: pointer;"><i class="ti-export"></i> Đăng xuất</li>
        `;
    }
    userMenuList.innerHTML = menuHtml;
}

// KHỞI TẠO KHI MỞ TRANG
(function init() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && savedUser !== "undefined") {
        try {
            userData = JSON.parse(savedUser);
            isLoggedIn = true;
        } catch (e) {
            console.error("Dữ liệu LocalStorage bị hỏng");
            localStorage.removeItem('currentUser');
        }
    }

    // Đợi DOM tải xong để render giao diện
    document.addEventListener('DOMContentLoaded', () => {
        renderMenu(); // Hiện menu ngay từ dữ liệu cũ cho nhanh
        if (isLoggedIn) syncUserData(); // Sau đó mới cập nhật số dư mới từ server
    });
})();

// SỰ KIỆN CLICK NÚT USER
userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderMenu(); // Cập nhật giao diện trước khi mở
    if (isLoggedIn) syncUserData(); // Đồng bộ lại số dư khi người dùng bấm vào
    userPopup.classList.toggle('active');
});

// HÀM ĐĂNG XUẤT
window.handleLogout = function() {
    localStorage.removeItem('currentUser');
    isLoggedIn = false;
    userData = null;
    alert("Đã đăng xuất thành công!");
    window.location.replace("index.html");
}
// ==========================================
// 4. LOGIC MODAL ĐĂNG NHẬP / ĐĂNG KÝ (ĐÃ FIX LỖI INPUT)
// ==========================================

function openAuthModal() {
    const modal = document.getElementById('authModal');
    const popup = document.getElementById('userPopup');

    if (modal) {
        modal.style.display = 'flex';
        if (popup) popup.classList.remove('active');
        
        // Luôn xóa trắng form và đưa về chế độ login khi mở modal
        clearAuthInputs();
        switchMode('login'); 
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        clearAuthInputs(); // Xóa dữ liệu khi đóng để lần sau mở ra form trắng
    }
}

// Hàm bổ trợ để xóa trắng các ô nhập liệu
function clearAuthInputs() {
    const userInput = document.getElementById('authUser');
    const passInput = document.getElementById('authPass');
    if (userInput) userInput.value = "";
    if (passInput) passInput.value = "";
}

function switchMode(mode) {
    const authTitle = document.getElementById('authTitle');
    const authSwitchText = document.getElementById('authSwitchText');

    // Xóa trắng input mỗi khi bấm chuyển giữa Đăng ký <-> Đăng nhập
    clearAuthInputs();

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
        if (isRegisterMode) {
            // --- XỬ LÝ ĐĂNG KÝ ---
            const resCheck = await fetch(`${API_URL}?username=${username}`);
            const listUsers = await resCheck.json();

            if (listUsers.length > 0) {
                alert("Tên tài khoản đã tồn tại!");
            } else {
                const newUser = { 
                    username,
                    password, 
                    level: 1, 
                    balance: 0,
                    history: [],
                    favorites: [] // Thêm mảng rỗng để tránh lỗi "Truyện theo dõi" bị trống
                };
                const resSave = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (resSave.ok) {
                    alert("Đăng ký thành công! Hãy đăng nhập.");
                    switchMode('login'); // Tự động xóa form và chuyển sang Login
                }
            }
        } else {
            // --- XỬ LÝ ĐĂNG NHẬP ---
            const response = await fetch(API_URL);
            const allUsers = await response.json();

            const foundUser = allUsers.find(u => 
                u.username === username && u.password === password
            );

            if (foundUser) {
                alert("Đăng nhập thành công!");
                isLoggedIn = true;
                userData = foundUser; 

                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                // Nếu trang web có hàm renderMenu và syncUserData thì gọi ở đây
                if (typeof renderMenu === 'function') renderMenu();
                if (typeof syncUserData === 'function') syncUserData();
                
                closeAuthModal();
            } else {
                alert("Sai tài khoản hoặc mật khẩu!");
            }
        }
    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        alert("Lỗi kết nối Server!");
    }
});
// ==========================================
// 5. SỰ KIỆN CLICK RA NGOÀI ĐỂ ĐÓNG TẤT CẢ
// ==========================================
window.addEventListener('click', (e) => {
    // 1. Đóng Search và bảng kết quả khi click ra ngoài vùng search-container
    if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('active');
        searchResultList.style.display = 'none';
    }
    
    // 2. Đóng User Popup khi click ra ngoài vùng userBtn
    if (!userBtn.contains(e.target)) {
        userPopup.classList.remove('active');
    }

    // 3. Đóng Modal đăng nhập khi click vào vùng xám bên ngoài
    if (e.target === authModal) {
        closeAuthModal();
    }
});

// ==========================================
// 6. Đổi màu Dark/Light cho body
// ==========================================

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Kiểm tra trạng thái đã lưu trong LocalStorage chưa
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
    // Toggle class
    body.classList.toggle('light-mode');
    
    // Lưu trạng thái vào LocalStorage để khi load lại trang không bị mất
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});
