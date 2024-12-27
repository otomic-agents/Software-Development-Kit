import {
    Bridge,
    OnQuoteIF,
    AskIF,
    Quote,
    LpInfo,
    AuthenticationLimiter,
    QuoteBase,
    SwapSignData,
    PreBusiness,
    BusinessFullData,
    Business,
    GetBusinessOptions,
    DstAmountSet,
    ChainId,
    NetworkType,
    ComplainSignData,
    ComplainSignedData,
    SignComplainEIP712Option,
    SignSwapOption,
    SwapSignedData,
    SwapTransactionOption,
    GetBridgesOption,
    GasPrice,
    SwapType,
} from './interface/interface';
import { TranslatedBridge, ResponseTransferOut, ResponseSolana } from './interface/api';

import {
    getChainName,
    getChainType,
    getNativeTokenName,
    getTokenAddress,
    getChainId,
    getNativeTokenDecimals,
} from './utils/chain';
import { sleep } from './utils/sleep';
import {
    _getComplainSignData,
    _getSignDataEIP712,
    decimals as _evmDecimals,
    decimalsDefaultRpc as _evmDecimalsDefaultRpc,
    _isNeedApprove,
    _getApproveTransfer,
    _getTransferOutTransfer,
    _getTransferOutConfirmTransfer,
    _getTransferOutRefundTransfer,
    _getTransferInConfirmTransfer,
    _getGasPrice,
    _getOnChainGasPrice,
    _getInitSwap,
    _getConfirmSwap,
    _getRefundSwap,
} from './business/evm';
import { _signQuoteEIP712ByPrivateKey } from './api/evm/SignQuoteEIP712ByPrivateKey';
import { _signQuoteEIP712ByMetamaskAPI } from './api/evm/SignQuoteEIP712ByMetamaskAPI';
import { _signComplainEIP712ByPrivateKey } from './api/evm/SignComplainEIP712ByPrivateKey';
import { _signComplainEIP712ByTermiPass } from './api/evm/SignComplainEIP712ByTermiPass';
import { _swap } from './api/Swap';
import { _transferOutByPrivateKey } from './api/evm/TransferOutByPrivateKey';
import { _transferOutByMetamaskAPI } from './api/evm/TransferOutByMetamaskAPI';
import { _transferOutConfirmByPrivateKey } from './api/evm/TransferOutConfirmByPrivateKey';
import { _transferOutConfirmByMetamaskAPI } from './api/evm/TransferOutConfirmByMetamaskAPI';
import { _transferOutRefundByPrivateKey } from './api/evm/TransferOutRefundByPrivateKey';
import { _transferOutRefundByMetamaskAPI } from './api/evm/TransferOutRefundByMetamaskAPI';
import { _transferInConfirmByPrivateKey } from './api/evm/TransferInConfirmByPrivateKey';
import { _transferInConfirmByMetamaskAPI } from './api/evm/TransferInConfirmByMetamaskAPI';
import { _initSwapByPrivateKey } from './api/evm/InitSwapByPrivateKey';
import { _initSwapByMetamaskAPI } from './api/evm/InitSwapByMetamaskAPI';
import { _confirmSwapByPrivateKey } from './api/evm/ConfirmSwapByPrivateKey';
import { _confirmSwapByMetamaskAPI } from './api/evm/ConfirmSwapByMetamaskAPI';
import { _refundSwapByPrivateKey } from './api/evm/RefundSwapByPrivateKey';
import { _refundSwapByMetamaskAPI } from './api/evm/RefundSwapByMetamaskAPI';
import { _getHistory } from './api/GetHistory';
import { _getBusiness, _getBusinessFull } from './api/GetBusiness';
import { _getBridge } from './api/GetBridge';
import { QuoteManager } from './api/Quote';
import { mathReceived } from './utils/math';
import { getBalance } from './api/GetBalance';

