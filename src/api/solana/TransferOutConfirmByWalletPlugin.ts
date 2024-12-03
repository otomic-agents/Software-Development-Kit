import { Connection, PublicKey } from '@solana/web3.js';
import { _getTransferOutConfirmTransaction, getJsonRpcProvider } from '../../business/solana';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { ResponseSolana } from '../../interface/api';

export const _transferOutConfirmByWalletPlugin = (
    preBusiness: PreBusiness,
    phantomAPI: any,
    network: NetworkType,
    rpc: string | undefined,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        try {
            const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network);

            let tx = await _getTransferOutConfirmTransaction(preBusiness, provider, network);

            const { signature } = await phantomAPI.signAndSendTransaction(tx);
            resolve({ txHash: signature });
        } catch (err) {
            reject(err);
        }
    });
