import { ethers } from 'ethers';
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
        relayHashlock: preBusiness.relay_hashlock_evm,
        stepTimelock: preBusiness.swap_asset_information.step_time_lock, //uint64
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
        relayHashlock: preBusiness.relay_hashlock_evm,
        stepTimelock: preBusiness.swap_asset_information.step_time_lock,
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
        stepTimeLock: preBusiness.swap_asset_information.step_time_lock,
        agreementReachedTime: preBusiness.swap_asset_information.agreement_reached_time,
    };
};