import {
    _getSignDataEIP712 as _getSignDataSolana,
    _getSignPreambleEIP712,
    _getTransferOutConfirmTransaction,
    _getTransferOutTransaction,
    _getTransferOutRefundTransaction,
    decimals as _solanaDecimals,
    decimalsDefaultRpc as _solanaDecimalsDefaultRpc,
} from './business/solana';
import { _signQuoteByPrivateKey } from './api/solana/SignQuoteByPrivateKey';
import { _signQuoteByWalletPlugin } from './api/solana/SignQuoteByWalletPlugin';
import { _transferOutByPrivateKey as _transferOutSolanaByPrivateKey } from './api/solana/TransferOutByPrivateKey';
import { _transferOutByWalletPlugin } from './api/solana/TransferOutByWalletPlugin';
import { _transferOutConfirmByPrivateKey as _transferOutConfirmSolanaByPrivateKey } from './api/solana/TransferOutConfirmByPrivateKey';
import { _transferOutConfirmByWalletPlugin } from './api/solana/TransferOutConfirmByWalletPlugin';
import { _transferOutRefundByPrivateKey as _transferOutRefundSolanaByPrivateKey } from './api/solana/TransferOutRefundByPrivateKey';
import { _transferOutRefundByWalletPlugin } from './api/solana/TransferOutRefundByWalletPlugin';
import { _transferInConfirmByPrivateKey as _transferInConfirmSolanaByPrivateKey } from './api/solana/TransferInConfirmByPrivateKey';
import { _transferInConfirmByWalletPlugin } from './api/solana/TransferInConfirmByWalletPlugin';
import { submitComplain } from './api/SubmitComplain';
import { getDidName } from './utils/did';
import { Transaction } from '@solana/web3.js';
import { ContractTransaction, ContractTransactionResponse, JsonRpcProvider } from 'ethers';

export {
    Bridge,
    OnQuoteIF,
    AskIF,
    Quote,
    LpInfo,
    AuthenticationLimiter,
    QuoteBase,
    SwapSignData,
    PreBusiness,
    BusinessFullData,
    Business,
    GetBusinessOptions,
    DstAmountSet,
    ChainId,
    NetworkType,
    ComplainSignData,
    ComplainSignedData,
    SignComplainEIP712Option,
    SignSwapOption,
    SwapSignedData,
    SwapTransactionOption,
    GetBridgesOption,
    GasPrice,
    TranslatedBridge,
    ResponseTransferOut,
    ResponseSolana,
    SwapType,
};
export namespace Otmoic {
    export namespace utils {
        export const GetChainName = (systemChainId: ChainId): string => getChainName(systemChainId);

        export const GetNativeTokenName = (systemChainId: ChainId): string => getNativeTokenName(systemChainId);

        export const GetChainId = (systemChainId: ChainId, network: NetworkType): number | undefined =>
            getChainId(systemChainId, network);

        export const GetNativeTokenDecimals = (systemChainId: ChainId): number => getNativeTokenDecimals(systemChainId);

        export const GetTokenDecimals = (
            systemChainId: ChainId,
            tokenAddress: string,
            network: NetworkType,
            rpc: string | undefined,
        ): Promise<number> => {
            if (systemChainId == 501) {
                if (rpc) {
                    return _solanaDecimals(systemChainId, tokenAddress, rpc);
                } else {
                    return _solanaDecimalsDefaultRpc(systemChainId, tokenAddress, network);
                }
            } else {
                if (rpc) {
                    return _evmDecimals(systemChainId, tokenAddress, rpc);
                } else {
                    return _evmDecimalsDefaultRpc(systemChainId, tokenAddress, network);
                }
            }
        };

        export const GetChainType = (systemChainId: ChainId): string => getChainType(systemChainId);

        export const MathReceived = (quote: Quote, amount: string, swapToNative: number): DstAmountSet =>
            mathReceived(quote, amount, swapToNative);

        export const GetTokenAddress = (contractAddress: string, systemChainId: ChainId): string =>
            getTokenAddress(contractAddress, systemChainId);

        export const Sleep = (ms: number): Promise<void> => sleep(ms);

        export const IsNeedApprove = (
            preBusiness: PreBusiness,
            userWallet: string,
            rpc: string | undefined,
            network: NetworkType,
            contractAddress: string,
        ): Promise<boolean> => _isNeedApprove(preBusiness, userWallet, rpc, network, contractAddress);

