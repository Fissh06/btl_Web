document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('followedStoriesContainer');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // 1. Kiểm tra đăng nhập
    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-message">
                <i class="ti-lock"></i>
                <p>Vui lòng đăng nhập để xem danh sách theo dõi.</p>
                <a href="index.html" class="btn-browse">Quay lại trang chủ</a>
            </div>`;
        return;
    }

    // 2. Kiểm tra danh sách trống
    if (!currentUser.favorites || currentUser.favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <i class="ti-face-sad"></i>
                <p>Bạn chưa theo dõi bộ truyện nào.</p>
                <a href="list.html" class="btn-browse">Khám phá truyện ngay</a>
            </div>`;
        return;
    }

    try {
        // 3. Fetch tất cả truyện và lọc ra những truyện có trong favorites
        const response = await fetch('http://localhost:3000/stories');
        const allStories = await response.json();
        
        const followedStories = allStories.filter(story => 
            currentUser.favorites.includes(story.id)
        );

        renderFollowedStories(followedStories);

    } catch (error) {
        console.error("Lỗi:", error);
        container.innerHTML = `<p style="color:white; text-align:center;">Lỗi kết nối Server.</p>`;
    }
});

function renderFollowedStories(stories) {
    const container = document.getElementById('followedStoriesContainer');
    let htmlContent = "";

    stories.forEach(story => {
        const isFree = story.price === 0;
        const displayPrice = isFree ? "Miễn phí" : `${story.price.toLocaleString()}đ`;

        htmlContent += `
            <div class="story-card" onclick="window.location.href='detail.html?id=${story.id}'" style="cursor:pointer">
                <img src="${story.thumbnail}" alt="${story.title}" onerror="this.src='../assets/img/logo.png'">
                <div class="story-card-info">
                    <h3 class="story-card-title">${story.title}</h3>
                    <div class="price-display ${isFree ? 'price-free' : 'price-paid'}">
                        ${displayPrice}
                    </div>
                    <button class="btn-remove" onclick="unfollowStory(event, '${story.id}')" 
                            style="margin-top:10px; background:none; border:none; color:#ff4757; cursor:pointer; font-size:13px;">
                        <i class="ti-trash"></i> Bỏ theo dõi
                    </button>
                </div>
            </div>`;
    });

    container.innerHTML = htmlContent;
}

// Hàm hỗ trợ bỏ theo dõi nhanh ngay tại danh sách
async function unfollowStory(event, storyId) {
    event.stopPropagation(); // Ngăn việc bị nhảy vào trang chi tiết khi bấm nút xóa
    
    if(!confirm("Bạn muốn bỏ theo dõi truyện này?")) return;

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.favorites = currentUser.favorites.filter(id => id !== storyId);
    
    // Cập nhật LocalStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Cập nhật Server
    try {
        await fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: currentUser.favorites })
        });
        // Tải lại trang để cập nhật danh sách
        location.reload();
    } catch (err) {
        console.error(err);
    }
}