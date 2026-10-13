// SPDX-License-Identifier: MIT
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

    // Ultra-lean single update function
    function updateFeed(bytes32 feedId, int256 value) public onlyReporter {
        Feed storage f = feeds[feedId];
        uint32 nextRound = f.roundId + 1;
        uint64 ts = uint64(block.timestamp);
        feeds[feedId] = Feed(value, ts, nextRound);
        emit FeedUpdated(feedId, value, ts, nextRound);
    }

    // Backward-compatible alias for registering
    function registerFeed(bytes32 feedId, string calldata, int256 initialValue) external onlyReporter {
        updateFeed(feedId, initialValue);
    }

    function getLatestFeed(bytes32 feedId) external view returns (int256 value, uint64 timestamp, uint32 roundId) {
        Feed storage f = feeds[feedId];
        if (f.timestamp == 0) revert FeedNotFound();
        return (f.value, f.timestamp, f.roundId);
    }
}
