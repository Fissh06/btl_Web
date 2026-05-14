async function renderStories(container, title) {
    title.innerText = "Quản lý truyện";
    container.innerHTML = `<p>Đang tải danh sách truyện...</p>`;

    try {
        const res = await fetch(`${API_URL}/stories`);
        const stories = await res.json();

        let html = `
            <div class="action-bar">
                <button class="btn-add" onclick="addStoryForm()">+ Thêm truyện mới</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ảnh</th>
                        <th>Tên truyện</th>
                        <th>Chương</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Thêm tham số index vào vòng lặp (index bắt đầu từ 0)
        stories.forEach((s, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td> <!-- Hiển thị số thứ tự thay vì s.id -->
                    <td><img src="${s.thumbnail}" width="50"></td>
                    <td>${s.title}</td>
                    <td>${s.chapters || 0}</td>
                    <td>
                        <button class="btn-edit" onclick="editStory('${s.id}')">Sửa</button>
                        <button class="btn-delete" onclick="deleteStory('${s.id}')">Xóa</button>
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

function deleteStory(id) {
    if(confirm("Xóa truyện này?")) {
        fetch(`${API_URL}/stories/${id}`, { method: 'DELETE' })
        .then(() => loadContent('stories'));
    }
}

// Hàm hiển thị Form (nếu có story truyền vào thì là Sửa, không có là Thêm)
async function renderStoryForm(story = null) {
    const container = document.getElementById('content-area');
    const title = document.getElementById('current-title');
    
    title.innerText = story ? "Chỉnh sửa truyện" : "Thêm truyện mới";

    container.innerHTML = `
        <div class="admin-form-container">
            <form id="story-form" onsubmit="handleSaveStory(event, ${story ? `'${story.id}'` : 'null'})">
                <div class="form-group">
                    <label>Tên truyện:</label>
                    <input type="text" id="title" value="${story ? story.title : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Tác giả:</label>
                    <input type="text" id="author" value="${story ? story.author : ''}" required>
                </div>

                <div class="form-group">
                    <label>Ảnh bìa (URL):</label>
                    <input type="text" id="thumbnail" value="${story ? story.thumbnail : ''}" required>
                </div>

                <div class="form-group">
                    <label>Trạng thái:</label>
                    <select id="status">
                        <option value="Đang tiến hành" ${story?.status === 'Đang tiến hành' ? 'selected' : ''}>Đang tiến hành</option>
                        <option value="Hoàn thành" ${story?.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Giá (VNĐ):</label>
                    <input type="number" id="price" value="${story ? story.price : 0}">
                </div>

                <div class="form-group">
                    <label>Thể loại:</label>
                    <div id="genres-container" class="checkbox-group" style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                        <!-- Checkbox sẽ được render vào đây -->
                    </div>
                </div>

                <div class="form-group">
                    <label>Mô tả:</label>
                    <textarea id="description" rows="5">${story ? story.description : ''}</textarea>
                </div>

                <hr>
                <h3>Nội dung chương (Content)</h3>
                <div id="chapters-container">
                    ${story && story.content ? story.content.map((c, index) => renderChapterInput(index, c)).join('') : ''}
                </div>
                <button type="button" class="btn-add-chapter" onclick="addChapterInput()">+ Thêm chương mới</button>

                <div class="form-actions" style="margin-top: 20px;">
                    <button type="submit" class="btn-save">Lưu lại</button>
                    <button type="button" class="btn-cancel" onclick="loadContent('stories')">Hủy bỏ</button>
                </div>
            </form>
        </div>
    `;

    // Đổ dữ liệu checkbox vào sau khi HTML đã render xong
    await loadGenresCheckboxes(story ? story.genres : []);
}

// Gọi khi nhấn nút + Thêm truyện
function addStoryForm() {
    renderStoryForm();
}

// Gọi khi nhấn nút Sửa
async function editStory(id) {
    try {
        const res = await fetch(`${API_URL}/stories/${id}`);
        const story = await res.json();
        renderStoryForm(story);
    } catch (err) {
        alert("Không thể lấy thông tin truyện!");
    }
}


// Xử lý lưu dữ liệu
async function handleSaveStory(event, id) {
    event.preventDefault();

    // 1. Lấy dữ liệu các chương
    const chapterElements = document.querySelectorAll('.chapter-item');
    const contentData = Array.from(chapterElements).map(item => {
        return {
            chapter: parseInt(item.querySelector('.chapter-num').value),
            images: item.querySelector('.chapter-images').value.split('\n').map(img => img.trim()).filter(img => img !== "")
        };
    });

    // 2. Lấy dữ liệu thể loại từ Checkboxes (Đây là phần thay đổi chính)
    const selectedGenres = Array.from(document.querySelectorAll('input[name="genres"]:checked'))
                                .map(cb => cb.value);

    const storyData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        thumbnail: document.getElementById('thumbnail').value,
        status: document.getElementById('status').value,
        price: Number(document.getElementById('price').value),
        description: document.getElementById('description').value,
        genres: selectedGenres, // Sử dụng mảng vừa lấy được
        chapters: contentData.length, 
        content: contentData
    };

    const method = id ? 'PATCH' : 'POST';
    const url = id ? `${API_URL}/stories/${id}` : `${API_URL}/stories`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(storyData)
        });

        if (res.ok) {
            alert("Lưu thành công!");
            loadContent('stories');
        }
    } catch (err) {
        alert("Lỗi kết nối server!");
    }
}

function renderChapterInput(index, data = { chapter: '', images: [] }) {
    return `
        <div class="chapter-item" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
            <div class="form-group">
                <label>Chương số(Chapter):</label>
                <input type="number" class="chapter-num" value="${data.chapter}" required>
            </div>
            <div class="form-group">
                <label>Danh sách ảnh (Mỗi link một dòng):</label>
                <textarea class="chapter-images" rows="4" placeholder="../assets/img/p1.jpg\n../assets/img/p2.jpg">${data.images.join('\n')}</textarea>
            </div>
            <button type="button" style="background:#ff4d4d; color:white; border:none; padding:5px; cursor:pointer" onclick="this.parentElement.remove()">Xóa chương này</button>
        </div>
    `;
}

// Thêm một ô nhập chương mới vào container
function addChapterInput() {
    const container = document.getElementById('chapters-container');
    const index = container.children.length;
    const newChapterHTML = renderChapterInput(index);
    container.insertAdjacentHTML('beforeend', newChapterHTML);
}


async function loadGenresCheckboxes(selectedGenres = []) {
    const res = await fetch(`${API_URL}/categories`);
    const categories = await res.json();
    const container = document.getElementById('genres-container');
    
    container.innerHTML = categories.map(cat => `
        <label style="margin-right: 15px; display: inline-block; cursor: pointer;">
            <input type="checkbox" name="genres" value="${cat.name}" 
                ${selectedGenres.includes(cat.name) ? 'checked' : ''}> ${cat.name}
        </label>
    `).join('');
}