// Giả sử API_URL đã có từ file khác hoặc khai báo lại nếu cần
const urlParams = new URLSearchParams(window.location.search);
let storyId = urlParams.get('id');
let currentChapter = parseInt(urlParams.get('chapter')) || 1;
let storyData = null;

async function loadChapter() {
    try {
        const res = await fetch(`http://localhost:3000/stories/${storyId}`);
        storyData = await res.json();
        
        // Cập nhật tiêu đề trang
        document.title = `${storyData.title} - Chương ${currentChapter}`;
        
        renderChapterImages();
        renderChapterList();
    } catch (err) {
        console.error("Không tải được nội dung chương");
    }
}

function renderChapterImages() {
    const content = document.getElementById('chapterContent');
    
    // 1. Tìm đúng dữ liệu của chương hiện tại trong mảng content
    const chapterData = storyData.content.find(c => c.chapter === currentChapter);

    if (chapterData && chapterData.images) {
        // 2. Dùng map để tạo toàn bộ thẻ img từ mảng images
        const html = chapterData.images.map((imgUrl, index) => `
            <img src="${imgUrl}" 
                 alt="Trang ${index + 1}" 
                 onerror="this.src='../assets/img/default-page.png'">
        `).join(''); // Gộp mảng thành chuỗi HTML

        content.innerHTML = html;
    } else {
        content.innerHTML = `<p style="color: white; text-align: center; padding: 50px;">
                                Nội dung chương này đang được cập nhật...
                             </p>`;
    }
    
    window.scrollTo(0, 0);
}

// Sửa lại hàm renderChapterList để dựa trên độ dài của mảng content
function renderChapterList() {
    const select = document.getElementById('chapterSelect');
    // Duyệt qua mảng content để lấy danh sách chương thực tế
    const options = storyData.content.map(c => `
        <option value="${c.chapter}" ${c.chapter === currentChapter ? 'selected' : ''}>
            Chương ${c.chapter}
        </option>
    `).join('');
    
    select.innerHTML = options;
}

function changeChapter(chap) {
    window.location.href = `read.html?id=${storyId}&chapter=${chap}`;
}

function nextChapter() {
    if (currentChapter < storyData.chapters) {
        changeChapter(currentChapter + 1);
    } else {
        alert("Đây là chương mới nhất!");
    }
}

function prevChapter() {
    if (currentChapter > 1) {
        changeChapter(currentChapter - 1);
    }
}

document.addEventListener('DOMContentLoaded', loadChapter);