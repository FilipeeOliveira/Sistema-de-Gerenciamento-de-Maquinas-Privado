const Machine = require('../models/machine');
const MachineDetail = require('../models/machineDetails');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { Op } = require('sequelize');


exports.searchAndFilterMachines = async (search, status, limit, offset) => {
    try {
        const whereClause = status ? { status } : {};
        const { count, rows: machines } = await Machine.findAndCountAll({
            where: {
                [Op.and]: [
                    whereClause,
                    {
                        [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { tags: { [Op.like]: `%${search}%` } }
                        ]
                    }
                ]
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return { machines, count };
    } catch (error) {
        console.error('Erro ao buscar e filtrar máquinas:', error);
        throw error;
    }
};

//DEIXEI COMENTADO PARA CASO TENHA UM BUG NO SISTEMA DE MAQUINAS
/* exports.listMachines = async (status) => {
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
}; */

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
            totalCount: pendingCount + maintenanceCount + inUseCount + inUseCount + inStockCount
        };
    } catch (err) {
        console.error('Erro ao obter estatísticas das máquinas:', err);
        throw err;
    }
};

exports.updateMachineStatus = async (id, status, res) => {
    try {
        const machine = await Machine.findByPk(id);
        if (!machine) {
            throw new Error('Máquina não encontrada');
        }

        console.log(`Atualizando o status da máquina com ID: ${id} para: ${status}`);
        await machine.update({ status });
        console.log(`Status da máquina atualizado para: ${status}`);

        if (status === 'Em chamado') {
            console.log('Gerando documento para o status "Em chamado"');
            const documentBuffer = await exports.generateDocument(machine);
            return documentBuffer;
        }
    } catch (error) {
        console.error('Erro ao atualizar o status da máquina:', error);
        throw error;
    }
};



exports.generateDocument = async (machine) => {
    try {
        const data = {
            client: machine.client,
            tags: machine.tags,
            description: machine.description
        };

        const templatePath = path.join(__dirname, '../docs/ModeloParaAssinatura.docx');
        if (!fs.existsSync(templatePath)) {
            throw new Error('Template de documento não encontrado');
        }

        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip);

        doc.setData(data);
        doc.render();

        return doc.getZip().generate({ type: 'nodebuffer' });
    } catch (error) {
        console.error('Erro ao gerar documento:', error);
        throw error;
    }
};

exports.updateAdditionalDetails = async (id, description, parts, quantity, value, files) => {
    try {
        const images = files.map(file => file.path);

        const totalValue = value.reduce((acc, curr) => acc + parseFloat(curr), 0);

        const machineDetail = await MachineDetail.create({
            description,
            parts: parts.map((part, index) => ({
                name: part,
                quantity: quantity[index],
                value: value[index]
            })),
            images,
            totalValue,
            machineId: id,
        });

        return machineDetail;
    } catch (error) {
        console.error('Erro ao salvar os detalhes adicionais:', error);
        throw error;
    }
};





