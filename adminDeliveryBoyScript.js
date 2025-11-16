#!/usr/bin/env node

/**
 * Admin Script: Approve Delivery Boys
 * 
 * This script provides utilities for admin to:
 * - List pending delivery boys waiting for approval
 * - Approve/reject delivery boys
 * - View delivery boy details
 * - Suspend/activate delivery boys
 * 
 * Usage:
 *   node adminDeliveryBoyScript.js list              # List pending approvals
 *   node adminDeliveryBoyScript.js approve <id>      # Approve delivery boy
 *   node adminDeliveryBoyScript.js reject <id>       # Reject delivery boy
 *   node adminDeliveryBoyScript.js suspend <id>      # Suspend delivery boy
 *   node adminDeliveryBoyScript.js activate <id>     # Activate delivery boy
 *   node adminDeliveryBoyScript.js details <id>      # View details
 */

const mongoose = require('mongoose');
const DeliveryBoy = require('./models/DeliveryBoy');
require('dotenv').config();

// Color-coded console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`),
  table: (data) => console.table(data)
};

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    log.success('Connected to MongoDB');
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

/**
 * List pending delivery boys
 */
async function listPendingApprovals() {
  log.header('Pending Delivery Boy Approvals');

  try {
    const pending = await DeliveryBoy.find({ isApproved: false })
      .select('firstName lastName email phone status createdAt isVerified license.number vehicle.type')
      .sort({ createdAt: -1 });

    if (pending.length === 0) {
      log.info('No pending approvals');
      return;
    }

    console.log('\n');
    const data = pending.map((boy, idx) => ({
      '#': idx + 1,
      'Name': `${boy.firstName} ${boy.lastName}`,
      'Email': boy.email,
      'Phone': boy.phone,
      'License': boy.license?.number || 'N/A',
      'Vehicle': boy.vehicle?.type || 'N/A',
      'Status': boy.status,
      'Verified': boy.isVerified ? '✓' : '✗',
      'Registered': new Date(boy.createdAt).toLocaleDateString(),
      'ID': boy._id.toString()
    }));

    log.table(data);
    console.log(`\nTotal pending: ${pending.length}`);
  } catch (error) {
    log.error(`Failed to list pending: ${error.message}`);
  }
}

/**
 * Approve a delivery boy
 */
async function approveDeliveryBoy(id) {
  log.header(`Approving Delivery Boy: ${id}`);

  try {
    const boy = await DeliveryBoy.findByIdAndUpdate(
      id,
      { 
        isApproved: true, 
        isVerified: true,
        status: 'active'
      },
      { new: true }
    );

    if (!boy) {
      log.error('Delivery boy not found');
      return;
    }

    log.success(`Approved: ${boy.firstName} ${boy.lastName}`);
    log.info(`Email: ${boy.email}`);
    log.info(`Status: ${boy.status}`);
    log.info(`Can now login and accept orders`);
  } catch (error) {
    log.error(`Approval failed: ${error.message}`);
  }
}

/**
 * Reject a delivery boy
 */
async function rejectDeliveryBoy(id) {
  log.header(`Rejecting Delivery Boy: ${id}`);

  try {
    const boy = await DeliveryBoy.findByIdAndRemove(id);

    if (!boy) {
      log.error('Delivery boy not found');
      return;
    }

    log.success(`Rejected and removed: ${boy.firstName} ${boy.lastName}`);
    log.info(`Email: ${boy.email}`);
  } catch (error) {
    // findByIdAndRemove is deprecated, use deleteOne instead
    try {
      const boy = await DeliveryBoy.findById(id);
      if (!boy) {
        log.error('Delivery boy not found');
        return;
      }
      await DeliveryBoy.deleteOne({ _id: id });
      log.success(`Rejected and removed: ${boy.firstName} ${boy.lastName}`);
    } catch (err) {
      log.error(`Rejection failed: ${err.message}`);
    }
  }
}

/**
 * Suspend a delivery boy
 */
async function suspendDeliveryBoy(id) {
  log.header(`Suspending Delivery Boy: ${id}`);

  try {
    const boy = await DeliveryBoy.findByIdAndUpdate(
      id,
      { status: 'suspended' },
      { new: true }
    );

    if (!boy) {
      log.error('Delivery boy not found');
      return;
    }

    log.success(`Suspended: ${boy.firstName} ${boy.lastName}`);
    log.warning(`Account is now suspended and cannot login`);
  } catch (error) {
    log.error(`Suspension failed: ${error.message}`);
  }
}

/**
 * Activate a delivery boy
 */
