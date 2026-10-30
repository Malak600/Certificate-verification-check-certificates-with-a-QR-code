// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title CertiChain certificate registry
/// @notice Stores the SHA-256 hash of each issued certificate, who issued it and when,
///         and whether it was revoked. No personal data is stored on chain (KVKK).
/// @dev Epic E1. Stories S1 (record hash), S2 (only authorised wallets), S4 (revoke).
contract CertificateRegistry is AccessControl {
    /// Wallets with this role may issue and revoke certificates (the club's organisers).
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    /// Largest batch accepted in one transaction (an event has 50-70 attendees).
    uint256 public constant MAX_BATCH = 200;

    enum Status { NotFound, Valid, Revoked }

    struct Record {
        address issuer;     // wallet that issued the certificate
        uint64 issuedAt;    // block timestamp of issue
        uint64 revokedAt;   // 0 while the certificate is valid
    }

    mapping(bytes32 => Record) private records;

    event CertificateIssued(bytes32 indexed certHash, address indexed issuer, uint64 issuedAt);
    event CertificateRevoked(bytes32 indexed certHash, address indexed revokedBy, uint64 revokedAt);

    error EmptyHash();
    error AlreadyIssued(bytes32 certHash);
    error NotIssued(bytes32 certHash);
    error AlreadyRevoked(bytes32 certHash);
    error BadBatchSize(uint256 size);

    /// The deployer becomes the admin (can add/remove issuers) and the first issuer.
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /// @notice Record one certificate hash.
    function issue(bytes32 certHash) external onlyRole(ISSUER_ROLE) {
        _issue(certHash);
    }

    /// @notice Record all certificates of an event in one transaction.
    function issueBatch(bytes32[] calldata certHashes) external onlyRole(ISSUER_ROLE) {
        uint256 n = certHashes.length;
        if (n == 0 || n > MAX_BATCH) revert BadBatchSize(n);
        for (uint256 i = 0; i < n; i++) {
            _issue(certHashes[i]);
        }
    }

    /// @notice Mark a certificate as no longer valid. It stays on record as Revoked.
    function revoke(bytes32 certHash) external onlyRole(ISSUER_ROLE) {
        Record storage r = records[certHash];
        if (r.issuedAt == 0) revert NotIssued(certHash);
        if (r.revokedAt != 0) revert AlreadyRevoked(certHash);
        r.revokedAt = uint64(block.timestamp);
        emit CertificateRevoked(certHash, msg.sender, r.revokedAt);
    }

    /// @notice Free read for anyone: is this certificate valid, revoked or unknown?
    function verify(bytes32 certHash)
        external
        view
        returns (Status status, address issuer, uint64 issuedAt, uint64 revokedAt)
    {
        Record memory r = records[certHash];
        if (r.issuedAt == 0) return (Status.NotFound, address(0), 0, 0);
        status = r.revokedAt == 0 ? Status.Valid : Status.Revoked;
        return (status, r.issuer, r.issuedAt, r.revokedAt);
    }

    function _issue(bytes32 certHash) private {
        if (certHash == bytes32(0)) revert EmptyHash();
        if (records[certHash].issuedAt != 0) revert AlreadyIssued(certHash);
        uint64 nowTs = uint64(block.timestamp);
        records[certHash] = Record({ issuer: msg.sender, issuedAt: nowTs, revokedAt: 0 });
        emit CertificateIssued(certHash, msg.sender, nowTs);
    }
}
