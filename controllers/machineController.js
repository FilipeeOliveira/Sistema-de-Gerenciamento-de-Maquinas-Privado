// Exemplo de machineController.js

const Machine = require('../models/machine');

exports.listMachines = async () => {
    try {
        const machines = await Machine.findAll();
        return machines;
    } catch (err) {
        console.error('Error fetching machines:', err);
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
        console.error('Error updating machine:', error);
        throw error;
    }
};
