import { ContractTransactionResponse } from "ethers"

export interface ResponseTransferOut {
    approve: ContractTransactionResponse | undefined
    transferOut: ContractTransactionResponse
}