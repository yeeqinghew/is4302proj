var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MedicalRecords = artifacts.require("./MedicalRecords.sol");
var Users = artifacts.require('./Users.sol');

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage)
    .then(() => {
      return deployer.deploy(MedicalRecords);
    })
    .then(() => {
      return deployer.deploy(Users);
    });;
};
