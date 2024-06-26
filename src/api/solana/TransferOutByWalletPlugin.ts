import { Connection, PublicKey } from "@solana/web3.js";
import { doTransferOut, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";
import { ResponseTransferOut } from "../../interface/api";

export const _transferOutByWalletPlugin = (uuid: string, preBusiness: PreBusiness, phantomAPI: any, network: string, rpc: string | undefined) => new Promise<string>(async (resolve, reject) => {
    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)

    //transfer out
    const transferOutTx = await doTransferOut(uuid, preBusiness, provider, network)
    
    const latestBlockhash = await provider.getLatestBlockhash()
    transferOutTx.recentBlockhash = latestBlockhash.blockhash
    transferOutTx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender)

    try {
        const signature = await phantomAPI.signAndSendTransaction(transferOutTx);
        resolve(signature)
    } catch (err) {
        reject(err)
    }
})