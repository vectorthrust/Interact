const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleTaskEscrow", function () {
  let taskEscrow;
  let owner, user, agent;
  let taskDescription = "Order a large pepperoni pizza";
  let depositAmount = ethers.utils.parseEther("0.1");

  beforeEach(async function () {
    [owner, user, agent] = await ethers.getSigners();

    const TaskEscrow = await ethers.getContractFactory("TaskEscrow");
    taskEscrow = await TaskEscrow.deploy(); // No constructor params!
    await taskEscrow.deployed();
  });

  describe("Task Creation", function () {
    it("Should create a task with valid parameters", async function () {
      await expect(
        taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount })
      )
        .to.emit(taskEscrow, "TaskCreated")
        .withArgs(1, taskDescription, depositAmount, []);

      const task = await taskEscrow.getTask(1);
      expect(task.user).to.equal(user.address);
      expect(task.amount).to.equal(depositAmount);
      expect(task.description).to.equal(taskDescription);
      expect(task.completed).to.be.false;
      expect(task.verified).to.be.false;
      expect(task.paid).to.be.false;
    });

    it("Should reject task creation with zero deposit", async function () {
      await expect(
        taskEscrow.connect(user).createTask(taskDescription, [], { value: 0 })
      ).to.be.revertedWith("Need money");
    });

    it("Should reject task creation with empty description", async function () {
      await expect(
        taskEscrow.connect(user).createTask("", [], { value: depositAmount })
      ).to.be.revertedWith("Need description");
    });
  });

  describe("Task Completion", function () {
    beforeEach(async function () {
      await taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount });
    });

    it("Should allow agent to complete task", async function () {
      await expect(taskEscrow.connect(agent).completeTask(1))
        .to.emit(taskEscrow, "TaskCompleted")
        .withArgs(1);

      const task = await taskEscrow.getTask(1);
      expect(task.agent).to.equal(agent.address);
      expect(task.completed).to.be.true;
    });

    it("Should reject completion if task doesn't exist", async function () {
      await expect(
        taskEscrow.connect(agent).completeTask(999)
      ).to.be.revertedWith("Task doesn't exist");
    });

    it("Should reject completion if already taken", async function () {
      await taskEscrow.connect(agent).completeTask(1);
      
      await expect(
        taskEscrow.connect(user).completeTask(1)
      ).to.be.revertedWith("Already taken");
    });
  });

  describe("Payment and Verification", function () {
    beforeEach(async function () {
      await taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount });
      await taskEscrow.connect(agent).completeTask(1);
    });

    it("Should allow user to verify and pay", async function () {
      const initialAgentBalance = await agent.getBalance();
      
      await expect(taskEscrow.connect(user).verifyAndPay(1))
        .to.emit(taskEscrow, "TaskPaid")
        .withArgs(1, depositAmount);

      const task = await taskEscrow.getTask(1);
      expect(task.verified).to.be.true;
      expect(task.paid).to.be.true;

      // Check agent received the full amount
      const finalAgentBalance = await agent.getBalance();
      expect(finalAgentBalance.sub(initialAgentBalance)).to.equal(depositAmount);
    });

    it("Should only allow task creator to verify", async function () {
      await expect(
        taskEscrow.connect(agent).verifyAndPay(1)
      ).to.be.revertedWith("Not your task");
    });

    it("Should reject if not completed", async function () {
      await taskEscrow.connect(user).createTask("Another task", [], { value: depositAmount });
      
      await expect(
        taskEscrow.connect(user).verifyAndPay(2)
      ).to.be.revertedWith("Not completed");
    });

    it("Should reject double payment", async function () {
      await taskEscrow.connect(user).verifyAndPay(1);
      
      await expect(
        taskEscrow.connect(user).verifyAndPay(1)
      ).to.be.revertedWith("Already verified");
    });
  });

  describe("Task Cancellation", function () {
    it("Should allow user to cancel unassigned task", async function () {
      await taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount });
      
      const initialBalance = await user.getBalance();
      const tx = await taskEscrow.connect(user).cancelTask(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await user.getBalance();
      const expectedBalance = initialBalance.add(depositAmount).sub(gasUsed);
      expect(finalBalance).to.equal(expectedBalance);
    });

    it("Should reject cancellation after agent assigned", async function () {
      await taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount });
      await taskEscrow.connect(agent).completeTask(1);
      
      await expect(
        taskEscrow.connect(user).cancelTask(1)
      ).to.be.revertedWith("You have time to verify");
    });

    it("Should only allow task creator to cancel", async function () {
      await taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount });
      
      await expect(
        taskEscrow.connect(agent).cancelTask(1)
      ).to.be.revertedWith("Not your task");
    });
  });

  describe("Complete Flow", function () {
    it("Should handle complete task lifecycle", async function () {
      // 1. Create task
      await taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount });
      
      // 2. Agent completes
      await taskEscrow.connect(agent).completeTask(1);
      
      // 3. User verifies and pays
      await taskEscrow.connect(user).verifyAndPay(1);
      
      const task = await taskEscrow.getTask(1);
      expect(task.completed).to.be.true;
      expect(task.verified).to.be.true;
      expect(task.paid).to.be.true;
      expect(task.agent).to.equal(agent.address);
    });
  });

  describe("Agent Security", function () {
    it("Should allow anyone to complete open tasks (empty allowedAgents)", async function () {
      await taskEscrow.connect(user).createTask(taskDescription, [], { value: depositAmount });
      
      // Anyone can complete
      await expect(taskEscrow.connect(agent).completeTask(1))
        .to.emit(taskEscrow, "TaskCompleted");
    });

    it("Should only allow pre-approved agents to complete restricted tasks", async function () {
      const [, , , otherUser] = await ethers.getSigners();
      
      // Create task with only 'agent' allowed
      await taskEscrow.connect(user).createTask(taskDescription, [agent.address], { value: depositAmount });
      
      // Approved agent can complete
      await expect(taskEscrow.connect(agent).completeTask(1))
        .to.emit(taskEscrow, "TaskCompleted");
    });

    it("Should reject non-approved agents", async function () {
      const [, , , otherUser] = await ethers.getSigners();
      
      // Create task with only 'agent' allowed
      await taskEscrow.connect(user).createTask(taskDescription, [agent.address], { value: depositAmount });
      
      // Other user cannot complete
      await expect(taskEscrow.connect(otherUser).completeTask(1))
        .to.be.revertedWith("Not an approved agent");
    });

    it("Should check if agent is allowed", async function () {
      const [, , , otherUser] = await ethers.getSigners();
      
      // Create restricted task
      await taskEscrow.connect(user).createTask(taskDescription, [agent.address], { value: depositAmount });
      
      expect(await taskEscrow.isAllowedAgent(1, agent.address)).to.be.true;
      expect(await taskEscrow.isAllowedAgent(1, otherUser.address)).to.be.false;
    });

    it("Should return allowed agents list", async function () {
      await taskEscrow.connect(user).createTask(taskDescription, [agent.address, user.address], { value: depositAmount });
      
      const allowedAgents = await taskEscrow.getAllowedAgents(1);
      expect(allowedAgents).to.deep.equal([agent.address, user.address]);
    });
  });
}); 