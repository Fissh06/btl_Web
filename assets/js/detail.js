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

            // 3. Đổ mô tả
            if (story.description) {
                document.getElementById('detailDesc').innerText = story.description;
            }
            
        } catch (error) {
            console.error("Lỗi tải chi tiết truyện:", error);
            document.getElementById('storyDetail').innerHTML = `<p style="text-align:center; padding:50px;">Không tìm thấy dữ liệu truyện này.</p>`;
        }
    }
});