import { ethers } from 'ethers';
import { web3 } from '@coral-xyz/anchor';
import { keccak_256 } from '@noble/hashes/sha3';
import { PreBusiness } from '../interface/interface';

export const jsonParser = (src: string) => {
    let parsed = JSON.parse(src);
    if (typeof parsed === 'string') parsed = jsonParser(parsed);
    return parsed;
};

export const getTransferOutData = (preBusiness: PreBusiness) => {
    return {
        sender: preBusiness.swap_asset_information.sender, //address
        bridge: preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address, //adrress
        token: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token, //adrress
        amount: preBusiness.swap_asset_information.amount, //uint256
        hashlock: ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [preBusiness.preimage])), //bytes32
        expectedSingleStepTime: preBusiness.swap_asset_information.expected_single_step_time, //uint64
        tolerantSingleStepTime: preBusiness.swap_asset_information.tolerant_single_step_time, //uint64
        earliestRefundTime: preBusiness.swap_asset_information.earliest_refund_time, //uint64
        dstChainId: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id, //uint64
        dstAddress: preBusiness.swap_asset_information.dst_address, //uint256
        bidId: preBusiness.hash, //uint64
        tokenDst: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token, //uint256
        amountDst: preBusiness.swap_asset_information.dst_amount, //uint256
        nativeAmountDst: preBusiness.swap_asset_information.dst_native_amount,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
        requestor: preBusiness.swap_asset_information.requestor,
        lpId: preBusiness.swap_asset_information.quote.lp_info.name,
        userSign: preBusiness.swap_asset_information.user_sign,
        lpSign: preBusiness.swap_asset_information.lp_sign,
    };
};

export const getTransferOutConfirmData = (preBusiness: PreBusiness) => {
    return {
        sender: preBusiness.swap_asset_information.sender,
        receiver: preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address,
        token: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token,
        tokenAmount: preBusiness.swap_asset_information.amount,
        ethAmount: 0,
        hashlock: ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [preBusiness.preimage])),
        expectedSingleStepTime: preBusiness.swap_asset_information.expected_single_step_time, //uint64
        tolerantSingleStepTime: preBusiness.swap_asset_information.tolerant_single_step_time, //uint64
        earliestRefundTime: preBusiness.swap_asset_information.earliest_refund_time, //uint64
        preimage: preBusiness.preimage,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
    };
};

export const getTransferInConfirmData = (preBusiness: PreBusiness, sender: string) => {
    // wallet_address, // address _sender,
    // ethers.BigNumber.from(
    //   command_transfer_confirm.user_receiver_address
    // ).toHexString(), // address _receiver,
    // ethers.BigNumber.from(command_transfer_confirm.token).toHexString(), // address _token,
    // command_transfer_confirm.token_amount, // uint256 _token_amount,
    // command_transfer_confirm.eth_amount, // uint256 _eth_amount,
    // ethers.utils.arrayify(command_transfer_confirm.hash_lock), // bytes32 _hashlock,
    // command_transfer_confirm.step_time_lock, // uint64 _timelock,
    // ethers.utils.arrayify(command_transfer_confirm.preimage), // bytes32 _preimage
    // command_transfer_confirm.agreement_reached_time,

    return {
        sender: sender,
        receiver: preBusiness.swap_asset_information.dst_address,
        token: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token,
        amount: preBusiness.swap_asset_information.dst_amount,
        nativeAmount: preBusiness.swap_asset_information.dst_native_amount,
        hashlock: ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [preBusiness.preimage])),
        preimage: preBusiness.preimage,
        expectedSingleStepTime: preBusiness.swap_asset_information.expected_single_step_time, //uint64
        tolerantSingleStepTime: preBusiness.swap_asset_information.tolerant_single_step_time, //uint64
        earliestRefundTime: preBusiness.swap_asset_information.earliest_refund_time, //uint64
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
    };
};

export const getInitSwapData = (preBusiness: PreBusiness) => {
    return {
        sender: preBusiness.swap_asset_information.sender, //address
        receiver: preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address, //adrress
        srcToken: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token, //adrress
        srcAmount: preBusiness.swap_asset_information.amount, //uint256
        dstToken: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token, //uint256
        dstAmount: preBusiness.swap_asset_information.dst_amount, //uint256
        stepTime: preBusiness.swap_asset_information.expected_single_step_time, //uint64
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
        bidId: preBusiness.hash, //uint64
        requestor: preBusiness.swap_asset_information.requestor,
        lpId: preBusiness.swap_asset_information.quote.lp_info.name,
        userSign: preBusiness.swap_asset_information.user_sign,
        lpSign: preBusiness.swap_asset_information.lp_sign,
    };
};

export const getConfirmAndRefundSwapData = (preBusiness: PreBusiness) => {
    return {
        sender: preBusiness.swap_asset_information.sender, //address
        receiver: preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address, //adrress
        srcToken: preBusiness.swap_asset_information.quote.quote_base.bridge.src_token, //adrress
        srcAmount: preBusiness.swap_asset_information.amount, //uint256
        dstToken: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token, //uint256
        dstAmount: preBusiness.swap_asset_information.dst_amount, //uint256
        stepTime: preBusiness.swap_asset_information.expected_single_step_time, //uint64
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
    };
};

export function generateUuid(
    sender: web3.PublicKey,
    receiver: web3.PublicKey,
    hashlock: number[],
    agreementReachedTime: string,
    expectedSingleStepTime: string,
    tolerantSingleStepTime: string,
    earliestRefundTime: string,
    token: web3.PublicKey,
    tokenAmount: string,
    ethAmount: string,
): number[] {
    let data = Buffer.concat([
        sender.toBuffer(),
        receiver.toBuffer(),
        Buffer.from(hashlock),
        Buffer.from(agreementReachedTime),
        Buffer.from(expectedSingleStepTime),
        Buffer.from(tolerantSingleStepTime),
        Buffer.from(earliestRefundTime),
        token.toBuffer(),
        Buffer.from(tokenAmount),
        Buffer.from(ethAmount),
    ]);
    return Array.from(keccak_256(data));
}
