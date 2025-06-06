<img width="100" alt="Screenshot 2025-05-16 at 4 48 20 AM" src="https://github.com/user-attachments/assets/a302b0e2-267c-45e6-b497-f654a3f19a27" />

# Interact: From Crypto to Automated Real-World Actions via AI Agents

**Interact** is a AI agent driven platform that turns your crypto into real-world goods and services seamlessly, securely, and verifiably. By leveraging blockchain-based escrows and browser-based AI agents, Interact automates purchases, bookings, and other real-world tasks directly from your crypto wallet without any off-ramps.

---

## ❗ Problem Statement

- **Crypto to Fiat Friction:** Converting crypto to real-world goods and services typically involves cumbersome fiat off-ramps, compliance hurdles, and intermediaries.
- **Fragmented Workflows:** Even when off-ramp services exist, they’re disjointed, requiring multiple apps and manual steps.
- **Lack of Trustless Automation:** Users lack direct, verifiable flows to ensure payment happens only after tasks are completed.

---

## 🏆 Key Features

- **Fiat Off-Ramp Automation:** Users lock crypto funds in a secure on-chain escrow contract, triggering real-world actions.
- **AI Agents as Human Proxies:** Browser-based AI agents interpret and execute tasks like ordering food, booking flights, or shopping online.
- **Trustless Escrow Workflow:** Dual attestation, AI & user verifies completion or a time-based fallback pays the agent automatically.
- **Multi-Chain Support:** Operates across Hedera, Flare, and Flow blockchains, letting users choose their ecosystem.
- **Seamless Real-World Conversion:** No need for third-party fiat providers, agents handle purchases using VCCs or APIs directly.

---

## 📷 Preview
<img width="300" src="https://github.com/user-attachments/assets/d1b0d326-c3c1-46d0-bfdf-63002fb54efe" />
<img width="300" src="https://github.com/user-attachments/assets/878ef91a-6344-4a93-9780-b26e414e8dff" />
<img width="300" src="https://github.com/user-attachments/assets/ecd514bb-6f88-406e-9302-7d25ec3914b5" />
<img width="500" src="https://github.com/user-attachments/assets/9744616c-98e6-4302-bca3-1c18f17e832b" />

---

## 🚦 User Flow

1. **Deposit Funds:**  
   - Connect your crypto wallet and deposit tokens (HBAR, FLR, FLOW) into the on-chain escrow.

2. **Start AI Agent:**  
   - An AI agent is assigned to your task, automating the real-world execution.

3. **Real-Time Execution:**  
   - Watch live logs of your task’s progress via a WebSocket-powered interface.

4. **Verify & Release:**  
   - Once completed, verify the task and release escrowed funds to the agent, or let fallback rules handle payment.

---

## 🛠️ Architecture

### Blockchain: Multi-Chain Escrow
- **TaskEscrow.sol** (EVM smart contract):  
  - Stores task metadata (user, agent, amount, status, timestamps).  
  - Holds funds in escrow until dual attestation (user + agent) finalizes payment.  
  - Timeouts for fallback refunds or agent payouts ensure fairness.  
  - Deployed on Hedera Testnet, Flare Mainnet, and Flow Mainnet.

- **Deployment & Testing:**  
  - Hardhat used for deployment and verification.  
  - Leverages FTSO price feeds for real-time crypto/USD conversions.

---

### AI-Powered Agent & Automation

- **Backend:**  
  - **FastAPI + WebSockets** for live, bidirectional updates.  
  - **LangChain, OpenAI** for LLM-powered task interpretation and execution planning.  
  - **Browser Automation** Playwright and browser_use libraries for real-world purchase flows.

- **Frontend:**  
  - **Next.js + React** with dynamic theming based on selected blockchain.  
  - **shadcn/ui** for sleek, modern UI components.  
  - Real-time agent status updates (running, completed, error) streamed via WebSockets.

- **Execution Flow:**  
  - Templates customize LLM prompts for different task types (food, flights, shopping).  
  - Agents asynchronously automate real-world actions like clicking, filling forms, and checking out.  
  - Live task logs provide transparency and user confidence.

---

### Security & Payment Flows

- **Dual Attestation Model:**  
  - AI and user verify completion or fallback payments trigger after set timeouts.  
  - No middlemen  payments go directly to agent or user wallet.

- **Fiat Funds Handling:**  
  - AI agents manage fiat funds through VCCs, bypassing complex fiat-crypto conversion steps.

- **Stateless Agents:**  
  - No persistent backend database, tasks stored in frontend localStorage and streamed live to agents.

---

## 🚀 Deployed Contracts
- **Hedera Testnet (TaskEscrow)**
- **Flare Mainnet (TaskEscrow)** 
- **Flow Mainnet (TaskEscrow)** 

---

## 📦 Example Use Cases

- 🍕 Order food delivery and pay with crypto.
- ✈️ Book your next flight seamlessly with your wallet.
- 🛍️ Shop for anything on Amazon, from groceries to gadgets.

---

## 🌐 Technology Stack

- **Blockchain (EVM):** Hedera, Flare, Flow  
- **Smart Contracts:** Solidity, Hardhat  
- **AI:** LangChain, OpenAI  
- **Browser Automation:** Playwright, browser_use  
- **Frontend:** Next.js, React, shadcn/ui  
- **Backend:** FastAPI, WebSockets  

---
