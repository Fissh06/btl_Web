
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
// 3. LOGIC USER POPUP & MENU
// ==========================================

window.handleLogout = function() {
    localStorage.removeItem('currentUser'); // Xóa trước
    isLoggedIn = false;
    userData = null;
    alert("Đã đăng xuất!");
    window.location.replace("index.html"); // Dùng replace để ép trình duyệt xóa sạch trạng thái cũ
}





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
            <li class="user-balance"><i class="ti-wallet"></i> Số dư: ${userData.balance.toLocaleString()}đ</li>
            <li><i class="ti-heart"></i> Truyện theo dõi</li>
            <li><i class="ti-wallet"></i> Nạp tiền</li>
            <li onclick="showTransactionHistory()"><i class="ti-exchange-vertical"></i> Lịch sử giao dịch</li>
            <li onclick="handleLogout()"><i class="ti-export"></i> Đăng xuất</li>
        `;
    }
    userMenuList.innerHTML = menuHtml;
}
// Kiểm tra xem có user nào đang lưu trong máy không
// Kiểm tra dữ liệu khi vừa mở trang hoặc F5
const savedUser = localStorage.getItem('currentUser');

if (savedUser) {
    try {
        userData = JSON.parse(savedUser);
        isLoggedIn = true;
        // Đợi DOM tải xong mới render menu
        document.addEventListener('DOMContentLoaded', () => {
            renderMenu();
        });
    } catch (e) {
        // Nếu dữ liệu bị lỗi thì xóa luôn
        localStorage.removeItem('currentUser');
    }
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
            // --- XỬ LÝ ĐĂNG KÝ ---
            const resCheck = await fetch(API_URL + "?username=" + username);
            const listUsers = await resCheck.json();

            if (listUsers.length > 0) {
                alert("Tên tài khoản đã tồn tại!");
            } else {
                const newUser = { 
                    username,
                    password, 
                    level: 1, 
                    balance: 0,
                    history: [] };
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
            // --- XỬ LÝ ĐĂNG NHẬP ---
            const response = await fetch(API_URL);
            const allUsers = await response.json();

            // Tìm user trong danh sách trả về
            const foundUser = allUsers.find(u => 
                u.username === username && u.password === password
            );

            if (foundUser) {
                alert("Đăng nhập thành công!");
                isLoggedIn = true;
                userData = foundUser; 

                renderMenu();       
                closeAuthModal();   
                
                localStorage.setItem('currentUser', JSON.stringify(userData));
                console.log("Đã đăng nhập thành công:", userData);
            } else {
                alert("Sai tài khoản hoặc mật khẩu!");
            }
        }
    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        alert("Lỗi kết nối Server! Bạn đã bật json-server chưa?");
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
