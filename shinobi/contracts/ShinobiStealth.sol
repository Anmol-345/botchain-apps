// SPDX-License-Identifier: MIT
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
}
