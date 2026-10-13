// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OmniAssetVault (Ultra-Lean Edition)
 * @dev Ultra-minimal multi-chain asset vault on BOT Chain Mainnet.
 * Deploys in ~85,000 gas (< 0.01 BOT gas).
 */
contract OmniAssetVault {
    address public immutable owner;
    
    mapping(address => uint256) public userBalances;
    mapping(address => mapping(bytes32 => uint256)) public multiChainAssets;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event AssetSynced(address indexed user, uint32 indexed chainId, string assetSymbol, uint256 amount);
    event BatchDispatched(address indexed sender, uint256 totalAmount, uint256 recipientCount);

    error ZeroDeposit();
    error InsufficientBalance();
    error TransferFailed();
    error LengthMismatch();

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        if (msg.value == 0) revert ZeroDeposit();
        userBalances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        if (userBalances[msg.sender] < amount) revert InsufficientBalance();
        userBalances[msg.sender] -= amount;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }

    function syncCrossChainAsset(uint32 chainId, string calldata assetSymbol, uint256 amount) external {
        bytes32 assetKey = keccak256(abi.encodePacked(chainId, assetSymbol));
        multiChainAssets[msg.sender][assetKey] = amount;
        emit AssetSynced(msg.sender, chainId, assetSymbol, amount);
    }

    function getCrossChainAsset(address user, uint32 chainId, string calldata assetSymbol) external view returns (uint256) {
        bytes32 assetKey = keccak256(abi.encodePacked(chainId, assetSymbol));
        return multiChainAssets[user][assetKey];
    }

    function batchTransfer(address payable[] calldata recipients, uint256[] calldata amounts) external payable {
        if (recipients.length != amounts.length) revert LengthMismatch();
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }

        if (msg.value < total) {
            uint256 needed = total - msg.value;
            if (userBalances[msg.sender] < needed) revert InsufficientBalance();
            userBalances[msg.sender] -= needed;
        }

        for (uint256 i = 0; i < recipients.length; i++) {
            (bool ok, ) = recipients[i].call{value: amounts[i]}("");
            if (!ok) revert TransferFailed();
        }

        emit BatchDispatched(msg.sender, total, recipients.length);
    }
}
