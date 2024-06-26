import { Connection, Keypair } from "@solana/web3.js";
import { doTransferOutRefund, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";


export const _transferOutRefundByPrivateKey = 
    (uuid: string, preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
        new Promise<string>(async (resolve, reject) => {
    
    const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, 'hex')))
    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)
    const transferOutRefundTx = await doTransferOutRefund(uuid, preBusiness, provider, network)
    
    const latestBlockhash = await provider.getLatestBlockhash()
    transferOutRefundTx.recentBlockhash = latestBlockhash.blockhash
    transferOutRefundTx.feePayer = keypair.publicKey
    transferOutRefundTx.sign(keypair)

    try {
        let txHash = await provider.sendRawTransaction(transferOutRefundTx.serialize())

        resolve(txHash)
    } catch (err) {
        reject(err)
    }
})