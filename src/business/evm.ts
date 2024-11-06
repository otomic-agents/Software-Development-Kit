import { Contract, ContractTransaction, ContractTransactionResponse, JsonRpcProvider, Wallet, ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import ABI from './evmABI';
import { PreBusiness, Quote } from '../interface/interface';
import {
    getChainId,
    getChainType,
    getOtmoicAddressBySystemChainId,
    getExpectedSingleStepTime,
    getTolerantSingleStepTime,
    getDefaultEarliestRefundTime,
    getDefaultGasPrice,
    getMaximumGasPrice,
    getNativeTokenDecimals,
    getNativeTokenName,
} from '../utils/chain';
import { convertMinimumUnits, convertNativeMinimumUnits, convertStandardUnits } from '../utils/math';
import { getTransferInConfirmData, getTransferOutConfirmData, getTransferOutData } from '../utils/data';
import { decimals as solanaDecimals, getDefaultRPC as getSolanaDefaultRPC } from '../business/solana';
import { toHexAddress, isZeroAddress } from '../utils/format';

interface Tokens {
    [key: number]: {
        [key: string]: Contract;
    };
}

interface TokensInfo {
    [key: number]: {
        [key: string]: any;
    };
}

interface Cache {
    tokens: Tokens;
    tokensInfo: TokensInfo;
}

const cache: Cache = {
    tokensInfo: {},
    tokens: {},
};

export const getProvider = (rpc: string): JsonRpcProvider => {
    let provider = new ethers.JsonRpcProvider(rpc);
    return provider;
};

export const getCache = (system_chain_id: number, token_address: string, rpc: string) => {
    if (cache.tokens[system_chain_id] == undefined) cache.tokens[system_chain_id] = {};
    if (cache.tokens[system_chain_id][token_address] == undefined)
        cache.tokens[system_chain_id][token_address] = new ethers.Contract(token_address, ABI.erc20, getProvider(rpc));
    return cache.tokens[system_chain_id][token_address];
};

export const checkTokenInfoBoxExist = (system_chain_id: number, token_address: string) => {
    if (cache.tokensInfo[system_chain_id] == undefined) cache.tokensInfo[system_chain_id] = {};
    if (cache.tokensInfo[system_chain_id][token_address] == undefined)
        cache.tokensInfo[system_chain_id][token_address] = {};
};

export const decimals = (system_chain_id: number, token_address: string, rpc: string) =>
    new Promise(async (resolve, reject) => {
        try {
            checkTokenInfoBoxExist(system_chain_id, token_address);
            if (cache.tokensInfo[system_chain_id][token_address].decimals == undefined) {
                if (isZeroAddress(token_address)) {
                    cache.tokensInfo[system_chain_id][token_address].decimals = getNativeTokenDecimals(system_chain_id);
                } else {
                    cache.tokensInfo[system_chain_id][token_address].decimals = await getCache(
                        system_chain_id,
                        token_address,
                        rpc,
                    ).decimals();
                }
            }
            resolve(cache.tokensInfo[system_chain_id][token_address].decimals);
        } catch (err) {
            reject(err);
        }
    });

export const decimalsDefaultRpc = (system_chain_id: number, token_address: string, network: string) => {
    const rpc = getDefaultRPC(system_chain_id, network);
    return decimals(system_chain_id, token_address, rpc);
};

export const symbol = (system_chain_id: number, token_address: string, rpc: string) =>
    new Promise<string>(async (resolve, reject) => {
        try {
            checkTokenInfoBoxExist(system_chain_id, token_address);
            if (cache.tokensInfo[system_chain_id][token_address].symbol == undefined) {
                if (isZeroAddress(token_address)) {
                    cache.tokensInfo[system_chain_id][token_address].symbol = getNativeTokenName(system_chain_id);
                } else {
                    cache.tokensInfo[system_chain_id][token_address].symbol = await getCache(
                        system_chain_id,
                        token_address,
                        rpc,
                    ).symbol();
                }
            }
            resolve(cache.tokensInfo[system_chain_id][token_address].symbol);
        } catch (err) {
            reject(err);
        }
    });

export const getDefaultRPC = (system_chain_id: number, network: string) => {
    const isMainnet = network == 'mainnet';
    switch (system_chain_id) {
        case 9000:
            return isMainnet ? 'https://rpc.ankr.com/avalanche' : 'https://rpc.ankr.com/avalanche_fuji';
        case 9006:
            return isMainnet ? 'https://bsc-dataseed.bnbchain.org' : 'https://bsc-testnet.public.blastapi.io';
        case 60:
            return isMainnet ? 'https://rpc.ankr.com/eth' : 'https://ethereum-sepolia-rpc.publicnode.com';
        case 966:
            return isMainnet ? 'https://polygon-bor-rpc.publicnode.com' : 'https://polygon-mumbai-pokt.nodies.app';
        case 614:
            return isMainnet ? 'https://mainnet.optimism.io' : 'https://sepolia.optimism.io';
        default:
            throw new Error('not found rpc node');
    }
};

export const _getSignDataEIP712 = async (
    quote: Quote,
    network: string,
    amount: string,
    dstAmount: string,
    dstNativeAmount: string,
    swapToNative: number,
    receivingAddress: string,
    expectedSingleStepTime: number | undefined,
    tolerantSingleStepTime: number | undefined,
    earliestRefundTime: number | undefined,
    rpcSrc: string | undefined,
    rpcDst: string | undefined,
) => {
    const domain = {
        name: 'OtmoicSwap',
        version: '1',
        chainId: getChainId(quote.quote_base.bridge.src_chain_id, network),
    };

    let srcDecimals: any;
    if (getChainType(quote.quote_base.bridge.src_chain_id) === 'evm') {
        srcDecimals = await decimals(
            quote.quote_base.bridge.src_chain_id,
            quote.quote_base.bridge.src_token,
            rpcSrc == undefined ? getDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc,
        );
    } else if (getChainType(quote.quote_base.bridge.src_chain_id) === 'solana') {
        srcDecimals = await solanaDecimals(
            quote.quote_base.bridge.src_chain_id,
            quote.quote_base.bridge.src_token,
            rpcSrc == undefined ? getSolanaDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc,
        );
    }

    let dstDecimals: any;
    if (getChainType(quote.quote_base.bridge.dst_chain_id) === 'evm') {
        dstDecimals = await decimals(
            quote.quote_base.bridge.dst_chain_id,
            quote.quote_base.bridge.dst_token,
            rpcDst == undefined ? getDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst,
        );
    } else if (getChainType(quote.quote_base.bridge.dst_chain_id) === 'solana') {
        dstDecimals = await solanaDecimals(
            quote.quote_base.bridge.dst_chain_id,
            quote.quote_base.bridge.dst_token,
            rpcDst == undefined ? getSolanaDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst,
        );
    }

    let agreementReachedTime = parseInt(((Date.now() + 1000 * 60 * 1) / 1000).toFixed(0));
    let defaultExpectedSingleStepTime = getExpectedSingleStepTime(
        quote.quote_base.bridge.src_chain_id,
        quote.quote_base.bridge.dst_chain_id,
    );
    let defaultTolerantSingleStepTime = getTolerantSingleStepTime(
        quote.quote_base.bridge.src_chain_id,
        quote.quote_base.bridge.dst_chain_id,
    );
    const signMessage = {
        src_chain_id: quote.quote_base.bridge.src_chain_id,
        src_address: quote.quote_base.lp_bridge_address,
        src_token: quote.quote_base.bridge.src_token,
        src_amount: convertMinimumUnits(amount, srcDecimals),

        dst_chain_id: quote.quote_base.bridge.dst_chain_id,
        dst_address: receivingAddress,
        dst_token: quote.quote_base.bridge.dst_token,
        dst_amount: convertMinimumUnits(dstAmount, dstDecimals),
        dst_native_amount: convertNativeMinimumUnits(quote.quote_base.bridge.dst_chain_id, dstNativeAmount),

        requestor: '', //user_address.value,
        lp_id: quote.lp_info.name,
        agreement_reached_time: agreementReachedTime,
        expected_single_step_time:
            expectedSingleStepTime == undefined ? defaultExpectedSingleStepTime : expectedSingleStepTime,
        tolerant_single_step_time:
            tolerantSingleStepTime == undefined ? defaultTolerantSingleStepTime : tolerantSingleStepTime,
        earliest_refund_time:
            earliestRefundTime == undefined
                ? getDefaultEarliestRefundTime(
                      agreementReachedTime,
                      defaultExpectedSingleStepTime,
                      defaultTolerantSingleStepTime,
                  )
                : earliestRefundTime,
    };

    const typedData = {
        types: {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
            ],
            Message: [
                { name: 'src_chain_id', type: 'uint256' },
                { name: 'src_address', type: 'string' },
                { name: 'src_token', type: 'string' },
                { name: 'src_amount', type: 'string' },
                { name: 'dst_chain_id', type: 'uint256' },
                { name: 'dst_address', type: 'string' },
                { name: 'dst_token', type: 'string' },
                { name: 'dst_amount', type: 'string' },
                { name: 'dst_native_amount', type: 'string' },
                { name: 'requestor', type: 'string' },
                { name: 'lp_id', type: 'string' },
                { name: 'agreement_reached_time', type: 'uint256' },
                { name: 'expected_single_step_time', type: 'uint256' },
                { name: 'tolerant_single_step_time', type: 'uint256' },
                { name: 'earliest_refund_time', type: 'uint256' },
            ],
        },
        primaryType: 'Message',
        domain,
        message: signMessage,
    };

    return typedData;
};

