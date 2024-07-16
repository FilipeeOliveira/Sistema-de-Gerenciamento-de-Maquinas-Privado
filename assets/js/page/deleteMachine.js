document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.delete-machine').forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const machineId = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja deletar esta máquina?')) {
                fetch(`/machines/delete/${machineId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => { throw new Error(err.message); });
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            const row = document.getElementById(`machine-row-${machineId}`);
                            if (row) {
                                row.remove();
                            }
                        } else {
                            alert('Erro ao deletar a máquina.');
                        }
                    })
                    .catch(error => console.error('Error:', error));
            }
        });
    });
});