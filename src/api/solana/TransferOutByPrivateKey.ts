import { Connection, Keypair } from "@solana/web3.js";
import { doTransferOut, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";

export const _transferOutByPrivateKey = 
    (uuid: string, preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
        new Promise<string>(async (resolve, reject) => {
    
    const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, 'hex')))

    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)

    //transfer out
    const transferOutTx = await doTransferOut(uuid, preBusiness, provider, network)
    
    const latestBlockhash = await provider.getLatestBlockhash()
    transferOutTx.recentBlockhash = latestBlockhash.blockhash
    transferOutTx.feePayer = keypair.publicKey
    transferOutTx.sign(keypair)

    try {
        let txHash = await provider.sendRawTransaction(transferOutTx.serialize())

        resolve(txHash)
    } catch (err) {
        reject(err)
    }
})