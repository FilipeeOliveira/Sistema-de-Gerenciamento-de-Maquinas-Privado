const Machine = require('../models/machine');
const { Op } = require('sequelize');

exports.listMachines = async () => {
    try {
        const machines = await Machine.findAll({
            order: [['createdAt', 'DESC']] 
        });
        return machines;
    } catch (err) {
        console.error('Erro ao encontrar as máquinas:', err);
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

exports.updateMachine = async (id, updatedData) => {
    try {
        const machine = await Machine.findByPk(id);
        if (machine) {
            return await machine.update(updatedData);
        }
        return null;
    } catch (error) {
        console.error('Erro ao atualizar a máquina:', error);
        throw error;
    }
};

//estatisticas
exports.getDashboardStats = async () => {
    try {
        const pendingCount = await Machine.count({ where: { status: 'Pendente' } });
        const maintenanceCount = await Machine.count({ where: { status: 'Em Manutenção' } });
        const inUseCount = await Machine.count({ where: { status: 'Em Uso' } });

        return {
            pendingCount,
            maintenanceCount,
            inUseCount,
            totalCount: pendingCount + maintenanceCount + inUseCount
        };
    } catch (err) {
        console.error('Erro ao obter estatísticas das máquinas:', err);
        throw err;
    }
};