async function activateDeliveryBoy(id) {
  log.header(`Activating Delivery Boy: ${id}`);

  try {
    const boy = await DeliveryBoy.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    );

    if (!boy) {
      log.error('Delivery boy not found');
      return;
    }

    log.success(`Activated: ${boy.firstName} ${boy.lastName}`);
    log.info(`Can now login and accept orders`);
  } catch (error) {
    log.error(`Activation failed: ${error.message}`);
  }
}

/**
 * View delivery boy details
 */
async function viewDetails(id) {
  log.header(`Delivery Boy Details: ${id}`);

  try {
    const boy = await DeliveryBoy.findById(id);

    if (!boy) {
      log.error('Delivery boy not found');
      return;
    }

    console.log(`
${colors.cyan}Personal Information${colors.reset}
  Name: ${boy.firstName} ${boy.lastName}
  Email: ${boy.email}
  Phone: ${boy.phone}

${colors.cyan}License & Vehicle${colors.reset}
  License Number: ${boy.license?.number || 'N/A'}
  License Expiry: ${boy.license?.expiryDate ? new Date(boy.license.expiryDate).toLocaleDateString() : 'N/A'}
  Vehicle Type: ${boy.vehicle?.type || 'N/A'}
  Registration: ${boy.vehicle?.registrationNumber || 'N/A'}
  Model: ${boy.vehicle?.model || 'N/A'}

${colors.cyan}Account Status${colors.reset}
  Status: ${boy.status}
  Approved: ${boy.isApproved ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}
  Verified: ${boy.isVerified ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}
  Registered: ${new Date(boy.createdAt).toLocaleString()}
  Last Active: ${boy.lastActive ? new Date(boy.lastActive).toLocaleString() : 'Never'}

${colors.cyan}Performance Stats${colors.reset}
  Total Deliveries: ${boy.totalDeliveries || 0}
  Completed: ${boy.completedDeliveries || 0}
  Rating: ${boy.rating || 0} ⭐
  Avg Delivery Time: ${boy.averageDeliveryTime || 0} mins

${colors.cyan}Address${colors.reset}
  ${boy.address?.street || 'N/A'}
  ${boy.address?.city || ''} ${boy.address?.state || ''} ${boy.address?.zipCode || ''}
    `);
  } catch (error) {
    log.error(`Failed to fetch details: ${error.message}`);
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
${colors.cyan}Delivery Boy Admin Script${colors.reset}
${colors.yellow}Usage:${colors.reset}
  node adminDeliveryBoyScript.js <command> [options]

${colors.yellow}Commands:${colors.reset}
  list                    List pending delivery boy approvals
  approve <id>            Approve a delivery boy by ID
  reject <id>             Reject and remove a delivery boy
  suspend <id>            Suspend a delivery boy account
  activate <id>           Activate a suspended delivery boy
  details <id>            View full details of a delivery boy
  help                    Show this help message

${colors.yellow}Examples:${colors.reset}
  node adminDeliveryBoyScript.js list
  node adminDeliveryBoyScript.js approve 507f1f77bcf86cd799439011
  node adminDeliveryBoyScript.js suspend 507f1f77bcf86cd799439012
  node adminDeliveryBoyScript.js details 507f1f77bcf86cd799439013

${colors.yellow}Notes:${colors.reset}
  - Delivery boys must be approved before they can login
  - Only approved delivery boys can access the delivery APIs
  - Suspended delivery boys cannot login or accept orders
  `);
}

/**
 * Main handler
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const id = args[1];

  if (!command || command === 'help') {
    showHelp();
    process.exit(0);
  }

  // Connect to DB
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  // Execute command
  switch (command) {
    case 'list':
      await listPendingApprovals();
      break;
    case 'approve':
      if (!id) {
        log.error('Please provide delivery boy ID');
        showHelp();
      } else {
        await approveDeliveryBoy(id);
      }
      break;
    case 'reject':
      if (!id) {
        log.error('Please provide delivery boy ID');
        showHelp();
      } else {
        await rejectDeliveryBoy(id);
      }
      break;
    case 'suspend':
      if (!id) {
        log.error('Please provide delivery boy ID');
        showHelp();
      } else {
        await suspendDeliveryBoy(id);
      }
      break;
    case 'activate':
      if (!id) {
        log.error('Please provide delivery boy ID');
        showHelp();
      } else {
        await activateDeliveryBoy(id);
      }
      break;
    case 'details':
      if (!id) {
        log.error('Please provide delivery boy ID');
        showHelp();
      } else {
        await viewDetails(id);
      }
      break;
    default:
      log.error(`Unknown command: ${command}`);
      showHelp();
  }

  // Close connection
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
