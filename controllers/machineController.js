const Machine = require('../models/machine');
const fs = require('fs');
const { Op } = require('sequelize');
const path = require('path');

exports.searchMachines = async (search, limit, offset) => {
    try {
        const { count, rows: machines } = await Machine.findAndCountAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { tags: { [Op.like]: `%${search}%` } }
                ]
            },
            limit,
            offset
        });

        return { machines, count };
    } catch (error) {
        console.error('Erro ao buscar as máquinas:', error);
        throw error;
    }
};

exports.listMachines = async (status) => {
    try {
        const whereClause = status ? { status } : {};
        const machines = await Machine.findAll({
            where: whereClause,
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
        const machine = await Machine.findByPk(id);

        if (!machine) {
            throw new Error('Máquina não encontrada');
        }

        if (machine.images && machine.images.length > 0) {
            machine.images.forEach(imagePath => {
                const filePath = path.join(__dirname, '../public', imagePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                } else {
                    console.warn(`Arquivo não encontrado para remoção: ${filePath}`);
                }
            });
        }

        await Machine.destroy({ where: { id } });
    } catch (err) {
        console.error('Erro ao deletar a máquina:', err);
        throw err;
    }
};

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

exports.updateMachine = async (id, updatedData, files, imagesToRemove) => {
    try {
        const machine = await Machine.findByPk(id);
        if (!machine) {
            throw new Error('Máquina não encontrada');
        }

        let currentImages = [];
        if (typeof machine.images === 'string') {
            currentImages = machine.images.split(',');
        } else if (Array.isArray(machine.images)) {
            currentImages = machine.images;
        }

        console.log('Imagens atuais:', currentImages);

        if (imagesToRemove && imagesToRemove.length > 0) {
            currentImages = currentImages.filter(image => !imagesToRemove.includes(image));
            console.log('Imagens após remoção:', currentImages);
        }

        const newImages = files ? files.map(file => `/uploads/${file.filename}`) : [];
        const updatedImages = currentImages.concat(newImages).join(',');

        await machine.update({
            ...updatedData,
            images: updatedImages,
            updatedAt: new Date()
        });

        return machine;
    } catch (error) {
        console.error('Erro ao atualizar a máquina:', error);
        throw error;
    }
};



exports.getDashboardStats = async () => {
    try {
        const pendingCount = await Machine.count({ where: { status: 'Em chamado' } });
        const maintenanceCount = await Machine.count({ where: { status: 'Em Manutenção' } });
        const inUseCount = await Machine.count({ where: { status: 'Em Uso' } });
        const inStockCount = await Machine.count({ where: { status: 'Em estoque' } });

        return {
            pendingCount,
            maintenanceCount,
            inUseCount,
            inStockCount,
            totalCount: pendingCount + maintenanceCount + inUseCount + inUseCount
        };
    } catch (err) {
        console.error('Erro ao obter estatísticas das máquinas:', err);
        throw err;
    }
};

