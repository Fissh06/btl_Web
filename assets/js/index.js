// Phần search input
const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.querySelector('.search-container');
const searchInput = document.getElementById('searchInput');
// Lắng nghe trên toàn bộ container
searchContainer.addEventListener('click', (e) => {
    // Ngăn sự kiện click lan ra ngoài window
    e.stopPropagation();

    const isActive = searchContainer.classList.contains('active');

    // Nếu bấm đúng vào icon VÀ đang mở -> Đóng lại
    if (e.target === searchBtn && isActive) {
        searchContainer.classList.remove('active');
    } 
    // Nếu đang đóng -> Mở ra
    else if (!isActive) {
        searchContainer.classList.add('active');
        searchInput.focus();
    }
});
// Click ra ngoài để đóng
window.addEventListener('click', () => {
    searchContainer.classList.remove('active');
});




// Phần ẩn header
let lastScrollTop = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Hành động: Cuộn xuống + đã cuộn qua khỏi 100px đầu trang
        header.classList.add('hide');
    } else {
        // Hành động: Cuộn lên
        header.classList.remove('hide');
    }
    
    // Cập nhật lại vị trí cuộn cuối cùng
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
}, false);