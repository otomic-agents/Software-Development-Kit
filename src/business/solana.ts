import { PublicKey, Connection, Keypair, SystemProgram } from "@solana/web3.js";
import { getMint, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { BN, Program, Idl, setProvider, AnchorProvider, Wallet as AnchorWallet } from "@coral-xyz/anchor";
import msgpack5 from "msgpack5";
import pako from "pako";
import idl from "./solanaIdl";
import { convertMinimumUnits, convertNativeMinimumUnits, convertStandardUnits } from "../utils/math";
import { PreBusiness, Quote } from "../interface/interface";
import { getOtmoicAddressBySystemChainId, getFeeRecepientAddressBySystemChainId, getStepTimeLock } from "../utils/chain";

type Lock = {
    hash: Array<number>;
    deadline: BN;
};

interface TokensInfo {
    [key: number]: {
        [key: string]: any
    };
}

interface Cache {
    tokensInfo: TokensInfo
}

const cache: Cache = {
    tokensInfo: {},
}

export const getProvider = (rpc: string): Connection => {
    return new Connection(rpc, 'confirmed')
}

export const checkTokenInfoBoxExist = (system_chain_id: number, token_address: string) => {
    if (cache.tokensInfo[system_chain_id] == undefined) cache.tokensInfo[system_chain_id] = {}
    if (cache.tokensInfo[system_chain_id][token_address] == undefined) cache.tokensInfo[system_chain_id][token_address] = {}
}

export const decimals = (system_chain_id: number, token_address: string, rpc: string) => new Promise(async (resolve, reject) => {
    checkTokenInfoBoxExist(system_chain_id, token_address)
    if (cache.tokensInfo[system_chain_id][token_address].decimals == undefined) {
        let mintToken = new PublicKey(token_address)
        let connection = getProvider(rpc)
        let mintTokenAccountInfo = await connection.getAccountInfo(mintToken)
        let tokenProgramId = mintTokenAccountInfo?.owner
        let mintInfo = await getMint(connection, mintToken, 'confirmed', tokenProgramId)
        cache.tokensInfo[system_chain_id][token_address].decimals = mintInfo.decimals
    }
    resolve(cache.tokensInfo[system_chain_id][token_address].decimals)
})

export const symbol = (system_chain_id: number, token_address: string, rpc: string) => new Promise(async (resolve, reject) => {
    checkTokenInfoBoxExist(system_chain_id, token_address)
    if (cache.tokensInfo[system_chain_id][token_address].symbol == undefined) {
        let mintToken = new PublicKey(token_address)
        let connection = getProvider(rpc)
        let metadata = await Metadata.findByMint(connection, mintToken)
        if (metadata && metadata.data && metadata.data.data) {
            cache.tokensInfo[system_chain_id][token_address].symbol = metadata.data.data.symbol
        }
    }
    resolve(cache.tokensInfo[system_chain_id][token_address].symbol)
})

export const getDefaultRPC = (system_chain_id: number, network: string) => {
    const isMainnet = network === 'mainnet'
    switch (system_chain_id) {
        case 501:
            return isMainnet ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com'
        default:
            throw new Error('not found rpc node')
    }
}

export const _getSignDataEIP712 = async (quote: Quote, network: string, amount: string, dstAmount: string, dstNativeAmount: string, swapToNative: number, receivingAddress: string, stepTimeLock: number | undefined, rpcSrc: string | undefined, rpcDst: string | undefined) => {
    const srcDecimals = await decimals(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.src_token, rpcSrc == undefined ? getDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc)
    const dstDecimals = await decimals(quote.quote_base.bridge.dst_chain_id, quote.quote_base.bridge.dst_token, rpcDst == undefined ? getDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst)

    const signMessage = {
        src_chain_id: quote.quote_base.bridge.src_chain_id,
        src_address: quote.quote_base.lp_bridge_address,
        src_token: quote.quote_base.bridge.src_token,
        src_amount: convertMinimumUnits(amount, srcDecimals),

        dst_chain_id: quote.quote_base.bridge.dst_chain_id,
        dst_address: receivingAddress,
        dst_token: quote.quote_base.bridge.dst_token,
        dst_amount: convertMinimumUnits(dstAmount, dstDecimals),
        dst_native_amount: convertNativeMinimumUnits(quote.quote_base.bridge.dst_chain_id, dstNativeAmount),

        requestor: '', //user_address.value,
        lp_id: quote.lp_info.name,
        step_time_lock: stepTimeLock == undefined ? getStepTimeLock(quote.quote_base.bridge.src_chain_id, quote.quote_base.bridge.dst_chain_id) : stepTimeLock,
        agreement_reached_time: parseInt(((Date.now() + 1000 * 60 * 1) / 1000).toFixed(0)),
    }

    return signMessage
}

export const _getSignPreambleEIP712 = (contractAddress: PublicKey, signerPubkeys: PublicKey[], msgLen: number) => {
    // https://docs.solanalabs.com/proposals/off-chain-message-signing
    const signingDomain = Buffer.from('\xffsolana offchain', 'binary') // 16 bytes
    const headerVersion = Buffer.from([0]) // 1 byte
    const applicationDomain = contractAddress.toBuffer() // 32 bytes
    const messageFormat = Buffer.from([0]) // 1 byte
    const signerCount = Buffer.from([signerPubkeys.length]) // 1 byte
    const signers = Buffer.concat(signerPubkeys.map((signerPubkey) => signerPubkey.toBuffer())) // 32 bytes * signerCount
    const messageLen = Buffer.alloc(2) // 2 bytes
    messageLen.writeUInt16LE(msgLen) 
    const messagePreamble = Buffer.concat([
        signingDomain,
        headerVersion,
        applicationDomain,
        messageFormat,
        signerCount,
        signers,
        messageLen,
    ])
    return messagePreamble
}

export const getJsonRpcProvider =
    (preBusiness: PreBusiness, rpc: string | undefined, network: string) => {

    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id
    return new Connection(rpc === undefined ? getDefaultRPC(systemChainId, network) : rpc, 'confirmed')
}

export const doTransferOut = 
    (uuid: string, preBusiness: PreBusiness, provider: Connection, wallet: Keypair | undefined, network: string) => 
        new Promise<string>(async (resolve, reject) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id

    // setup a dummy provider
    setProvider(
        new AnchorProvider(
            new Connection('http://localhost'),
            new AnchorWallet(
                Keypair.fromSeed(
                    Uint8Array.from([
                        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                        1,
                    ]),
                ),
            ),
            {},
        ),
    )
    const otmoic = new Program(idl as Idl, getOtmoicAddressBySystemChainId(systemChainId, network))

    // uuid
    let uuidBuf = Array.from(Buffer.from(uuid, 'hex'));

    // user
    let user = new PublicKey(preBusiness.swap_asset_information.sender)
    
    // // receiver
    // let receiver = new PublicKey(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address)

    // mint token
    let token = new PublicKey(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
    let mintTokenAccountInfo = await provider.getAccountInfo(token)
    let tokenProgramId = mintTokenAccountInfo!.owner

    // amount
    let amount = new BN(preBusiness.swap_asset_information.amount)

    // sol amount
    let solAmount = new BN(0)

    // agreement reached time and step time lock
    let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time
    let stepTimeLock = preBusiness.swap_asset_information.step_time_lock
    let transferOutDeadline = new BN(agreementReachedTime + 1 * stepTimeLock)
    let refundDeadline = new BN(agreementReachedTime + 7 * stepTimeLock)
    
    // hash lock
    let hashLock = preBusiness.hashlock_solana
    let lockUser: Lock = {
        hash: Array.from(Buffer.from(hashLock, 'hex')),
        deadline: new BN(agreementReachedTime + 3 * stepTimeLock),
    }

    let relayHashLock = preBusiness.relay_hashlock_solana
    let lockRelay: Lock = {
        hash: Array.from(Buffer.from(relayHashLock, 'hex')),
        deadline: new BN(agreementReachedTime + 6 * stepTimeLock),
    }

    // source ata token account
    let source = await getOrCreateAssociatedTokenAccount(
        provider,
        wallet!,
        token,
        user,
        true,
        undefined,
        undefined,
        tokenProgramId,
    )

    // escrow and escrowAta
    let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoic.programId)
    let escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId)

    // adminSettings
    let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoic.programId)

    // tokenSettings
    let tokenSettings: PublicKey | null
    [tokenSettings] = PublicKey.findProgramAddressSync(
        [Buffer.from('token'), token.toBytes()],
        otmoic.programId,
    )
    let tokenSettingsAccount = await provider.getAccountInfo(tokenSettings)
    if (tokenSettingsAccount == null) {
        tokenSettings = null
    }

    // memo
    let memo = msgpack5()
        .encode({
            // stepTimeLock: stepTimeLock,
            // agreementReachedTime: agreementReachedTime,
            // srcChainId: command_transfer_in.src_chain_id,
            // srcTransferId: command_transfer_in.src_transfer_id,
            method: '0',
        })
        .slice()

    let compressedData = pako.deflate(memo, { level: 9 })

    let compressedBuffer = Buffer.from(compressedData)

    let tx = await otmoic.methods
    .prepare(
        uuidBuf,
        user,
        solAmount,
        amount,
        lockUser,
        lockRelay,
        transferOutDeadline,
        refundDeadline,
        Buffer.from([]),
        compressedBuffer,
    )
    .accounts({
        payer: wallet!.publicKey,
        from: user,
        mint: token,
        source: source.address,
        escrow: escrow,
        escrowAta: escrowAta,
        adminSettings: adminSettings,
        tokenSettings: tokenSettings === null ? undefined : tokenSettings,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram: tokenProgramId,
    })
    .signers([wallet!])
    .rpc()

    resolve(tx)
})

