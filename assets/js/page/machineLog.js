document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada e script iniciado.');
  
    const dateFilterForm = document.getElementById('dateFilterForm');
  
    if (!dateFilterForm) {
      console.error('Formulário não encontrado.');
      return;
    }
  
    console.log('Formulário encontrado.');
  
    dateFilterForm.addEventListener('submit', function(event) {
      const startDateInput = document.getElementById('startDate').value;
      const endDateInput = document.getElementById('endDate').value;
  
      if (!startDateInput || !endDateInput) {
        console.error('Datas de início e fim são obrigatórias.');
        event.preventDefault();
        return;
      }
  
      console.log(`Filtrando logs de ${startDateInput} até ${endDateInput}.`);
    });
  });
  
const startDate = new Date(req.query.startDate);
const endDate = new Date(req.query.endDate);

// Ajustar endDate para o final do dia
endDate.setHours(23, 59, 59, 999);

const logs = await MachineLog.findAll({
    where: {
        machineId: req.params.id,
        changeDate: {
            [Op.between]: [startDate, endDate]
        }
    },
    order: [['changeDate', 'DESC']]
});