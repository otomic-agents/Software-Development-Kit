import { Connection, Keypair } from '@solana/web3.js';
import { _getInitSwapTransaction, getJsonRpcProvider, ensureSendingTx } from '../../business/solana';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { removePrefix0x } from '../../utils/format';
import { ResponseSolana } from '../../interface/api';

export const _initSwapByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType,
    rpc: string | undefined,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        try {
            const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(removePrefix0x(privateKey), 'hex')));
            const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network);
            let tx = await _getInitSwapTransaction(preBusiness, provider, network);
            let txHash = await ensureSendingTx(provider, keypair, tx);

            resolve({ txHash });
        } catch (err) {
            reject(err);
        }
    });
