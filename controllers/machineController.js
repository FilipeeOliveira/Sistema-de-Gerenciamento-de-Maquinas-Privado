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
