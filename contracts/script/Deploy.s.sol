// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import {XStrategyFactory} from "../src/XStrategyFactory.sol";

contract Deploy is Script {
    // 0xSplits mainnet addresses
    address constant SPLIT_MAIN_BASE = 0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE;
    address constant SPLIT_MAIN_BASE_SEPOLIA = 0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address protocolFeeRecipient = vm.envAddress("PROTOCOL_FEE_RECIPIENT");
        address defaultOperator = vm.envAddress("PROTOCOL_OPERATOR"); // New env var

        vm.startBroadcast(deployerPrivateKey);

        // Determine which network
        address splitMain = block.chainid == 8453 ? SPLIT_MAIN_BASE : SPLIT_MAIN_BASE_SEPOLIA;

        XStrategyFactory factory = new XStrategyFactory(
            splitMain, 
            protocolFeeRecipient,
            defaultOperator
        );

        console.log("XStrategyFactory deployed to:", address(factory));
        console.log("Using SplitMain at:", splitMain);
        console.log("Using Default Operator:", defaultOperator);

        vm.stopBroadcast();
    }
}
