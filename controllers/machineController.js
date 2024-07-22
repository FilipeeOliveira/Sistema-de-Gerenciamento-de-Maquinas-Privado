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
exports.updateMachine = async (id, updatedData, files, imagesToRemove) => {
    try {
        let updatedMachineData = { ...updatedData };

        const machine = await Machine.findByPk(id);
        if (!machine) {
            throw new Error('Máquina não encontrada');
        }

        // Atualizar lista de imagens
        let currentImages = machine.images ? machine.images.split(',') : [];
        if (imagesToRemove && imagesToRemove.length > 0) {
            imagesToRemove = imagesToRemove.split(',');
            imagesToRemove.forEach(imagePath => {
                const decodedPath = decodeURIComponent(imagePath);
                const filePath = path.join(__dirname, '../public', decodedPath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                } else {
                    console.warn(`Arquivo não encontrado para remoção: ${filePath}`);
                }
                currentImages = currentImages.filter(img => img !== decodedPath);
            });
        }

        if (files && files.length > 0) {
            const newImages = files.map(file => path.join('/uploads', file.filename));
            currentImages = currentImages.concat(newImages);
        }

        updatedMachineData.images = currentImages.join(',');

        await machine.update(updatedMachineData);
        return machine;
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

