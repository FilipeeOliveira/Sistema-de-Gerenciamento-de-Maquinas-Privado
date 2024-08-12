const Machine = require('../models/machine');
const MachineDetail = require('../models/machineDetails');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { Op } = require('sequelize');
const MachineLog = require('../models/MachineLog');

exports.getDocumentsByMachineId = async (machineId) => {
    try {
        const documents = await MachineDetail.findAll({
            where: { machineId: machineId }
        });
        return documents;
    } catch (error) {
        throw new Error('Erro ao obter documentos: ' + error.message);
    }
};

exports.getDocumentsTable = async (req, res) => {
    const { machineId } = req.params;

    try {
        const documents = await MachineDetail.findAll({
            where: { machineId }
        });

        documents.forEach(document => {
            if (document.documents) {
                document.documents = document.documents.replace(/^\/documents\//, '');
            }
            if (document.doc2) {
                document.doc2 = document.doc2.replace(/^\/documents\//, '');
            }
            console.log('Caminho para download:', `/machines/documents/${document.documents}`);
        });

        res.render('pages/tableDocuments', {
            title: 'Tabela de Documentos',
            site_name: 'Geral - Conservação e Limpeza',
            version: '1.0',
            year: new Date().getFullYear(),
            machineId: machineId,
            documents: documents || []
        });
    } catch (error) {
        console.error('Erro ao obter documentos:', error);
        res.status(500).send('Erro interno do servidor');
    }
};

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

exports.deleteMachine = async (id) => {
    try {
        const machine = await Machine.findByPk(id);

        if (!machine) {
            throw new Error('Máquina não encontrada');
        }

        await MachineLog.destroy({ where: { machineId: id } });

        const machineDetail = await MachineDetail.findOne({ where: { machineId: id } });

        if (machine.images) {
            const images = Array.isArray(machine.images) ? machine.images : (typeof machine.images === 'string' ? machine.images.split(',') : []);
            images.forEach(imagePath => {
                const filePath = path.join(__dirname, '../public', imagePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                } else {
                    console.warn(`Imagem não encontrada para remoção: ${filePath}`);
                }
            });
        }

        if (machineDetail) {
            if (machineDetail.documents) {
                const documents = typeof machineDetail.documents === 'string' ? machineDetail.documents.split(',') : [];
                documents.forEach(docPath => {
                    const fullPath = path.join(__dirname, '../public', docPath.trim());
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    } else {
                        console.warn(`Documento não encontrado para remoção: ${fullPath}`);
                    }
                });
            }

            if (machineDetail.docDevolution) {
                const docDevolutionPaths = typeof machineDetail.docDevolution === 'string' ? machineDetail.docDevolution.split(',') : [];
                docDevolutionPaths.forEach(docPath => {
                    const fullPath = path.join(__dirname, '../public', docPath.trim());
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    } else {
                        console.warn(`Documento de devolução não encontrado para remoção: ${fullPath}`);
                    }
                });
            }

            if (machineDetail && machineDetail.images) {
                const evidences = Array.isArray(machineDetail.images) ? machineDetail.images : (typeof machineDetail.images === 'string' ? machineDetail.images.split(',') : []);
                evidences.forEach(evidencePath => {
                    const fullPath = path.join(__dirname, '../public/evidence', path.basename(evidencePath.trim()));
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    } else {
                        console.warn(`Evidência não encontrada para remoção: ${fullPath}`);
                    }
                });
            }

            await MachineDetail.destroy({ where: { machineId: id } });
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

        const previousStatus = machine.status;
        const newStatus = updatedData.status;

        if (previousStatus !== newStatus) {
            await MachineLog.create({
                machineId: id,
                previousStatus: previousStatus,
                newStatus: newStatus,
                changeDate: new Date()
            });
        }

        let currentImages = [];
        if (typeof machine.images === 'string') {
            currentImages = machine.images.split(',');
        } else if (Array.isArray(machine.images)) {
            currentImages = machine.images;
        }

        console.log('Imagens atuais:', currentImages);

        if (imagesToRemove && imagesToRemove.length > 0) {
            imagesToRemove.forEach(imagePath => {
                const fullImagePath = path.join(__dirname, '..', 'public', imagePath);

                if (fs.existsSync(fullImagePath)) {
                    fs.unlinkSync(fullImagePath);
                    console.log(`Imagem removida do servidor: ${fullImagePath}`);
                }
            });

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

exports.generateDocument = async (machine) => {
    try {
        const data = {
            client: machine.client,
            tags: machine.tags,
            description: machine.name
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

exports.generateOtherDocument = async (machine) => {
    try {
        const data = {
            client: machine.client,
            tags: machine.tags,
            description: machine.description
        };

        const templatePath = path.join(__dirname, '../docs/ModeloParaAssinaturaDev.docx');
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

// No controlador `machineController.js`
exports.generateOrderDocument = async (id, description, parts, quantity, value, totalValue) => {
    try {
        const machine = await Machine.findByPk(id);
        if (!machine) {
            throw new Error('Máquina não encontrada');
        }

        const date = new Date();
        const data = {
            client: machine.client,
            date: date.toLocaleDateString(),
            name: machine.name,
            tag: machine.tags,
            description: description,
            parts: parts,
            quantity: quantity,
            value: value,
            totalValue: totalValue
        };

        const templatePath = path.join(__dirname, '../docs/OrdemDeServiço.docx');
        if (!fs.existsSync(templatePath)) {
            throw new Error('Template de documento não encontrado');
        }

        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip);

        doc.setData(data);
        doc.render();

        const outputFilePath = path.join(__dirname, '../public/documents/orders', `OrdemServico_${id}_${Date.now()}.docx`);
        const buffer = doc.getZip().generate({ type: 'nodebuffer' });
        fs.writeFileSync(outputFilePath, buffer);

        await MachineDetail.update(
            { ordemDeServico: outputFilePath },
            { where: { machineId: id } }
        );

        return outputFilePath;
    } catch (error) {
        console.error('Erro ao gerar documento de ordem de serviço:', error);
        throw error;
    }
};



exports.updateAdditionalDetails = async (id, description, parts, quantity, value, images, document, totalValue) => {
    try {
        // Verificar se partes, quantidades e valores são arrays e têm o mesmo comprimento
        if (!Array.isArray(parts) || !Array.isArray(quantity) || !Array.isArray(value)) {
            throw new Error('As partes, quantidades e valores devem ser arrays.');
        }

        if (parts.length !== quantity.length || parts.length !== value.length) {
            throw new Error('As arrays de partes, quantidades e valores devem ter o mesmo comprimento.');
        }

        console.log('Dados recebidos no back-end:');
        console.log('Partes:', parts);
        console.log('Quantidades:', quantity);
        console.log('Valores:', value);
        console.log('Valor total recebido:', totalValue);

        // Ajustar caminhos das imagens e do documento
        const adjustedImages = images.map(image =>
            image.startsWith('/evidence/') ? image : `/evidence/${path.basename(image)}`
        );
        const adjustedDocument = document
            ? (document.startsWith('/documents/') ? document : `/documents/${path.basename(document)}`)
            : null;

        console.log('Caminhos ajustados das imagens:', adjustedImages);
        console.log('Caminho ajustado do documento:', adjustedDocument);

        // Criar o registro de detalhes adicionais
        const machineDetail = await MachineDetail.create({
            description,
            parts: parts.map((part, index) => ({
                name: part,
                quantity: quantity[index],
                value: value[index]
            })),
            images: adjustedImages,
            documents: adjustedDocument,
            totalValue: parseFloat(totalValue) || 0, // Garantir que o valor seja numérico
            machineId: id
        });

        return machineDetail;
    } catch (error) {
        console.error('Erro ao salvar os detalhes adicionais:', error);
        throw error;
    }
};



exports.updateDevolutionDocument = async (id, document) => {
    try {
        // Encontra os detalhes existentes da máquina
        const machineDetail = await MachineDetail.findOne({ where: { machineId: id } });

        if (!machineDetail) {
            // Se não encontrar, retorne um erro
            throw new Error('Detalhes da máquina não encontrados.');
        }

        // Atualiza o campo docDevolution
        machineDetail.docDevolution = document;
        await machineDetail.save();

        return machineDetail;
    } catch (error) {
        console.error('Erro ao atualizar o documento de devolução:', error);
        throw error;
    }
};

exports.getMachineLogsPage = async (req, res) => {
    try {
        const machineId = req.params.id;
        const { startDate, endDate } = req.query;

        const whereClause = { machineId };

        if (startDate && endDate) {
            whereClause.changeDate = {
                [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))]
            };
        }

        const logs = await MachineLog.findAll({
            where: whereClause,
            order: [['changeDate', 'DESC']]
        });

        res.render('pages/machinesLog', {
            machineId,
            logs,
            title: 'Logs de Máquinas',
            site_name: 'Geral - Conservação e Limpeza',
            year: new Date().getFullYear(),
            version: '1.0'
        });
    } catch (err) {
        console.error('Erro ao obter logs da máquina:', err);
        res.status(500).send('Erro ao obter logs da máquina');
    }
};

exports.getDashboardStats = async () => {
    try {
        const pendingCount = await Machine.count({ where: { status: 'Em chamado' } });
        const maintenanceCount = await Machine.count({ where: { status: 'Em Manutenção' } });
        const inUseCount = await Machine.count({ where: { status: 'Em Uso' } });
        const inStockCount = await Machine.count({ where: { status: 'Em estoque' } });
        const onHoldCount = await Machine.count({ where: { status: 'Em espera' } });

        return {
            pendingCount,
            maintenanceCount,
            inUseCount,
            inStockCount,
            onHoldCount,
            totalCount: pendingCount + maintenanceCount + inUseCount + inStockCount + onHoldCount
        };
    } catch (err) {
        console.error('Erro ao obter estatísticas das máquinas:', err);
        throw err;
    }
};


exports.editMachine = async (req, res) => {
    try {
        const machineId = req.params.id;
        const machine = await Machine.findByPk(machineId);

        if (!machine) {
            return res.status(404).json({ message: 'Máquina não encontrada' });
        }

        res.render('editMachine', {
            machine
        });
    } catch (error) {
        console.error('Erro ao buscar máquina:', error);
        res.status(500).json({ message: 'Erro ao buscar máquina', error: error.message });
    }
};















