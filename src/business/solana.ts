import {
    PublicKey,
    Connection,
    Keypair,
    SystemProgram,
    ComputeBudgetProgram,
    TransactionInstruction,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    getMint,
    getAssociatedTokenAddressSync,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    AccountLayout,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';
import { BN, Program, Idl, setProvider, AnchorProvider, Wallet as AnchorWallet, Provider } from '@coral-xyz/anchor';
import msgpack5 from 'msgpack5';
import pako from 'pako';
import retry from 'async-retry';
import idl from './solanaIdl';
import idl_singlechain from './solanaSingleChainIdl';
import { Obridge } from './obridgeType';
import { ObridgeSwap } from './obridgeSwapType';
import { convertMinimumUnits, convertNativeMinimumUnits, convertStandardUnits } from '../utils/math';
import { toBs58Address } from '../utils/format';
import { PreBusiness, Quote, NetworkType, ChainId, SwapSignData, SwapType } from '../interface/interface';
import {
    getOtmoicAddressBySystemChainId,
    getOtmoicSwapAddressBySystemChainId,
    getFeeRecepientAddressBySystemChainId,
    getExpectedSingleStepTime,
    getTolerantSingleStepTime,
    getDefaultEarliestRefundTime,
    getChainType,
    getNativeTokenDecimals,
    getNativeTokenName,
    commonTokenDecimals,
} from '../utils/chain';
import { decimals as evmDecimals, getDefaultRPC as getEvmDefaultRPC } from '../business/evm';
import { removePrefix0x, isZeroAddress } from '../utils/format';
import { generateUuid, generateUuidSwap } from '../utils/data';
import { sleep } from '../utils/sleep';
export type Lock = {
    hash: Array<number>;
    agreementReachedTime: BN;
    expectedSingleStepTime: BN;
    tolerantSingleStepTime: BN;
    earliestRefundTime: BN;
};

interface TokensInfo {
    [key: number]: {
        [key: string]: any;
    };
}

interface Cache {
    tokensInfo: TokensInfo;
}

const cache: Cache = {
    tokensInfo: {},
};

const isOut = true;
const isIn = false;

export const getProvider = (rpc: string): Connection => {
    return new Connection(rpc, 'confirmed');
};

export const checkTokenInfoBoxExist = (systemChainId: ChainId, tokenAddress: string) => {
    if (cache.tokensInfo[systemChainId] == undefined) cache.tokensInfo[systemChainId] = {};
    if (cache.tokensInfo[systemChainId][tokenAddress] == undefined) cache.tokensInfo[systemChainId][tokenAddress] = {};
};

export const decimals = (systemChainId: ChainId, tokenAddress: string, rpc: string) =>
    new Promise<number>(async (resolve, reject) => {
        try {
            checkTokenInfoBoxExist(systemChainId, tokenAddress);
            if (cache.tokensInfo[systemChainId][tokenAddress].decimals == undefined) {
                if (isZeroAddress(tokenAddress)) {
                    cache.tokensInfo[systemChainId][tokenAddress].decimals = getNativeTokenDecimals(systemChainId);
                } else {
                    let mintToken = new PublicKey(toBs58Address(tokenAddress));
                    let connection = getProvider(rpc);
                    let mintTokenAccountInfo = await connection.getAccountInfo(mintToken);
                    let tokenProgramId = mintTokenAccountInfo?.owner;
                    let mintInfo = await getMint(connection, mintToken, 'confirmed', tokenProgramId);
                    cache.tokensInfo[systemChainId][tokenAddress].decimals = mintInfo.decimals;
                }
            }
            resolve(cache.tokensInfo[systemChainId][tokenAddress].decimals);
        } catch (err) {
            const defaultDecimals = commonTokenDecimals(systemChainId, tokenAddress);
            if (defaultDecimals) {
                cache.tokensInfo[systemChainId][tokenAddress].decimals = defaultDecimals;
                return resolve(defaultDecimals);
            }
            reject(err);
        }
    });

export const decimalsDefaultRpc = (systemChainId: ChainId, tokenAddress: string, network: NetworkType) => {
    const rpc = getDefaultRPC(systemChainId, network);
    return decimals(systemChainId, tokenAddress, rpc);
};

export const symbol = (systemChainId: ChainId, tokenAddress: string, rpc: string): Promise<string> =>
    new Promise(async (resolve, reject) => {
        try {
            checkTokenInfoBoxExist(systemChainId, tokenAddress);
            if (cache.tokensInfo[systemChainId][tokenAddress].symbol == undefined) {
                if (isZeroAddress(tokenAddress)) {
                    cache.tokensInfo[systemChainId][tokenAddress].symbol = getNativeTokenName(systemChainId);
                } else {
                    let mintToken = new PublicKey(toBs58Address(tokenAddress));
                    try {
                        const umi = createUmi(rpc);
                        let asset = await fetchDigitalAsset(umi, publicKey(mintToken.toBase58()));
                        if (asset && asset.metadata) {
                            cache.tokensInfo[systemChainId][tokenAddress].symbol = asset.metadata.symbol;
                        }
                    } catch (err) {
                        if ((err as any).name === 'AccountNotFoundError') {
                            cache.tokensInfo[systemChainId][tokenAddress].symbol = undefined;
                        }
                    }
                }
            }
            resolve(cache.tokensInfo[systemChainId][tokenAddress].symbol);
        } catch (err) {
            reject(err);
        }
    });

export const getDefaultRPC = (systemChainId: ChainId, network: NetworkType) => {
    const isMainnet = network === NetworkType.MAINNET;
    switch (systemChainId) {
        case 501:
            return isMainnet ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com';
        default:
            throw new Error('not found rpc node');
    }
};

export const _getSignDataEIP712 = async (
    quote: Quote,
    network: NetworkType,
    amount: string,
    dstAmount: string,
    dstNativeAmount: string,
    swapToNative: number,
    receivingAddress: string,
    expectedSingleStepTime: number | undefined,
    tolerantSingleStepTime: number | undefined,
    earliestRefundTime: number | undefined,
    rpcSrc: string | undefined,
    rpcDst: string | undefined,
    swapType: SwapType,
): Promise<SwapSignData> => {
    let srcDecimals: any;
    if (getChainType(quote.quote_base.bridge.src_chain_id) === 'solana') {
        srcDecimals = await decimals(
            quote.quote_base.bridge.src_chain_id,
            quote.quote_base.bridge.src_token,
            rpcSrc == undefined ? getDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc,
        );
    } else if (getChainType(quote.quote_base.bridge.src_chain_id) === 'evm') {
        srcDecimals = await evmDecimals(
            quote.quote_base.bridge.src_chain_id,
            quote.quote_base.bridge.src_token,
            rpcSrc == undefined ? getEvmDefaultRPC(quote.quote_base.bridge.src_chain_id, network) : rpcSrc,
        );
    }

    let dstDecimals: any;
    if (getChainType(quote.quote_base.bridge.dst_chain_id) === 'solana') {
        dstDecimals = await decimals(
            quote.quote_base.bridge.dst_chain_id,
            quote.quote_base.bridge.dst_token,
            rpcDst == undefined ? getDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst,
        );
    } else if (getChainType(quote.quote_base.bridge.dst_chain_id) === 'evm') {
        dstDecimals = await evmDecimals(
            quote.quote_base.bridge.dst_chain_id,
            quote.quote_base.bridge.dst_token,
            rpcDst == undefined ? getEvmDefaultRPC(quote.quote_base.bridge.dst_chain_id, network) : rpcDst,
        );
    }

    let agreementReachedTime = parseInt(((Date.now() + 1000 * 60 * 1) / 1000).toFixed(0));
    let defaultExpectedSingleStepTime = getExpectedSingleStepTime(
        quote.quote_base.bridge.src_chain_id,
        quote.quote_base.bridge.dst_chain_id,
    );
    let defaultTolerantSingleStepTime = getTolerantSingleStepTime(
        quote.quote_base.bridge.src_chain_id,
        quote.quote_base.bridge.dst_chain_id,
    );

    switch (swapType) {
        case SwapType.ATOMIC:
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
                agreement_reached_time: agreementReachedTime,
                expected_single_step_time:
                    expectedSingleStepTime == undefined ? defaultExpectedSingleStepTime : expectedSingleStepTime,
                tolerant_single_step_time:
                    tolerantSingleStepTime == undefined ? defaultTolerantSingleStepTime : tolerantSingleStepTime,
                earliest_refund_time:
                    earliestRefundTime == undefined
                        ? getDefaultEarliestRefundTime(
                              agreementReachedTime,
                              defaultExpectedSingleStepTime,
                              defaultTolerantSingleStepTime,
                          )
                        : earliestRefundTime,
            };

            return {
                message: signMessage,
            };
        case SwapType.SINGLECHAIN:
            const signMessageSingleChain = {
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
                agreement_reached_time: agreementReachedTime,
                expected_single_step_time:
                    expectedSingleStepTime == undefined ? defaultExpectedSingleStepTime : expectedSingleStepTime,
            };
            return {
                message: signMessageSingleChain,
            };
    }
};

