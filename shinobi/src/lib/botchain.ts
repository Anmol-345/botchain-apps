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

export const SHINOBI_CONTRACT_ADDRESS = "0x8e1EAFaC5D8086845434398fa6a177F360BC84e4";
export const SHINOBI_EXPLORER_URL = `${BOT_CHAIN.explorerUrl}/address/${SHINOBI_CONTRACT_ADDRESS}`;

export const SHINOBI_CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ShinobiStealth (Ultra-Lean Edition)
 * @dev Ultra-minimal privacy stealth payment protocol on BOT Chain Mainnet.
 * Deploys in ~85,000 gas (< 0.01 BOT gas).
 */
contract ShinobiStealth {
    struct Announcement {
        address sender;
        address stealthRecipient;
        bytes32 ephemeralPubKeyHash;
        bytes32 encryptedViewPayload;
        uint256 amount;
        uint64 timestamp;
    }

    address public immutable owner;
    Announcement[] public announcements;
    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => bool) public spentNullifiers;

    event StealthAnnounced(
        uint256 indexed announcementId,
        address indexed sender,
        address indexed stealthRecipient,
        bytes32 ephemeralPubKeyHash,
        uint256 amount
    );
    event ShieldedDeposit(bytes32 indexed commitment, uint256 amount);
    event ShieldedWithdraw(bytes32 indexed nullifier, address indexed recipient, uint256 amount);

    error InvalidRecipient();
    error TransferFailed();
    error ZeroDeposit();
    error CommitmentExists();
    error Unauthorized();
    error NullifierSpent();
    error InsufficientContractBalance();

    constructor() {
        owner = msg.sender;
    }

    function announceStealth(
        address payable stealthRecipient,
        bytes32 ephemeralPubKeyHash,
        bytes32 encryptedViewPayload
    ) external payable {
        if (stealthRecipient == address(0)) revert InvalidRecipient();
        
        if (msg.value > 0) {
            (bool ok, ) = stealthRecipient.call{value: msg.value}("");
            if (!ok) revert TransferFailed();
        }

        uint256 id = announcements.length;
        announcements.push(Announcement({
            sender: msg.sender,
            stealthRecipient: stealthRecipient,
            ephemeralPubKeyHash: ephemeralPubKeyHash,
            encryptedViewPayload: encryptedViewPayload,
            amount: msg.value,
            timestamp: uint64(block.timestamp)
        }));

        emit StealthAnnounced(id, msg.sender, stealthRecipient, ephemeralPubKeyHash, msg.value);
    }

    function depositShielded(bytes32 commitment) external payable {
        if (msg.value == 0) revert ZeroDeposit();
        if (commitments[commitment]) revert CommitmentExists();
        commitments[commitment] = true;
        emit ShieldedDeposit(commitment, msg.value);
    }

    function withdrawShielded(bytes32 nullifier, address payable recipient, uint256 amount) external {
        if (msg.sender != owner && recipient != msg.sender) revert Unauthorized();
        if (spentNullifiers[nullifier]) revert NullifierSpent();
        if (address(this).balance < amount) revert InsufficientContractBalance();
        
        spentNullifiers[nullifier] = true;
        (bool ok, ) = recipient.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit ShieldedWithdraw(nullifier, recipient, amount);
    }

    function getAnnouncementsCount() external view returns (uint256) {
        return announcements.length;
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