        export const GetApproveTransfer = (
            preBusiness: PreBusiness,
            network: NetworkType,
        ): Promise<ContractTransaction> => _getApproveTransfer(preBusiness, network);

        export const GetGasPrice = (
            provider: JsonRpcProvider,
            systemChainId: ChainId,
            network: NetworkType,
        ): Promise<GasPrice> => _getGasPrice(provider, systemChainId, network);

        export const GetOnChainGasPrice = (systemChainId: ChainId, network: NetworkType): Promise<bigint> =>
            _getOnChainGasPrice(systemChainId, network);

        export const GetBalance = (
            bridge: Bridge,
            address: string,
            network: NetworkType,
            rpc: string | undefined,
        ): Promise<string> => {
            return getBalance(bridge, address, network, rpc);
        };
    }

    export namespace business {
        export const signQuote = (
            network: NetworkType,
            quote: Quote,
            amount: string,
            swapToNative: number,
            receivingAddress: string,
            expectedSingleStepTime: number | undefined,
            tolerantSingleStepTime: number | undefined,
            earliestRefundTime: number | undefined,
            rpcSrc: string | undefined,
            rpcDst: string | undefined,
            option: SignSwapOption,
        ): Promise<SwapSignData | SwapSignedData> => {
            switch (getChainType(quote.quote_base.bridge.src_chain_id)) {
                case 'evm':
                    if (option.getSignDataOnly) {
                        const { dstAmount, dstNativeAmount } = mathReceived(quote, amount, swapToNative);
                        if (!option.swapType) {
                            return Promise.reject('swapType is required');
                        }
                        return _getSignDataEIP712(
                            quote,
                            network,
                            amount,
                            dstAmount,
                            dstNativeAmount,
                            swapToNative,
                            receivingAddress,
                            expectedSingleStepTime,
                            tolerantSingleStepTime,
                            earliestRefundTime,
                            rpcSrc,
                            rpcDst,
                            option.swapType,
                        );
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey) {
                                    return Promise.reject('privateKey is required');
                                }
                                if (!option.swapType) {
                                    return Promise.reject('swapType is required');
                                }
                                return _signQuoteEIP712ByPrivateKey(
                                    quote,
                                    option.privateKey,
                                    network,
                                    amount,
                                    swapToNative,
                                    receivingAddress,
                                    expectedSingleStepTime,
                                    tolerantSingleStepTime,
                                    earliestRefundTime,
                                    rpcSrc,
                                    rpcDst,
                                    option.swapType,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI || !option.sender) {
                                    return Promise.reject('metamaskAPI and sender is required');
                                }
                                if (!option.swapType) {
                                    return Promise.reject('swapType is required');
                                }
                                return _signQuoteEIP712ByMetamaskAPI(
                                    quote,
                                    option.metamaskAPI,
                                    option.sender,
                                    network,
                                    amount,
                                    swapToNative,
                                    receivingAddress,
                                    expectedSingleStepTime,
                                    tolerantSingleStepTime,
                                    earliestRefundTime,
                                    rpcSrc,
                                    rpcDst,
                                    option.swapType,
                                );

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                case 'solana':
                    if (option.getSignDataOnly) {
                        const { dstAmount, dstNativeAmount } = mathReceived(quote, amount, swapToNative);
                        return _getSignDataSolana(
                            quote,
                            network,
                            amount,
                            dstAmount,
                            dstNativeAmount,
                            swapToNative,
                            receivingAddress,
                            expectedSingleStepTime,
                            tolerantSingleStepTime,
                            earliestRefundTime,
                            rpcSrc,
                            rpcDst,
                        );
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey) {
                                    return Promise.reject('privateKey is required');
                                }
                                return _signQuoteByPrivateKey(
                                    quote,
                                    option.privateKey,
                                    network,
                                    amount,
                                    swapToNative,
                                    receivingAddress,
                                    expectedSingleStepTime,
                                    tolerantSingleStepTime,
                                    earliestRefundTime,
                                    rpcSrc,
                                    rpcDst,
                                );

                            case 'phantomAPI':
                                if (!option.phantomAPI || !option.sender) {
                                    return Promise.reject('phantomAPI and sender is required');
                                }
                                return _signQuoteByWalletPlugin(
                                    quote,
                                    option.phantomAPI,
                                    option.sender,
                                    network,
                                    amount,
                                    swapToNative,
                                    receivingAddress,
                                    expectedSingleStepTime,
                                    tolerantSingleStepTime,
                                    earliestRefundTime,
                                    rpcSrc,
                                    rpcDst,
                                );

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    return Promise.reject(`not support chain: ${quote.quote_base.bridge.src_chain_id}`);
            }
        };

