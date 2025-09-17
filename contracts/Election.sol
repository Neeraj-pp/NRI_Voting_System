// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
    address public admin;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;                                                                                                                                                                                                                                                                 
   }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    uint public candidatesCount;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender], "Already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }
}
