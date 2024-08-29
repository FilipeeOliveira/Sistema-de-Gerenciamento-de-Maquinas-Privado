"use strict";

/* $("[data-checkboxes]").each(function () {
  var me = $(this),
    group = me.data('checkboxes'),
    role = me.data('checkbox-role');

  me.change(function () {
    var all = $('[data-checkboxes="' + group + '"]:not([data-checkbox-role="dad"])'),
      checked = $('[data-checkboxes="' + group + '"]:not([data-checkbox-role="dad"]):checked'),
      dad = $('[data-checkboxes="' + group + '"][data-checkbox-role="dad"]'),
      total = all.length,
      checked_length = checked.length;

    if (role == 'dad') {
      if (me.is(':checked')) {
        all.prop('checked', true);
      } else {
        all.prop('checked', false);
      }
    } else {
      if (checked_length >= total) {
        dad.prop('checked', true);
      } else {
        dad.prop('checked', false);
      }
    }
  });
});
 */


let imagesToRemove = [];
let editFilesToUpload = [];

function editMachine(id, name, tags, client, status, description, images) {
  document.getElementById('editMachineId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editTags').value = tags;
  document.getElementById('editClient').value = client;
  document.getElementById('editStatus').value = status;
  document.getElementById('editDescription').value = description;

  const imagePreviewContainer = document.getElementById('editImagePreview');
  imagePreviewContainer.innerHTML = '';
  
  imagesToRemove = [];
  
  if (images) {
    images.split(',').forEach(imagePath => {
      const colDiv = document.createElement('div');
      colDiv.className = 'col-4 col-md-3 mb-3';
  
      const img = document.createElement('img');
      img.src = imagePath;
      img.className = "img-thumbnail";
  
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remover';
      removeBtn.className = 'btn btn-sm btn-danger mt-2';
  
      removeBtn.onclick = function () {
        colDiv.remove();
        imagesToRemove.push(imagePath);
        console.log('Imagens a serem removidas:', imagesToRemove);
      };
  
      colDiv.appendChild(img);
      colDiv.appendChild(removeBtn);
      imagePreviewContainer.appendChild(colDiv);
    });
  }
  
  // Função de pré-visualização e remoção de novas imagens
  const editInputFileElement = document.getElementById('editImages');
  const editPreviewContainer = document.getElementById('editImagePreview');
  let editFilesToUpload = [];
  
  editInputFileElement.addEventListener('change', function (event) {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const colDiv = document.createElement('div');
          colDiv.className = 'col-4 col-md-3 mb-3';
  
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = "img-thumbnail";
  
          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'Remover';
          removeBtn.className = 'btn btn-sm btn-danger mt-2';
  
          removeBtn.onclick = function () {
            colDiv.remove();
            editFilesToUpload = editFilesToUpload.filter(f => f.name !== file.name);
            editInputFileElement.files = createFileList(editFilesToUpload);
          };
  
          colDiv.appendChild(img);
          colDiv.appendChild(removeBtn);
          editPreviewContainer.appendChild(colDiv);
        }
        reader.readAsDataURL(file);
        editFilesToUpload.push(file);
      }
    });
    
    editInputFileElement.files = createFileList(editFilesToUpload); 
  });
  
  function createFileList(files) {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  }
  
  // Seletor do modal
  const modalElement = document.getElementById('editMachineModal');
  
// Evento para quando o modal é fechado
$('#editMachineModal').on('hidden.bs.modal', function () {
  // Limpa os arquivos selecionados
  editFilesToUpload = [];
  editInputFileElement.value = ''; // Limpa o campo de input file

  // Limpa a pré-visualização de imagens
  editPreviewContainer.innerHTML = '';

  // Recarrega a página ao fechar o modal
  location.reload();
});

// Limpa também quando o "Esc" for pressionado (caso não seja automático no seu modal)
modalElement.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    // Fecha o modal
    $('#editMachineModal').modal('hide');
    
    // Recarrega a página após fechar o modal
    location.reload();
  }
});
  