        export const transferOut = (
            preBusiness: PreBusiness,
            network: NetworkType,
            rpc: string | undefined,
            option: SwapTransactionOption,
        ): Promise<ContractTransaction | ResponseTransferOut | Transaction | ResponseSolana> => {
            switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
                case 'evm':
                    if (option.getTxDataOnly) {
                        return _getTransferOutTransfer(preBusiness, network);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey || option.useMaximumGasPriceAtMost === undefined) {
                                    return Promise.reject('privateKey and useMaximumGasPriceAtMost is required');
                                }
                                return _transferOutByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    option.useMaximumGasPriceAtMost,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI) {
                                    return Promise.reject('metamaskAPI is required');
                                }
                                return _transferOutByMetamaskAPI(preBusiness, option.metamaskAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                case 'solana':
                    if (option.getTxDataOnly) {
                        return _getTransferOutTransaction(preBusiness, option.provider, network, option.pluginProvider);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey) {
                                    return Promise.reject('privateKey is required');
                                }
                                return _transferOutSolanaByPrivateKey(preBusiness, option.privateKey, network, rpc);

                            case 'phantomAPI':
                                if (!option.phantomAPI) {
                                    return Promise.reject('phantomAPI is required');
                                }
                                return _transferOutByWalletPlugin(preBusiness, option.phantomAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    return Promise.reject(
                        `not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`,
                    );
            }
        };

        export const transferOutConfirm = (
            preBusiness: PreBusiness,
            network: NetworkType,
            rpc: string | undefined,
            option: SwapTransactionOption,
        ): Promise<ContractTransaction | ContractTransactionResponse | Transaction | ResponseSolana> => {
            switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
                case 'evm':
                    if (option.getTxDataOnly) {
                        return _getTransferOutConfirmTransfer(preBusiness, network);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey || option.useMaximumGasPriceAtMost === undefined) {
                                    return Promise.reject('privateKey and useMaximumGasPriceAtMost is required');
                                }
                                return _transferOutConfirmByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    option.useMaximumGasPriceAtMost,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI) {
                                    return Promise.reject('metamaskAPI is required');
                                }
                                return _transferOutConfirmByMetamaskAPI(preBusiness, option.metamaskAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                case 'solana':
                    if (option.getTxDataOnly) {
                        return _getTransferOutConfirmTransaction(
                            preBusiness,
                            option.provider,
                            network,
                            option.pluginProvider,
                        );
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey) {
                                    return Promise.reject('privateKey is required');
                                }
                                return _transferOutConfirmSolanaByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                );

                            case 'phantomAPI':
                                if (!option.phantomAPI) {
                                    return Promise.reject('phantomAPI is required');
                                }
                                return _transferOutConfirmByWalletPlugin(preBusiness, option.phantomAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    return Promise.reject(
                        `not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`,
                    );
            }
        };

