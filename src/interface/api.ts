import { ContractTransactionResponse } from 'ethers';
import { Bridge } from './interface';

export interface ResponseTransferOut {
    approve: ContractTransactionResponse | undefined;
    transferOut: ContractTransactionResponse;
}

export interface TranslatedBridge extends Bridge {
    srcChainName: string;
    dstChainName: string;
    srcTokenSymbol: string;
    dstTokenSymbol: string;
}

export interface ResponseSolana {
    txHash: string;
    uuid: string;
}
