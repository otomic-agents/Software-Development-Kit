import { PreBusiness, NetworkType } from '../../interface/interface';
import { doApprove, doTransferOut, getJsonRpcProvider, _isNeedApprove } from '../../business/evm';
import { ContractTransactionResponse, JsonRpcProvider, ethers } from 'ethers';
import { ResponseTransferOut } from '../../interface/api';
import { sleep } from '../../utils/sleep';

export const _transferOutByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType,
    rpc: string | undefined,
    useMaximumGasPriceAtMost: boolean,
) =>
    new Promise<ResponseTransferOut>(async (resolve, reject) => {
        try {
            const web3Wallet = new ethers.Wallet(privateKey);

            const provider: JsonRpcProvider = getJsonRpcProvider(preBusiness, rpc, network);
            let approveTx: ContractTransactionResponse | undefined = undefined;
            //approve
            if (await _isNeedApprove(preBusiness, web3Wallet.address, rpc, network)) {
                approveTx = await doApprove(
                    preBusiness,
                    provider,
                    web3Wallet.connect(provider),
                    network,
                    useMaximumGasPriceAtMost,
                );
                // console.log(approveTx)

                while (await _isNeedApprove(preBusiness, web3Wallet.address, rpc, network)) {
                    await sleep(1000);
                }
            }

            //transfer out
            const transferOutTx = await doTransferOut(
                preBusiness,
                provider,
                web3Wallet.connect(provider),
                network,
                useMaximumGasPriceAtMost,
            );
            resolve({
                approve: approveTx,
                transferOut: transferOutTx,
            });
        } catch (error) {
            reject(error);
        }
    });
