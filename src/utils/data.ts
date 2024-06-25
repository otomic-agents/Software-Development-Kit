import { ethers } from "ethers";
import { PreBusiness } from "../interface/interface";
import { keccak_256 } from '@noble/hashes/sha3';

export const jsonParser = (src: string) => {
    let parsed = JSON.parse (src);
    if (typeof parsed === 'string') parsed = jsonParser(parsed);
    return parsed;
}

export const getTransferOutData = (preBusiness: PreBusiness) => {
    
    return {
        sender: preBusiness.swap_asset_information.sender,//address
        bridge: preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address,//adrress
        token: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token,//adrress
        amount: preBusiness.swap_asset_information.amount,//uint256
        hashlock: ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [preBusiness.preimage])),//bytes32
        relayHashlock: preBusiness.relay_hashlock_evm,
        stepTimelock: preBusiness.swap_asset_information.step_time_lock,//uint64
        dstChainId: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id,//uint64
        dstAddress: preBusiness.swap_asset_information.dst_address,//uint256
        bidId: preBusiness.hash,//uint64
        tokenDst: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token,//uint256
        amountDst: preBusiness.swap_asset_information.dst_amount,//uint256
        nativeAmountDst: preBusiness.swap_asset_information.dst_native_amount,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
        requestor: preBusiness.swap_asset_information.requestor,
        lpId: preBusiness.swap_asset_information.quote.lp_info.name,
        userSign: preBusiness.swap_asset_information.user_sign,
        lpSign:  preBusiness.swap_asset_information.lp_sign
    }
}

export const getTransferOutConfirmData = (preBusiness: PreBusiness) => {

    return {
        sender: preBusiness.swap_asset_information.sender,
        receiver: preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address,
        token: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token,
        token_amount: preBusiness.swap_asset_information.amount,
        eth_amount: 0,
        hashlock: ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [preBusiness.preimage])),
        relayHashlock: preBusiness.relay_hashlock_evm,
        stepTimelock: preBusiness.swap_asset_information.step_time_lock,
        preimage: preBusiness.preimage,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time
    }
}

export const getPreBusinessHashForSolana = (preBusiness: PreBusiness) => {
    let data = {
        sender: preBusiness.swap_asset_information.sender,
        receiver: preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address,
        hashlock: preBusiness.hashlock_solana,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
        stepTimelock: preBusiness.swap_asset_information.step_time_lock,
        token: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token,
        tokenAmount: preBusiness.swap_asset_information.amount
    }

    return Buffer.from(keccak_256(Buffer.from(JSON.stringify(data)))).toString('hex')
}