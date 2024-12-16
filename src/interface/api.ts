import { ContractTransactionResponse } from 'ethers';
import { Bridge } from './interface';

export interface ResponseTransferOut {
    approve: ContractTransactionResponse | undefined;
    transferOut: ContractTransactionResponse;
}

export interface TranslatedBridge extends Bridge {
    src_chain_name: string;
    dst_chain_name: string;
    src_token_symbol: string;
    dst_token_symbol: string;
}

export interface ResponseSolana {
    txHash: string;
}
