module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('machine_details', 'MachineDetails');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('MachineDetails', 'Machine_details');
  }
};
