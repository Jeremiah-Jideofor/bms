const prisma = require('../config/prisma');

/**
 * Logs an action to the audit log.
 * @param {number|null} userId - ID of the user performing the action (null for system actions)
 * @param {string} action - Action performed (e.g., 'CREATE', 'DELETE', 'LOGIN')
 * @param {string} entity - Entity affected (e.g., 'SALE', 'PRODUCT', 'USER')
 * @param {number|null} entityId - ID of the entity affected
 * @param {string} status - Status of the action ('SUCCESS' or 'FAILED')
 * @param {string|null} message - Optional message describing the action
 */
const logAction = async (userId, action, entity, entityId = null, status = 'SUCCESS', message = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        status,
        message,
      },
    });
  } catch (error) {
    // Log audit logging errors to console but don't throw to avoid breaking main flow
    console.error('Failed to log audit action:', error.message);
  }
};

module.exports = { logAction };