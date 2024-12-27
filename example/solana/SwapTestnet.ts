import Otmoic, {
    Bridge,
    NetworkType,
    Quote,
    SwapSignedData,
    PreBusiness,
    Business,
    ResponseSolana,
    SwapType,
} from '../../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const NETWORK = NetworkType.TESTNET;
const RPC_SOLANA = 'https://api.devnet.solana.com';
const RPC_BSC = 'https://data-seed-prebsc-2-s3.bnbchain.org:8545';

const bridge: Bridge = {
    bridge_id: 3,
    src_chain_id: 501,
    dst_chain_id: 9006,
    src_token: '0xd691ced994b9c641cf8f80b5f4dbdd80f0fd86af1b8604a702151fa7e46b7232',
    dst_token: '0xacda8bf66c2cadac9e99aa1aa75743f536e71094',
    bridge_name: undefined,
};
const amount = '13';

const relay = new Otmoic.Relay(RELA_URL);

const Ask = () =>
    new Promise<Quote>((resolve, reject) => {
        relay.ask(
            {
                bridge,
                amount: amount,
            },
            {
                OnQuote: (quote: Quote) => {
                    console.log('new quote', quote);
                    relay.stopAsk();
                    resolve(quote);
                },
            },
        );

        setTimeout(() => relay.stopAsk(), 30 * 1000);
    });

const doTxOut = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('doTxOut');

        const txHash = await Otmoic.business.transferOut(preBusiness, NETWORK, RPC_SOLANA, {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        });
        console.log('response tx out', txHash);
        resolve();
    });

const waitTxIn = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxIn');

        let succeed = false;

        while (succeed == false) {
            try {
                const resp = (await relay.getBusiness(preBusiness.hash)) as Business;
                console.log(Date.now(), resp.step);
                succeed = resp.step >= 3;
            } catch (e) {
                console.log(e);
            }
            await Otmoic.utils.Sleep(1000);
        }
        console.log('waited tx in');
        resolve();
    });

const doTxOutCfm = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('doTxOutCfm');

        const { txHash } = (await Otmoic.business.transferOutConfirm(preBusiness, NETWORK, RPC_SOLANA, {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        })) as ResponseSolana;
        console.log('response tx out confirm', txHash);
        resolve();
    });

const waitTxInCfm = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxInCfm');

        let succeed = false;

        while (succeed == false) {
            try {
                const resp = (await relay.getBusiness(preBusiness.hash)) as Business;
                console.log(Date.now(), resp.step);
                succeed = resp.step >= 5;
            } catch (e) {
                console.log(e);
            }
            await Otmoic.utils.Sleep(1000);
        }
        resolve();
    });

const doTxRefund = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('doTxOutRefund');

        const { txHash } = (await Otmoic.business.transferOutRefund(preBusiness, NETWORK, RPC_SOLANA, {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        })) as ResponseSolana;
        console.log('response tx out refund', txHash);
        resolve();
    });

const waitTxInRefund = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxInRefund');

        let succeed = false;

        while (succeed == false) {
            try {
                const resp = (await relay.getBusiness(preBusiness.hash)) as Business;
                console.log(Date.now(), resp.step);
                succeed = resp.step >= 7;
            } catch (e) {
                console.log(e);
            }
            await Otmoic.utils.Sleep(1000);
        }
        resolve();
    });

const swap = async () => {
    console.log('start solana swap on testnet');
    const quote = await Ask();
    const signData: SwapSignedData = (await Otmoic.business.signQuote(
        NETWORK,
        quote,
        amount,
        0,
        '0x50724411eb1817822e2590a43a8F0859FCc6fCD5',
        undefined,
        undefined,
        undefined,
        RPC_SOLANA,
        RPC_BSC,
        {
            swapType: SwapType.ATOMIC,
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        },
    )) as SwapSignedData;

    console.log('signData', signData);

    const relay = new Otmoic.Relay(RELA_URL);
    const swapType = SwapType.ATOMIC;
    const preBusiness: PreBusiness = await relay.swap(quote, signData.signData, signData.signed, swapType);

    console.log('preBusiness', preBusiness);

    if (preBusiness.locked == true) {
        await doTxOut(preBusiness);
        await waitTxIn(preBusiness);

        await doTxOutCfm(preBusiness);
        await waitTxInCfm(preBusiness);

        console.log('swap success');
        process.exit(0);
    }
};

const refund = async () => {
    const quote = await Ask();
    const signData: SwapSignedData = (await Otmoic.business.signQuote(
        NETWORK,
        quote,
        amount,
        0,
        '0x50724411eb1817822e2590a43a8F0859FCc6fCD5',
        undefined,
        undefined,
        undefined,
        RPC_SOLANA,
        RPC_BSC,
        {
            swapType: SwapType.ATOMIC,
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        },
    )) as SwapSignedData;

    console.log('signData', signData);

    const relay = new Otmoic.Relay(RELA_URL);
    const swapType = SwapType.ATOMIC;
    const preBusiness: PreBusiness = await relay.swap(quote, signData.signData, signData.signed, swapType);

    console.log('preBusiness', preBusiness);

    if (preBusiness.locked == true) {
        await doTxOut(preBusiness);
        await waitTxIn(preBusiness);

        await doTxRefund(preBusiness);
        await waitTxInRefund(preBusiness);

        console.log('refund success');
        process.exit(0);
    }
};

swap();
// refund()
