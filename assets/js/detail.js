document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('id');

    if (storyId) {
        try {
            const response = await fetch(`http://localhost:3000/stories/${storyId}`);
            if (!response.ok) throw new Error("Không tìm thấy truyện");
            
            const story = await response.json();

            // 1. Đổ dữ liệu cơ bản
            document.getElementById('detailTitle').innerText = story.title;
            document.getElementById('detailImg').src = story.thumbnail;
            document.getElementById('detailStatus').innerText = story.status;
            document.getElementById('detailPrice').innerText = story.price === 0 ? "Miễn phí" : story.price.toLocaleString() + "đ";
            
            // 2. Đổ dữ liệu bổ sung (Tác giả và Số chương)
            document.getElementById('detailAuthor').innerText = story.author || "Chưa rõ";
            document.getElementById('detailChapters').innerText = story.chapters ? `${story.chapters} chương` : "Đang cập nhật";

            // 3. Xử lý Thể loại
            const genreContainer = document.getElementById('detailGenres');
            if (genreContainer) {
                genreContainer.innerHTML = ''; 
                if (story.genres && Array.isArray(story.genres)) {
                    story.genres.forEach(genreName => {
                        const span = document.createElement('span');
                        span.className = 'genre-tag';
                        span.innerText = genreName;
                        genreContainer.appendChild(span);
                    });
                }
            }

            // 4. Đổ mô tả
            if (story.description) {
                document.getElementById('detailDesc').innerText = story.description;
            }

            // ==========================================
            // THÊM LOGIC THEO DÕI TẠI ĐÂY
            // ==========================================
            initFollowFeature(storyId);

        } catch (error) {
            console.error("Lỗi tải chi tiết truyện:", error);
            const detailSection = document.getElementById('storyDetail');
            if(detailSection) {
                detailSection.innerHTML = `<p style="text-align:center; padding:50px;">Không tìm thấy dữ liệu truyện này.</p>`;
            }
        }
    }
});

// Hàm xử lý logic theo dõi
function initFollowFeature(storyId) {
    const btnFollow = document.getElementById('btnFollow');
    const followText = document.getElementById('followText');
    
    // Lấy thông tin user từ LocalStorage
    // Lưu ý: Key 'currentUser' phải khớp với key bạn lưu khi Đăng nhập
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Kiểm tra xem đã theo dõi chưa để đổi giao diện nút khi mới vào trang
    if (currentUser && currentUser.favorites && currentUser.favorites.includes(storyId)) {
        btnFollow.classList.add('followed');
        followText.innerText = "Đã theo dõi";
    }

    btnFollow.onclick = async function() {
        // Cập nhật lại dữ liệu mới nhất từ local (phòng trường hợp login/logout)
        currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
            alert("Bạn phải đăng nhập để theo dõi truyện!");
            return;
        }

        // Đảm bảo có mảng favorites
        if (!currentUser.favorites) currentUser.favorites = [];

        const index = currentUser.favorites.indexOf(storyId);

        if (index > -1) {
            // Đã có -> Xóa đi (Bỏ theo dõi)
            currentUser.favorites.splice(index, 1);
            btnFollow.classList.remove('followed');
            followText.innerText = "Theo dõi";
        } else {
            // Chưa có -> Thêm vào
            currentUser.favorites.push(storyId);
            btnFollow.classList.add('followed');
            followText.innerText = "Đã theo dõi";
        }

        // 1. Cập nhật lại LocalStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // 2. Gửi cập nhật lên server (JSON Server)
        try {
            await fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorites: currentUser.favorites })
            });
        } catch (err) {
            console.error("Lỗi đồng bộ server:", err);
        }
    };
}