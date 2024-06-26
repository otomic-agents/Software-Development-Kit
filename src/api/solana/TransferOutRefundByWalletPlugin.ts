import { Connection, PublicKey } from "@solana/web3.js";
import { doTransferOutRefund, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";

export const _transferOutRefundByWalletPlugin = 
    (uuid: string, preBusiness: PreBusiness, phantomAPI: any, network: string, rpc: string | undefined) => 
        new Promise<string>(async (resolve, reject) => {
    
    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)
    
    const transferOutRefundTx = await doTransferOutRefund(uuid, preBusiness, provider, network)

    const latestBlockhash = await provider.getLatestBlockhash()
    transferOutRefundTx.recentBlockhash = latestBlockhash.blockhash
    transferOutRefundTx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender)

    try {
        const signature = await phantomAPI.signAndSendTransaction(transferOutRefundTx);
        resolve(signature)
    } catch (err) {
        reject(err)
    }
})