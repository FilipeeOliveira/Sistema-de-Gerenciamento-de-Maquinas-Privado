const Machine = require('../models/machine');
const fs = require('fs');
const path = require('path');

// Função para listar máquinas
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

// Função para deletar máquina
exports.deleteMachine = async (id) => {
    try {
        await Machine.destroy({ where: { id } });
    } catch (err) {
        console.error('Erro ao deletar a máquina:', err);
        throw err;
    }
};

// Função para buscar dados da máquina
exports.getMachineById = async (id) => {
    try {
        const machine = await Machine.findByPk(id);
        if (machine) {
            return machine;
        } else {
            throw new Error('Máquina não encontrada');
        }
    } catch (error) {
        console.error('Erro ao buscar máquina:', error);
        throw error;
    }
};

// Função para atualizar dados da máquina
exports.updateMachine = async (id, updatedData, files) => {
    try {
        let updatedMachineData = { ...updatedData };

        if (files && files.length > 0) {
            const images = files.map(file => path.join('/uploads', file.filename));
            updatedMachineData.images = images.join(',');
        }

        const machine = await Machine.findByPk(id);
        if (machine) {
            await machine.update(updatedMachineData);
            return machine;
        } else {
            throw new Error('Máquina não encontrada');
        }
    } catch (error) {
        console.error('Erro ao atualizar a máquina:', error);
        throw error;
    }
};
