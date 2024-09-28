import { Connection, Keypair } from '@solana/web3.js';
import { doTransferOutConfirm, getJsonRpcProvider, ensureSendingTx } from '../../business/solana';
import { PreBusiness } from '../../interface/interface';
import { removePrefix0x } from '../../utils/format';
import { ResponseSolana } from '../../interface/api';

export const _transferOutConfirmByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: string,
    rpc: string | undefined,
    uuid?: string,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        try {
            const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(removePrefix0x(privateKey), 'hex')));
            const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network);
            let { tx, uuidBack } = await doTransferOutConfirm(preBusiness, provider, network, uuid);

            let txHash = await ensureSendingTx(provider, keypair, tx);

            resolve({
                txHash,
                uuid: uuidBack,
            });
        } catch (err) {
            reject(err);
        }
    });
