document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('id');

    if (!storyId) {
        console.error("Không tìm thấy ID truyện trên URL");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/stories/${storyId}`);
        if (!response.ok) throw new Error("Không tìm thấy truyện trong database");
        
        const story = await response.json();

        // 1. Đổ dữ liệu cơ bản (Dùng Optional Chaining để tránh lỗi nếu thiếu ID)
        const titleEl = document.getElementById('detailTitle');
        const imgEl = document.getElementById('detailImg');
        const statusEl = document.getElementById('detailStatus');
        const priceEl = document.getElementById('detailPrice');

        if (titleEl) titleEl.innerText = story.title;
        if (imgEl) imgEl.src = story.thumbnail || '../assets/img/logo.png';
        if (statusEl) statusEl.innerText = story.status;
        if (priceEl) priceEl.innerText = story.price === 0 ? "Miễn phí" : story.price.toLocaleString() + "đ";
        
        // 2. Đổ dữ liệu bổ sung
        const authorEl = document.getElementById('detailAuthor');
        const chaptersEl = document.getElementById('detailChapters');
        if (authorEl) authorEl.innerText = story.author || "Chưa rõ";
        if (chaptersEl) chaptersEl.innerText = story.chapters ? `${story.chapters} chương` : "Đang cập nhật";

        // 3. Xử lý Thể loại
        renderGenres(story.genres);

        // 4. Đổ mô tả
        const descEl = document.getElementById('detailDesc');
        if (descEl) descEl.innerText = story.description || "Nội dung đang cập nhật...";

        // 5. Khởi tạo các tính năng (Đặt trong try-catch riêng để nếu lỗi tính năng này không làm chết trang)
        try {
            initPurchaseLogic(story);
        } catch (e) { console.error("Lỗi logic mua:", e); }

        try {
            initFollowFeature(storyId);
        } catch (e) { console.error("Lỗi logic theo dõi:", e); }

    } catch (error) {
        console.error("Lỗi tải chi tiết truyện:", error);
        const detailSection = document.getElementById('storyDetail');
        if(detailSection) {
            detailSection.innerHTML = `<p style="text-align:center; padding:50px; color: white;">Không tìm thấy dữ liệu truyện này. Vui lòng kiểm tra lại kết nối Server.</p>`;
        }
    }
});

function renderGenres(genres) {
    const genreContainer = document.getElementById('detailGenres');
    if (!genreContainer) return;
    genreContainer.innerHTML = ''; 
    if (genres && Array.isArray(genres)) {
        genres.forEach(genreName => {
            const span = document.createElement('span');
            span.className = 'genre-tag';
            span.innerText = genreName;
            genreContainer.appendChild(span);
        });
    }
}

async function initPurchaseLogic(story) {
    const btnRead = document.querySelector('.btn-read');
    if (!btnRead) return;

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isOwner = currentUser?.purchasedStories?.includes(story.id);
    const isFree = story.price === 0;

    if (isFree || isOwner) {
        btnRead.innerText = "Đọc Ngay";
        btnRead.classList.remove('buy-mode');
        btnRead.onclick = () => window.location.href = `read.html?id=${story.id}`;
    } else {
        btnRead.innerText = `Mua Truyện (${story.price.toLocaleString()}đ)`;
        btnRead.classList.add('buy-mode');
        btnRead.onclick = () => handlePurchase(story, btnRead);
    }
}

async function handlePurchase(story, btnElement) {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { alert("Bạn cần đăng nhập để mua!"); return; }

    const balance = user.balance || 0;
    if (balance < story.price) {
        alert("Số dư không đủ!");
        return;
    }

    if (confirm(`Mua "${story.title}"?`)) {
        user.purchasedStories = user.purchasedStories || [];
        user.purchasedStories.push(story.id);
        user.balance -= story.price;

        try {
            const res = await fetch(`http://localhost:3000/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    purchasedStories: user.purchasedStories,
                    balance: user.balance 
                })
            });
            if (res.ok) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                location.reload();
            }
        } catch (err) { alert("Lỗi kết nối server!"); }
    }
}

function initFollowFeature(storyId) {
    const btnFollow = document.getElementById('btnFollow');
    const followText = document.getElementById('followText');
    if (!btnFollow) return;

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser?.favorites?.includes(storyId)) {
        btnFollow.classList.add('followed');
        if (followText) followText.innerText = "Đã theo dõi";
    }

    btnFollow.onclick = async () => {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) { alert("Vui lòng đăng nhập!"); return; }

        currentUser.favorites = currentUser.favorites || [];
        const index = currentUser.favorites.indexOf(storyId);

        if (index > -1) {
            currentUser.favorites.splice(index, 1);
            btnFollow.classList.remove('followed');
            if (followText) followText.innerText = "Theo dõi";
        } else {
            currentUser.favorites.push(storyId);
            btnFollow.classList.add('followed');
            if (followText) followText.innerText = "Đã theo dõi";
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        await fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: currentUser.favorites })
        });
    };
}