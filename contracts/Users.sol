//pragma solidity ^0.5.0;

contract Users{

    // user structure

    // user events

    // user modifiers

    // user functions

    // function to register patient
    function registerPatient(address patient) public {}

    // function to register analyst
    function registerAnalyst(address analyst) public {}

    // function to register doctor
    function registerDoctor(address doctor) public {}

    // function to register healthcare provider
    function registerHealthcareProvider(address provider) public {}

    // function to register nurse
    function registerNurse(address nurse) public {}

    // function to register financial institute
    function registerFinancialInstitute(address institute) public {}

    // function to unregister analyst
    function unregisterAnalyst(address analyst) public {}

    // function to unregister doctor
    function unregisterDoctor(address doctor) public {}

    // function to unregister healthcare provider
    function unregisterHealthcareProvider(address provider) public {}

    // function to unregister nurse
    function unregisterNurse(address nurse) public {}

    // function to unregister financial institute
    function unregisterFinancialInstitute(address institute) public {}

    // function to make payment
    function makePayment(address patient, address receiver) public {}

    // function to make payment on behalf on a payment
    function makePaymentFor(address sender, address receiver) public {}

    // function to view specific transaction
    function viewTransaction(int transactionId) public {}

    // function to grant address access to all records
    function grantFullAccess(address user) public {}

    // function to remove access to all records
    function ungrantFullAccess(address user) public {}

    // function to get information of that certain address (actually idt it should be onchain anymore)
    function getInfo(address user) public {}
}