async function renderCategories(container, title) {
    title.innerText = "Quản lý danh mục";
    container.innerHTML = `<p>Đang tải danh sách danh mục...</p>`;

    try {
        const res = await fetch(`${API_URL}/categories`);
        const categories = await res.json();

        let html = `
            <div class="action-bar">
                <button class="btn-add" onclick="addCategoryForm()">+ Thêm danh mục mới</button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>STT</th> <!-- Đổi từ ID thành STT -->
                        <th>Tên danh mục</th>
                        <th>Mô tả</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Dùng index để hiển thị số thứ tự tăng dần 1, 2, 3...
        categories.forEach((cat, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td> 
                    <td><strong>${cat.name}</strong></td>
                    <td>${cat.description || 'Chưa có mô tả'}</td>
                    <td>
                        <button class="btn-edit" onclick="editCategory('${cat.id}')">
                             Sửa
                        </button>
                        <button class="btn-delete" onclick="deleteCategory('${cat.id}')">
                             Xóa
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style="color:red">Lỗi tải dữ liệu!</p>`;
    }
}

// Hiển thị Form Thêm/Sửa
async function renderCategoryForm(category = null) {
    const container = document.getElementById('content-area');
    const title = document.getElementById('current-title');
    
    title.innerText = category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới";

    container.innerHTML = `
        <div class="admin-form-container">
            <form id="category-form" onsubmit="handleSaveCategory(event, ${category ? `'${category.id}'` : 'null'})">
                <div class="form-group">
                    <label>Tên danh mục:</label>
                    <input type="text" id="cat-name" value="${category ? category.name : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Mô tả:</label>
                    <textarea id="cat-description" rows="5">${category ? category.description : ''}</textarea>
                </div>

                <div class="form-actions" style="margin-top: 20px;">
                    <button type="submit" class="btn-save">Lưu lại</button>
                    <button type="button" class="btn-cancel" onclick="loadContent('categories')">Hủy bỏ</button>
                </div>
            </form>
        </div>
    `;
}

// Gọi khi bấm nút Thêm
function addCategoryForm() {
    renderCategoryForm();
}

// Gọi khi bấm nút Sửa
async function editCategory(id) {
    try {
        const res = await fetch(`${API_URL}/categories/${id}`);
        const category = await res.json();
        renderCategoryForm(category);
    } catch (err) {
        alert("Lỗi lấy thông tin!");
    }
}

// Xử lý lưu dữ liệu (Theo đúng cách của Stories)
async function handleSaveCategory(event, id) {
    event.preventDefault();

    const categoryData = {
        name: document.getElementById('cat-name').value.trim(),
        description: document.getElementById('cat-description').value.trim()
    };

    const method = id ? 'PATCH' : 'POST';
    const url = id ? `${API_URL}/categories/${id}` : `${API_URL}/categories`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });

        if (res.ok) {
            alert("Lưu danh mục thành công!");
            loadContent('categories');
        }
    } catch (err) {
        alert("Lỗi server!");
    }
}

// Hàm xóa
function deleteCategory(id) {
    if(confirm("Xóa danh mục này có thể làm mất dữ liệu lọc của truyện. Bạn chắc chứ?")) {
        fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' })
        .then(() => loadContent('categories'));
    }
}