export const getJsonRpcProvider = (preBusiness: PreBusiness, rpc: string | undefined, network: string) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;
    return new ethers.JsonRpcProvider(
        rpc == undefined ? getDefaultRPC(systemChainId, network) : rpc,
        getChainId(systemChainId, network),
    );
};

export const getJsonRpcProviderByChainId = (chainId: number, rpc: string | undefined, network: string) => {
    return new ethers.JsonRpcProvider(
        rpc == undefined ? getDefaultRPC(chainId, network) : rpc,
        getChainId(chainId, network),
    );
};

export const _isNeedApprove = (
    preBusiness: PreBusiness,
    user_wallet: string,
    rpc: string | undefined,
    network: string,
) =>
    new Promise<Boolean>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;
            const tokenAddress = preBusiness.swap_asset_information.quote.quote_base.bridge.src_token;
            const amount = preBusiness.swap_asset_information.amount;

            if (isZeroAddress(tokenAddress)) {
                resolve(false);
                return;
            }

            checkTokenInfoBoxExist(systemChainId, tokenAddress);
            let allowance = await getCache(
                systemChainId,
                tokenAddress,
                rpc == undefined ? getDefaultRPC(systemChainId, network) : rpc,
            ).allowance(user_wallet, getOtmoicAddressBySystemChainId(systemChainId, network));
            resolve(new BigNumber(amount).comparedTo(allowance.toString()) == 1);
        } catch (err) {
            reject(err);
        }
    });

