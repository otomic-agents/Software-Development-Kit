import { Connection, PublicKey } from "@solana/web3.js";
import { doTransferOutConfirm, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";

export const _transferOutConfirmByWalletPlugin = 
    (uuid: string, preBusiness: PreBusiness, phantomAPI: any, network: string, rpc: string | undefined) => 
        new Promise<string>(async (resolve, reject) => {

    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)
    
    const transferOutConfirmTx = await doTransferOutConfirm(uuid, preBusiness, provider, network)

    const latestBlockhash = await provider.getLatestBlockhash()
    transferOutConfirmTx.recentBlockhash = latestBlockhash.blockhash
    transferOutConfirmTx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender)

    try {
        const signature = await phantomAPI.signAndSendTransaction(transferOutConfirmTx);
        resolve(signature)
    } catch (err) {
        reject(err)
    }
})
