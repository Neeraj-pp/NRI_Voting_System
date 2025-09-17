let web3;
let account;
let election;
let isVerified = false; // Passport verification flag

window.addEventListener('load', async () => {
  // Load Web3
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      alert("MetaMask connection rejected.");
      return;
    }
  } else {
    alert("Please install MetaMask to use this DApp.");
    return;
  }

  // Load MetaMask account
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  document.getElementById("account").innerText = "Account: " + account;

  // Load contract
  const res = await fetch("Election.json");
  const data = await res.json();
  const ElectionContract = TruffleContract(data);
  ElectionContract.setProvider(web3.currentProvider);

  try {
    election = await ElectionContract.deployed();
    console.log("Contract loaded:", election);
  } catch (err) {
    alert("Failed to load Election contract.");
    return;
  }

  // Load and display candidates
  try {
    const count = await election.candidatesCount();
    let output = "<h3>Candidates</h3>";
    for (let i = 1; i <= count; i++) {
      const c = await election.candidates(i);
      output += `ID: ${c.id}, Name: ${c.name}, Votes: ${c.voteCount}<br>`;
    }
    document.getElementById("candidates").innerHTML = output;
  } catch (err) {
    alert("Failed to load candidates.");
    console.error(err);
  }
});




// Vote
async function castVote() {
  const id = document.getElementById("candidateId").value;

  if (!election) {
    alert("Election contract not loaded yet.");
    return;
  }

  if (!id) {
    alert("Please enter a candidate ID.");
    return;
  }

  try {
    await election.vote(id, { from: account });
    alert("Vote cast successfully!");
    location.reload();
  } catch (error) {
    console.error(error);
    alert("Voting failed: " + error.message);
  }
}

// Admin-only: Add Candidate
async function addCandidate() {
  const name = document.getElementById("newCandidateName").value;

  if (!name) {
    alert("Please enter a candidate name.");
    return;
  }

  try {
    const contractAdmin = await election.admin();
    if (account.toLowerCase() !== contractAdmin.toLowerCase()) {
      alert("Only admin can add candidates.");
      return;
    }

    await election.addCandidate(name, { from: account });
    alert("Candidate added successfully!");
    location.reload();
  } catch (error) {
    console.error(error);
    alert("Failed to add candidate: " + error.message);
  }
}





// ✅ Passport Verification
async function verifyPassport() {
  const fileInput = document.getElementById("passportFile");
  if (fileInput.files.length === 0) {
    alert("Please upload a passport image.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch("http://127.0.0.1:5000/verify_passport", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    if (result.passport_no) {
      // ✅ Check if passport exists in hidden list
      const validPassports = Array.from(
        document.querySelectorAll("#validPassports span")
      ).map(el => el.innerText.trim());

      if (validPassports.includes(result.passport_no)) {
        isVerified = true;
        document.getElementById("verificationResult").innerText =
          "✅ Passport Verified: " + result.passport_no;
      } else {
        isVerified = false;
        document.getElementById("verificationResult").innerText =
          "❌ Passport number not in allowed list.";
      }
    } else {
      document.getElementById("verificationResult").innerText =
        "❌ " + (result.error || "Verification failed");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to verify passport.");
  }
}
