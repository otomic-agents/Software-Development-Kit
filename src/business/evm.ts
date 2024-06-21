import { Contract, ContractTransactionResponse, JsonRpcProvider, Provider, Wallet, ethers } from "ethers";
import BigNumber from "bignumber.js";

import ABI from "./evmABI"
import { PreBusiness, Quote } from "../interface/interface";
import { getChainId, getOtmoicAddressBySystemChainId, getStepTimeLock } from "../utils/chain";
import { convertMinimumUnits, convertNativeMinimumUnits, convertStandardUnits } from "../utils/math";
import { getTransferOutConfirmData, getTransferOutData } from "../utils/data";

interface Tokens {
    [key: number]: {
        [key: string]: Contract
    };
}

interface TokensInfo {
    [key: number]: {
        [key: string]: any
    };
}

interface Cache {
    tokens: Tokens
    tokensInfo: TokensInfo
}

const cache: Cache = {
    tokensInfo: {},
    tokens: {}
}

export const getProvider = (rpc: string): JsonRpcProvider => {
    let provider = new ethers.JsonRpcProvider(rpc);
    return provider
}

export const getCache = (system_chain_id: number, token_address: string, rpc: string) => {
    if(cache.tokens[system_chain_id] == undefined) cache.tokens[system_chain_id] = {}
    if(cache.tokens[system_chain_id][token_address] == undefined) cache.tokens[system_chain_id][token_address] = new ethers.Contract(token_address, ABI.erc20, getProvider(rpc));
    return cache.tokens[system_chain_id][token_address]
}

export const checkTokenInfoBoxExist = (system_chain_id: number, token_address: string) => {
    if(cache.tokensInfo[system_chain_id] == undefined) cache.tokensInfo[system_chain_id] = {}
    if(cache.tokensInfo[system_chain_id][token_address] == undefined) cache.tokensInfo[system_chain_id][token_address] = {}
}

export const decimals = (system_chain_id: number, token_address: string, rpc: string) => new Promise(async (resolve, reject) => {
    checkTokenInfoBoxExist(system_chain_id, token_address)
    if(cache.tokensInfo[system_chain_id][token_address].decimals == undefined){
        cache.tokensInfo[system_chain_id][token_address].decimals = await getCache(system_chain_id, token_address, rpc).decimals()
    } 
    resolve(cache.tokensInfo[system_chain_id][token_address].decimals)
})

export const symbol = (system_chain_id: number, token_address: string, rpc: string) => new Promise<string>(async (resolve, reject) => {
    checkTokenInfoBoxExist(system_chain_id, token_address)
    if(cache.tokensInfo[system_chain_id][token_address].symbol == undefined){
        cache.tokensInfo[system_chain_id][token_address].symbol = await getCache(system_chain_id, token_address, rpc).symbol()
    } 
    resolve(cache.tokensInfo[system_chain_id][token_address].symbol)
})

export const getDefaultRPC = (system_chain_id: number, network: string) => {
    
    const isMainnet = network == 'mainnet'
    switch (system_chain_id) {
        case 9000:
            return isMainnet ? 'https://rpc.ankr.com/avalanche' : 'https://rpc.ankr.com/avalanche_fuji';
        case 9006:
            return isMainnet ? 'https://endpoints.omniatech.io/v1/bsc/mainnet/a6561bfe08614178a5a993e03df2c6d1' : 'https://alpha-wild-layer.bsc-testnet.discover.quiknode.pro/36e6335f383755d8fcceb64fe90000b3aecb516d';
        case 60:
            return isMainnet ? 'https://rpc.ankr.com/eth' : 'https://ethereum-sepolia-rpc.publicnode.com'
        case 966:
            return isMainnet ? 'https://polygon-bor-rpc.publicnode.com' : 'https://polygon-mumbai-pokt.nodies.app' 
        case 614:
            return isMainnet ? 'https://mainnet.optimism.io' : 'https://sepolia.optimism.io'
        default:
            throw new Error("not found rpc node");
            
    }
}

export const _getSignDataEIP712 = async (quote: Quote, network: string, amount: string, dstAmount: string, dstNativeAmount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, rpcDst: string | undefined) => {
    const domain = {
        name: 'OtmoicSwap',
        version: '1',
        chainId: getChainId(quote.quote_base.bridge.src_chain_id, network),
    };

    const srcDecimals = await decimals(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.src_token, rpcSrc == undefined ? getDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc)
    const dstDecimals = await decimals(quote.quote_base.bridge.dst_chain_id, quote.quote_base.bridge.dst_token, rpcDst == undefined ? getDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst)

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
        step_time_lock: stepTimeLock == undefined ? getStepTimeLock(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.dst_chain_id) : stepTimeLock,
        agreement_reached_time: parseInt(((Date.now() + 1000 * 60 * 1) / 1000).toFixed(0)),
    }

    const typedData = {
        types: {
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
            { name: 'step_time_lock', type: 'uint256' },
            { name: 'agreement_reached_time', type: 'uint256' },
            ],
        },
        primaryType: 'Message',
        domain,
        message: signMessage,
    };

    return typedData
}

