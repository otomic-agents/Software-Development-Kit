import { Contract, ContractTransactionResponse, JsonRpcProvider, Provider, Wallet, ethers } from "ethers";
import BigNumber from "bignumber.js";

import ABI from "./evmABI"
import { PreBusiness, Quote } from "../interface/interface";
import { getChainId, getChainType, getOtmoicAddressBySystemChainId, getStepTimeLock } from "../utils/chain";
import { convertMinimumUnits, convertNativeMinimumUnits, convertStandardUnits } from "../utils/math";
import { getTransferInConfirmData, getTransferOutConfirmData, getTransferOutData } from "../utils/data";
import { decimals as solanaDecimals, getDefaultRPC as getSolanaDefaultRPC} from "../business/solana";
import { toHexAddress } from "../utils/format";

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
            return isMainnet ? 'https://endpoints.omniatech.io/v1/bsc/mainnet/a6561bfe08614178a5a993e03df2c6d1' : 'https://bsc-testnet.public.blastapi.io';
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

    let srcDecimals: any
    if (getChainType(quote.quote_base.bridge.src_chain_id) === 'evm') {
        srcDecimals = await decimals(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.src_token, rpcSrc == undefined ? getDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc)
    } else if (getChainType(quote.quote_base.bridge.src_chain_id) === 'solana') {
        srcDecimals = await solanaDecimals(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.src_token, rpcSrc == undefined ? getSolanaDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc)
    }

    let dstDecimals: any
    if (getChainType(quote.quote_base.bridge.dst_chain_id) === 'evm') {
        dstDecimals = await decimals(quote.quote_base.bridge.dst_chain_id, quote.quote_base.bridge.dst_token, rpcDst == undefined ? getDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst)
    } else if (getChainType(quote.quote_base.bridge.dst_chain_id) === 'solana') {
        dstDecimals = await solanaDecimals(quote.quote_base.bridge.dst_chain_id, quote.quote_base.bridge.dst_token, rpcDst == undefined ? getSolanaDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst)
    }
 
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
        data.tokenAmount,
        data.ethAmount,
        data.hashlock,
        data.relayHashlock,
        data.stepTimelock,
        data.preimage,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        data.agreementReachedTime
    )

    resolve(transferOutCfmTx)
})

export const doTransferInConfirm =
    (preBusiness: PreBusiness, provider: JsonRpcProvider, wallet: Wallet | undefined, network: string, sender: string) =>
        new Promise<ContractTransactionResponse>(async (resolve, reject) => {
  
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id

    const otmoic = new ethers.Contract(getOtmoicAddressBySystemChainId(systemChainId, network), ABI.otmoic, provider).connect(wallet == undefined ? await provider.getSigner() : wallet)
    const data = getTransferInConfirmData(preBusiness, sender)
    const transferInCfmTx = await otmoic.getFunction('confirmTransferIn').send(
        data.sender,
        data.receiver,
        data.token,
        data.amount,
        data.nativeAmount,
        data.hashlock,
        data.stepTimeLock,
        data.preimage,
        data.agreementReachedTime
    )   

    resolve(transferInCfmTx)
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
        data.tokenAmount,
        data.ethAmount,
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

    return convertStandardUnits(balance, decimals)
}

export const _getComplainSignData = async (preBusiness: PreBusiness, network: string) => {

    const eip712Domain = {
        name: 'Otmoic Reputation',
        version: '1',
        chainId: network == 'mainnet' ? 10 : 11155420,
        verifyingContract: network == 'mainnet' ? '0xE924F7f68D1dcd004720e107F62c6303aF271ed3' : '0xe69257d83b2c50b2d7496348d053d76c744753e4'
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
            { name: 'stepTimeLock', type: 'uint64' },
            { name: 'agreementReachedTime', type: 'uint64' },
            { name: 'userSign', type: 'string' },
            { name: 'lpSign', type: 'string' },
        ]
    }

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
        stepTimeLock: preBusiness.swap_asset_information.step_time_lock,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
        userSign: preBusiness.swap_asset_information.user_sign,
        lpSign: preBusiness.swap_asset_information.lp_sign
    }

    return {
        types: complaintType,
        primaryType: 'Complaint',
        domain: eip712Domain,
        message: complaintValue
    }
}
