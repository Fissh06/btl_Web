let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Kiểm tra đăng nhập
if (!currentUser) {
    alert("Vui lòng đăng nhập để sử dụng tính năng này!");
    window.location.href = "index.html";
}

// 1. Hiển thị thông tin ban đầu
function initPage() {
    document.getElementById('currentBalance').innerText = (currentUser.balance || 0).toLocaleString() + "đ";
    renderHistory();
}

// 2. Hàm vẽ Lịch sử giao dịch
function renderHistory() {
    const historyBody = document.getElementById('historyTableBody');
    const historyData = currentUser.history || [];

    if (historyData.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Chưa có giao dịch nào.</td></tr>`;
        return;
    }

    // Hiển thị từ mới nhất đến cũ nhất
    historyBody.innerHTML = historyData.reverse().map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.content}</td>
            <td class="${item.amount > 0 ? 'text-success' : 'text-danger'}">
                ${item.amount > 0 ? '+' : ''}${item.amount.toLocaleString()}đ
            </td>
            <td><span class="status-done">Thành công</span></td>
        </tr>
    `).join('');
}

// 3. Xử lý Nạp tiền
document.getElementById('btnRecharge').addEventListener('click', async () => {
    const amountInput = document.getElementById('rechargeAmount');
    const amount = parseInt(amountInput.value);

    if (isNaN(amount) || amount < 10000) {
        alert("Số tiền nạp tối thiểu là 10.000đ!");
        return;
    }

    // Tạo thông tin giao dịch mới
    const transaction = {
        id: Date.now(),
        date: new Date().toLocaleString('vi-VN'),
        content: "Nạp tiền vào tài khoản",
        amount: amount
    };

    // Cập nhật dữ liệu mới cho currentUser
    const updatedUser = {
        ...currentUser,
        balance: (currentUser.balance || 0) + amount,
        history: [...(currentUser.history || []), transaction]
    };

    try {
        // Gửi lên Server (db.json)
        const res = await fetch(`${API_URL}/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                balance: updatedUser.balance,
                history: updatedUser.history
            })
        });

        if (res.ok) {
            alert(`Nạp thành công ${amount.toLocaleString()}đ!`);
            
            // Cập nhật LocalStorage và giao diện
            currentUser = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            amountInput.value = ""; // Xóa ô nhập
            initPage(); // Vẽ lại giao diện
        }
    } catch (error) {
        alert("Lỗi kết nối server!");
    }
});

initPage();