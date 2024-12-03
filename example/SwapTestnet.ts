import {
    Bridge,
    Relay,
    Quote,
    SwapSignedData,
    PreBusiness,
    evm,
    utils,
    business,
    NetworkType,
    Business,
} from '../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const NETWORK = NetworkType.TESTNET;
const RPC_BSC = 'https://bsc-testnet-rpc.publicnode.com';
const RPC_SOLANA = 'https://api.devnet.solana.com';

const bridge: Bridge = {
    bridge_id: 1,
    src_chain_id: 501,
    dst_chain_id: 9006,
    src_token: '0xd691ced994b9c641cf8f80b5f4dbdd80f0fd86af1b8604a702151fa7e46b7232',
    dst_token: '0xacda8bf66c2cadac9e99aa1aa75743f536e71094',
    bridge_name: undefined,
};
const amount = '15';

const relay = new Relay(RELA_URL);

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

        const resp = await business.transferOut(preBusiness, NETWORK, RPC_BSC, {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
            useMaximumGasPriceAtMost: false,
        });
        console.log('response tx out', resp);
        resolve();
    });

const waitTxIn = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxIn');

        let succeed = false;

        while (succeed == false) {
            const resp = (await relay.getBusiness(preBusiness.hash)) as Business;
            succeed = resp.step >= 3;
            console.log('waitTxIn', resp.step);
            await utils.Sleep(1000);
        }

        resolve();
    });

const doTxOutCfm = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('doTxOutCfm');

        const resp = await business.transferOutConfirm(preBusiness, NETWORK, RPC_BSC, {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
            useMaximumGasPriceAtMost: false,
        });
        console.log('response tx out confirm', resp);
        resolve();
    });

const waitTxInCfm = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxInCfm');

        let succeed = false;

        while (succeed == false) {
            const resp = (await relay.getBusiness(preBusiness.hash)) as Business;
            succeed = resp.step >= 5;
            console.log('waitCfmIn', resp.step);
            await utils.Sleep(1000);
        }

        resolve();
    });

const doTxOutRefund = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('doTxOutRefund');

        let canDo = false;
        while (canDo == false) {
            await utils.Sleep(1000);

            canDo = Date.now() > preBusiness.swap_asset_information.earliest_refund_time * 1000 + 10 * 1000;

            console.log(
                `can refund: ${canDo}, now: ${Date.now()}, time lock: ${preBusiness.swap_asset_information.earliest_refund_time * 1000 + 10 * 1000}`,
            );
        }

        const resp = await business.transferOutRefund(preBusiness, NETWORK, RPC_BSC, {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
            useMaximumGasPriceAtMost: false,
        });
        console.log('response tx out refund', resp);
        resolve();
    });

const waitTxInRefund = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxInRefund');

        let succeed = false;

        while (succeed == false) {
            const resp = (await relay.getBusiness(preBusiness.hash)) as Business;
            succeed = resp.step >= 7;
            console.log('waitCfmRefund', resp.step);
            await utils.Sleep(1000);
        }

        resolve();
    });

const swap = async () => {
    const quote = await Ask();

    const signData: SwapSignedData = (await business.signQuote(
        NETWORK,
        quote,
        amount,
        0,
        '0xfee69ce6840ffcc48af425d5827e8dbcb1a9afd688ef206ee3da5c9ef23503dc',
        undefined,
        undefined,
        undefined,
        RPC_BSC,
        RPC_SOLANA,
        {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        },
    )) as SwapSignedData;

    console.log('signData', signData);

    const relay = new Relay(RELA_URL);
    const preBusiness: PreBusiness = await relay.swap(quote, signData.signData, signData.signed);

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
    const signData: SwapSignedData = (await business.signQuote(
        NETWORK,
        quote,
        amount,
        0,
        '0xfee69ce6840ffcc48af425d5827e8dbcb1a9afd688ef206ee3da5c9ef23503dc',
        undefined,
        undefined,
        undefined,
        RPC_BSC,
        RPC_SOLANA,
        {
            type: 'privateKey',
            privateKey: process.env.WALLET_KEY as string,
        },
    )) as SwapSignedData;

    console.log('signData', signData);

    const relay = new Relay(RELA_URL);
    const preBusiness: PreBusiness = await relay.swap(quote, signData.signData, signData.signed);

    console.log('preBusiness', preBusiness);

    if (preBusiness.locked == true) {
        await doTxOut(preBusiness);
        await waitTxIn(preBusiness);

        await doTxOutRefund(preBusiness);
        await waitTxInRefund(preBusiness);
        console.log('refund success');
        process.exit(0);
    }
};

swap();
// refund();
