import { Connection, Keypair } from "@solana/web3.js";
import { doTransferInConfirm, getJsonRpcProvider } from "../../business/solana";
import { PreBusiness } from "../../interface/interface";
import { removePrefix0x } from "../../utils/format"
import { ResponseSolana } from "../../interface/api"

export const _transferInConfirmByPrivateKey = 
    (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined, sender: string, uuid?: string) => 
        new Promise<ResponseSolana>(async (resolve, reject) => {
    const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(removePrefix0x(privateKey), 'hex')))
    const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network)
    let {tx, uuidBack} = await doTransferInConfirm(preBusiness, provider, network, sender, uuid)
    
    const latestBlockhash = await provider.getLatestBlockhash()
    tx.recentBlockhash = latestBlockhash.blockhash
    tx.feePayer = keypair.publicKey
    tx.sign(keypair)

    try {
        let txHash = await provider.sendRawTransaction(tx.serialize())

        resolve({
            txHash,
            uuid: uuidBack
        })
    } catch (err) {
        reject(err)
    }
})