export const getJsonRpcProvider = 
    (preBusiness: PreBusiness, rpc: string | undefined, network: string) => {

    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id
    return new ethers.JsonRpcProvider(
        rpc == undefined ? getDefaultRPC(systemChainId, network) : rpc,
        getChainId(systemChainId, network)
    )
}

export const isNeedApprove = 
    (preBusiness: PreBusiness, user_wallet: string, rpc: string | undefined, network: string) => 
        new Promise<Boolean>(async (resolve, reject) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id
    const tokenAddress = preBusiness.swap_asset_information.quote.quote_base.bridge.src_token
    const amount = preBusiness.swap_asset_information.amount

    checkTokenInfoBoxExist(systemChainId, tokenAddress)
    let allowance = await getCache(
        systemChainId, tokenAddress, 
        rpc == undefined ? getDefaultRPC(systemChainId, network) : rpc
    ).allowance(user_wallet, getOtmoicAddressBySystemChainId(systemChainId, network))
    resolve(new BigNumber(amount).comparedTo(allowance.toString()) == 1)
})

export const doApprove = 
    (preBusiness: PreBusiness, provider: JsonRpcProvider, wallet: Wallet | undefined, network: string) => 
        new Promise<ContractTransactionResponse>(async (resolve, reject) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id
    const tokenAddress = preBusiness.swap_asset_information.quote.quote_base.bridge.src_token
    const amount = preBusiness.swap_asset_information.amount

    const erc20 = new ethers.Contract(tokenAddress, ABI.erc20, provider).connect(wallet == undefined ? await provider.getSigner() : wallet)
    // const erc20 = new ethers.Contract(tokenAddress, ABI.erc20, provider)
    const approveTx = await erc20.getFunction('approve').send(getOtmoicAddressBySystemChainId(systemChainId, network), amount)
    resolve(approveTx)
})

export const doTransferOut = 
    (preBusiness: PreBusiness, provider: JsonRpcProvider, wallet: Wallet | undefined, network: string) => 
        new Promise<ContractTransactionResponse>(async (resolve, reject) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id

    const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic, provider).connect(wallet == undefined ? await provider.getSigner() : wallet)
    const data = getTransferOutData(preBusiness)
    const transferOutTx = await otmoic.getFunction('transferOut').send(
        data.sender,
        data.bridge,
        data.token,
        data.amount,
        data.hashlock,
        data.relayHashlock,
        data.stepTimelock,
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
        data.lpSign
    )
    resolve(transferOutTx)
})

export const doTransferOutConfirm = 
    (preBusiness: PreBusiness, provider: JsonRpcProvider, wallet: Wallet | undefined, network: string) => 
        new Promise<ContractTransactionResponse>(async (resolve, reject) => {
    
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id

    const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic, provider).connect(wallet == undefined ? await provider.getSigner() : wallet)
    const data = getTransferOutConfirmData(preBusiness)
    const transferOutCfmTx = await otmoic.getFunction('confirmTransferOut').send(
        data.sender,
        data.receiver,
        data.token,
        data.token_amount,
        data.eth_amount,
        data.hashlock,
        data.relayHashlock,
        data.stepTimelock,
        data.preimage,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        data.agreementReachedTime
    )

    resolve(transferOutCfmTx)
})

export const doTransferOutRefund =
    (preBusiness: PreBusiness, provider: JsonRpcProvider, wallet: Wallet | undefined, network: string) =>
        new Promise<ContractTransactionResponse>(async (resolve, reject) => {

    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id

    const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic, provider).connect(wallet == undefined ? await provider.getSigner() : wallet)
    const data = getTransferOutConfirmData(preBusiness)
    const transferOutRfdTx = await otmoic.getFunction('refundTransferOut').send(
        data.sender,
        data.receiver,
        data.token,
        data.token_amount,
        data.eth_amount,
        data.hashlock,
        data.relayHashlock,
        data.stepTimelock,
        data.agreementReachedTime
    )

    resolve(transferOutRfdTx)
})

export const getBalance = async (network: string, systemChainId: number, token: string, address: string, rpc: string | undefined) => {
    
    const erc20 = new ethers.Contract(token, ABI.erc20, getProvider(rpc == undefined ? getDefaultRPC(systemChainId, network) : rpc));
    const balance = await erc20.balanceOf(address)
    const decimals = await erc20.decimals()

    //TODO FIXME 乘除的方向反了
    return convertStandardUnits(balance, decimals)
}