export const doApprove = (
    preBusiness: PreBusiness,
    provider: JsonRpcProvider,
    wallet: Wallet | undefined,
    network: string,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;
            const tokenAddress = preBusiness.swap_asset_information.quote.quote_base.bridge.src_token;
            const amount = preBusiness.swap_asset_information.amount;

            const erc20 = new ethers.Contract(tokenAddress, ABI.erc20, provider).connect(
                wallet == undefined ? await provider.getSigner() : wallet,
            );
            // const erc20 = new ethers.Contract(tokenAddress, ABI.erc20, provider)
            const approveTx = await erc20
                .getFunction('approve')
                .send(getOtmoicAddressBySystemChainId(systemChainId, network), amount, {
                    gasPrice: await _getGasPrice(provider, systemChainId, network),
                });
            resolve(approveTx);
        } catch (err) {
            reject(err);
        }
    });

export const _getApproveTransfer = (preBusiness: PreBusiness, network: string) =>
    new Promise<ContractTransaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;
            const tokenAddress = preBusiness.swap_asset_information.quote.quote_base.bridge.src_token;
            const amount = preBusiness.swap_asset_information.amount;

            const erc20 = new ethers.Contract(tokenAddress, ABI.erc20, undefined);
            resolve(
                await erc20
                    .getFunction('approve')
                    .populateTransaction(getOtmoicAddressBySystemChainId(systemChainId, network), amount),
            );
        } catch (error) {
            reject(error);
        }
    });

