var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MedicalRecords = artifacts.require("./MedicalRecords.sol");
var Users = artifacts.require("./Users.sol");


module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Users);
  await deployer.deploy(SimpleStorage);
  await deployer.deploy(MedicalRecords);
};
