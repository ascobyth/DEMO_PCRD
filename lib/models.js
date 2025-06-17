// Import all models to ensure they're registered with Mongoose
try {
  // Only require models that actually exist
  require('../models/User');
} catch (error) {
  console.warn('User model not found:', error.message);
}

try {
  require('../models/Capability');
} catch (error) {
  console.warn('Capability model not found:', error.message);
}

try {
  require('../models/TestingMethod');
} catch (error) {
  console.warn('TestingMethod model not found:', error.message);
}

try {
  require('../models/Equipment');
} catch (error) {
  console.warn('Equipment model not found:', error.message);
}

try {
  require('../models/Location');
} catch (error) {
  console.warn('Location model not found:', error.message);
}

try {
  require('../models/RequestList');
} catch (error) {
  console.warn('RequestList model not found:', error.message);
}

try {
  require('../models/TestingSampleList');
} catch (error) {
  console.warn('TestingSampleList model not found:', error.message);
}

// Load additional models
try {
  require('../models/Io');
} catch (error) {
  console.warn('Io model not found:', error.message);
}

try {
  require('../models/SampleCommercial');
} catch (error) {
  console.warn('SampleCommercial model not found:', error.message);
}

try {
  require('../models/AppTech');
} catch (error) {
  console.warn('AppTech model not found:', error.message);
}

try {
  require('../models/PlantReactor');
} catch (error) {
  console.warn('PlantReactor model not found:', error.message);
}

try {
  require('../models/ErList');
} catch (error) {
  console.warn('ErList model not found:', error.message);
}

try {
  require('../models/AsrList');
} catch (error) {
  console.warn('AsrList model not found:', error.message);
}

// The rest of the models are commented out until they're confirmed to exist
/*
require('../models/ASRRequest');
require('../models/SmartAssistant');
require('../models/QueueManagement');
require('../models/Notification');
require('../models/ActivityLog');
*/

// Export a function that does nothing but ensures all models are loaded
module.exports = function ensureModelsLoaded() {
  // Models are loaded when this file is required
  return true;
};