export const _getSignPreambleEIP712 = (contractAddress: PublicKey, signerPubkeys: PublicKey[], msgLen: number) => {
    // https://docs.solanalabs.com/proposals/off-chain-message-signing
    const signingDomain = Buffer.from('\xffsolana offchain', 'binary'); // 16 bytes
    const headerVersion = Buffer.from([0]); // 1 byte
    const applicationDomain = contractAddress.toBuffer(); // 32 bytes
    const messageFormat = Buffer.from([0]); // 1 byte
    const signerCount = Buffer.from([signerPubkeys.length]); // 1 byte
    const signers = Buffer.concat(signerPubkeys.map((signerPubkey) => signerPubkey.toBuffer())); // 32 bytes * signerCount
    const messageLen = Buffer.alloc(2); // 2 bytes
    messageLen.writeUInt16LE(msgLen);
    const messagePreamble = Buffer.concat([
        signingDomain,
        headerVersion,
        applicationDomain,
        messageFormat,
        signerCount,
        signers,
        messageLen,
    ]);
    return messagePreamble;
};

export const getJsonRpcProvider = (preBusiness: PreBusiness, rpc: string | undefined, network: NetworkType) => {
    const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;
    return new Connection(rpc === undefined ? getDefaultRPC(systemChainId, network) : rpc, 'confirmed');
};

export const getJsonRpcProviderByChainId = (chainId: number, rpc: string | undefined, network: NetworkType) => {
    return new Connection(rpc === undefined ? getDefaultRPC(chainId, network) : rpc, 'confirmed');
};