document.getElementById('editMachineForm').onsubmit = async function (e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('name', document.getElementById('editName').value);
  formData.append('tags', document.getElementById('editTags').value);
  formData.append('client', document.getElementById('editClient').value);
  formData.append('status', document.getElementById('editStatus').value);
  formData.append('description', document.getElementById('editDescription').value);

  formData.append('imagesToRemove', JSON.stringify(imagesToRemove));

  const imagesInput = document.getElementById('editImages');
  if (imagesInput) {
    for (let i = 0; i < imagesInput.files.length; i++) {
      formData.append('images', imagesInput.files[i]);
    }
  }

    console.log('Dados do FormData:', Array.from(formData.entries()));

    try {
      const response = await fetch(`/machines/update/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);

        const status = document.getElementById('editStatus').value;
        if (status === 'Em chamado' || status === 'Em espera') {
          showModalConfirmation(id, status);
        } else {
          location.reload();
        }
      } else {
        console.error('Erro ao atualizar a máquina');
        alert('Erro ao atualizar a máquina');
      }
    } catch (error) {
      console.error('Erro ao atualizar a máquina', error);
      alert('Erro ao atualizar a máquina');
    }

    $('#editMachineModal').modal('hide');
  };

  function showModalConfirmation(machineId, status) {
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const confirmDownloadButton = document.getElementById('confirmDownloadButton');
    const cancelDownloadButton = document.getElementById('cancelDownloadButton');

    confirmDownloadButton.onclick = async function () {
      confirmationModal.hide();

      if (status === 'Em chamado') {
        const docResponse = await fetch(`/machines/generate-document/${machineId}`);
        if (docResponse.ok) {
          const contentDisposition = docResponse.headers.get('Content-Disposition');
          const blob = await docResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = contentDisposition.split('filename=')[1];
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          console.error('Erro ao gerar o documento');
          alert('Erro ao gerar o documento');
        }
      } else if (status === 'Em espera') {
        const docResponse = await fetch(`/machines/generateDocument/${machineId}`);
        if (docResponse.ok) {
          const contentDisposition = docResponse.headers.get('Content-Disposition');
          const blob = await docResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = contentDisposition.split('filename=')[1];
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          console.error('Erro ao gerar o documento');
          alert('Erro ao gerar o documento');
        }
      }
      location.reload();
    };

    cancelDownloadButton.onclick = function () {
      confirmationModal.hide();
      location.reload();
    };

    confirmationModal.show();
  }
}

//Modal em uso
$(document).ready(function () {
  console.log("Documento pronto.");

  let previousStatus = $('#editStatus').val(); 

  // Evento de mudança no status do modal de edição
  $('#editStatus').change(function () {
    const selectedStatus = $(this).val();
    console.log("Status selecionado:", selectedStatus);

    if (selectedStatus === 'Em Uso') {
      console.log("Status é 'Em Uso'. Abrindo o modal para exportar documento de devolução.");

      const machineId = $('#editMachineId').val();
      $('#devolutionMachineId').val(machineId);

      $('#exportDevolutionModal').modal('show');
    }
  });

  // Pré-visualização do documento de devolução
  $('#devolutionDocument').on('change', function () {
    const file = this.files[0];
    const previewContainer = $('#devolutionDocumentPreview');
    previewContainer.empty();

    if (file) {
      const fileName = $('<p>').text(`Documento: ${file.name}`);
      previewContainer.append(fileName);
    }
  });

  // Evento para quando o modal de exportação de documento for fechado
  $('#exportDevolutionModal').on('hidden.bs.modal', function () {
    $('#devolutionDocument').val('');
    $('#devolutionDocumentPreview').empty();

    // Verificar se o documento foi exportado
    if (!$('#devolutionDocument').val()) {
      console.log('Documento não exportado. Revertendo para o status anterior:', previousStatus);
      $('#editStatus').val(previousStatus); // Reverter para o status anterior
    }
  });

  // Evento de submissão do formulário de exportação de documento
  $('#exportDevolutionForm').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/machines/export-devolution',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        console.log('Documento de devolução exportado com sucesso.', response);

        // Fechar o modal de exportação
        $('#exportDevolutionModal').modal('hide');

        // Atualizar o status anterior para "Em Uso"
        previousStatus = 'Em Uso';

        
        $('#editMachineForm').submit();
      },
      error: function (xhr, status, error) {
        console.error('Erro ao exportar documento de devolução:', error);
        alert('Erro ao exportar documento de devolução.');
      }
    });
  });

  
  $('#editMachineModal').on('show.bs.modal', function () {
    previousStatus = $('#editStatus').val();
  });

  $('#editMachineForm').submit(function (e) {
    const selectedStatus = $('#editStatus').val();
    if (selectedStatus === 'Em Uso' && !$('#devolutionDocument').val()) {
      e.preventDefault();
      console.log('A exportação do documento é necessária antes de salvar as alterações.');
      $('#editStatus').val(previousStatus);
    }
  });
});



$(document).ready(function () {
  console.log("Documento pronto.");

  let filesToUpload = [];

  // Abre o modal com o status 'Em Manutenção'
  $('.status-badge').click(function () {
    const status = $(this).text().trim();
    console.log("Status clicado:", status);

    if (status === 'Em Manutenção') {
      console.log("Status é 'Em Manutenção'. Abrindo o modal.");

      const machineId = $(this).data('machine-id');
      $('#machineId').val(machineId);

      $('#additionalDetailsModal').modal('show');
    }
  });

  // Pré-visualização de imagens adicionais
  $('#additionalImages').on('change', function () {
    const newFiles = Array.from(this.files);
    const previewContainer = $('#additionalImagePreview');
    const existingFiles = filesToUpload || []; // Se já existem arquivos, use-os

    filesToUpload = existingFiles.concat(newFiles); // Adiciona os novos arquivos ao array existente

    previewContainer.empty(); // Limpa a pré-visualização

    filesToUpload.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const colDiv = $('<div>').addClass('col-4 col-md-3 mb-3');
          const img = $('<img>').attr('src', e.target.result).addClass('img-thumbnail');
          const removeBtn = $('<button>').text('Remover').addClass('btn btn-sm btn-danger mt-2').click(function () {
            colDiv.remove();
            filesToUpload.splice(index, 1); // Remove o arquivo da lista
            updateInputFiles(); // Atualiza o input com os arquivos restantes
          });

          colDiv.append(img).append(removeBtn);
          previewContainer.append(colDiv);
        };
        reader.readAsDataURL(file);
      }
    });

    updateInputFiles(); // Atualiza o input com todos os arquivos
  });

  // Função para atualizar o input de arquivos com a lista atualizada
  function updateInputFiles() {
    const dataTransfer = new DataTransfer();
    filesToUpload.forEach(file => dataTransfer.items.add(file));
    $('#additionalImages')[0].files = dataTransfer.files;
  }

  // Pré-visualização do documento adicional
  $('#additionalDocument').on('change', function () {
    const file = this.files[0];
    const previewContainer = $('#additionalDocumentPreview');
    previewContainer.empty();

    if (file) {
      const fileName = $('<p>').text(`Documento: ${file.name}`);
      previewContainer.append(fileName);
    }
  });

  // Submeter o formulário de detalhes adicionais
  $('#additionalDetailsForm').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    console.log('Dados do formulário:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const quantities = formData.getAll('quantity[]');
    const values = formData.getAll('value[]');
    const totalValue = quantities.reduce((acc, qty, index) => acc + parseFloat(qty) * parseFloat(values[index]), 0);
    console.log('Valor total calculado:', totalValue);

    formData.append('totalValue', totalValue.toFixed(2));

    $.ajax({
      url: '/machines/update-details',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        console.log('Detalhes adicionais atualizados com sucesso.', response);
        
        // Limpa os campos do formulário
        $('#additionalDetailsForm')[0].reset();
        
        // Limpa as pré-visualizações de imagens e documentos
        $('#additionalImagePreview').empty();
        $('#additionalDocumentPreview').empty();

        $('#additionalDetailsModal').modal('hide');
      },
      error: function (xhr, status, error) {
        console.error('Erro ao atualizar detalhes adicionais:', error);
        alert('Erro ao atualizar detalhes adicionais.');
      }
    });
  });

  // Evento de fechamento do modal
  $('#additionalDetailsModal').on('hidden.bs.modal', function () {
    // Limpa os campos do formulário
    $('#additionalDetailsForm')[0].reset();
    
    // Limpa as pré-visualizações de imagens e documentos
    $('#additionalImagePreview').empty();
    $('#additionalDocumentPreview').empty();

    // Reseta a lista de arquivos selecionados
    filesToUpload = [];
  });
});


function calculateTotalValue() {
  let total = 0;

  $('#partsList .row').each(function () {
    const quantity = parseFloat($(this).find('input[name="quantity[]"]').val()) || 0;
    const value = parseFloat($(this).find('input[name="value[]"]').val()) || 0;

    total += quantity * value;
  });

  $('#totalValue').val(total.toFixed(2));
}

$(document).on('click', '.add-part', function () {
  const partRow =
    `<div class="row mb-2">
        <div class="col-md-5">
          <input type="text" class="form-control" name="parts[]" placeholder="Peça" required>
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control" name="quantity[]" placeholder="Quantidade" required>
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control" name="value[]" placeholder="Valor" required>
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-danger btn-sm remove-part"><i class="fas fa-minus"></i></button>
        </div>
      </div>`;
  $('#partsList').append(partRow);
});

$(document).on('click', '.remove-part', function () {
  $(this).closest('.row').remove();
  calculateTotalValue();
});

$(document).on('input', 'input[name="value[]"], input[name="quantity[]"]', calculateTotalValue);

$(document).ready(function () {
  calculateTotalValue();
});

//modal de documento manutencao
$(document).ready(function () {
  console.log("Documento pronto.");

  let previousStatus = $('#editStatus').val(); 

  $('#editStatus').change(function () {
      const selectedStatus = $(this).val();
      console.log("Status selecionado:", selectedStatus);

      if (selectedStatus === 'Em Manutenção') {
          const machineId = $('#editMachineId').val();
          console.log("ID da máquina:", machineId);
          
          $('#maintenanceMachineId').val(machineId);
          $('#maintenanceDocumentModal').modal('show');
      }
  });

  // Visualização do documento selecionado
  $('#maintenanceDocument').on('change', function () {
      const file = this.files[0];
      const previewContainer = $('#maintenanceDocumentPreview');
      previewContainer.empty();

      if (file) {
          const fileName = $('<p>').text(`Documento: ${file.name}`);
          previewContainer.append(fileName);
      }
  });

  // Evento para quando o modal de manutenção for fechado
  $('#maintenanceDocumentModal').on('hidden.bs.modal', function () {
      $('#maintenanceDocument').val('');  // Limpa o campo do documento
      $('#maintenanceDocumentPreview').empty();  // Limpa a pré-visualização

      // Verificar se o documento foi exportado
      if (!$('#maintenanceDocument').val()) {
          console.log('Documento de manutenção não exportado. Revertendo para o status anterior:', previousStatus);
          $('#editStatus').val(previousStatus); // Reverter para o status anterior
      }
  });

  // Envio do formulário via AJAX
  $('#maintenanceDocumentForm').on('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      console.log('Dados do formulário de documento de manutenção:');
      for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
              console.log(`${key}: ${value.name}`);
          } else {
              console.log(`${key}: ${value}`);
          }
      }

      $.ajax({
          url: '/machines/upload-maintenance-document',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(response) {
              console.log('Resposta do servidor:', response.message);
              $('#maintenanceDocumentModal').modal('hide');

              // Atualizar o status anterior para "Em Manutenção"
              previousStatus = 'Em Manutenção';
          },
          error: function(err) {
              console.error('Erro ao enviar o documento:', err);
              alert('Erro ao enviar o documento.');
          }
      });
  });

  // Captura o status atual ao abrir o modal de edição da máquina
  $('#editMachineModal').on('show.bs.modal', function () {
      previousStatus = $('#editStatus').val();
  });

  // Verifica o envio do formulário principal
  $('#editMachineForm').submit(function (e) {
      const selectedStatus = $('#editStatus').val();
      if (selectedStatus === 'Em Manutenção' && !$('#maintenanceDocument').val()) {
          e.preventDefault();
          console.log('A exportação do documento de manutenção é necessária antes de salvar as alterações.');
          $('#editStatus').val(previousStatus);
      }
  });
});



document.addEventListener('DOMContentLoaded', function () {
  const badges = document.querySelectorAll('.status-badge');

  badges.forEach(badge => {
    const status = badge.textContent.trim();

    switch (status) {
      case 'Em Manutenção':
        badge.classList.add('badge-danger'); // Vermelho
        break;
      case 'Em Uso':
        badge.classList.add('badge-success'); // Verde
        break;
      case 'Em chamado':
        badge.classList.add('badge-warning'); // Amarelo
        break;
      case 'Em espera':
        badge.classList.add('badge-primary'); // Azul
        break;
      case 'Em estoque':
        badge.classList.add('badge-brown'); // Marrom
        break;
      default:
        badge.classList.add('badge-primary'); // Azul (ou outra cor padrão)
        break;
    }
  });
});





