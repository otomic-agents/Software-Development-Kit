import { ContractTransactionResponse, ethers } from "ethers";
import { PreBusiness } from "../../interface/interface";
import { ResponseTransferOut } from "../../interface/api";
import { doApprove, doTransferOut, getJsonRpcProvider, isNeedApprove } from "../../business/evm";


export const _transferOutByMetamaskAPI = (preBusiness: PreBusiness, metamaskAPI: any, network: string, rpc: string | undefined) => new Promise<ResponseTransferOut>(async (resolve, reject) => {
    const provider = new ethers.JsonRpcProvider(metamaskAPI)
    let approveTx: ContractTransactionResponse | undefined = undefined

    //approve
    if (await isNeedApprove(
        preBusiness,
        preBusiness.swap_asset_information.sender,
        rpc,
        network))
    {
        approveTx = await doApprove(preBusiness, provider, undefined, network)
        console.log(approveTx)
    }

    if (provider == undefined || approveTx == undefined) {
        throw new Error("provider or approveTx not exist");
    }
    //transfer out
    const transferOutTx = await doTransferOut(preBusiness, provider, undefined, network)
    resolve({
        approve: approveTx,
        transferOut: transferOutTx
    })
})