export const _getTransferOutTransaction = (
    preBusiness: PreBusiness,
    provider: Connection | undefined,
    network: NetworkType,
    pluginProvider?: Provider,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        if (provider == undefined) {
            provider = getJsonRpcProvider(preBusiness, undefined, network);
        }
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            let otmoic: Program<Obridge>;
            if (pluginProvider == undefined) {
                // setup a dummy provider
                setProvider(
                    new AnchorProvider(
                        new Connection('http://localhost'),
                        new AnchorWallet(
                            Keypair.fromSeed(
                                Uint8Array.from([
                                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                    1, 1, 1, 1,
                                ]),
                            ),
                        ),
                        {},
                    ),
                );
                otmoic = new Program(
                    idl as Idl,
                    getOtmoicAddressBySystemChainId(systemChainId, network),
                ) as unknown as Program<Obridge>;
            } else {
                otmoic = new Program(
                    idl as Idl,
                    getOtmoicAddressBySystemChainId(systemChainId, network),
                    pluginProvider,
                ) as unknown as Program<Obridge>;
            }

            // user
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.sender));

            // receiver
            let lp = new PublicKey(
                toBs58Address(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address),
            );

            const solOnlyMode = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // mint token
            let token: PublicKey = ZERO_PUBKEY;
            let tokenProgramId: PublicKey | null = null;
            if (!solOnlyMode) {
                token = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token),
                );
                let mintTokenAccountInfo = await provider.getAccountInfo(token);
                tokenProgramId = mintTokenAccountInfo!.owner;
            }

            // amount
            let amount = solOnlyMode ? new BN(0) : new BN(preBusiness.swap_asset_information.amount);

            // sol amount
            let solAmount = solOnlyMode ? new BN(preBusiness.swap_asset_information.amount) : new BN(0);

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let tolerantSingleStepTime = preBusiness.swap_asset_information.tolerant_single_step_time;
            let earliestRefundTime = preBusiness.swap_asset_information.earliest_refund_time;

            // hash lock
            let hashLock = preBusiness.hashlock_solana;

            let lock: Lock = {
                hash: Array.from(Buffer.from(removePrefix0x(hashLock), 'hex')),
                agreementReachedTime: new BN(agreementReachedTime),
                expectedSingleStepTime: new BN(expectedSingleStepTime),
                tolerantSingleStepTime: new BN(tolerantSingleStepTime),
                earliestRefundTime: new BN(earliestRefundTime),
            };

            // uuid
            let uuid = generateUuid(
                user,
                lp,
                lock.hash,
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
                tolerantSingleStepTime.toString(),
                earliestRefundTime.toString(),
                token,
                amount.toString(),
                solAmount.toString(),
            );

            // source ata token account
            let source: PublicKey | null = null;
            if (!solOnlyMode) {
                source = getAssociatedTokenAddressSync(token, user, true, tokenProgramId!);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoic.programId);
            let escrowAta: PublicKey | null = null;
            if (!solOnlyMode) {
                escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId!);
            }

            // adminSettings
            let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoic.programId);

            // tokenSettings
            let tokenSettings: PublicKey | null;
            [tokenSettings] = PublicKey.findProgramAddressSync(
                [Buffer.from('token'), token.toBytes()],
                otmoic.programId,
            );
            let tokenSettingsAccount = await provider.getAccountInfo(tokenSettings);
            if (tokenSettingsAccount == null) {
                tokenSettings = null;
            }

            // memo
            let memo = msgpack5()
                .encode({
                    expectedSingleStepTime: expectedSingleStepTime,
                    tolerantSingleStepTime: tolerantSingleStepTime,
                    earliestRefundTime: earliestRefundTime,
                    agreementReachedTime: agreementReachedTime,
                    dstAddress: preBusiness.swap_asset_information.dst_address,
                    dstChainId: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id,
                    amountDst: preBusiness.swap_asset_information.dst_amount,
                    nativeAmountDst: preBusiness.swap_asset_information.dst_native_amount,
                    bidId: preBusiness.hash,
                    tokenDst: preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token,
                    requestor: preBusiness.swap_asset_information.requestor,
                    lpId: preBusiness.swap_asset_information.quote.lp_info.name,
                    userSign: preBusiness.swap_asset_information.user_sign,
                    lpSign: preBusiness.swap_asset_information.lp_sign,
                })
                .slice();

            let compressedData = pako.deflate(memo, { level: 9 });

            let compressedBuffer = Buffer.from(compressedData);

            let tx = await otmoic.methods
                .prepare(uuid, lp, solAmount, amount, lock, isOut, compressedBuffer)
                .accounts({
                    payer: user,
                    from: user,
                    mint: solOnlyMode ? null : token,
                    source: source,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    adminSettings: adminSettings,
                    tokenSettings: tokenSettings!,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: tokenProgramId,
                })
                .transaction();

            const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const _getTransferOutConfirmTransaction = (
    preBusiness: PreBusiness,
    provider: Connection | undefined,
    network: NetworkType,
    pluginProvider?: Provider,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        if (provider == undefined) {
            provider = getJsonRpcProvider(preBusiness, undefined, network);
        }

        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            let otmoic: Program<Obridge>;
            if (pluginProvider == undefined) {
                // setup a dummy provider
                setProvider(
                    new AnchorProvider(
                        new Connection('http://localhost'),
                        new AnchorWallet(
                            Keypair.fromSeed(
                                Uint8Array.from([
                                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                    1, 1, 1, 1,
                                ]),
                            ),
                        ),
                        {},
                    ),
                );
                otmoic = new Program(
                    idl as Idl,
                    getOtmoicAddressBySystemChainId(systemChainId, network),
                ) as unknown as Program<Obridge>;
            } else {
                otmoic = new Program(
                    idl as Idl,
                    getOtmoicAddressBySystemChainId(systemChainId, network),
                    pluginProvider,
                ) as unknown as Program<Obridge>;
            }

            // user
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.sender));

            // receiver
            let lp = new PublicKey(
                toBs58Address(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address),
            );

            const solOnlyMode = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // mint token
            let token: PublicKey = ZERO_PUBKEY;
            let tokenProgramId: PublicKey | null = null;
            if (!solOnlyMode) {
                token = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token),
                );
                let mintTokenAccountInfo = await provider.getAccountInfo(token);
                tokenProgramId = mintTokenAccountInfo!.owner;
            }

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let tolerantSingleStepTime = preBusiness.swap_asset_information.tolerant_single_step_time;
            let earliestRefundTime = preBusiness.swap_asset_information.earliest_refund_time;

            // hash lock
            let hashLock = preBusiness.hashlock_solana;

            let lock: Lock = {
                hash: Array.from(Buffer.from(removePrefix0x(hashLock), 'hex')),
                agreementReachedTime: new BN(agreementReachedTime),
                expectedSingleStepTime: new BN(expectedSingleStepTime),
                tolerantSingleStepTime: new BN(tolerantSingleStepTime),
                earliestRefundTime: new BN(earliestRefundTime),
            };

            // uuid
            let uuid = generateUuid(
                user,
                lp,
                lock.hash,
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
                tolerantSingleStepTime.toString(),
                earliestRefundTime.toString(),
                token,
                solOnlyMode ? '0' : preBusiness.swap_asset_information.amount,
                solOnlyMode ? preBusiness.swap_asset_information.amount : '0',
            );

            // hash preimage
            let preimage = Array.from(Buffer.from(removePrefix0x(preBusiness.preimage), 'hex'));

            // adminSettings
            let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoic.programId);

            // destination
            let destination: PublicKey | null = null;
            if (!solOnlyMode) {
                destination = getAssociatedTokenAddressSync(token, lp, true, tokenProgramId!);
            }

            // fee recepient
            let feeRecepient = new PublicKey(getFeeRecepientAddressBySystemChainId(systemChainId, network));
            let feeDestination: PublicKey | null = null;
            if (!solOnlyMode) {
                feeDestination = getAssociatedTokenAddressSync(token, feeRecepient, true, tokenProgramId!);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoic.programId);
            let escrowAta: PublicKey | null = null;
            if (!solOnlyMode) {
                escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId!);
            }

            let tx = await otmoic.methods
                .confirm(uuid, preimage, isOut)
                .accounts({
                    payer: user,
                    from: user,
                    to: lp,
                    destination: destination,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    adminSettings: adminSettings,
                    feeRecepient: feeRecepient,
                    feeDestination: feeDestination,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: tokenProgramId,
                })
                .transaction();

            const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const _getTransferOutRefundTransaction = (
    preBusiness: PreBusiness,
    provider: Connection | undefined,
    network: NetworkType,
    pluginProvider?: Provider,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        if (provider == undefined) {
            provider = getJsonRpcProvider(preBusiness, undefined, network);
        }
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            // setup a dummy provider
            let otmoic: Program<Obridge>;
            if (pluginProvider == undefined) {
                setProvider(
                    new AnchorProvider(
                        new Connection('http://localhost'),
                        new AnchorWallet(
                            Keypair.fromSeed(
                                Uint8Array.from([
                                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                    1, 1, 1, 1,
                                ]),
                            ),
                        ),
                        {},
                    ),
                );
                otmoic = new Program(
                    idl as Idl,
                    getOtmoicAddressBySystemChainId(systemChainId, network),
                ) as unknown as Program<Obridge>;
            } else {
                otmoic = new Program(
                    idl as Idl,
                    getOtmoicAddressBySystemChainId(systemChainId, network),
                    pluginProvider,
                ) as unknown as Program<Obridge>;
            }

            // user
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.sender));

            // receiver
            let lp = new PublicKey(
                toBs58Address(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address),
            );

            const solOnlyMode = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // mint token
            let token: PublicKey = ZERO_PUBKEY;
            let tokenProgramId: PublicKey | null = null;
            if (!solOnlyMode) {
                token = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token),
                );
                let mintTokenAccountInfo = await provider.getAccountInfo(token);
                tokenProgramId = mintTokenAccountInfo!.owner;
            }

            // source
            let source: PublicKey | null = null;
            if (!solOnlyMode) {
                source = getAssociatedTokenAddressSync(token, user, true, tokenProgramId!);
            }

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let tolerantSingleStepTime = preBusiness.swap_asset_information.tolerant_single_step_time;
            let earliestRefundTime = preBusiness.swap_asset_information.earliest_refund_time;

            // hash lock
            let hashLock = preBusiness.hashlock_solana;

            let lock: Lock = {
                hash: Array.from(Buffer.from(removePrefix0x(hashLock), 'hex')),
                agreementReachedTime: new BN(agreementReachedTime),
                expectedSingleStepTime: new BN(expectedSingleStepTime),
                tolerantSingleStepTime: new BN(tolerantSingleStepTime),
                earliestRefundTime: new BN(earliestRefundTime),
            };

            // uuid
            let uuid = generateUuid(
                user,
                lp,
                lock.hash,
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
                tolerantSingleStepTime.toString(),
                earliestRefundTime.toString(),
                token,
                solOnlyMode ? '0' : preBusiness.swap_asset_information.amount,
                solOnlyMode ? preBusiness.swap_asset_information.amount : '0',
            );

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoic.programId);
            let escrowAta: PublicKey | null = null;
            if (!solOnlyMode) {
                escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId!);
            }

            let tx = await otmoic.methods
                .refund(uuid, isOut)
                .accounts({
                    from: user,
                    source: source,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: tokenProgramId,
                })
                .transaction();

            const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const _getInitSwapTransaction = (
    preBusiness: PreBusiness,
    provider: Connection | undefined,
    network: NetworkType,
    pluginProvider?: Provider,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        if (provider == undefined) {
            provider = getJsonRpcProvider(preBusiness, undefined, network);
        }
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            let otmoicSwap: Program<ObridgeSwap>;
            if (pluginProvider == undefined) {
                // setup a dummy provider
                setProvider(
                    new AnchorProvider(
                        new Connection('http://localhost'),
                        new AnchorWallet(
                            Keypair.fromSeed(
                                Uint8Array.from([
                                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                    1, 1, 1, 1,
                                ]),
                            ),
                        ),
                        {},
                    ),
                );
                otmoicSwap = new Program(
                    idl_singlechain as Idl,
                    getOtmoicSwapAddressBySystemChainId(systemChainId, network),
                ) as unknown as Program<ObridgeSwap>;
            } else {
                otmoicSwap = new Program(
                    idl_singlechain as Idl,
                    getOtmoicSwapAddressBySystemChainId(systemChainId, network),
                    pluginProvider,
                ) as unknown as Program<ObridgeSwap>;
            }

            // user
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.sender));

            // receiver
            let lp = new PublicKey(
                toBs58Address(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address),
            );

            const isSrcTokenSol = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
                ? true
                : false;
            const isDstTokenSol = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // src token
            let srcToken: PublicKey = ZERO_PUBKEY;
            if (!isSrcTokenSol) {
                srcToken = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token),
                );
            }

            // dst token
            let dstToken: PublicKey = ZERO_PUBKEY;
            if (!isDstTokenSol) {
                dstToken = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token),
                );
            }

            // src amount
            const srcAmount: BN = new BN(preBusiness.swap_asset_information.amount);

            // dst amount
            const dstAmount: BN = new BN(preBusiness.swap_asset_information.dst_amount);

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let lock = {
                agreementReachedTime: new BN(agreementReachedTime),
                stepTime: new BN(expectedSingleStepTime),
            };
            // uuid
            const uuid = generateUuidSwap(
                user,
                lp,
                srcToken,
                srcAmount.toString(),
                dstToken,
                dstAmount.toString(),
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
            );

            // source ata token account
            let source: PublicKey | null = null;
            if (!isSrcTokenSol) {
                source = getAssociatedTokenAddressSync(srcToken, user, true, TOKEN_PROGRAM_ID);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoicSwap.programId);
            let escrowAta: PublicKey | null = null;
            if (!isSrcTokenSol) {
                escrowAta = getAssociatedTokenAddressSync(srcToken, escrow, true, TOKEN_PROGRAM_ID);
            }

            // adminSettings
            let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoicSwap.programId);

            // srcTokenSettings
            let srcTokenSettings: PublicKey | null;
            [srcTokenSettings] = PublicKey.findProgramAddressSync(
                [Buffer.from('token'), srcToken.toBytes()],
                otmoicSwap.programId,
            );
            let srcTokenSettingsAccount = await provider.getAccountInfo(srcTokenSettings);
            if (srcTokenSettingsAccount == null) {
                srcTokenSettings = null;
            }

            // dstTokenSettings
            let dstTokenSettings: PublicKey | null;
            [dstTokenSettings] = PublicKey.findProgramAddressSync(
                [Buffer.from('token'), dstToken.toBytes()],
                otmoicSwap.programId,
            );
            let dstTokenSettingsAccount = await provider.getAccountInfo(dstTokenSettings);
            if (dstTokenSettingsAccount == null) {
                dstTokenSettings = null;
            }

            // memo
            let memo = msgpack5()
                .encode({
                    bidId: preBusiness.hash,
                    requestor: preBusiness.swap_asset_information.requestor,
                    lpId: preBusiness.swap_asset_information.quote.lp_info.name,
                    userSign: preBusiness.swap_asset_information.user_sign,
                    lpSign: preBusiness.swap_asset_information.lp_sign,
                })
                .slice();

            let compressedData = pako.deflate(memo, { level: 9 });

            let compressedBuffer = Buffer.from(compressedData);

            let tx = await otmoicSwap.methods
                .submitSwap(uuid, srcAmount, dstAmount, lock, compressedBuffer)
                .accounts({
                    payer: user,
                    from: user,
                    to: lp,
                    srcToken: isSrcTokenSol ? null : srcToken,
                    source: source,
                    dstToken: isDstTokenSol ? null : dstToken,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    adminSettings: adminSettings,
                    srcTokenSettings: srcTokenSettings,
                    dstTokenSettings: dstTokenSettings,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .transaction();

            const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const _getConfirmSwapTransaction = (
    preBusiness: PreBusiness,
    provider: Connection | undefined,
    network: NetworkType,
    pluginProvider?: Provider,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        if (provider == undefined) {
            provider = getJsonRpcProvider(preBusiness, undefined, network);
        }
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            let otmoicSwap: Program<ObridgeSwap>;
            if (pluginProvider == undefined) {
                // setup a dummy provider
                setProvider(
                    new AnchorProvider(
                        new Connection('http://localhost'),
                        new AnchorWallet(
                            Keypair.fromSeed(
                                Uint8Array.from([
                                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                    1, 1, 1, 1,
                                ]),
                            ),
                        ),
                        {},
                    ),
                );
                otmoicSwap = new Program(
                    idl_singlechain as Idl,
                    getOtmoicSwapAddressBySystemChainId(systemChainId, network),
                ) as unknown as Program<ObridgeSwap>;
            } else {
                otmoicSwap = new Program(
                    idl_singlechain as Idl,
                    getOtmoicSwapAddressBySystemChainId(systemChainId, network),
                    pluginProvider,
                ) as unknown as Program<ObridgeSwap>;
            }

            // user
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.sender));

            // receiver
            let lp = new PublicKey(
                toBs58Address(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address),
            );

            const isSrcTokenSol = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
                ? true
                : false;
            const isDstTokenSol = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // src token
            let srcToken: PublicKey = ZERO_PUBKEY;
            if (!isSrcTokenSol) {
                srcToken = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token),
                );
            }

            // dst token
            let dstToken: PublicKey = ZERO_PUBKEY;
            if (!isDstTokenSol) {
                dstToken = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token),
                );
            }

            // src amount
            const srcAmount: BN = new BN(preBusiness.swap_asset_information.amount);

            // dst amount
            const dstAmount: BN = new BN(preBusiness.swap_asset_information.dst_amount);

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;

            // uuid
            const uuid = generateUuidSwap(
                user,
                lp,
                srcToken,
                srcAmount.toString(),
                dstToken,
                dstAmount.toString(),
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
            );

            // from destination
            let fromDestination: PublicKey | null = null;
            if (!isDstTokenSol) {
                fromDestination = getAssociatedTokenAddressSync(dstToken, user, true, TOKEN_PROGRAM_ID);
            }

            // to source
            let toSource: PublicKey | null = null;
            if (!isDstTokenSol) {
                toSource = getAssociatedTokenAddressSync(dstToken, lp, true, TOKEN_PROGRAM_ID);
            }

            // toDestination
            let toDestination: PublicKey | null = null;
            if (!isSrcTokenSol) {
                toDestination = getAssociatedTokenAddressSync(srcToken, lp, true, TOKEN_PROGRAM_ID);
            }

            let feeRecepient = new PublicKey(getFeeRecepientAddressBySystemChainId(systemChainId, network));
            // src fee destination
            let srcFeeDestination: PublicKey | null = null;
            if (!isSrcTokenSol) {
                srcFeeDestination = getAssociatedTokenAddressSync(srcToken, feeRecepient, true, TOKEN_PROGRAM_ID);
            }

            // dst fee destination
            let dstFeeDestination: PublicKey | null = null;
            if (!isDstTokenSol) {
                dstFeeDestination = getAssociatedTokenAddressSync(dstToken, feeRecepient, true, TOKEN_PROGRAM_ID);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoicSwap.programId);
            let escrowAta: PublicKey | null = null;
            if (!isSrcTokenSol) {
                escrowAta = getAssociatedTokenAddressSync(srcToken, escrow, true, TOKEN_PROGRAM_ID);
            }

            // adminSettings
            let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoicSwap.programId);

            // srcTokenSettings
            let srcTokenSettings: PublicKey | null;
            [srcTokenSettings] = PublicKey.findProgramAddressSync(
                [Buffer.from('token'), srcToken.toBytes()],
                otmoicSwap.programId,
            );
            let srcTokenSettingsAccount = await provider.getAccountInfo(srcTokenSettings);
            if (srcTokenSettingsAccount == null) {
                srcTokenSettings = null;
            }

            // dstTokenSettings
            let dstTokenSettings: PublicKey | null;
            [dstTokenSettings] = PublicKey.findProgramAddressSync(
                [Buffer.from('token'), dstToken.toBytes()],
                otmoicSwap.programId,
            );
            let dstTokenSettingsAccount = await provider.getAccountInfo(dstTokenSettings);
            if (dstTokenSettingsAccount == null) {
                dstTokenSettings = null;
            }

            let tx = await otmoicSwap.methods
                .confirmSwap(uuid)
                .accounts({
                    payer: lp,
                    from: user,
                    fromDestination: fromDestination,
                    to: lp,
                    toSource: toSource,
                    toDestination: toDestination,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    adminSettings: adminSettings,
                    feeRecepient: feeRecepient,
                    srcFeeDestination: srcFeeDestination,
                    dstFeeDestination: dstFeeDestination,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .transaction();

            const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const _getRefundSwapTransaction = (
    preBusiness: PreBusiness,
    provider: Connection | undefined,
    network: NetworkType,
    pluginProvider?: Provider,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        if (provider == undefined) {
            provider = getJsonRpcProvider(preBusiness, undefined, network);
        }
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;

            let otmoicSwap: Program<ObridgeSwap>;
            if (pluginProvider == undefined) {
                // setup a dummy provider
                setProvider(
                    new AnchorProvider(
                        new Connection('http://localhost'),
                        new AnchorWallet(
                            Keypair.fromSeed(
                                Uint8Array.from([
                                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                    1, 1, 1, 1,
                                ]),
                            ),
                        ),
                        {},
                    ),
                );
                otmoicSwap = new Program(
                    idl_singlechain as Idl,
                    getOtmoicSwapAddressBySystemChainId(systemChainId, network),
                ) as unknown as Program<ObridgeSwap>;
            } else {
                otmoicSwap = new Program(
                    idl_singlechain as Idl,
                    getOtmoicSwapAddressBySystemChainId(systemChainId, network),
                    pluginProvider,
                ) as unknown as Program<ObridgeSwap>;
            }

            // user
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.sender));

            // receiver
            let lp = new PublicKey(
                toBs58Address(preBusiness.swap_asset_information.quote.quote_base.lp_bridge_address),
            );

            const isSrcTokenSol = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token)
                ? true
                : false;
            const isDstTokenSol = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // src token
            let srcToken: PublicKey = ZERO_PUBKEY;
            if (!isSrcTokenSol) {
                srcToken = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.src_token),
                );
            }

            // dst token
            let dstToken: PublicKey = ZERO_PUBKEY;
            if (!isDstTokenSol) {
                dstToken = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token),
                );
            }

            // src amount
            const srcAmount: BN = new BN(preBusiness.swap_asset_information.amount);

            // dst amount
            const dstAmount: BN = new BN(preBusiness.swap_asset_information.dst_amount);

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let lock = {
                agreementReachedTime: new BN(agreementReachedTime),
                stepTime: new BN(expectedSingleStepTime),
            };
            // uuid
            const uuid = generateUuidSwap(
                user,
                lp,
                srcToken,
                srcAmount.toString(),
                dstToken,
                dstAmount.toString(),
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
            );

            // from source
            let fromSource: PublicKey | null = null;
            if (!isSrcTokenSol) {
                fromSource = getAssociatedTokenAddressSync(srcToken, user, true, TOKEN_PROGRAM_ID);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoicSwap.programId);
            let escrowAta: PublicKey | null = null;
            if (!isSrcTokenSol) {
                escrowAta = getAssociatedTokenAddressSync(srcToken, escrow, true, TOKEN_PROGRAM_ID);
            }

            let tx = await otmoicSwap.methods
                .refundSwap(uuid)
                .accounts({
                    from: user,
                    source: fromSource,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .transaction();

            const latestBlockhash = await provider.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const doTransferIn = (preBusiness: PreBusiness, provider: Connection, network: NetworkType, sender: string) =>
    new Promise<Transaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id;

            // setup a dummy provider
            setProvider(
                new AnchorProvider(
                    new Connection('http://localhost'),
                    new AnchorWallet(
                        Keypair.fromSeed(
                            Uint8Array.from([
                                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                1, 1, 1,
                            ]),
                        ),
                    ),
                    {},
                ),
            );
            const otmoic = new Program(
                idl as Idl,
                getOtmoicAddressBySystemChainId(systemChainId, network),
            ) as unknown as Program<Obridge>;

            // lp
            let lp = new PublicKey(toBs58Address(sender));

            // receiver
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.dst_address));

            const solOnlyMode = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // mint token
            let token: PublicKey = ZERO_PUBKEY;
            let tokenProgramId: PublicKey | null = null;
            if (!solOnlyMode) {
                token = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token),
                );
                let mintTokenAccountInfo = await provider.getAccountInfo(token);
                tokenProgramId = mintTokenAccountInfo!.owner;
            }

            // amount
            let amount = new BN(preBusiness.swap_asset_information.dst_amount_need);

            // sol amount
            let solAmount = new BN(preBusiness.swap_asset_information.dst_native_amount_need);

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let tolerantSingleStepTime = preBusiness.swap_asset_information.tolerant_single_step_time;
            let earliestRefundTime = preBusiness.swap_asset_information.earliest_refund_time;

            // hash lock
            let hashLock = preBusiness.hashlock_solana;

            let lock: Lock = {
                hash: Array.from(Buffer.from(removePrefix0x(hashLock), 'hex')),
                agreementReachedTime: new BN(agreementReachedTime),
                expectedSingleStepTime: new BN(expectedSingleStepTime),
                tolerantSingleStepTime: new BN(tolerantSingleStepTime),
                earliestRefundTime: new BN(earliestRefundTime),
            };

            // uuid
            let uuid = generateUuid(
                lp,
                user,
                lock.hash,
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
                tolerantSingleStepTime.toString(),
                earliestRefundTime.toString(),
                token,
                preBusiness.swap_asset_information.dst_amount_need,
                preBusiness.swap_asset_information.dst_native_amount_need,
            );

            // source ata token account
            let source: PublicKey | null = null;
            if (!solOnlyMode) {
                source = getAssociatedTokenAddressSync(token, lp, true, tokenProgramId!);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoic.programId);
            let escrowAta: PublicKey | null = null;
            if (!solOnlyMode) {
                escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId!);
            }

            // adminSettings
            let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoic.programId);

            // tokenSettings
            let tokenSettings: PublicKey | null;
            [tokenSettings] = PublicKey.findProgramAddressSync(
                [Buffer.from('token'), token.toBytes()],
                otmoic.programId,
            );
            let tokenSettingsAccount = await provider.getAccountInfo(tokenSettings);
            if (tokenSettingsAccount == null) {
                tokenSettings = null;
            }

            // memo
            let memo = msgpack5()
                .encode({
                    expectedSingleStepTime: expectedSingleStepTime,
                    tolerantSingleStepTime: tolerantSingleStepTime,
                    earliestRefundTime: earliestRefundTime,
                    agreementReachedTime: agreementReachedTime,
                    srcChainId: preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id,
                    srcTransferId: preBusiness.swap_asset_information.src_transfer_id,
                    method: '1',
                })
                .slice();

            let compressedData = pako.deflate(memo, { level: 9 });

            let compressedBuffer = Buffer.from(compressedData);

            let tx = await otmoic.methods
                .prepare(uuid, user, solAmount, amount, lock, isIn, compressedBuffer)
                .accounts({
                    payer: lp,
                    from: lp,
                    mint: solOnlyMode ? null : token,
                    source: source,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    adminSettings: adminSettings,
                    tokenSettings: tokenSettings!,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: tokenProgramId,
                })
                .transaction();

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const doTransferInConfirm = (
    preBusiness: PreBusiness,
    provider: Connection,
    network: NetworkType,
    sender: string,
    signer: string,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id;

            // setup a dummy provider
            setProvider(
                new AnchorProvider(
                    new Connection('http://localhost'),
                    new AnchorWallet(
                        Keypair.fromSeed(
                            Uint8Array.from([
                                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                1, 1, 1,
                            ]),
                        ),
                    ),
                    {},
                ),
            );
            const otmoic = new Program(
                idl as Idl,
                getOtmoicAddressBySystemChainId(systemChainId, network),
            ) as unknown as Program<Obridge>;

            // signer
            let signerAccount = new PublicKey(toBs58Address(signer));

            // sender
            let lp = new PublicKey(toBs58Address(sender));

            // receiver
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.dst_address));

            const solOnlyMode = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // mint token
            let token: PublicKey = ZERO_PUBKEY;
            let tokenProgramId: PublicKey | null = null;
            if (!solOnlyMode) {
                token = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token),
                );
                let mintTokenAccountInfo = await provider.getAccountInfo(token);
                tokenProgramId = mintTokenAccountInfo!.owner;
            }

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let tolerantSingleStepTime = preBusiness.swap_asset_information.tolerant_single_step_time;
            let earliestRefundTime = preBusiness.swap_asset_information.earliest_refund_time;

            // hash lock
            let hashLock = preBusiness.hashlock_solana;

            let lock: Lock = {
                hash: Array.from(Buffer.from(removePrefix0x(hashLock), 'hex')),
                agreementReachedTime: new BN(agreementReachedTime),
                expectedSingleStepTime: new BN(expectedSingleStepTime),
                tolerantSingleStepTime: new BN(tolerantSingleStepTime),
                earliestRefundTime: new BN(earliestRefundTime),
            };

            // uuid
            let uuid = generateUuid(
                lp,
                user,
                lock.hash,
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
                tolerantSingleStepTime.toString(),
                earliestRefundTime.toString(),
                token,
                preBusiness.swap_asset_information.dst_amount_need,
                preBusiness.swap_asset_information.dst_native_amount_need,
            );

            // hash preimage
            let preimage = Array.from(Buffer.from(removePrefix0x(preBusiness.preimage), 'hex'));

            // adminSettings
            let [adminSettings] = PublicKey.findProgramAddressSync([Buffer.from('settings')], otmoic.programId);

            // destination
            let destination: PublicKey | null = null;
            if (!solOnlyMode) {
                destination = getAssociatedTokenAddressSync(token, user, true, tokenProgramId!);
            }

            // fee recepient
            let feeRecepient = new PublicKey(getFeeRecepientAddressBySystemChainId(systemChainId, network));
            let feeDestination: PublicKey | null = null;
            if (!solOnlyMode) {
                feeDestination = getAssociatedTokenAddressSync(token, feeRecepient, true, tokenProgramId!);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoic.programId);
            let escrowAta: PublicKey | null = null;
            if (!solOnlyMode) {
                escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId!);
            }

            let tx = await otmoic.methods
                .confirm(uuid, preimage, isIn)
                .accounts({
                    payer: signerAccount,
                    from: lp,
                    to: user,
                    destination: destination,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    adminSettings: adminSettings,
                    feeRecepient: feeRecepient,
                    feeDestination: feeDestination,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: tokenProgramId,
                })
                .transaction();

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const doTransferInRefund = (
    preBusiness: PreBusiness,
    provider: Connection,
    network: NetworkType,
    sender: string,
) =>
    new Promise<Transaction>(async (resolve, reject) => {
        try {
            const systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id;

            // setup a dummy provider
            setProvider(
                new AnchorProvider(
                    new Connection('http://localhost'),
                    new AnchorWallet(
                        Keypair.fromSeed(
                            Uint8Array.from([
                                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                1, 1, 1,
                            ]),
                        ),
                    ),
                    {},
                ),
            );
            const otmoic = new Program(
                idl as Idl,
                getOtmoicAddressBySystemChainId(systemChainId, network),
            ) as unknown as Program<Obridge>;

            // lp
            let lp = new PublicKey(toBs58Address(sender));

            // receiver
            let user = new PublicKey(toBs58Address(preBusiness.swap_asset_information.dst_address));

            const solOnlyMode = isZeroAddress(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token)
                ? true
                : false;
            const ZERO_PUBKEY = new PublicKey(new Uint8Array(32).fill(0));

            // mint token
            let token: PublicKey = ZERO_PUBKEY;
            let tokenProgramId: PublicKey | null = null;
            if (!solOnlyMode) {
                token = new PublicKey(
                    toBs58Address(preBusiness.swap_asset_information.quote.quote_base.bridge.dst_token),
                );
                let mintTokenAccountInfo = await provider.getAccountInfo(token);
                tokenProgramId = mintTokenAccountInfo!.owner;
            }

            // agreement reached time and step time lock
            let agreementReachedTime = preBusiness.swap_asset_information.agreement_reached_time;
            let expectedSingleStepTime = preBusiness.swap_asset_information.expected_single_step_time;
            let tolerantSingleStepTime = preBusiness.swap_asset_information.tolerant_single_step_time;
            let earliestRefundTime = preBusiness.swap_asset_information.earliest_refund_time;

            // hash lock
            let hashLock = preBusiness.hashlock_solana;

            let lock: Lock = {
                hash: Array.from(Buffer.from(removePrefix0x(hashLock), 'hex')),
                agreementReachedTime: new BN(agreementReachedTime),
                expectedSingleStepTime: new BN(expectedSingleStepTime),
                tolerantSingleStepTime: new BN(tolerantSingleStepTime),
                earliestRefundTime: new BN(earliestRefundTime),
            };

            // uuid
            let uuid = generateUuid(
                lp,
                user,
                lock.hash,
                agreementReachedTime.toString(),
                expectedSingleStepTime.toString(),
                tolerantSingleStepTime.toString(),
                earliestRefundTime.toString(),
                token,
                preBusiness.swap_asset_information.dst_amount_need,
                preBusiness.swap_asset_information.dst_native_amount_need,
            );

            // source
            let source: PublicKey | null = null;
            if (!solOnlyMode) {
                source = getAssociatedTokenAddressSync(token, lp, true, tokenProgramId!);
            }

            // escrow and escrowAta
            let [escrow] = PublicKey.findProgramAddressSync([Buffer.from(uuid)], otmoic.programId);
            let escrowAta: PublicKey | null = null;
            if (!solOnlyMode) {
                escrowAta = getAssociatedTokenAddressSync(token, escrow, true, tokenProgramId!);
            }

            let tx = await otmoic.methods
                .refund(uuid, isIn)
                .accounts({
                    from: lp,
                    source: source,
                    escrow: escrow,
                    escrowAta: escrowAta,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: tokenProgramId,
                })
                .transaction();

            resolve(tx);
        } catch (err) {
            reject(err);
        }
    });

