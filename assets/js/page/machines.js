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

        if (document.getElementById('editStatus').value === 'Em chamado') {
          const docResponse = await fetch(`/machines/generate-document/${id}`);
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
        } else if (document.getElementById('editStatus').value === 'Em Uso') {
          const docResponse = await fetch(`/machines/generateDocument/${id}`);
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
        } else {
          alert('Máquina atualizada com sucesso');
        }

        location.reload();
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
}



$(document).ready(function () {
  console.log("Página carregada.");

  // Verifica se o elemento está presente
  console.log("Elemento encontrado:", $('a[data-status="Em Manutenção"]').length > 0);

  // Adiciona um listener para o clique no status "Em Manutenção"
  $('a[data-status="Em Manutenção"]').click(function () {
    const status = $(this).attr('data-status');
    console.log("Status selecionado:", status);

    if (status === 'Em Manutenção') {
      console.log("Abrindo o modal de detalhes de manutenção.");
      $('#additionalDetailsModal').modal('show');
    } else {
      console.log("Status não corresponde a 'Em Manutenção'.");
    }
  });

  // Código para lidar com o formulário de detalhes adicionais
  $('#additionalDetailsForm').submit(function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    console.log('Formulário de detalhes adicionais enviado.');

    $.ajax({
      url: '/machines/update-details', // Certifique-se de que esta URL está correta
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        console.log('Detalhes adicionais atualizados com sucesso.', response);
        $('#additionalDetailsModal').modal('hide'); // Fechar o modal ao atualizar com sucesso
      },
      error: function (xhr, status, error) {
        console.error('Erro ao atualizar detalhes adicionais:', error);
        alert('Erro ao atualizar detalhes adicionais.');
      }
    });
  });




  // Função para calcular o valor total das peças
  function calculateTotalValue() {
    let total = 0;
    $('input[name="value[]"]').each(function () {
      const value = parseFloat($(this).val()) || 0;
      total += value;
    });
    $('#totalValue').val(total.toFixed(2));
  }

  // Adiciona uma nova linha de campos para peças
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

  // Remove uma linha de campos de peças e recalcula o valor total
  $(document).on('click', '.remove-part', function () {
    $(this).closest('.row').remove();
    calculateTotalValue();
  });

  // Recalcula o valor total quando o valor de uma peça é alterado
  $(document).on('input', 'input[name="value[]"]', calculateTotalValue);

  // Calcula o valor total das peças ao carregar a página
  $(document).ready(function () {
    calculateTotalValue();
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
      case 'Em estoque':
        badge.classList.add('badge-brown'); // Amarelo
        break;
      default:
        badge.classList.add('badge-primary'); // Azul (ou outra cor padrão)
        break;
    }
  });
});