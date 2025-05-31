# Fintents TaskEscrow System

Multi-chain escrow for AI agent tasks. Users deposit native tokens, agents complete tasks, dual attestation releases payment.

## Deployed Contracts

### Rootstock Testnet
- **Contract**: `0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788`
- **Token**: tRBTC

### Flare Mainnet  
- **Contract**: `0x698AeD7013796240EE7632Bde5f67A7f2A2aA6A5`
- **Token**: FLR

### Flow Mainnet
- **Contract**: `0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788`
- **Token**: FLOW

## Deploy to Flow

```bash
npx hardhat run scripts/deploy.js --network flow-mainnet
```

## TaskEscrow Contract Details

### Task Structure
```solidity
struct Task {
    address user;           // Task creator
    address agent;          // Assigned agent (0x0 if open)
    uint256 amount;         // Deposited tokens (wei)
    string description;     // Task details
    TaskStatus status;      // 0=Open, 1=Assigned, 2=Completed, 3=Verified, 4=Cancelled
    uint256 createdAt;      // Block timestamp
    uint256 completedAt;    // Block timestamp
}
```

## Withdrawal Scenarios (Money Back to Wallets)

### User Gets Refund to Their Wallet
1. **No Agent Assigned**: Cancel anytime → Full refund
2. **Agent Timeout**: Agent has 7 days to complete, if they don't → Full refund  
3. **Before Agent Completes**: Cancel before agent finishes → Full refund

### Agent Gets Payment to Their Wallet  
1. **Normal Flow**: User calls `verifyAndPay()` → Agent gets paid
2. **User Timeout**: Agent completes but user doesn't verify within 3 days → Agent can call `claimPayment()`

### Money Goes Directly to Wallets
- **User refunds**: `payable(msg.sender).transfer(task.amount)` → User's wallet
- **Agent payments**: `payable(task.agent).transfer(task.amount)` → Agent's wallet
- **No intermediary**: Funds transfer directly from contract to wallet addresses

### What User CANNOT Do
- ❌ Cancel after agent completes work (agent deserves payment)
- ❌ Get refund if agent did the work but user didn't verify

### Frontend Integration

```javascript
const escrowABI = [
  "function createTask(string description, address[] allowedAgents) external payable returns (uint256)",
  "function completeTask(uint256 taskId) external",
  "function verifyAndPay(uint256 taskId) external",
  "function cancelTask(uint256 taskId) external",
  "function claimPayment(uint256 taskId) external",
  "function canUserCancel(uint256) external view returns (bool canCancel, string reason)",
  "function canAgentClaim(uint256) external view returns (bool canClaim, string reason)",
  "function tasks(uint256) external view returns (address user, address agent, uint256 amount, string description, uint8 status, uint256 createdAt, uint256 completedAt)"
];

// Create task (Frontend)
const taskId = await escrow.createTask(
  "Order pizza from Joe's Pizza", 
  [], // Empty = open to all agents, or [agentAddress] for specific agent
  { value: ethers.utils.parseEther(tokenAmount) }
);

// Check if user can cancel (get refund)
const [canCancel, reason] = await escrow.canUserCancel(taskId);
if (canCancel) {
  await escrow.cancelTask(taskId); // User gets refund to their wallet
}

// Check if agent can claim payment
const [canClaim, claimReason] = await escrow.canAgentClaim(taskId);
if (canClaim) {
  await escrow.connect(agentSigner).claimPayment(taskId); // Agent gets paid to their wallet
}
```

### Backend Agent Integration

```javascript
// Agent accepts task
await escrow.connect(agentSigner).completeTask(taskId);

// Check if task is completed (agent called completeTask)
const task = await escrow.tasks(taskId);
if (task.status === 2) { // Completed
  console.log("Task completed, waiting for user verification");
}

// Agent can claim payment after timeout (3 days after completion)
const [canClaim] = await escrow.canAgentClaim(taskId);
if (canClaim) {
  await escrow.connect(agentSigner).claimPayment(taskId); // Money goes to agent's wallet
}
```

## Price Feeds (FTSO V2)

**See `test_direct_ftso_v2.js` for complete price feed integration example.**

```javascript
// Addresses
const FTSO_MAINNET = "0x7BDE3Df0624114eDB3A67dFe6753e62f4e7c1d20";
const FTSO_TESTNET = "0x3d893C53D9e8056135C26C8c638B76C8b60Df726";

// Feed IDs  
const BTC_USD = "0x014254432f55534400000000000000000000000000";
const FLR_USD = "0x01464c522f55534400000000000000000000000000";
const ETH_USD = "0x014554482f55534400000000000000000000000000";

// Get token amount for USD
async function getTokenAmountForUSD(usdAmount, feedId) {
  const provider = new ethers.providers.JsonRpcProvider("https://flare-api.flare.network/ext/C/rpc");
  const ftso = new ethers.Contract(FTSO_MAINNET, ["function getFeedByIdInWei(bytes21) external view returns (uint256, uint64)"], provider);
  
  const [priceWei] = await ftso.getFeedByIdInWei(feedId);
  const usdWei = ethers.utils.parseEther(usdAmount.toString());
  return ethers.utils.formatEther(usdWei.mul(ethers.utils.parseEther("1")).div(priceWei));
}
```

## Contract Usage Examples

```javascript
// Rootstock (calculate tRBTC for $15 USD)
const rootstock = new ethers.Contract("0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788", escrowABI, signer);
const btcAmount = await getTokenAmountForUSD(15, BTC_USD);
const taskId = await rootstock.createTask("Order pizza", [], { value: ethers.utils.parseEther(btcAmount) });

// Flare (calculate FLR for $15 USD)
const flare = new ethers.Contract("0x698AeD7013796240EE7632Bde5f67A7f2A2aA6A5", escrowABI, signer);
const flrAmount = await getTokenAmountForUSD(15, FLR_USD);
await flare.createTask("Book flight", [], { value: ethers.utils.parseEther(flrAmount) });

// Flow (manual FLOW amount)
const flow = new ethers.Contract("[DEPLOY_ADDRESS_HERE]", escrowABI, signer);
await flow.createTask("Buy NFT", [], { value: ethers.utils.parseEther("15") });
```

## Workflow

1. **User**: `createTask(description, allowedAgents)` + deposit tokens
2. **Agent**: `completeTask(taskId)` when work is done  
3. **User**: `verifyAndPay(taskId)` to release payment
4. **Timeouts**: 7 days agent completion, 3 days user verification, then agent can claim

## Task Status Flow

```
0 (Open) → 1 (Assigned) → 2 (Completed) → 3 (Verified/Paid)
    ↓           ↓              ↓
4 (Cancelled)   ↓         Agent can claim
                ↓         after 3 days
            Agent assigned
```

## Why These Chains

- **Rootstock**: Bitcoin ecosystem
- **Flare**: Built-in oracles  
- **Flow**: NFT/gaming users

## Dev

```bash
npm install
npx hardhat compile  
npx hardhat test
node test_direct_ftso_v2.js  # Test price feeds
``` 