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

// Função de pré-visualização e remoção de imagens
const previewContainer = document.getElementById('preview');
const inputFileElement = document.getElementById('image-upload');
let filesToUpload = [];

inputFileElement.addEventListener('change', function (event) {
  filesToUpload = Array.from(event.target.files);
  previewContainer.innerHTML = '';

  filesToUpload.forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-4 col-md-3 mb-3';
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = "img-thumbnail";

        // Botão para remover a imagem
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remover';
        removeBtn.className = 'btn btn-sm btn-danger mt-2';
        removeBtn.onclick = function () {
          colDiv.remove();
          filesToUpload.splice(index, 1); // Remove o arquivo da lista
          inputFileElement.files = createFileList(filesToUpload); // Atualiza os arquivos no input
        };

        colDiv.appendChild(img);
        colDiv.appendChild(removeBtn);
        previewContainer.appendChild(colDiv);
      }
      reader.readAsDataURL(file);
    }
  });
});

// Função para criar um objeto FileList
function createFileList(files) {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}

// Função de validação de formulário
function validateForm(form) {
  let isValid = true;
  form.querySelectorAll("[required]").forEach(function (input) {
    if (!input.value) {
      isValid = false;
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  });
  return isValid;
}

// Adiciona um evento de envio ao formulário
document.getElementById('machineForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Evita o envio padrão do formulário

  // Valida o formulário
  if (!validateForm(this)) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  // Realiza o envio dos dados utilizando fetch
  const formData = new FormData(this);

  fetch('/machine/create', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (response.ok) {
        // Limpa os campos do formulário após o envio bem-sucedido
        this.reset(); // Resetará os campos do formulário

        // Limpa o conteúdo do Summernote
        $('.summernote-simple').summernote('reset');

        // Limpa a pré-visualização das imagens
        previewContainer.innerHTML = '';

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

// Cores de cadastro
document.addEventListener('DOMContentLoaded', function () {
  const selectStatus = document.getElementById('editStatus');

  selectStatus.addEventListener('change', function () {
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
      case 'Em chamado':
        statusBadge.classList.remove('badge-primary', 'badge-danger', 'badge-success');
        statusBadge.classList.add('badge-warning');
        break;
      case 'Em Estoque':
        statusBadge.classList.remove('badge-primary', 'badge-danger', 'badge-success', 'badge-warning');
        statusBadge.classList.add('badge-brown');
        break;
      case 'Em espera':
        statusBadge.classList.remove('badge-primary', 'badge-danger', 'badge-success', 'badge-warning');
        statusBadge.classList.add('badge-primary');
        break;
      default:
        statusBadge.classList.remove('badge-danger', 'badge-success', 'badge-warning', 'badge-brown');
        statusBadge.classList.add('badge-primary');
        break;
    }
  });
});