export const getBalance = async (
    network: NetworkType,
    systemChainId: number,
    token: string,
    address: string,
    rpc: string | undefined,
) => {
    let provider = getProvider(rpc === undefined ? getDefaultRPC(systemChainId, network) : rpc);
    if (isZeroAddress(token)) {
        let userAddress = new PublicKey(toBs58Address(address));
        let balance = await provider.getBalance(userAddress);
        return convertStandardUnits(balance, getNativeTokenDecimals(systemChainId));
    } else {
        let tokenAccounts = await provider.getTokenAccountsByOwner(new PublicKey(toBs58Address(address)), {
            mint: new PublicKey(toBs58Address(token)),
        });

        if (tokenAccounts.value.length == 0) {
            return '0';
        }
        let tokenAccount = tokenAccounts.value[0];
        const accountData = AccountLayout.decode(tokenAccount.account.data);
        let mintTokenAccountInfo = await provider.getAccountInfo(accountData.mint);
        let tokenProgramId = mintTokenAccountInfo!.owner;
        let mintInfo = await getMint(provider, accountData.mint, undefined, tokenProgramId);
        let balance = accountData.amount;
        let decimals = mintInfo.decimals;

        return convertStandardUnits(balance, decimals);
    }
};

const DEFAULT_MICRO_LAMPORTS = 0.002 * LAMPORTS_PER_SOL;
const PRIORITY_RATE_MULTIPLIER = 1.5; // Adjust this multiplier as needed
const getCompetitivePriorityFee = async (connection: Connection): Promise<number> => {
    try {
        // Get recent prioritization fees
        const priorityFees = await connection.getRecentPrioritizationFees();

        if (!priorityFees.length) {
            return DEFAULT_MICRO_LAMPORTS; // fallback to default if no recent fees
        }

        // sort the fees from high to low
        const recentFees = priorityFees.map((fee) => fee.prioritizationFee).sort((a, b) => b - a);
        // get the median fee
        const medianFee = recentFees[Math.floor(recentFees.length / 2)];

        if (medianFee == 0) {
            return DEFAULT_MICRO_LAMPORTS;
        }

        // Apply multiplier to ensure competitiveness
        return Math.ceil(medianFee * PRIORITY_RATE_MULTIPLIER);
    } catch (error) {
        console.error('Error getting competitive priority fee:', error);
        return DEFAULT_MICRO_LAMPORTS; // fallback to default
    }
};

