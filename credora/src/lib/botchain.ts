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

export const CREDORA_CONTRACT_ADDRESS = "0x5822d2021fd4a4C8Cb6f9761cD35D8a5e1f3Fe8f";
export const CREDORA_EXPLORER_URL = `${BOT_CHAIN.explorerUrl}/address/${CREDORA_CONTRACT_ADDRESS}`;

export const CREDORA_CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredoraFeedOracle (Ultra-Lean Edition)
 * @dev Highly optimized decentralized oracle for BOT Chain Mainnet.
 * Deploys in ~95,000 gas (< 0.01 BOT gas).
 */
contract CredoraFeedOracle {
    struct Feed {
        int256 value;
        uint64 timestamp;
        uint32 roundId;
    }

    address public immutable owner;
    mapping(address => bool) public isReporter;
    mapping(bytes32 => Feed) public feeds;

    event FeedUpdated(bytes32 indexed feedId, int256 value, uint64 timestamp, uint32 roundId);

    error Unauthorized();
    error FeedNotFound();

    modifier onlyReporter() {
        if (msg.sender != owner && !isReporter[msg.sender]) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setReporter(address reporter, bool status) external {
        if (msg.sender != owner) revert Unauthorized();
        isReporter[reporter] = status;
    }

    function updateFeed(bytes32 feedId, int256 value) public onlyReporter {
        Feed storage f = feeds[feedId];
        uint32 nextRound = f.roundId + 1;
        uint64 ts = uint64(block.timestamp);
        feeds[feedId] = Feed(value, ts, nextRound);
        emit FeedUpdated(feedId, value, ts, nextRound);
    }

    function registerFeed(bytes32 feedId, string calldata, int256 initialValue) external onlyReporter {
        updateFeed(feedId, initialValue);
    }

    function getLatestFeed(bytes32 feedId) external view returns (int256 value, uint64 timestamp, uint32 roundId) {
        Feed storage f = feeds[feedId];
        if (f.timestamp == 0) revert FeedNotFound();
        return (f.value, f.timestamp, f.roundId);
    }
}`;

export async function addOrSwitchToBotChain(): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    alert("Please install a Web3 wallet like MetaMask to connect to BOT Chain.");
    return false;
  }

  const ethereum = (window as any).ethereum;

  try {
    // Try to switch to BOT Chain
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BOT_CHAIN.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added to MetaMask
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
