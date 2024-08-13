document.addEventListener('DOMContentLoaded', () => {
  let machineIdToDelete = null;

  // Abre o modal de confirmação quando o botão de deletar é clicado
  document.querySelectorAll('.delete-machine').forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      machineIdToDelete = this.getAttribute('data-id');
      $('#deleteConfirmationModal').modal('show');
    });
  });

  // Lida com a confirmação de exclusão no modal
  document.getElementById('confirmDeleteButton').addEventListener('click', async function () {
    if (machineIdToDelete) {
      try {
        const response = await fetch(`/machines/delete/${machineIdToDelete}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const row = document.getElementById(`machine-row-${machineIdToDelete}`);
          if (row) {
            row.remove();
            location.reload()
          }
          $('#deleteConfirmationModal').modal('hide');
        } else {
          const data = await response.json();
          alert('Erro ao deletar a máquina: ' + data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Erro ao deletar a máquina. Tente novamente.');
      }
    }
  });
});
