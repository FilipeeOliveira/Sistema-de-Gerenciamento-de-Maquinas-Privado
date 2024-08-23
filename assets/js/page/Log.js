document.addEventListener('DOMContentLoaded', () => {
  console.log('Página carregada e script iniciado.');

  const dateFilterForm = document.getElementById('dateFilterForm');

  if (!dateFilterForm) {
    console.error('Formulário não encontrado.');
    return;
  }

  console.log('Formulário encontrado.');

  dateFilterForm.addEventListener('submit', function (event) {
    const startDateInput = document.getElementById('startDate')?.value;
    const endDateInput = document.getElementById('endDate')?.value;

    if (!startDateInput || !endDateInput) {
      console.error('Datas de início e fim são obrigatórias.');
      event.preventDefault();
      return;
    }

    // Verifica se as datas são válidas
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Datas fornecidas são inválidas.');
      event.preventDefault();
      return;
    }

    console.log(`Filtrando logs de ${startDateInput} até ${endDateInput}.`);
  });
});
