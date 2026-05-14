const API_URL = "http://localhost:3000";

function loadContent(type, element) {
    const contentArea = document.getElementById('content-area');
    const title = document.getElementById('current-title');
    
    // Cập nhật trạng thái Active trên Menu
    if (element) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    }

    // Gọi hàm render tương ứng từ các file JS riêng biệt
    switch(type) {
        case 'stories':
            renderStories(contentArea, title);
            break;
        case 'users':
            renderUsers(contentArea, title);
            break;
        case 'categories':
            renderCategories(contentArea, title);
            break;
        case 'orders':
            renderOrders(contentArea, title);
            break;
    }
}

// Hàm đăng xuất Admin
function handleAdminLogout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất và quay lại trang chủ?")) {
        localStorage.removeItem('currentUser'); // Xóa thông tin đăng nhập
        window.location.replace("../user/index.html"); // Chuyển hướng
    }
}
// Mặc định load trang truyện khi mới vào
window.onload = () => loadContent('stories');




// Hàm chuyển đổi nội dung
function loadContent(type, element) {
    const contentArea = document.getElementById('content-area');
    const title = document.getElementById('current-title');
    
    if (element) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    }

    switch(type) {
        case 'stories':
            renderStories(contentArea, title); // Gọi hàm từ admin-stories.js
            break;
        case 'users':
            renderUsers(contentArea, title);   // Gọi hàm từ admin-users.js
            break;
        case 'categories':
            renderCategories(contentArea, title); // Gọi hàm từ admin-categories.js
            break;
        case 'orders':
            renderOrders(contentArea, title);     // Gọi hàm từ admin-orders.js
            break;
    }
}





