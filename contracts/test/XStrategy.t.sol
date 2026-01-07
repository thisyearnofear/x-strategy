// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import {XStrategy} from "../src/XStrategy.sol";
import {XStrategyFactory} from "../src/XStrategyFactory.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract XStrategyTest is Test {
    XStrategyFactory factory;
    ERC20Mock token;
    
    address strategyCreator = address(0x1);
    address designatedCreator = address(0x2);
    address contributor1 = address(0x3);
    address operator = address(0x99);
    address feeRecipient = address(0x88);
    // Base Mainnet SplitMain
    address splitMain = address(0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE); 

    uint256 constant CREATOR_STAKE = 0.5 ether;
    uint256 constant TARGET_AMOUNT = 10 ether;
    uint256 constant DEADLINE_OFFSET = 30 days;

    function setUp() public {
        // Deploy mock token
        token = new ERC20Mock();
        
        // Deploy factory
        factory = new XStrategyFactory(splitMain, feeRecipient, operator);
        
        // Fund accounts
        vm.deal(strategyCreator, 100 ether);
        vm.deal(designatedCreator, 100 ether);
        vm.deal(contributor1, 100 ether);
        vm.deal(operator, 100 ether);
        
        // Mint tokens for testing
        token.mint(address(this), 1000000 ether);
        token.mint(operator, 1000000 ether);
    }

    function testCreateStrategyAndOptIn() public {
        vm.startPrank(strategyCreator);
        
        uint32[] memory unlocks = new uint32[](3);
        unlocks[0] = 3333; // 33.33%
        unlocks[1] = 3333;
        unlocks[2] = 3334;
        
        // 1. Create Strategy
        address strategyAddr = factory.createStrategy(
            address(token),
            designatedCreator,
            TARGET_AMOUNT,
            block.timestamp + DEADLINE_OFFSET,
            unlocks
        );
        vm.stopPrank();

        XStrategy strategy = XStrategy(payable(strategyAddr));
        
        // Verify initial state
        assertEq(uint(strategy.status()), uint(XStrategy.Status.PENDING_CREATOR));
        
        // 2. Creator Opt-In
        vm.startPrank(designatedCreator);
        strategy.optIn{value: CREATOR_STAKE}();
        vm.stopPrank();
        
        assertEq(uint(strategy.status()), uint(XStrategy.Status.ACTIVE));
        assertEq(address(strategy).balance, CREATOR_STAKE);
    }

    function testContributeAndSwap() public {
        // Setup Strategy
        vm.prank(strategyCreator);
        uint32[] memory unlocks = new uint32[](1);
        unlocks[0] = 10000;
        address strategyAddr = factory.createStrategy(
            address(token),
            designatedCreator,
            TARGET_AMOUNT,
            block.timestamp + DEADLINE_OFFSET,
            unlocks
        );
        XStrategy strategy = XStrategy(payable(strategyAddr));
        
        vm.prank(designatedCreator);
        strategy.optIn{value: CREATOR_STAKE}();

        // 1. User Contributes (Pending)
        vm.prank(contributor1);
        strategy.contribute{value: 1 ether}();
        
        (,,uint256 pending,) = strategy.getContributorInfo(contributor1);
        assertEq(pending, 1 ether);

        // 2. Operator Confirms Swap
        vm.startPrank(operator);
        token.approve(address(strategy), 1000 ether); 
        
        // Transfer tokens to strategy (simulating swap destination)
        token.transfer(address(strategy), 500 ether);
        
        uint256 preBalance = operator.balance;
        strategy.confirmSwap(
            contributor1,
            1 ether,    // ETH used
            500 ether,  // Tokens received
            450 ether   // Min expected
        );
        uint256 postBalance = operator.balance;
        assertEq(postBalance, preBalance + 1 ether, "Operator Refund Failed");

        vm.stopPrank();
        
        (uint256 ethContributed, uint256 tokensOwed, bool hasWithdrawn) = strategy.contributors(contributor1);
        uint256 pendingAfter = strategy.pendingContributions(contributor1);
        
        assertEq(ethContributed, 1 ether);
        assertEq(tokensOwed, 500 ether);
        assertEq(pendingAfter, 0);
        assertFalse(hasWithdrawn);
    }

    function testCompleteMilestone() public {
         // Setup Strategy
        vm.prank(strategyCreator);
        uint32[] memory unlocks = new uint32[](1);
        unlocks[0] = 10000;
        address strategyAddr = factory.createStrategy(
            address(token),
            designatedCreator,
            TARGET_AMOUNT,
            block.timestamp + DEADLINE_OFFSET,
            unlocks
        );
        XStrategy strategy = XStrategy(payable(strategyAddr));
        
        vm.prank(designatedCreator);
        strategy.optIn{value: CREATOR_STAKE}();
        
        // Complete milestone
        vm.prank(designatedCreator);
        bytes32 proof = keccak256("proof");
        strategy.completeMilestone(0, proof);
        
        (bytes32 storedProof, uint32 unlockBps, bool completed) = strategy.milestones(0);
        assertTrue(completed);
        assertEq(storedProof, proof);

        // Verify Reputation Update
        (uint256 created, uint256 succeeded,,,) = factory.creatorReputation(designatedCreator);
        assertEq(created, 1);
        assertEq(succeeded, 1);
    }

    function testCannotContributeAfterDeadline() public {
        // Setup
        vm.prank(strategyCreator);
        uint32[] memory unlocks = new uint32[](1);
        unlocks[0] = 10000;
        address strategyAddr = factory.createStrategy(
            address(token),
            designatedCreator,
            TARGET_AMOUNT,
            block.timestamp + DEADLINE_OFFSET,
            unlocks
        );
        XStrategy strategy = XStrategy(payable(strategyAddr));
        
        vm.prank(designatedCreator);
        strategy.optIn{value: CREATOR_STAKE}();
        
        // Warp past deadline
        vm.warp(block.timestamp + DEADLINE_OFFSET + 1);
        
        // Try to contribute
        vm.prank(contributor1);
        vm.expectRevert(XStrategy.DeadlinePassed.selector);
        strategy.contribute{value: 1 ether}();
    }
}
