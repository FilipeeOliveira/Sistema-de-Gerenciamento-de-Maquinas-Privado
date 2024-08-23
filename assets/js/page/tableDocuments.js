document.addEventListener('DOMContentLoaded', function () {
  const imageModalElement = document.getElementById('imageModal');
  const largeImageModalElement = document.getElementById('largeImageModal');
  const imageModal = new bootstrap.Modal(imageModalElement);
  const largeImageModal = new bootstrap.Modal(largeImageModalElement);
  const largeImage = document.getElementById('largeImage');

  document.querySelectorAll('.view-image').forEach(link => {
      link.addEventListener('click', function () {
          const images = this.getAttribute('data-images').split(',');
          const imageGallery = document.getElementById('imageGallery');

          // Limpando o conteúdo anterior do gallery
          imageGallery.innerHTML = '';

          images.forEach(imageSrc => {
              const colDiv = document.createElement('div');
              colDiv.className = 'col-4 col-md-3 mb-3'; 

              const img = document.createElement('img');
              img.src = `/evidence/${imageSrc}`;
              img.className = "img-thumbnail img-clickable"; 
              img.style.width = '100%'; 
              img.style.height = '75px'; 
              img.style.objectFit = 'cover'; 

              colDiv.appendChild(img);
              imageGallery.appendChild(colDiv);

              // Adiciona evento de clique para exibir a imagem em tamanho grande
              img.addEventListener('click', function () {
                  largeImage.src = this.src;
                  largeImageModal.show();
              });
          });

          // Exibindo o modal com as miniaturas
          imageModal.show();
      });
  });

  // Removendo o backdrop manualmente ao fechar o modal
  imageModalElement.addEventListener('hidden.bs.modal', function () {
      document.body.classList.remove('modal-open');
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
  });

  largeImageModalElement.addEventListener('hidden.bs.modal', function () {
      document.body.classList.remove('modal-open');
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const dateFilterForm = document.getElementById('dateFilterForm');

  if (!dateFilterForm) {
    return;
  }

  dateFilterForm.addEventListener('submit', function(event) {
    const startDateInput = document.getElementById('startDate')?.value;
    const endDateInput = document.getElementById('endDate')?.value;

    if (!startDateInput || !endDateInput) {
      event.preventDefault();
      return;
    }

    // Verifica se as datas são válidas
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      event.preventDefault();
      return;
    }
  });
});