export const doTransferOutConfirm = 
    (uuid: string, preBusiness: PreBusiness, provider: Connection, wallet: Keypair | undefined, network: string) => 
        new Promise<string>(async (resolve, reject) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id

    // setup a dummy provider
    setProvider(
        new AnchorProvider(
            new Connection('http://localhost'),
            new AnchorWallet(
                Keypair.fromSeed(
                    Uint8Array.from([
                        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                        1,
                    ]),
                ),
            ),
            {},
        ),
    )
    const otmoic = new Program(idl as Idl, getOtmoicAddressBySystemChainId(systemChainId, network))
    
    // uuid
    let uuidBuf = Array.from(Buffer.from(uuid, 'hex'));

    // receiver
    let lp = new PublicKey(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address)
   
    // mint token
    let token = new PublicKey(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
    let mintTokenAccountInfo = await provider.getAccountInfo(token)
    let tokenProgramId = mintTokenAccountInfo!.owner
   
    // hash preimage
    let preimage = Array.from(Buffer.from(preBusiness.preimage, 'hex'))
   
    // adminSettings
    let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoic.programId)
   
    // destination
    let destination = await getOrCreateAssociatedTokenAccount(
        provider,
        wallet!,
        token,
        lp,
        true,
        undefined,
        undefined,
        tokenProgramId,
    );
   
    // fee recepient
    let feeRecepient = new PublicKey(getFeeRecepientAddressBySystemChainId(systemChainId, network))
    let feeDestination = await getOrCreateAssociatedTokenAccount(
        provider,
        wallet!,
        token,
        feeRecepient,
        true,
        undefined,
        undefined,
        tokenProgramId,
    );
   
    // escrow and escrowAta
    let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid!)], otmoic.programId)
    let escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId)

    let tx = await otmoic.methods
        .confirm(uuidBuf, preimage)
        .accounts({
            to: lp,
            destination: destination.address,
            escrow: escrow,
            escrowAta: escrowAta,
            adminSettings: adminSettings,
            feeRecepient: feeRecepient,
            feeDestination: feeDestination.address,
            systemProgram: SystemProgram.programId,
            tokenProgram: tokenProgramId,
        })
        .signers([wallet!])
        .rpc()
    
    resolve(tx)
})

