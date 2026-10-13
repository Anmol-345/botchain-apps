export const BOT_CHAIN = {
  chainId: 677,
  chainIdHex: "0x2a5",
  name: "BOT Chain Mainnet",
  currencyName: "BOT",
  currencySymbol: "BOT",
  decimals: 18,
  rpcUrl: "https://rpc.botchain.ai",
  explorerUrl: "https://scan.botchain.ai",
  officialWebsite: "https://botchain.ai",
};

export const OMNIWALLET_CONTRACT_ADDRESS = "0xF8c0062A507E345BAa1FB92cC72031eb5171E159";
export const OMNIWALLET_EXPLORER_URL = `${BOT_CHAIN.explorerUrl}/address/${OMNIWALLET_CONTRACT_ADDRESS}`;

export const OMNIWALLET_CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
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
}`;

export async function addOrSwitchToBotChain(): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    alert("Please install a Web3 wallet like MetaMask to connect to BOT Chain.");
    return false;
  }

  const ethereum = (window as any).ethereum;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BOT_CHAIN.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902 || switchError.message?.includes("unrecognized")) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BOT_CHAIN.chainIdHex,
              chainName: BOT_CHAIN.name,
              rpcUrls: [BOT_CHAIN.rpcUrl],
              nativeCurrency: {
                name: BOT_CHAIN.currencyName,
                symbol: BOT_CHAIN.currencySymbol,
                decimals: BOT_CHAIN.decimals,
              },
              blockExplorerUrls: [BOT_CHAIN.explorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add BOT Chain to wallet:", addError);
        return false;
      }
    }
    console.error("Failed to switch to BOT Chain:", switchError);
    return false;
  }
}