export const doTransferOut = (
    preBusiness: PreBusiness,
    provider: JsonRpcProvider,
    wallet: Wallet | undefined,
    network: string,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            const otmoic = new ethers.Contract(
                getOtmoicAddressBySystemChainId(systemChainId, network),
                ABI.otmoic,
                provider,
            ).connect(wallet == undefined ? await provider.getSigner() : wallet);
            const data = getTransferOutData(preBusiness);
            console.log(`transfer out data`, data);

            let transferOutTx: ContractTransactionResponse;
            if (isZeroAddress(data.token)) {
                transferOutTx = await otmoic
                    .getFunction('transferOut')
                    .send(
                        data.sender,
                        data.bridge,
                        data.token,
                        data.amount,
                        data.hashlock,
                        data.expectedSingleStepTime,
                        data.tolerantSingleStepTime,
                        data.earliestRefundTime,
                        data.dstChainId,
                        data.dstAddress,
                        data.bidId,
                        data.tokenDst,
                        data.amountDst,
                        data.nativeAmountDst,
                        data.agreementReachedTime,
                        data.requestor,
                        data.lpId,
                        data.userSign,
                        data.lpSign,
                        {
                            gasPrice: await _getGasPrice(provider, systemChainId, network),
                            value: data.amount,
                        },
                    );
            } else {
                transferOutTx = await otmoic
                    .getFunction('transferOut')
                    .send(
                        data.sender,
                        data.bridge,
                        data.token,
                        data.amount,
                        data.hashlock,
                        data.expectedSingleStepTime,
                        data.tolerantSingleStepTime,
                        data.earliestRefundTime,
                        data.dstChainId,
                        data.dstAddress,
                        data.bidId,
                        data.tokenDst,
                        data.amountDst,
                        data.nativeAmountDst,
                        data.agreementReachedTime,
                        data.requestor,
                        data.lpId,
                        data.userSign,
                        data.lpSign,
                        {
                            gasPrice: await _getGasPrice(provider, systemChainId, network),
                        },
                    );
            }
            resolve(transferOutTx);
        } catch (err) {
            reject(err);
        }
    });

export const _getTransferOutTransfer = (preBusiness: PreBusiness, network: string) =>
    new Promise<ContractTransaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic);
            const data = getTransferOutData(preBusiness);
            console.log('tx datda', data);

            let tx: ContractTransaction;
            if (isZeroAddress(data.token)) {
                tx = await otmoic
                    .getFunction('transferOut')
                    .populateTransaction(
                        data.sender,
                        data.bridge,
                        data.token,
                        data.amount,
                        data.hashlock,
                        data.expectedSingleStepTime,
                        data.tolerantSingleStepTime,
                        data.earliestRefundTime,
                        data.dstChainId,
                        data.dstAddress,
                        data.bidId,
                        data.tokenDst,
                        data.amountDst,
                        data.nativeAmountDst,
                        data.agreementReachedTime,
                        data.requestor,
                        data.lpId,
                        data.userSign,
                        data.lpSign,
                        {
                            value: data.amount,
                        },
                    );
            } else {
                tx = await otmoic
                    .getFunction('transferOut')
                    .populateTransaction(
                        data.sender,
                        data.bridge,
                        data.token,
                        data.amount,
                        data.hashlock,
                        data.expectedSingleStepTime,
                        data.tolerantSingleStepTime,
                        data.earliestRefundTime,
                        data.dstChainId,
                        data.dstAddress,
                        data.bidId,
                        data.tokenDst,
                        data.amountDst,
                        data.nativeAmountDst,
                        data.agreementReachedTime,
                        data.requestor,
                        data.lpId,
                        data.userSign,
                        data.lpSign,
                    );
            }

            resolve(tx);
        } catch (error) {
            reject(error);
        }
    });

