"use strict";

$("[data-checkboxes]").each(function () {
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

let imagesToRemove = [];

function editMachine(id, name, tags, client, status, description, images) {
  document.getElementById('editName').value = name;
  document.getElementById('editTags').value = tags;
  document.getElementById('editClient').value = client;
  document.getElementById('editStatus').value = status;
  document.getElementById('editDescription').value = description;

  const imagePreviewContainer = document.getElementById('editImagePreview');
  imagePreviewContainer.innerHTML = '';

  let imagesToRemove = [];

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
          alert('Máquina atualizada com sucesso');
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


$(document).ready(function () {
  console.log("Documento pronto.");

  $('.status-badge').click(function () {
    const status = $(this).text().trim();
    console.log("Status clicado:", status);

    if (status === 'Em Manutenção') {
      console.log("Status é 'Em Manutenção'. Abrindo o modal.");

      const machineId = $(this).data('machine-id');
      $('#machineId').val(machineId);

      $('#additionalDetailsModal').modal('show');
    } else {
      console.log("Status não é 'Em Manutenção'. Nenhuma ação necessária.");
    }
  });

  $('#additionalDetailsForm').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    $.ajax({
      url: '/machines/update-details',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        console.log('Detalhes adicionais atualizados com sucesso.', response);
        $('#additionalDetailsModal').modal('hide');
      },
      error: function (xhr, status, error) {
        console.error('Erro ao atualizar detalhes adicionais:', error);
        alert('Erro ao atualizar detalhes adicionais.');
      }
    });
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
  const partRow = `
    <div class="row mb-2">
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

$(document).on('input', 'input[name="value[]"]', calculateTotalValue);

$(document).ready(function () {
  calculateTotalValue();
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
