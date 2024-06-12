import { ethers } from "ethers";

import { Quote } from "../interface/interface";
import { getChainId, getStepTimeLock } from "../utils/chain";
import { convertMinimumUnits, convertNativeMinimumUnits } from "../utils/math";


const cache = {
    tokensInfo: {},
    tokens: {}
}

export const getCache = (system_chain_id: number, token_address: string) => {
    if(cache.tokens[system_chain_id] == undefined) cache.tokens[system_chain_id] = {}
    if(cache.tokens[system_chain_id][token_address] == undefined) cache.tokens[system_chain_id][token_address] = new ethers.Contract(token_address, ABI.erc20, this.evm_logic.getProvider(system_chain_id));
    return cache.tokens[system_chain_id][token_address]
}

export const checkTokenInfoBoxExist = (system_chain_id: number, token_address: string) => {
    if(cache.tokensInfo[system_chain_id] == undefined) cache.tokensInfo[system_chain_id] = {}
    if(cache.tokensInfo[system_chain_id][token_address] == undefined) cache.tokensInfo[system_chain_id][token_address] = {}
}

export const decimals = (system_chain_id: number, token_address: string) => new Promise(async (resolve, reject) => {
    checkTokenInfoBoxExist(system_chain_id, token_address)
    if(cache.tokensInfo[system_chain_id][token_address].decimals == undefined){
        cache.tokensInfo[system_chain_id][token_address].decimals = await getCache(system_chain_id, token_address).decimals()
    } 
    resolve(cache.tokensInfo[system_chain_id][token_address].decimals)
})

export const getSignDataEIP712 = async (quote: Quote, network: string, amount: string, dstAmount: string, dstNativeAmount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined) => {
    const domain = {
        name: 'OtmoicSwap',
        version: '1',
        chainId: getChainId(quote.quote_base.bridge.src_chain_id, network),
    };

    const srcDecimals = await decimals(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.src_token)
    const dstDecimals = await decimals(quote.quote_base.bridge.dst_chain_id, quote.quote_base.bridge.dst_token)

    const signMessage = {
        src_chain_id: quote.quote_base.bridge.src_chain_id,
        src_address: quote.quote_base.lp_bridge_address,
        src_token: quote.quote_base.bridge.src_token,
        src_amount: convertMinimumUnits(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.src_token, amount, srcDecimals),

        dst_chain_id: quote.quote_base.bridge.dst_chain_id,
        dst_address: receivingAddress,
        dst_token: quote.quote_base.bridge.dst_token,
        dst_amount: convertMinimumUnits(quote.quote_base.bridge.dst_chain_id, quote.quote_base.bridge.dst_token, dstAmount, dstDecimals),
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