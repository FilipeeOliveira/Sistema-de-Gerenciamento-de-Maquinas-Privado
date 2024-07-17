"use strict";

$("select").selectric();
$.uploadPreview({
  input_field: "#image-upload",   // Default: .image-upload
  preview_box: "#image-preview",  // Default: .image-preview
  label_field: "#image-label",    // Default: .image-label
  label_default: "Adicionar Imagens",   // Default: Choose File
  label_selected: "Adicionar Imagens",  // Default: Change File
  no_label: false,                // Default: false
  success_callback: null          // Default: null
});
$(".inputtags").tagsinput('items');

document.getElementById('image-upload').addEventListener('change', function(event) {
  const previewContainer = document.getElementById('preview');
  previewContainer.innerHTML = ""; 
  const files = event.target.files;

  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-4 col-md-3';
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = "img-thumbnail";
        colDiv.appendChild(img);
        previewContainer.appendChild(colDiv);
      }
      reader.readAsDataURL(file);
    }
  });
});

document.getElementById('machineForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Evita o envio padrão do formulário

  // Realiza o envio dos dados utilizando fetch
  fetch('/machine/create', {
      method: 'POST',
      body: new FormData(this)
  })
  .then(response => {
    if (response.ok) {
      alert('Dados enviados com sucesso!');
      // Limpa os campos do formulário após o envio bem-sucedido
      this.reset(); // Resetará os campos do formulário

      // Limpa o conteúdo do Summernote
      $('.summernote-simple').summernote('reset');

      // Limpa a pré-visualização das imagens
      document.getElementById('preview').innerHTML = '';

      // Resetar o campo de etiqueta
      $('.inputtags').tagsinput('removeAll');

      // Resetar o campo de status para a opção padrão
      $('#editStatus').val('');
      $('#editStatus').selectric('refresh');

          // Você pode adicionar aqui qualquer outra ação após o envio bem-sucedido
      } else {
          throw new Error('Erro ao enviar os dados.');
      }
  })
  .catch(error => {
      console.error('Erro:', error);
      alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
  });
});

//cores de cadastro
document.addEventListener('DOMContentLoaded', function() {
  const selectStatus = document.getElementById('editStatus');

  selectStatus.addEventListener('change', function() {
    const selectedOption = selectStatus.options[selectStatus.selectedIndex];
    const statusBadge = document.querySelector('.status-badge');

    switch (selectedOption.value) {
      case 'Em Manutenção':
        statusBadge.classList.remove('badge-primary', 'badge-success', 'badge-warning');
        statusBadge.classList.add('badge-danger');
        break;
      case 'Em Uso':
        statusBadge.classList.remove('badge-primary', 'badge-danger', 'badge-warning');
        statusBadge.classList.add('badge-success');
        break;
      case 'Pendente':
        statusBadge.classList.remove('badge-primary', 'badge-danger', 'badge-success');
        statusBadge.classList.add('badge-warning');
        break;
      default:
        statusBadge.classList.remove('badge-danger', 'badge-success', 'badge-warning');
        statusBadge.classList.add('badge-primary');
        break;
    }
  });
});