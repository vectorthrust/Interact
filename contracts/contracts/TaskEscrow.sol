// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleTaskEscrow
 * @dev Dead simple escrow for AI agent tasks - create, complete, pay!
 * Now with timeout protection so money doesn't get stuck forever!
 */
contract TaskEscrow {
    
    struct Task {
        address user;           // Who created the task
        address agent;          // Who's doing the task  
        uint256 amount;         // How much money
        string description;     // What to do
        bool completed;         // Agent says done
        bool verified;          // User says good
        bool paid;             // Money sent
        uint256 createdAt;     // When task was created
        uint256 completedAt;   // When agent claimed completion
        address[] allowedAgents; // Pre-approved agents (empty = anyone can apply)
    }

    mapping(uint256 => Task) public tasks;
    uint256 public nextTaskId = 1;
    
    // Timeouts
    uint256 public constant COMPLETION_TIMEOUT = 7 days;  // Agent has 7 days to complete
    uint256 public constant VERIFICATION_TIMEOUT = 3 days; // User has 3 days to verify after completion
    
    event TaskCreated(uint256 taskId, string description, uint256 amount, address[] allowedAgents);
    event TaskCompleted(uint256 taskId);
    event TaskPaid(uint256 taskId, uint256 amount);
    event TaskRefunded(uint256 taskId, uint256 amount, string reason);

    /**
     * @dev Create a task with native token deposit
     * @param description What you want done
     * @param allowedAgents List of pre-approved agents (empty = anyone can apply)
     */
    function createTask(string calldata description, address[] calldata allowedAgents) external payable {
        require(msg.value > 0, "Need money");
        require(bytes(description).length > 0, "Need description");

        tasks[nextTaskId] = Task({
            user: msg.sender,
            agent: address(0),
            amount: msg.value,
            description: description,
            completed: false,
            verified: false,
            paid: false,
            createdAt: block.timestamp,
            completedAt: 0,
            allowedAgents: allowedAgents
        });

        emit TaskCreated(nextTaskId, description, msg.value, allowedAgents);
        nextTaskId++;
    }

    /**
     * @dev Agent accepts and completes task in one go (NOW WITH SECURITY!)
     */
    function completeTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(task.amount > 0, "Task doesn't exist");
        require(task.agent == address(0), "Already taken");
        require(!task.completed, "Already done");
        require(!task.paid, "Already paid");
        
        // 🛡️ SECURITY CHECK: Is this agent allowed?
        if (task.allowedAgents.length > 0) {
            bool isAllowed = false;
            for (uint i = 0; i < task.allowedAgents.length; i++) {
                if (task.allowedAgents[i] == msg.sender) {
                    isAllowed = true;
                    break;
                }
            }
            require(isAllowed, "Not an approved agent");
        }
        // If allowedAgents is empty, anyone can apply (open task)

        task.agent = msg.sender;
        task.completed = true;
        task.completedAt = block.timestamp;
        
        emit TaskCompleted(taskId);
    }

    /**
     * @dev User verifies completion and releases payment
     */
    function verifyAndPay(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(task.user == msg.sender, "Not your task");
        require(task.completed, "Not completed");
        require(!task.verified, "Already verified");
        require(!task.paid, "Already paid");

        task.verified = true;
        task.paid = true;
        
        // Send money to agent
        payable(task.agent).transfer(task.amount);
        
        emit TaskPaid(taskId, task.amount);
    }

    /**
     * @dev Cancel task and get refund (multiple scenarios)
     */
    function cancelTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(task.user == msg.sender, "Not your task");
        require(!task.paid, "Already paid");

        string memory reason;
        
        // Scenario 1: No agent assigned yet (immediate cancel)
        if (task.agent == address(0)) {
            reason = "No agent assigned";
        }
        // Scenario 2: Agent assigned but never completed (agent failed)
        else if (!task.completed && block.timestamp > task.createdAt + COMPLETION_TIMEOUT) {
            reason = "Agent timeout - no completion";
        }
        // Scenario 3: Agent completed work, but user didn't verify in time
        // FAIR RULE: If agent did work and user doesn't respond, agent deserves payment!
        else if (task.completed && block.timestamp > task.completedAt + VERIFICATION_TIMEOUT) {
            revert("Agent completed work - they deserve payment, not refund");
        }
        // Scenario 4: Not eligible for refund yet
        else {
            if (!task.completed) {
                revert("Agent has time to complete");
            } else {
                revert("You have time to verify");
            }
        }

        task.paid = true; // Prevent re-entry
        payable(msg.sender).transfer(task.amount);
        
        emit TaskRefunded(taskId, task.amount, reason);
    }

    /**
     * @dev Agent can claim payment after verification timeout (FAIR RULE!)
     */
    function claimPayment(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(task.agent == msg.sender, "Not your task");
        require(task.completed, "Not completed");
        require(!task.paid, "Already paid");
        require(block.timestamp > task.completedAt + VERIFICATION_TIMEOUT, "Wait for timeout");

        task.paid = true;
        payable(task.agent).transfer(task.amount);
        
        emit TaskPaid(taskId, task.amount);
    }

    /**
     * @dev Get task info
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    /**
     * @dev Check if an address is allowed to complete a task
     */
    function isAllowedAgent(uint256 taskId, address agent) external view returns (bool) {
        Task storage task = tasks[taskId];
        
        // If no specific agents allowed, anyone can apply
        if (task.allowedAgents.length == 0) {
            return true;
        }
        
        // Check if agent is in the allowed list
        for (uint i = 0; i < task.allowedAgents.length; i++) {
            if (task.allowedAgents[i] == agent) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * @dev Get allowed agents for a task
     */
    function getAllowedAgents(uint256 taskId) external view returns (address[] memory) {
        return tasks[taskId].allowedAgents;
    }

    /**
     * @dev Check if task can be cancelled by user
     */
    function canUserCancel(uint256 taskId) external view returns (bool canCancel, string memory reason) {
        Task storage task = tasks[taskId];
        
        if (task.paid) {
            return (false, "Already paid");
        }
        
        if (task.agent == address(0)) {
            return (true, "No agent assigned");
        }
        
        if (!task.completed && block.timestamp > task.createdAt + COMPLETION_TIMEOUT) {
            return (true, "Agent timeout");
        }
        
        if (task.completed && block.timestamp > task.completedAt + VERIFICATION_TIMEOUT) {
            return (false, "Agent deserves payment - cannot cancel");
        }
        
        return (false, "Not eligible yet");
    }

    /**
     * @dev Check if agent can claim payment
     */
    function canAgentClaim(uint256 taskId) external view returns (bool canClaim, string memory reason) {
        Task storage task = tasks[taskId];
        
        if (task.agent == address(0)) {
            return (false, "No agent assigned");
        }
        
        if (!task.completed) {
            return (false, "Not completed");
        }
        
        if (task.paid) {
            return (false, "Already paid");
        }
        
        if (block.timestamp > task.completedAt + VERIFICATION_TIMEOUT) {
            return (true, "Verification timeout reached");
        }
        
        return (false, "Wait for timeout");
    }
} 