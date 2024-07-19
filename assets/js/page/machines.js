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

function editMachine(id, name, tags, client, status, description, images) {
  document.getElementById('editName').value = name;
  document.getElementById('editTags').value = tags;
  document.getElementById('editClient').value = client;
  document.getElementById('editStatus').value = status;
  document.getElementById('editDescription').value = description;

  // Limpar a pré-visualização das imagens
  const imagePreviewContainer = document.getElementById('editImagePreview');
  imagePreviewContainer.innerHTML = '';

  // Adicionar as imagens existentes na pré-visualização
  if (images) {
    images.split(',').forEach(imagePath => {
      const colDiv = document.createElement('div');
      colDiv.className = 'col-4 col-md-3 mb-3'; // Ajuste de classes conforme necessário

      const img = document.createElement('img');
      img.src = imagePath;
      img.className = "img-thumbnail";

      // Botão para remover a imagem
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remover';
      removeBtn.className = 'btn btn-sm btn-danger mt-2';
      removeBtn.onclick = function () {
        colDiv.remove();
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

    // Adicionar as imagens selecionadas ao FormData
    const imagesInput = document.getElementById('editImages');
    for (let i = 0; i < imagesInput.files.length; i++) {
      formData.append('images', imagesInput.files[i]);
    }

    try {
      const response = await fetch(`/machines/update/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        alert('Máquina atualizada com sucesso');
        location.reload();
      } else {
        console.error('Erro ao atualizar a máquina');
        alert('Erro ao atualizar a máquina');
      }
    } catch (error) {
      console.error('Erro ao atualizar a máquina', error);
      alert('Erro ao atualizar a máquina');
    }

    // Feche o modal após a submissão
    $('#editMachineModal').modal('hide');
  };
}






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
      case 'Pendente':
        badge.classList.add('badge-warning'); // Amarelo
        break;
      default:
        badge.classList.add('badge-primary'); // Azul (ou outra cor padrão)
        break;
    }
  });
});

