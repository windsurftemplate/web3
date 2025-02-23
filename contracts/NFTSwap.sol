// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFTSwap is ReentrancyGuard {
    using Address for address payable;

    enum AssetType { ETH, ERC20, ERC721 }

    struct PaymentSplit {
        address payable recipient;
        uint256 percentage;
    }

    struct Asset {
        AssetType assetType;
        address contractAddress; // Zero address for ETH
        uint256 tokenId;        // Used for ERC721
        uint256 amount;         // Used for ETH/ERC20
    }

    struct SwapDetails {
        Asset asset;
        address owner;
        bool isDeposited;
        PaymentSplit[] paymentSplits;
    }

    struct Swap {
        SwapDetails initiator;
        SwapDetails counterparty;
        uint256 deadline;
        bool isActive;
    }

    mapping(uint256 => Swap) public swaps;
    uint256 public nextSwapId;
    
    // 1 hour deadline by default
    uint256 public constant DEFAULT_DEADLINE = 1 hours;
    uint256 public constant TOTAL_PERCENTAGE = 10000; // 100% with 2 decimal places

    event SwapCreated(
        uint256 indexed swapId,
        address indexed creator,
        AssetType asset1Type,
        address asset1Contract,
        uint256 asset1TokenId,
        uint256 asset1Amount,
        AssetType asset2Type,
        address asset2Contract,
        uint256 asset2TokenId,
        uint256 asset2Amount
    );
    event NFTDeposited(uint256 indexed swapId, address indexed depositor);
    event SwapExecuted(uint256 indexed swapId);
    event SwapCancelled(uint256 indexed swapId);
    event NFTWithdrawn(uint256 indexed swapId, address indexed withdrawer);
    event PaymentDistributed(uint256 indexed swapId, address indexed recipient, uint256 amount);

    function createSwap(
        Asset memory _asset1,
        PaymentSplit[] calldata _splits1,
        Asset memory _asset2
    ) external payable returns (uint256) {
        require(validateAsset(_asset1), "Invalid asset 1");
        require(validateAsset(_asset2), "Invalid asset 2");
        require(validateSplits(_splits1), "Invalid payment splits");

        // Handle ETH deposit if asset1 is ETH
        if (_asset1.assetType == AssetType.ETH) {
            require(msg.value == _asset1.amount, "Incorrect ETH amount");
        }

        uint256 swapId = nextSwapId++;
        swaps[swapId] = Swap({
            initiator: SwapDetails({
                asset: _asset1,
                owner: msg.sender,
                isDeposited: _asset1.assetType == AssetType.ETH,
                paymentSplits: new PaymentSplit[](_splits1.length)
            }),
            counterparty: SwapDetails({
                asset: _asset2,
                owner: address(0),
                isDeposited: false,
                paymentSplits: new PaymentSplit[](0)
            }),
            deadline: block.timestamp + DEFAULT_DEADLINE,
            isActive: true
        });

        // Copy payment splits
        for (uint i = 0; i < _splits1.length; i++) {
            swaps[swapId].initiator.paymentSplits[i] = _splits1[i];
        }

        // Handle token deposits
        if (_asset1.assetType == AssetType.ERC20) {
            IERC20(_asset1.contractAddress).transferFrom(
                msg.sender,
                address(this),
                _asset1.amount
            );
            swaps[swapId].initiator.isDeposited = true;
        } else if (_asset1.assetType == AssetType.ERC721) {
            IERC721(_asset1.contractAddress).transferFrom(
                msg.sender,
                address(this),
                _asset1.tokenId
            );
            swaps[swapId].initiator.isDeposited = true;
        }

        emit SwapCreated(
            swapId,
            msg.sender,
            _asset1.assetType,
            _asset1.contractAddress,
            _asset1.tokenId,
            _asset1.amount,
            _asset2.assetType,
            _asset2.contractAddress,
            _asset2.tokenId,
            _asset2.amount
        );

        return swapId;
    }

    function validateAsset(Asset memory asset) internal pure returns (bool) {
        if (asset.assetType == AssetType.ETH) {
            return asset.amount > 0;
        } else if (asset.assetType == AssetType.ERC20) {
            return asset.contractAddress != address(0) && asset.amount > 0;
        } else if (asset.assetType == AssetType.ERC721) {
            return asset.contractAddress != address(0);
        }
        return false;
    }

    function acceptSwap(
        uint256 _swapId,
        PaymentSplit[] calldata _splits2
    ) external payable nonReentrant {
        Swap storage swap = swaps[_swapId];
        require(swap.isActive, "Swap is not active");
        require(block.timestamp < swap.deadline, "Swap has expired");
        require(!swap.counterparty.isDeposited, "NFT already deposited");
        require(validateSplits(_splits2), "Invalid payment splits");
        require(msg.value == swap.initiator.asset.amount, "Incorrect ETH amount");

        // Set counterparty payment splits
        swap.counterparty.paymentSplits = new PaymentSplit[](_splits2.length);
        for (uint i = 0; i < _splits2.length; i++) {
            swap.counterparty.paymentSplits[i] = _splits2[i];
        }

        // Transfer NFT
        IERC721(swap.counterparty.asset.contractAddress).transferFrom(
            msg.sender,
            address(this),
            swap.counterparty.asset.tokenId
        );

        swap.counterparty.owner = msg.sender;
        swap.counterparty.isDeposited = true;

        emit NFTDeposited(_swapId, msg.sender);
    }

    function depositNFT(uint256 _swapId) external payable nonReentrant {
        Swap storage swap = swaps[_swapId];
        require(swap.isActive, "Swap is not active");
        require(block.timestamp < swap.deadline, "Swap has expired");

        if (msg.sender == swap.initiator.owner) {
            require(!swap.initiator.isDeposited, "NFT already deposited");
            require(msg.value == swap.counterparty.asset.amount, "Incorrect ETH amount");
            IERC721(swap.initiator.asset.contractAddress).transferFrom(
                msg.sender,
                address(this),
                swap.initiator.asset.tokenId
            );
            swap.initiator.isDeposited = true;
        } else {
            revert("Not authorized");
        }

        emit NFTDeposited(_swapId, msg.sender);
    }

    function executeSwap(uint256 _swapId) external nonReentrant {
        Swap storage swap = swaps[_swapId];
        require(swap.isActive, "Swap is not active");
        require(block.timestamp < swap.deadline, "Swap has expired");
        require(
            msg.sender == swap.initiator.owner || msg.sender == swap.counterparty.owner,
            "Not authorized"
        );
        require(
            swap.initiator.isDeposited && swap.counterparty.isDeposited,
            "Both NFTs must be deposited"
        );

        // Distribute payments according to splits
        distributePayment(swap.initiator.paymentSplits, swap.initiator.asset.amount);
        distributePayment(swap.counterparty.paymentSplits, swap.counterparty.asset.amount);

        // Transfer NFTs
        IERC721(swap.initiator.asset.contractAddress).transferFrom(
            address(this),
            swap.counterparty.owner,
            swap.initiator.asset.tokenId
        );
        IERC721(swap.counterparty.asset.contractAddress).transferFrom(
            address(this),
            swap.initiator.owner,
            swap.counterparty.asset.tokenId
        );

        swap.isActive = false;
        emit SwapExecuted(_swapId);
    }

    function validateSplits(PaymentSplit[] calldata splits) internal pure returns (bool) {
        uint256 totalPercentage = 0;
        for (uint i = 0; i < splits.length; i++) {
            require(splits[i].recipient != address(0), "Invalid recipient");
            totalPercentage += splits[i].percentage;
        }
        return totalPercentage == TOTAL_PERCENTAGE;
    }

    function distributePayment(PaymentSplit[] storage splits, uint256 amount) internal {
        for (uint i = 0; i < splits.length; i++) {
            uint256 payment = (amount * splits[i].percentage) / TOTAL_PERCENTAGE;
            if (payment > 0) {
                splits[i].recipient.sendValue(payment);
                emit PaymentDistributed(nextSwapId - 1, splits[i].recipient, payment);
            }
        }
    }

    function withdrawNFT(uint256 _swapId) external nonReentrant {
        Swap storage swap = swaps[_swapId];
        require(swap.isActive, "Swap is not active");
        require(block.timestamp >= swap.deadline, "Swap has not expired");

        if (msg.sender == swap.initiator.owner && swap.initiator.isDeposited) {
            IERC721(swap.initiator.asset.contractAddress).transferFrom(
                address(this),
                swap.initiator.owner,
                swap.initiator.asset.tokenId
            );
            swap.initiator.isDeposited = false;
        } else if (msg.sender == swap.counterparty.owner && swap.counterparty.isDeposited) {
            IERC721(swap.counterparty.asset.contractAddress).transferFrom(
                address(this),
                swap.counterparty.owner,
                swap.counterparty.asset.tokenId
            );
            swap.counterparty.isDeposited = false;
        } else {
            revert("No NFT to withdraw");
        }

        if (!swap.initiator.isDeposited && !swap.counterparty.isDeposited) {
            swap.isActive = false;
        }

        emit NFTWithdrawn(_swapId, msg.sender);
    }
} 