export const doTransferOutConfirm = (
    preBusiness: PreBusiness,
    provider: JsonRpcProvider,
    wallet: Wallet | undefined,
    network: string,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            const otmoic = new ethers.Contract(
                getOtmoicAddressBySystemChainId(systemChainId, network),
                ABI.otmoic,
                provider,
            ).connect(wallet == undefined ? await provider.getSigner() : wallet);
            const data = getTransferOutConfirmData(preBusiness);
            const transferOutCfmTx = await otmoic
                .getFunction('confirmTransferOut')
                .send(
                    data.sender,
                    data.receiver,
                    data.token,
                    data.tokenAmount,
                    data.ethAmount,
                    data.hashlock,
                    data.expectedSingleStepTime,
                    data.tolerantSingleStepTime,
                    data.earliestRefundTime,
                    data.preimage,
                    data.agreementReachedTime,
                    {
                        gasPrice: await _getGasPrice(provider, systemChainId, network),
                    },
                );
            resolve(transferOutCfmTx);
        } catch (err) {
            reject(err);
        }
    });

export const _getTransferOutConfirmTransfer = (preBusiness: PreBusiness, network: string) =>
    new Promise<ContractTransaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic);
            const data = getTransferOutConfirmData(preBusiness);
            const transferOutCfmTx = await otmoic
                .getFunction('confirmTransferOut')
                .populateTransaction(
                    data.sender,
                    data.receiver,
                    data.token,
                    data.tokenAmount,
                    data.ethAmount,
                    data.hashlock,
                    data.expectedSingleStepTime,
                    data.tolerantSingleStepTime,
                    data.earliestRefundTime,
                    data.preimage,
                    data.agreementReachedTime,
                );
            resolve(transferOutCfmTx);
        } catch (err) {
            reject(err);
        }
    });

export const doTransferInConfirm = (
    preBusiness: PreBusiness,
    provider: JsonRpcProvider,
    wallet: Wallet | undefined,
    network: string,
    sender: string,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id;

            const otmoic = new ethers.Contract(
                getOtmoicAddressBySystemChainId(systemChainId, network),
                ABI.otmoic,
                provider,
            ).connect(wallet == undefined ? await provider.getSigner() : wallet);
            const data = getTransferInConfirmData(preBusiness, sender);
            const transferInCfmTx = await otmoic
                .getFunction('confirmTransferIn')
                .send(
                    data.sender,
                    data.receiver,
                    data.token,
                    data.amount,
                    data.nativeAmount,
                    data.hashlock,
                    data.expectedSingleStepTime,
                    data.tolerantSingleStepTime,
                    data.earliestRefundTime,
                    data.preimage,
                    data.agreementReachedTime,
                    {
                        gasPrice: await _getGasPrice(provider, systemChainId, network),
                    },
                );
            resolve(transferInCfmTx);
        } catch (err) {
            reject(err);
        }
    });

