const Machine = require('../models/machine');

exports.listMachines = async () => {
    try {
        const machines = await Machine.findAll();
        return machines;
    } catch (err) {
        console.error('Error ao encontrar as máquinas:', err);
        throw err;
    }
};

exports.deleteMachine = async (id) => {
    try {
        await Machine.destroy({ where: { id } });
    } catch (err) {
        console.error('Erro ao deletar a máquina:', err);
        throw err;
    }
};
