// Export all models from this file
const { User, Role } = require('./User');
const Capability = require('./Capability');
const TestingMethod = require('./TestingMethod');
const Equipment = require('./Equipment');
const Location = require('./Location');
const Io = require('./Io');
const RequestList = require('./RequestList');
const TestingSample = require('./TestingSample');
const SampleCommercial = require('./SampleCommercial');
const AppTech = require('./AppTech');
const PlantReactor = require('./PlantReactor');
const ErList = require('./ErList');
const TestingERList = require('./TestingERList');
const AsrList = require('./AsrList');
const TestingSampleList = require('./TestingSampleList');
const SampleSet = require('./SampleSet');
const Notification = require('./Notification');

module.exports = {
  User,
  Role,
  Capability,
  TestingMethod,
  Equipment,
  Location,
  Io,
  RequestList,
  TestingSample,
  TestingSampleList,
  SampleCommercial,
  AppTech,
  PlantReactor,
  ErList,
  TestingERList,
  AsrList,
  SampleSet,
  Notification
};
