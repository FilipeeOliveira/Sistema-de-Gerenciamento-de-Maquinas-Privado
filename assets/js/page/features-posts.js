"use strict";

$("[data-checkboxes]").each(function() {
  var me = $(this),
    group = me.data('checkboxes'),
    role = me.data('checkbox-role');

  me.change(function() {
    var all = $('[data-checkboxes="' + group + '"]:not([data-checkbox-role="dad"])'),
      checked = $('[data-checkboxes="' + group + '"]:not([data-checkbox-role="dad"]):checked'),
      dad = $('[data-checkboxes="' + group + '"][data-checkbox-role="dad"]'),
      total = all.length,
      checked_length = checked.length;

    if(role == 'dad') {
      if(me.is(':checked')) {
        all.prop('checked', true);
      }else{
        all.prop('checked', false);
      }
    }else{
      if(checked_length >= total) {
        dad.prop('checked', true);
      }else{
        dad.prop('checked', false);
      }
    }
  });
});

//modal
function editMachine(id, name, tags, client, status, description) {
  document.getElementById('editName').value = name;
  document.getElementById('editTags').value = tags;
  document.getElementById('editClient').value = client;
  document.getElementById('editStatus').value = status;
  document.getElementById('editDescription').value = description;

  document.getElementById('editMachineForm').onsubmit = async function(e) {
    e.preventDefault();
    const updatedMachine = {
      name: document.getElementById('editName').value,
      tags: document.getElementById('editTags').value,
      client: document.getElementById('editClient').value,
      status: document.getElementById('editStatus').value,
      description: document.getElementById('editDescription').value
    };

    try {
      const response = await fetch(`/machines/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedMachine)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        alert('Máquina atualizada com sucesso')
        location.reload();
        // Atualize a interface do usuário, se necessário
      } else {
        console.error('Erro ao atualizar a máquina');
        alert('Erro ao atualizar a máquina')
      }
    } catch (error) {
      console.error('Erro ao atualizar a máquina', error);
    }

    // Feche o modal após a submissão
    $('#editMachineModal').modal('hide');
  };
}


