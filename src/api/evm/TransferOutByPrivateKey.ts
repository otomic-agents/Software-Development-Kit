import { PreBusiness } from "../../interface/interface";
import { doApprove, doTransferOut, getJsonRpcProvider, isNeedApprove } from "../../business/evm";
import { ContractTransactionResponse, JsonRpcProvider, ethers } from "ethers";
import { ResponseTransferOut } from "../../interface/api";
import { sleep } from "../../utils/sleep";




export const _transferOutByPrivateKey = 
    (preBusiness: PreBusiness, privateKey: string, network: string, rpc: string | undefined) => 
        new Promise<ResponseTransferOut>(async (resolve, reject) => {
    
    const web3Wallet = new ethers.Wallet(privateKey)

    const provider: JsonRpcProvider = getJsonRpcProvider(preBusiness, rpc, network)
    let approveTx: ContractTransactionResponse | undefined = undefined
    //approve
    if (await isNeedApprove(
        preBusiness,
        web3Wallet.address,
        rpc,
        network))
    {

        approveTx = await doApprove(preBusiness, provider, web3Wallet.connect(provider), network)
        console.log(approveTx)

        while (await isNeedApprove(
            preBusiness,
            web3Wallet.address,
            rpc,
            network)) {
            
            await sleep(1000)
        }

    }

    //transfer out
    const transferOutTx = await doTransferOut(preBusiness, provider, web3Wallet.connect(provider), network)
    resolve({
        approve: approveTx,
        transferOut: transferOutTx
    })
})