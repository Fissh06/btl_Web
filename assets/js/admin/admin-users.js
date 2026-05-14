async function renderUsers(container, title) {
    title.innerText = "Quản lý tài khoản";
    container.innerHTML = `<p>Đang tải danh sách người dùng...</p>`;

    try {
        const res = await fetch(`${API_URL}/users`);
        const allUsers = await res.json();

        // Lọc bỏ Admin để không hiện trong danh sách quản lý
        const users = allUsers.filter(u => u.role !== 'admin');

        let html = `
            <div class="action-bar">
                <button class="btn-add" onclick="addUserForm()">+ Thêm tài khoản mới</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Username</th>
                        <th>Số dư (VND)</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach((u, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${u.username}</td>
                    <td><strong>${(u.balance || 0).toLocaleString()}đ</strong></td>
                    <td>
                        <button class="btn-edit" onclick="editUser('${u.id}')">Sửa / Nạp tiền</button>
                        <button class="btn-delete" onclick="deleteUser('${u.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style="color:red">Lỗi tải dữ liệu người dùng!</p>`;
    }
}




// Hàm hiển thị Form (Thêm/Sửa)
// Form này sẽ cho phép bạn chỉnh sửa cả mật khẩu và số dư tài khoản.
async function renderUserForm(user = null) {
    const container = document.getElementById('content-area');
    const title = document.getElementById('current-title');
    
    title.innerText = user ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới";

    container.innerHTML = `
        <div class="admin-form-container">
            <form id="user-form" onsubmit="handleSaveUser(event, ${user ? `'${user.id}'` : 'null'})">
                <div class="form-group">
                    <label>Tên đăng nhập:</label>
                    <input type="text" id="username" value="${user ? user.username : ''}" required ${user ? 'readonly' : ''}>
                </div>
                
                <div class="form-group">
                    <label>Mật khẩu:</label>
                    <input type="text" id="password" value="${user ? user.password : ''}" required>
                </div>

                <div class="form-group">
                    <label>Số dư trong ví (để mua truyện):</label>
                    <input type="number" id="balance" value="${user ? user.balance : 0}">
                </div>

                <div class="form-actions" style="margin-top: 20px;">
                    <button type="submit" class="btn-save">Lưu thông tin</button>
                    <button type="button" class="btn-cancel" onclick="loadContent('users')">Hủy</button>
                </div>
            </form>
        </div>
    `;
}

function addUserForm() {
    renderUserForm();
}
async function editUser(id) {
    try {
        const res = await fetch(`${API_URL}/users/${id}`);
        const user = await res.json();
        renderUserForm(user);
    } catch (err) {
        alert("Lỗi lấy thông tin người dùng!");
    }
}




// Hàm xử lý Lưu và Xóa
// Cơ chế Lưu cũng sẽ tự động xử lý POST hoặc PATCH.
async function handleSaveUser(event, id) {
    event.preventDefault();

    const userData = {
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value.trim(),
        balance: Number(document.getElementById('balance').value),
        role: "user", // Luôn luôn là user
        purchasedStories: id ? undefined : [] // Nếu thêm mới thì khởi tạo mảng truyện đã mua trống
    };

    // Nếu là cập nhật (id tồn tại), ta dùng PATCH để không ghi đè mảng boughtStories cũ
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `${API_URL}/users/${id}` : `${API_URL}/users`;

    // Nếu sửa, ta không gửi lại trường boughtStories để giữ nguyên lịch sử mua của họ
    if (id) delete userData.boughtStories;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            alert("Đã cập nhật dữ liệu tài khoản!");
            loadContent('users');
        }
    } catch (err) {
        alert("Lỗi kết nối server!");
    }
}

function deleteUser(id) {
    if(confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) {
        fetch(`${API_URL}/users/${id}`, { method: 'DELETE' })
        .then(() => {
            alert("Đã xóa tài khoản!");
            loadContent('users');
        });
    }
}
