// Hiện thị truyện ở file index.html và tương tác khi bấm vào truyện
// 1. KHAI BÁO CẤU HÌNH
const API_STORIES = "http://localhost:3000/stories";

/**
 * Hàm lấy danh sách truyện từ JSON Server và hiển thị lên giao diện
 */
async function loadStories() {
    const storyListContainer = document.getElementById('storyList');
    
    // Kiểm tra nếu không có container này (đang ở trang detail) thì thoát hàm
    if (!storyListContainer) return;

    console.log("Đang tải dữ liệu từ db.json...");
    
    try {
        const response = await fetch(API_STORIES);
        
        if (!response.ok) {
            throw new Error("Không thể kết nối tới server!");
        }

        const stories = await response.json();

        // Xóa nội dung cũ trước khi đổ mới
        storyListContainer.innerHTML = "";

        let htmlContent = "";
        stories.forEach(story => {
            // ... logic xử lý giá tiền ...
            const isFree = story.price === 0;
            const displayPrice = isFree ? "Miễn phí" : `${story.price.toLocaleString()}đ`;
            const priceClass = isFree ? "price-free" : "price-paid";

            // CHÚ THÍCH CHUYỂN HƯỚNG:
            // 1. onclick="handleStoryClick('${story.id}')": 
            //    Gắn sự kiện click vào toàn bộ thẻ div của truyện.
            // 2. ${story.id}: Lấy giá trị ID định danh duy nhất của truyện từ db.json 
            //    để truyền vào hàm handleStoryClick khi người dùng bấm vào.
            htmlContent += `
                <div class="story-item" onclick="handleStoryClick('${story.id}')">
                    <div class="story-img-container">
                        <img 
                            src="${story.thumbnail}" 
                            class="story-img" 
                            alt="${story.title}"
                            onerror="this.onerror=null; this.src='../assets/img/logo.png'"
                            // nếu ảnh chưa để thumbnail thì sẽ mặc định để ảnh logo
                        >
                    </div>
                    <div class="story-info">
                        <h3 class="story-title">${story.title}</h3>
                        <div class="price-display ${priceClass}">
                            ${displayPrice}
                        </div>
                    </div>
                </div>
            `;
        });

        storyListContainer.innerHTML = htmlContent;
        console.log(`Đã hiển thị ${stories.length} truyện.`);

    } catch (error) {
        console.error("Lỗi khi tải truyện:", error);
        storyListContainer.innerHTML = `<p style="color: red; text-align: center;">Lỗi kết nối Server.</p>`;
    }
}

/**
 * Xử lý điều hướng sang trang chi tiết
 */
function handleStoryClick(storyId) {
    // Chuyển hướng sang trang detail.html kèm theo ID của truyện trên URL
    // window.location.href: Thuộc tính của trình duyệt dùng để thay đổi địa chỉ URL hiện tại.
    // `detail.html?id=${storyId}`: 
    //   - "detail.html": Tên file đích muốn chuyển tới.
    //   - "?id=": Tạo một Query Parameter (tham số truy vấn) có tên là 'id'.
    //   - ${storyId}: Giá trị ID thực tế (ví dụ: ?id=1). 
    //     Trang detail.html sẽ nhìn vào cái đuôi này để tự tải dữ liệu tương ứng.
    window.location.href = `detail.html?id=${storyId}`;
}

// 2. KÍCH HOẠT KHI TRANG LOAD XONG
document.addEventListener('DOMContentLoaded', () => {
    loadStories();
});