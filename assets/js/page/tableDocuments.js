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
                // Criação dos elementos usando a estrutura fornecida
                const colDiv = document.createElement('div');
                colDiv.className = 'col-4 col-md-3 mb-3'; // Usando as classes fornecidas

                const img = document.createElement('img');
                img.src = `/evidence/${imageSrc}`;
                img.className = "img-thumbnail img-clickable"; // Adicionando a classe img-clickable para o evento de clique
                img.style.width = '100%'; // Largura 100% do container
                img.style.height = '75px'; // Altura fixa para todas as miniaturas
                img.style.objectFit = 'cover'; // Para garantir que a imagem se ajuste corretamente sem distorções

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
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada e script iniciado.');
  
    const dateFilterForm = document.getElementById('dateFilterForm');
  
    if (!dateFilterForm) {
      console.error('Formulário não encontrado.');
      return;
    }
  
    console.log('Formulário encontrado.');
  
    dateFilterForm.addEventListener('submit', function(event) {
      const startDateInput = document.getElementById('startDate')?.value;
      const endDateInput = document.getElementById('endDate')?.value;
  
      if (!startDateInput || !endDateInput) {
        console.error('Datas de início e fim são obrigatórias.');
        event.preventDefault();
        return;
      }
  
      // Verifica se as datas são válidas
      const startDate = new Date(startDateInput);
      const endDate = new Date(endDateInput);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Datas fornecidas são inválidas.');
        event.preventDefault();
        return;
      }
  
      console.log(`Filtrando documentos de ${startDateInput} até ${endDateInput}.`);
    });
  });
  