export const _getTransferInConfirmTransfer = (preBusiness: PreBusiness, network: string, sender: string) =>
    new Promise<ContractTransaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id;

            const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic);
            const data = getTransferInConfirmData(preBusiness, sender);
            const transferInCfmTx = await otmoic
                .getFunction('confirmTransferIn')
                .populateTransaction(
                    data.sender,
                    data.receiver,
                    data.token,
                    data.amount,
                    data.nativeAmount,
                    data.hashlock,
                    data.expectedSingleStepTime,
                    data.tolerantSingleStepTime,
                    data.earliestRefundTime,
                    data.preimage,
                    data.agreementReachedTime,
                );
            resolve(transferInCfmTx);
        } catch (err) {
            reject(err);
        }
    });

export const doTransferOutRefund = (
    preBusiness: PreBusiness,
    provider: JsonRpcProvider,
    wallet: Wallet | undefined,
    network: string,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            const otmoic = new ethers.Contract(
                getOtmoicAddressBySystemChainId(systemChainId, network),
                ABI.otmoic,
                provider,
            ).connect(wallet == undefined ? await provider.getSigner() : wallet);
            const data = getTransferOutConfirmData(preBusiness);
            const transferOutRfdTx = await otmoic
                .getFunction('refundTransferOut')
                .send(
                    data.sender,
                    data.receiver,
                    data.token,
                    data.tokenAmount,
                    data.ethAmount,
                    data.hashlock,
                    data.expectedSingleStepTime,
                    data.tolerantSingleStepTime,
                    data.earliestRefundTime,
                    data.agreementReachedTime,
                    {
                        gasPrice: await _getGasPrice(provider, systemChainId, network),
                    },
                );
            resolve(transferOutRfdTx);
        } catch (err) {
            reject(err);
        }
    });

export const _getTransferOutRefundTransfer = (preBusiness: PreBusiness, network: string) =>
    new Promise<ContractTransaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic);
            const data = getTransferOutConfirmData(preBusiness);
            const transferOutRfdTx = await otmoic
                .getFunction('refundTransferOut')
                .populateTransaction(
                    data.sender,
                    data.receiver,
                    data.token,
                    data.tokenAmount,
                    data.ethAmount,
                    data.hashlock,
                    data.expectedSingleStepTime,
                    data.tolerantSingleStepTime,
                    data.earliestRefundTime,
                    data.agreementReachedTime,
                );
            resolve(transferOutRfdTx);
        } catch (err) {
            reject(err);
        }
    });

export const getBalance = async (
    network: string,
    systemChainId: number,
    token: string,
    address: string,
    rpc: string | undefined,
) => {
    if (isZeroAddress(token)) {
        const provider = getProvider(rpc == undefined ? getDefaultRPC(systemChainId, network) : rpc);
        const balance = await provider.getBalance(address);
        const decimals = getNativeTokenDecimals(systemChainId);
        return convertStandardUnits(balance, decimals);
    } else {
        const erc20 = new ethers.Contract(
            token,
            ABI.erc20,
            getProvider(rpc == undefined ? getDefaultRPC(systemChainId, network) : rpc),
        );
        const balance = await erc20.balanceOf(address);
        const decimals = await erc20.decimals();
        return convertStandardUnits(balance, decimals);
    }
};

