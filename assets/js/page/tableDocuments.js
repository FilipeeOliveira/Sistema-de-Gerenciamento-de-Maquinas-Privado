document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.view-image').forEach(link => {
        link.addEventListener('click', function () {
            const images = this.getAttribute('data-images').split(',');
            const carouselInner = document.getElementById('carouselImages');
            carouselInner.innerHTML = images.map((img, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="/evidence/${img}" class="d-block w-100" alt="Imagem">
                </div>
            `).join('');
            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
        });
    });
});