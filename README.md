# NRI Voting System

An educational decentralized-voting prototype that combines an Ethereum smart contract with a browser-based Web3 interface and a small Flask service for passport-image text extraction. The project explores how blockchain transactions and a basic identity-check workflow can be connected in a voting application.

> **Important:** This repository is a learning prototype, not a production election system. Passport OCR, a hard-coded allow-list, browser-side verification, and webcam frame-difference checks are not secure identity or liveness verification. Do not use this system for real elections or upload real passport information.

## Project Overview

The project contains three main components:

1. **Solidity election contract** — the contract deployer is the administrator, the administrator can add candidates, and each wallet address can cast at most one vote.
2. **Browser DApp** — connects to MetaMask, loads the Truffle contract artifact, displays candidates, and submits candidate/vote transactions.
3. **Flask passport OCR service** — accepts an uploaded image and uses Tesseract OCR to extract a possible passport-like alphanumeric value. The browser compares the extracted value with a small hard-coded allow-list.

A JavaScript webcam module requests camera access and checks for changes between video frames. This is a movement heuristic, not biometric or spoof-resistant liveness detection.

## Features Implemented

- Connect to an injected Web3 provider such as MetaMask
- Display the connected Ethereum account
- Load the Truffle contract artifact and deployed election contract
- List candidates and their vote counts
- Restrict candidate creation to the contract administrator
- Prevent a wallet address from voting more than once
- Extract a possible passport number from an uploaded image through Tesseract OCR
- Compare the OCR result with a client-side allow-list
- Request webcam access and detect basic frame changes

## Technology Stack

- Solidity 0.8+
- Truffle contract abstraction
- Web3.js 1.8.2 (loaded from a CDN in the HTML)
- MetaMask
- JavaScript, HTML, and CSS
- Python, Flask, pytesseract, and Pillow
- lite-server

## Repository Structure

    .
    ├── contracts/
    │   └── Election.sol              # Election smart contract
    ├── migrations/
    │   └── 1_deploy_contracts.js     # Truffle deployment migration
    ├── src/
    │   ├── app.js                    # Wallet, contract, voting, and OCR UI logic
    │   ├── index.html                # DApp interface
    │   ├── liveness.js               # Webcam movement heuristic
    │   └── Election.json             # Truffle contract artifact
    ├── passport_verification.py      # Flask OCR API
    ├── liveness.js                   # Root-level liveness script
    ├── requirements.txt              # Python dependencies
    ├── package.json                  # Node scripts and dependencies
    └── truffle-config.js             # Truffle configuration

## Prerequisites

- Node.js and npm
- Python 3.9+ (choose a version compatible with installed Python packages)
- Truffle CLI
- MetaMask browser extension
- A local Ethereum development network or another network configured for deployment
- Tesseract OCR installed on your machine

The Python code currently contains a Windows-specific Tesseract executable path. Update it for your operating system before running the OCR service.

## Setup

### 1. Clone the repository

    git clone https://github.com/Neeraj-pp/NRI_Voting_System.git
    cd NRI_Voting_System

### 2. Install Node dependencies

    npm install
    npm install --global truffle

### 3. Install Python dependencies

Create a virtual environment:

    python -m venv .venv

Windows PowerShell:

    .\.venv\Scripts\Activate.ps1

macOS/Linux:

    source .venv/bin/activate

Install the packages listed in requirements.txt and the libraries imported by the Flask service:

    pip install -r requirements.txt
    pip install pytesseract pillow flask-cors

Install the Tesseract OCR engine separately and ensure it is available on PATH. If it is not, update pytesseract.pytesseract.tesseract_cmd in passport_verification.py.

### 4. Compile and deploy the smart contract

Configure the development network in truffle-config.js and ensure that network is running. Then run:

    truffle compile
    truffle migrate --reset

The browser calls ElectionContract.deployed(), so the contract artifact and deployment network must match the network selected in MetaMask. Keep the deployment information in src/Election.json synchronized with the network you use.

### 5. Start the passport OCR API

With the Python virtual environment active:

    python passport_verification.py

The service listens on http://127.0.0.1:5000 and exposes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /verify_passport | Accepts an image in multipart form field file and returns a detected passport_no or an error |

### 6. Start the browser application

From the repository root:

    npm start

Open the local URL printed by lite-server. Connect MetaMask to the same network where the contract was deployed.

## Typical Usage

1. Start the blockchain development network and deploy the contract.
2. Start the Flask OCR service.
3. Start the browser application and connect MetaMask.
4. The connected wallet is shown and candidates are loaded from the contract.
5. The administrator wallet can add candidates.
6. A voter can upload an image for the OCR check. The detected value is compared with the hard-coded browser allow-list.
7. After the page reports a match, the voter can submit a candidate ID. MetaMask asks for approval of the blockchain transaction.

## Smart Contract Behavior

The Election contract stores the deployer as admin, tracks candidates by numeric ID, and records whether an address has already voted.

| Function | Access | Behavior |
| --- | --- | --- |
| addCandidate(string) | Admin only | Adds a candidate with an initial vote count of zero |
| vote(uint) | Any address, once | Records one vote for a valid candidate ID |
| candidates(uint) | Public getter | Reads candidate details |
| candidatesCount() | Public getter | Returns the number of candidates |
| admin() | Public getter | Returns the administrator address |
| voters(address) | Public getter | Indicates whether an address has voted |

## API Response Examples

Example successful OCR extraction:

    {"passport_no": "EXAMPLE123"}

Example error response:

    {"passport_no": null, "error": "No valid passport number detected"}

An extracted string does not establish that a passport is genuine, belongs to the uploader, or that its holder is eligible to vote.

## Known Limitations and Security Considerations

- The passport allow-list is embedded in browser HTML and can be inspected or modified.
- The smart contract does not know about passport verification. A caller can invoke vote() directly through another Web3 client without using the browser OCR flow.
- Wallet addresses are not verified people. Wallet rotation and shared wallets are not addressed.
- OCR extracts a matching alphanumeric string; it does not authenticate a passport or validate its security features.
- The Flask service runs in debug mode and uses permissive CORS. These settings are unsuitable for production.
- Uploaded files are saved using the supplied filename and are not cleaned up by the current code. Production code needs generated safe filenames, content/size validation, secure storage, and a retention policy.
- The webcam code compares pixel changes between frames. It cannot reliably distinguish a live person from a video, screen, or other spoof.
- The contract has no election schedule, candidate editing/removal, voter eligibility registry, or privacy-preserving ballot mechanism.
- Blockchain vote data is public and immutable; this design does not provide ballot secrecy.
- The browser's verification gate is client-side and can be bypassed. Eligibility rules must never depend only on UI state.

## Possible Next Improvements

- Design a privacy-preserving identity and eligibility workflow that is enforced outside the browser.
- Replace the frame-difference heuristic with a properly evaluated liveness solution.
- Add election lifecycle controls and stronger administrative access management.
- Add smart-contract unit tests and frontend/API integration tests.
- Add upload size/type validation, generated filenames, rate limiting, and structured API errors.
- Document the exact local blockchain network and deployment workflow.

## License

The smart contract declares the MIT SPDX identifier. No repository-wide license file was identified; confirm the intended project license before reuse or redistribution.
