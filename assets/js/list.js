const API_STORIES = "http://localhost:3000/stories";
let allStories = []; 
let currentGenre = 'all';
let currentPriceFilter = 'all'; 

async function loadStories() {
    const container = document.getElementById('storyListContainer');
    if (!container) return;

    try {
        const response = await fetch(API_STORIES);
        if (!response.ok) throw new Error("Không thể kết nối tới server!");

        allStories = await response.json();
        renderStories(allStories);
        setupFilterEvents();

    } catch (error) {
        console.error("Lỗi:", error);
        container.innerHTML = `<p style="color:white; text-align:center;">Lỗi kết nối Server.</p>`;
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('type') === 'free') {
        currentPriceFilter = 'free';
        // Đoạn này giúp giao diện nút bấm cũng chuyển sang active ở nút Miễn phí
        setTimeout(() => {
            document.querySelectorAll('.price-filter-item').forEach(el => {
                el.classList.remove('active');
                if(el.getAttribute('data-price') === 'free') el.classList.add('active');
            });
        }, 100);
}
}

function setupFilterEvents() {
    // 1. Lọc Thể loại
    const genreTags = document.querySelectorAll('.genre-filter-item');
    genreTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Cách xóa class active an toàn hơn
            document.querySelectorAll('.genre-filter-item').forEach(el => el.classList.remove('active'));
            tag.classList.add('active');
            currentGenre = tag.getAttribute('data-genre');
            filterAndRender();
        });
    });

    // 2. Lọc Giá
    const priceTags = document.querySelectorAll('.price-filter-item');
    priceTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Xóa tất cả class active của nhóm GIÁ trước khi thêm mới
            document.querySelectorAll('.price-filter-item').forEach(el => el.classList.remove('active'));
            tag.classList.add('active');
            
            currentPriceFilter = tag.getAttribute('data-price');
            console.log("Đang chọn lọc giá:", currentPriceFilter); // Để kiểm tra xem nó có chạy vào đây không
            filterAndRender();
        });
    });

    // 3. Tìm kiếm
    const searchInput = document.getElementById('listSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }
}

function filterAndRender() {
    const searchText = (document.getElementById('listSearchInput')?.value || "").toLowerCase();

    const filtered = allStories.filter(story => {
        // 1. Lọc theo tên
        const matchSearch = story.title.toLowerCase().includes(searchText);

        // 2. Lọc theo thể loại
        const matchGenre = currentGenre === 'all' || (story.genres && story.genres.includes(currentGenre));
        
        // 3. Lọc theo giá (Đoạn này quan trọng)
        let matchPrice = true;
        if (currentPriceFilter === 'free') {
            matchPrice = (story.price === 0);
        } else if (currentPriceFilter === 'paid') {
            matchPrice = (story.price > 0);
        }

        return matchSearch && matchGenre && matchPrice;
    });

    renderStories(filtered);
}

function renderStories(data) {
    const container = document.getElementById('storyListContainer');
    if (!container) return;
    
    let htmlContent = "";
    data.forEach(story => {
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
                </div>
            </div>`;
    });

    container.innerHTML = htmlContent || `<p style="color: #ccc; grid-column: 1/-1; text-align: center; margin-top: 50px;">Không tìm thấy truyện phù hợp với bộ lọc.</p>`;
}

document.addEventListener('DOMContentLoaded', loadStories);