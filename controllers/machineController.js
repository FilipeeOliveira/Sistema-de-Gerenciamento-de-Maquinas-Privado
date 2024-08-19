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
            where: { machineId: machineId },
            order: [['createdAt', 'DESC']]
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
            where: { machineId },
            order: [['createdAt', 'DESC']]
        });

        documents.forEach(document => {
            if (document.documents) {
                document.documents = document.documents.replace(/^\/documents\//, '');
            }
            if (document.doc2) {
                document.doc2 = document.doc2.replace(/^\/documents\//, '');
            }
            if (document.images) {
                document.images = document.images.map(imagem => imagem.replace(/^\/evidence\//, ''));
            }
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
        console.log(`Iniciando a exclusão da máquina com ID: ${id}`);

        const machine = await Machine.findByPk(id);
        const machineDetails = await MachineDetail.findAll({ where: { machineId: id } });

        if (machine) {
            const deleteFile = (filePath) => {
                console.log(`Tentando remover arquivo: ${filePath}`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Arquivo removido: ${filePath}`);
                } else {
                    console.warn(`Arquivo não encontrado para remoção: ${filePath}`);
                }
            };

            if (machine.images) {
                const images = Array.isArray(machine.images) ? machine.images : machine.images.split(',');
                images.forEach(imagePath => {
                    const fullPath = imagePath.startsWith('C:') ? imagePath : path.join(__dirname, '../public/uploads', path.basename(imagePath.trim()));
                    deleteFile(fullPath);
                });
            }

            await MachineLog.destroy({ where: { machineId: id } });
            console.log(`Logs da máquina com ID ${id} removidos.`);

            if (machineDetails.length > 0) {
                console.log(`Detalhes da máquina encontrados. Processando exclusão de arquivos.`);

                const processedFiles = new Set();

                for (const machineDetail of machineDetails) {

                    if (machineDetail.images) {
                        const evidences = Array.isArray(machineDetail.images) ? machineDetail.images : machineDetail.images.split(',');
                        evidences.forEach(evidencePath => {
                            const fullPath = evidencePath.startsWith('C:') ? evidencePath : path.join(__dirname, '../public/evidence', path.basename(evidencePath.trim()));
                            deleteFile(fullPath);
                        });
                    }

                    if (machineDetail.documents) {
                        const documents = machineDetail.documents.split(',');
                        documents.forEach(docPath => {
                            const fullPath = docPath.startsWith('C:') ? docPath : path.join(__dirname, '../public/documents', path.basename(docPath.trim()));
                            deleteFile(fullPath);
                        });
                    }

                    if (machineDetail.docDevolution) {
                        const documentsDev = machineDetail.docDevolution.split(',');
                        documentsDev.forEach(docPath => {
                            const fullPath = docPath.startsWith('C:') ? docPath : path.join(__dirname, '../public/documents/devolution', path.basename(docPath.trim()));

                            if (!processedFiles.has(fullPath)) {
                                deleteFile(fullPath);
                                processedFiles.add(fullPath);
                            } else {
                                console.warn(`Arquivo já processado anteriormente: ${fullPath}`);
                            }
                        });
                    }

                    if (machineDetail.docOrder) {
                        const docOrderPath = machineDetail.docOrder.startsWith('C:') ? machineDetail.docOrder : path.join(__dirname, '../public/documents/orders', path.basename(machineDetail.docOrder.trim()));
                        deleteFile(docOrderPath);
                    }
                }

                await MachineDetail.destroy({ where: { machineId: id } });
                console.log(`Detalhes da máquina com ID ${id} removidos.`);
            } else {
                console.log(`Nenhum detalhe encontrado para a máquina com ID ${id}.`);
            }

            await Machine.destroy({ where: { id } });
            console.log('Máquina removida com sucesso.');
        } else {
            console.warn(`Máquina com ID ${id} não encontrada.`);
        }
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
            parts: parts.map((part, index) => ({
                part: part.trim(),
                quantity: parseInt(quantity[index], 10),
                value: parseFloat(value[index]).toFixed(2)
            })),
            totalValue: parseFloat(totalValue).toFixed(2)
        };
        const templatePath = path.join(__dirname, '../docs/OrdemDeServiço.docx');
        if (!fs.existsSync(templatePath)) {
            throw new Error('Template de documento não encontrado');
        }
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip);
        doc.setData(data);

        try {
            doc.render();
        } catch (renderError) {
            console.error('Erro ao renderizar documento:', renderError);
            throw renderError;
        }

        const fileName = `OrdemServico_${id}_${Date.now()}.docx`;
        const outputFilePath = path.join(__dirname, '../public/documents/orders', fileName);
        const buffer = doc.getZip().generate({ type: 'nodebuffer' });
        fs.writeFileSync(outputFilePath, buffer);

        const relativePath = path.relative(path.join(__dirname, '../public'), outputFilePath).replace(/\\/g, '/');
        return relativePath;
    } catch (error) {
        console.error('Erro ao gerar documento de ordem de serviço:', error);
        throw error;
    }
};

exports.updateAdditionalDetails = async (id, description, parts, quantity, value, images, document, totalValue, docOrder) => {
    try {
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

        const adjustedImages = images.map(image =>
            image.startsWith('/evidence/') ? image : `/evidence/${path.basename(image)}`
        );
        const adjustedDocument = document
            ? (document.startsWith('/documents/') ? document : `/documents/${path.basename(document)}`)
            : null;

        console.log('Caminhos ajustados das imagens:', adjustedImages);
        console.log('Caminho ajustado do documento:', adjustedDocument);
        console.log('Caminho do documento de ordem de serviço:', docOrder);

        const [machineDetail, created] = await MachineDetail.upsert({
            description,
            parts: parts.map((part, index) => ({
                name: part,
                quantity: quantity[index],
                value: value[index]
            })),
            images: adjustedImages,
            documents: adjustedDocument,
            totalValue: parseFloat(totalValue) || 0,
            machineId: id,
            docOrder
        });

        return machineDetail;
    } catch (error) {
        console.error('Erro ao salvar os detalhes adicionais:', error);
        throw error;
    }
};

exports.updateDevolutionDocument = async (document) => {
    try {
        // Encontrar o último registro na tabela MachineDetails
        const machineDetail = await MachineDetail.findOne({
            order: [['id', 'DESC']]
        });

        if (!machineDetail) {
            throw new Error('Nenhum detalhe de máquina encontrado.');
        }


        if (typeof document !== 'string' || document.trim() === '') {
            throw new Error('Caminho do documento de devolução inválido.');
        }

        machineDetail.docDevolution = document;
        await machineDetail.save();

        return machineDetail;
    } catch (error) {
        console.error('Erro ao atualizar o documento de devolução:', error);
        throw error;
    }
};
;


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















