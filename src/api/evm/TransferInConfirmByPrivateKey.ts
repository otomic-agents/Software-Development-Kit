import { ContractTransactionResponse, ethers, JsonRpcProvider } from "ethers";
import { PreBusiness } from "../../interface/interface";
import { doTransferInConfirm, getJsonRpcProvider } from "../../business/evm";

export const _transferInConfirmByPrivateKey = (
    preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined, sender: string
) => new Promise<ContractTransactionResponse>(async (resolve, reject) => {
    
    const web3Wallet = new ethers.Wallet(privateKey)
    let fakePreBusiness = structuredClone(preBusiness)
    fakePreBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id
    let provider: JsonRpcProvider = getJsonRpcProvider(fakePreBusiness, rpc, network)

    const transferOutConfirmTx = await doTransferInConfirm(preBusiness, provider, web3Wallet.connect(provider), network, sender);

    resolve(transferOutConfirmTx)
})