export const _getComplainSignData = async (preBusiness: PreBusiness, network: string) => {
    const eip712Domain = {
        name: 'Otmoic Reputation',
        version: '1',
        chainId: network == 'mainnet' ? 10 : 11155420,
        verifyingContract:
            network == 'mainnet'
                ? '0xE924F7f68D1dcd004720e107F62c6303aF271ed3'
                : '0xd9d91A805e074932E3E6FeD399A814207106A69E',
    };

    const complaintType = {
        Complaint: [
            { name: 'srcChainId', type: 'uint64' },
            { name: 'srcAddress', type: 'uint256' },
            { name: 'srcToken', type: 'string' },
            { name: 'dstChainId', type: 'uint64' },
            { name: 'dstAddress', type: 'uint256' },
            { name: 'dstToken', type: 'string' },
            { name: 'srcAmount', type: 'string' },
            { name: 'dstAmount', type: 'string' },
            { name: 'dstNativeAmount', type: 'string' },
            { name: 'requestor', type: 'string' },
            { name: 'lpId', type: 'string' },
            { name: 'expectedSingleStepTime', type: 'uint64' },
            { name: 'tolerantSingleStepTime', type: 'uint64' },
            { name: 'earliestRefundTime', type: 'uint64' },
            { name: 'agreementReachedTime', type: 'uint64' },
            { name: 'userSign', type: 'string' },
            { name: 'lpSign', type: 'string' },
        ],
    };

    const complaintValue = {
        srcChainId: preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id,
        srcAddress: toHexAddress(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address),
        srcToken: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token,
        dstChainId: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id,
        dstAddress: toHexAddress(preBusiness.swap_asset_information.dst_address),
        dstToken: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token,
        srcAmount: preBusiness.swap_asset_information.amount,
        dstAmount: preBusiness.swap_asset_information.dst_amount,
        dstNativeAmount: preBusiness.swap_asset_information.dst_native_amount,
        requestor: preBusiness.swap_asset_information.sender,
        lpId: preBusiness.swap_asset_information.quote.lp_info.name,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
        expectedSingleStepTime: preBusiness.swap_asset_information.expected_single_step_time,
        tolerantSingleStepTime: preBusiness.swap_asset_information.tolerant_single_step_time,
        earliestRefundTime: preBusiness.swap_asset_information.earliest_refund_time,
        userSign: preBusiness.swap_asset_information.user_sign,
        lpSign: preBusiness.swap_asset_information.lp_sign,
    };

    return {
        types: complaintType,
        primaryType: 'Complaint',
        domain: eip712Domain,
        message: complaintValue,
    };
};

export async function _getGasPrice(provider: JsonRpcProvider, systemChainId: number, network: string): Promise<bigint> {
    let gasPrice = await getGasPriceFromNode(provider);
    if (!gasPrice) {
        gasPrice = await getGasPriceFromHistory(provider);
    }

    if (gasPrice) {
        if (gasPrice > getMaximumGasPrice(systemChainId, network)) {
            gasPrice = getMaximumGasPrice(systemChainId, network);
        }
    } else {
        gasPrice = getDefaultGasPrice(systemChainId, network);
    }

    let ret = addPremium(gasPrice);
    console.log('get gas price', ret.toString());
    return ret;
}

export async function _getOnChainGasPrice(systemChainId: number, network: string): Promise<bigint> {
    const provider = getProvider(getDefaultRPC(systemChainId, network));

    let gasPrice = await getGasPriceFromNode(provider);
    if (!gasPrice) {
        gasPrice = await getGasPriceFromHistory(provider);
    }

    return gasPrice || BigInt(0);
}

async function getGasPriceFromHistory(provider: JsonRpcProvider): Promise<bigint | undefined> {
    return new Promise((resolve, reject) => {
        provider
            .send('eth_feeHistory', [1, 'latest', [20, 80]])
            .then((result) => {
                // console.log('get gas history result', result);
                if (result.reward && result.reward[0] && result.reward[0][1]) {
                    resolve(BigInt(result.reward[0][1]));
                } else {
                    resolve(undefined);
                }
                resolve(result);
            })
            .catch((error) => {
                console.log('get gas history error', error);
                resolve(undefined);
            });
    });
}

async function getGasPriceFromNode(provider: JsonRpcProvider): Promise<bigint | undefined> {
    return new Promise((resolve, reject) => {
        provider
            .getFeeData()
            .then((result) => {
                // console.log('get gas price result', result);
                if (result.gasPrice) {
                    resolve(result.gasPrice);
                } else {
                    resolve(undefined);
                }
            })
            .catch((error) => {
                console.log('get gas price error', error);
                resolve(undefined);
            });
    });
}

function addPremium(gasPrice: bigint): bigint {
    // 1.5 times
    return (gasPrice * BigInt(150)) / BigInt(100);
}
