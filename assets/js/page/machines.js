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
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition && contentDisposition.includes('attachment')) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = contentDisposition.split('filename=')[1];
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          const result = await response.json();
          console.log(result.message);
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