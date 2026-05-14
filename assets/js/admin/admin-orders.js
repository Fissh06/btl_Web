// Hàm render danh sách đơn hàng
// Thêm cột Ngày tạo và hiển thị Số thứ tự để dễ theo dõi.
async function renderOrders(container, title) {
    title.innerText = "Lịch sử giao dịch hệ thống";
    container.innerHTML = `<div class="loading">Đang tổng hợp lịch sử...</div>`;

    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();

        // Gom tất cả history từ tất cả users thành một danh sách duy nhất
        let allHistory = [];
        users.forEach(user => {
            if (user.history && user.history.length > 0) {
                user.history.forEach(item => {
                    allHistory.push({
                        ...item,
                        username: user.username, // Thêm tên để biết ai nạp
                        userId: user.id
                    });
                });
            }
        });

        // Sắp xếp theo thời gian mới nhất (dựa trên id là timestamp)
        allHistory.sort((a, b) => b.id - a.id);

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Khách hàng</th>
                        <th>Nội dung</th>
                        <th>Số tiền</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
        `;

        allHistory.forEach((item, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${item.username}</strong></td>
                    <td>${item.content}</td>
                    <td style="color: green; font-weight: bold;">+${(item.amount || 0).toLocaleString()}đ</td>
                    <td>${item.date}</td>
                    <td><span class="badge status-success">Thành công</span></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p class="error">Lỗi khi lấy lịch sử giao dịch!</p>`;
    }
}



// Hàm xử lý Duyệt nạp (Cộng tiền vào ví User)
// Hàm này thực hiện 2 việc: cập nhật trạng thái đơn hàng và cập nhật số dư người dùng.
async function approveOrder(orderId, userId, amount) {
    if (!confirm(`Xác nhận duyệt nạp ${(amount).toLocaleString()}đ cho tài khoản này?`)) return;

    try {
        // 1. Lấy thông tin user để biết số dư hiện tại
        const userRes = await fetch(`${API_URL}/users/${userId}`);
        const user = await userRes.json();

        // 2. Cập nhật số dư mới cho User
        const newBalance = (user.balance || 0) + amount;
        await fetch(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: newBalance })
        });

        // 3. Cập nhật trạng thái đơn hàng thành completed
        await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });

        alert("Đã duyệt nạp tiền thành công!");
        loadContent('orders'); // Tải lại danh sách
    } catch (err) {
        alert("Có lỗi xảy ra khi duyệt đơn!");
        console.error(err);
    }
}

// Hàm Hủy đơn hàng
// Dùng trong trường hợp đơn hàng bị lỗi hoặc sai thông tin.
async function cancelOrder(orderId) {
    if (confirm("Bạn có chắc chắn muốn xóa/hủy yêu cầu nạp tiền này?")) {
        try {
            await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'DELETE'
            });
            loadContent('orders');
        } catch (err) {
            alert("Lỗi khi xóa đơn!");
        }
    }
}

