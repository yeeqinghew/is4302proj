const SimpleStorage = artifacts.require("SimpleStorage");
const MedicalRecords = artifacts.require("MedicalRecords");
const Users = artifacts.require("Users");


module.exports = async function(deployer, network, accounts) {
  deployer.deploy(SimpleStorage, {from: accounts[0]})
  .then(() => SimpleStorage.deployed())
  .then(() => deployer.deploy(Users, {from: accounts[0]}))
  .then(() => Users.deployed())
  .then(() => deployer.deploy(MedicalRecords, Users.address, {from: accounts[1]}))
  .then(() => MedicalRecords.deployed())
};