export const doTransferOutRefund = 
    (uuid: string, preBusiness: PreBusiness, provider: Connection, wallet: Keypair | undefined, network: string) => 
        new Promise<string>(async (resolve, reject) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id

    // setup a dummy provider
    setProvider(
        new AnchorProvider(
            new Connection('http://localhost'),
            new AnchorWallet(
                Keypair.fromSeed(
                    Uint8Array.from([
                        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                        1,
                    ]),
                ),
            ),
            {},
        ),
    )
    const otmoic = new Program(idl as Idl, getOtmoicAddressBySystemChainId(systemChainId, network))
    
    // uuid
    let uuidBuf = Array.from(Buffer.from(uuid, 'hex'));
   
    // user
    let user = new PublicKey(preBusiness.swap_asset_information.sender)
   
    // mint token
    let token = new PublicKey(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
    let mintTokenAccountInfo = await provider.getAccountInfo(token)
    let tokenProgramId = mintTokenAccountInfo!.owner
   
    // source
    let source = await getOrCreateAssociatedTokenAccount(
        provider,
        wallet!,
        token,
        user,
        true,
        undefined,
        undefined,
        tokenProgramId,
    );
   
    // escrow and escrowAta
    let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid!)], otmoic.programId)
    let escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId)

    let tx = await otmoic.methods
        .refund(uuidBuf)
        .accounts({
            from: user,
            source: source.address,
            escrow: escrow,
            escrowAta: escrowAta,
            systemProgram: SystemProgram.programId,
            tokenProgram: tokenProgramId,
        })
        .signers([wallet!])
        .rpc()
    
    resolve(tx)
})

export const getBalance = async (network: string, systemChainId: number, token: string, address: string, rpc: string | undefined) => {
    let provider = getProvider(rpc === undefined ? getDefaultRPC(systemChainId, network) : rpc)
    let tokenAccounts = await provider.getTokenAccountsByOwner(new PublicKey(address), {
        mint: new PublicKey(token),
    })

    if (tokenAccounts.value.length == 0) {
        return '0'
    }
    let tokenAccount = tokenAccounts.value[0]
    const accountData = AccountLayout.decode(tokenAccount.account.data)
    let mintTokenAccountInfo = await provider.getAccountInfo(accountData.mint)
    let tokenProgramId = mintTokenAccountInfo!.owner
    let mintInfo = await getMint(
        provider,
        accountData.mint,
        undefined,
        tokenProgramId,
    )
    let balance = accountData.amount
    let decimals = mintInfo.decimals
    
    return convertStandardUnits(balance, decimals)
}
