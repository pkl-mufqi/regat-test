'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Issues', {
      issueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      policyId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issueLink: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      labels: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      workarounds: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await queryInterface.createTable('Workarounds', {
      workaroundId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      issueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      actionName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jobTemplateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      jobTemplateName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      inventory: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      module_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      module_args: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      limit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      credential: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      parameters: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await queryInterface.createTable('WorkaroundParameters', {
      workaroundParameterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await queryInterface.createTable('Jobs', {
      lastJobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      alertId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actionName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Jobs');
    await queryInterface.dropTable('WorkaroundParameters');
    await queryInterface.dropTable('Workarounds');
    await queryInterface.dropTable('Issues');
  }
};