// export const ensureSendingTx = async (provider: Connection, keypair: Keypair, tx: Transaction): Promise<string> => {
//     const latestBlockhash = await provider.getLatestBlockhash('confirmed');
//     tx.recentBlockhash = latestBlockhash.blockhash;

//     // const microLamports = await getCompetitivePriorityFee(provider);
//     const addPriorityFee: TransactionInstruction = ComputeBudgetProgram.setComputeUnitPrice({
//         microLamports: DEFAULT_MICRO_LAMPORTS,
//     });
//     tx.instructions.unshift(addPriorityFee);

//     tx.feePayer = keypair.publicKey;
//     tx.sign(keypair);

//     let txHash = await provider.sendRawTransaction(tx.serialize());
//     console.log(`not yet confirmed txHash: ${txHash}`);
//     return txHash;
// };

export const ensureSendingTx = async (
    connection: Connection,
    signer: Keypair,
    transaction: Transaction,
    maxRetries: number = 5,
    retryDelay: number = 5000, // in milliseconds
): Promise<string> => {
    const signatures: string[] = [];
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            // Get the latest blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;

            // const microLamports = await getCompetitivePriorityFee(provider);
            const addPriorityFee: TransactionInstruction = ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: DEFAULT_MICRO_LAMPORTS,
            });
            transaction.instructions.unshift(addPriorityFee);

            transaction.feePayer = signer.publicKey;
            transaction.sign(signer);

            // Send the transaction
            const txId = await connection.sendRawTransaction(transaction.serialize());
            signatures.push(txId);
            console.log(`Transaction sent: ${txId}`);

            // Wait for confirmation
            const confirmation = await connection.confirmTransaction(
                {
                    signature: txId,
                    blockhash: blockhash,
                    lastValidBlockHeight: lastValidBlockHeight,
                },
                'confirmed',
            );
            if (confirmation.value.err == null) {
                console.log(`Transaction confirmed: ${txId}`);
                return txId;
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            attempt++;
        }

        // Check all signatures for confirmation
        if (signatures.length > 0) {
            const statuses = await connection.getSignatureStatuses(signatures);
            for (const [index, status] of statuses.value.entries()) {
                console.log(`Checking status of signature ${signatures[index]}:`, status);
                if (
                    status?.confirmationStatus === 'processed' ||
                    status?.confirmationStatus === 'confirmed' ||
                    status?.confirmationStatus === 'finalized'
                ) {
                    console.log(`Previously sent transaction confirmed: ${signatures[index]}`);
                    return signatures[index];
                }
            }
        }

        // Wait before retrying
        if (attempt < maxRetries) {
            console.log(`Retrying # ${attempt} in ${retryDelay}ms...`);
            await sleep(retryDelay);
        }
    }

    // If no transaction was confirmed after all retries
    throw new Error('Transaction failed after maximum retries.');
};