        export const transferInConfirm = (
            preBusiness: PreBusiness,
            network: NetworkType,
            rpc: string | undefined,
            sender: string,
            option: SwapTransactionOption,
        ): Promise<ContractTransaction | ContractTransactionResponse | Transaction | ResponseSolana> => {
            switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id)) {
                case 'evm':
                    if (option.getTxDataOnly) {
                        return _getTransferInConfirmTransfer(preBusiness, network, sender);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey || option.useMaximumGasPriceAtMost === undefined) {
                                    return Promise.reject('privateKey and useMaximumGasPriceAtMost is required');
                                }
                                return _transferInConfirmByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    sender,
                                    option.useMaximumGasPriceAtMost,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI) {
                                    return Promise.reject('metamaskAPI is required');
                                }
                                return _transferInConfirmByMetamaskAPI(
                                    preBusiness,
                                    option.metamaskAPI,
                                    network,
                                    rpc,
                                    sender,
                                );

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                case 'solana':
                    if (option.getTxDataOnly) {
                        return Promise.reject('not support getTxDataOnly');
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey) {
                                    return Promise.reject('privateKey is required');
                                }
                                return _transferInConfirmSolanaByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    sender,
                                );

                            case 'phantomAPI':
                                if (!option.phantomAPI) {
                                    return Promise.reject('phantomAPI is required');
                                }
                                return _transferInConfirmByWalletPlugin(
                                    preBusiness,
                                    option.phantomAPI,
                                    network,
                                    rpc,
                                    sender,
                                );

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    throw new Error(
                        `not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`,
                    );
            }
        };

        export const transferOutRefund = (
            preBusiness: PreBusiness,
            network: NetworkType,
            rpc: string | undefined,
            option: SwapTransactionOption,
        ): Promise<ContractTransaction | ContractTransactionResponse | Transaction | ResponseSolana> => {
            switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
                case 'evm':
                    if (option.getTxDataOnly) {
                        return _getTransferOutRefundTransfer(preBusiness, network);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey || option.useMaximumGasPriceAtMost === undefined) {
                                    return Promise.reject('privateKey and useMaximumGasPriceAtMost is required');
                                }
                                return _transferOutRefundByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    option.useMaximumGasPriceAtMost,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI) {
                                    return Promise.reject('metamaskAPI is required');
                                }
                                return _transferOutRefundByMetamaskAPI(preBusiness, option.metamaskAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                case 'solana':
                    if (option.getTxDataOnly) {
                        return _getTransferOutRefundTransaction(
                            preBusiness,
                            option.provider,
                            network,
                            option.pluginProvider,
                        );
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey) {
                                    return Promise.reject('privateKey is required');
                                }
                                return _transferOutRefundSolanaByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                );

                            case 'phantomAPI':
                                if (!option.phantomAPI) {
                                    return Promise.reject('phantomAPI is required');
                                }
                                return _transferOutRefundByWalletPlugin(preBusiness, option.phantomAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    throw new Error(
                        `not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`,
                    );
            }
        };

        export const initSwap = (
            preBusiness: PreBusiness,
            network: NetworkType,
            rpc: string | undefined,
            option: SwapTransactionOption,
        ): Promise<ContractTransaction | ResponseTransferOut | Transaction | ResponseSolana> => {
            switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
                case 'evm':
                    if (option.getTxDataOnly) {
                        return _getInitSwap(preBusiness, network);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey || option.useMaximumGasPriceAtMost === undefined) {
                                    return Promise.reject('privateKey and useMaximumGasPriceAtMost is required');
                                }
                                return _initSwapByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    option.useMaximumGasPriceAtMost,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI) {
                                    return Promise.reject('metamaskAPI is required');
                                }
                                return _initSwapByMetamaskAPI(preBusiness, option.metamaskAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    return Promise.reject(
                        `not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`,
                    );
            }
        };

        export const confirmSwap = (
            preBusiness: PreBusiness,
            network: NetworkType,
            rpc: string | undefined,
            option: SwapTransactionOption,
        ): Promise<ContractTransaction | ResponseTransferOut | Transaction | ResponseSolana> => {
            switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
                case 'evm':
                    if (option.getTxDataOnly) {
                        return _getConfirmSwap(preBusiness, network);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey || option.useMaximumGasPriceAtMost === undefined) {
                                    return Promise.reject('privateKey and useMaximumGasPriceAtMost is required');
                                }
                                return _confirmSwapByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    option.useMaximumGasPriceAtMost,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI) {
                                    return Promise.reject('metamaskAPI is required');
                                }
                                return _confirmSwapByMetamaskAPI(preBusiness, option.metamaskAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    return Promise.reject(
                        `not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`,
                    );
            }
        };

        export const refundSwap = (
            preBusiness: PreBusiness,
            network: NetworkType,
            rpc: string | undefined,
            option: SwapTransactionOption,
        ): Promise<ContractTransaction | ContractTransactionResponse | Transaction | ResponseSolana> => {
            switch (getChainType(preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id)) {
                case 'evm':
                    if (option.getTxDataOnly) {
                        return _getRefundSwap(preBusiness, network);
                    } else {
                        switch (option.type) {
                            case 'privateKey':
                                if (!option.privateKey || option.useMaximumGasPriceAtMost === undefined) {
                                    return Promise.reject('privateKey and useMaximumGasPriceAtMost is required');
                                }
                                return _refundSwapByPrivateKey(
                                    preBusiness,
                                    option.privateKey,
                                    network,
                                    rpc,
                                    option.useMaximumGasPriceAtMost,
                                );

                            case 'metamaskAPI':
                                if (!option.metamaskAPI) {
                                    return Promise.reject('metamaskAPI is required');
                                }
                                return _refundSwapByMetamaskAPI(preBusiness, option.metamaskAPI, network, rpc);

                            default:
                                return Promise.reject(`not support type: ${option.type}`);
                        }
                    }

                default:
                    return Promise.reject(
                        `not support chain: ${preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id}`,
                    );
            }
        };

        export const complain = async (
            preBusiness: PreBusiness,
            privateKey: string,
            network: NetworkType,
        ): Promise<string | boolean> => {
            const name = await getDidName(privateKey, network);
            if (name != undefined) {
                const signed = await _signComplainEIP712ByPrivateKey(preBusiness, privateKey, network);
                return await submitComplain(network, signed.signData.message, signed.signed, name);
            } else {
                return 'wallet not terminus did owner';
            }
        };

        export const signComplainEIP712 = (
            preBusiness: PreBusiness,
            network: NetworkType,
            option: SignComplainEIP712Option,
        ): Promise<ComplainSignedData | ComplainSignData> => {
            if (option.getSignDataOnly) {
                return Promise.resolve(_getComplainSignData(preBusiness, network));
            } else {
                switch (option.type) {
                    case 'privateKey':
                        if (!option.privateKey) {
                            return Promise.reject('privateKey is required');
                        }
                        return _signComplainEIP712ByPrivateKey(preBusiness, option.privateKey, network);

                    case 'termiPass':
                        if (!option.termiPassAPI) {
                            return Promise.reject('termiPassAPI is required');
                        }
                        return _signComplainEIP712ByTermiPass(preBusiness, option.termiPassAPI, network);

                    default:
                        return Promise.reject(`not support type: ${option.type}`);
                }
            }
        };
    }

    export class Relay {
        relayUrl: string;
        network: NetworkType = NetworkType.MAINNET;

        quoteManager: QuoteManager = new QuoteManager();

        constructor(relay: string) {
            if (relay == undefined) {
                throw new Error('The relay parameter is required. ');
            }

            this.relayUrl = relay;
        }

        getBridge = (option: GetBridgesOption): Promise<Bridge[] | TranslatedBridge[]> =>
            _getBridge(this.relayUrl, option);

        ask = (askIF: AskIF, callback: OnQuoteIF): void => this.quoteManager.ask(askIF, callback, this.relayUrl);

        stopAsk = (): void => this.quoteManager.stopAsk();

        swap = (quote: Quote, signData: SwapSignData, signed: string, swapType: SwapType): Promise<PreBusiness> =>
            _swap(quote, signData, signed, this.relayUrl, swapType);

        getHistory = (address: string, swapType: SwapType): Promise<BusinessFullData[]> =>
            _getHistory(this.relayUrl, address, swapType);

        getBusiness = (hash: string, options: GetBusinessOptions = {}): Promise<Business | BusinessFullData> => {
            if (options.detailed) {
                if (!options.swapType) {
                    return Promise.reject('swapType is required');
                }
                return _getBusinessFull(this.relayUrl, hash, options.swapType);
            } else {
                return _getBusiness(this.relayUrl, hash);
            }
        };
    }
}

export default Otmoic;
