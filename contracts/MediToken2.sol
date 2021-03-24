//pragma solidity ^0.5.0;

contract MediToken2{

    // MediToken events

    // MediToken modifiers

    // MediToken functions

    // function to mint tokens to address
    function mint(int tokens, address receiver) public {}

    // function to obtain minter allowance of an address (shenmeyisi)
    function minterAllowance(address minter) public {}

    // function to see if address is a minter
    function isMinter(address user) public {}

    // function to obtain allowance for an address
    function allowance(address user) public {}

    // function to see the total supply of tokens
    function totalSupply() public {}

    // function to see token balance of address
    function balanceOf(address user) public {}

    // function to approve address to spend specified amount of tokens
    function approve(address sender, int tokens) public {}

    // function to transfer tokens from one address to another
    function transferFrom(address sender, address receiver, int tokens) public {}

    // function to transfer tokens from msg.sender to address
    function transfer(address receiver, int tokens) public {}

    // function to add a new minter
    function configureMinter(address minter) public {}

    // function to remove a minter
    function removeMinter(address minter) public {}

    // function to allow minter to burn tokens
    function burn(address user, int tokens) public {}

    // function to destroy funds from a blacklisted address
    function destroyBlackFunds(address user) public {}

    // function to update master minter
    function updateMasterMinter(address minter) public {}
}