import { PreBusiness, solana, utils } from '../../src';
import { Bridge, Relay, Quote, SignData } from '../../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const NETWORK = 'testnet';
const RPC_SOLANA = 'https://api.devnet.solana.com';
const RPC_BSC = 'https://data-seed-prebsc-2-s3.bnbchain.org:8545';

const bridge: Bridge = {
    bridge_id: 2,
    src_chain_id: 501,
    dst_chain_id: 9006,
    src_token: '0xd691ced994b9c641cf8f80b5f4dbdd80f0fd86af1b8604a702151fa7e46b7232',
    dst_token: '0xaCDA8BF66C2CADAc9e99Aa1aa75743F536E71094',
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

        const txHash = await solana.transferOutByPrivateKey(
            preBusiness,
            process.env.WALLET_KEY as string,
            NETWORK,
            RPC_SOLANA,
        );
        console.log('response tx out', txHash);
        resolve();
    });

const waitTxIn = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxIn');

        let succeed = false;

        while (succeed == false) {
            try {
                const resp = await relay.getBusiness(preBusiness.hash);
                console.log(Date.now(), resp.step);
                succeed = resp.step >= 3;
            } catch (e) {
                console.log(e);
            }
            await utils.Sleep(1000);
        }
        console.log('waited tx in');
        resolve();
    });

const doTxOutCfm = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('doTxOutCfm');

        const { txHash } = await solana.transferOutConfirmByPrivateKey(
            preBusiness,
            process.env.WALLET_KEY as string,
            NETWORK,
            RPC_SOLANA,
        );
        console.log('response tx out confirm', txHash);
        resolve();
    });

const waitTxInCfm = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('waitTxInCfm');

        let succeed = false;

        while (succeed == false) {
            try {
                const resp = await relay.getBusiness(preBusiness.hash);
                console.log(Date.now(), resp.step);
                succeed = resp.step >= 5;
            } catch (e) {
                console.log(e);
            }
            await utils.Sleep(1000);
        }
        resolve();
    });

const doTxRefund = (preBusiness: PreBusiness) =>
    new Promise<void>(async (resolve, reject) => {
        console.log('doTxOutRefund');

        const { txHash } = await solana.transferOutRefundByPrivateKey(
            preBusiness,
            process.env.WALLET_KEY as string,
            NETWORK,
            RPC_SOLANA,
        );
        console.log('response tx out refund', txHash);
        resolve();
    });

const swap = async () => {
    const quote = await Ask();
    const signData: { signData: SignData; signed: string } = await solana.signQuoteByPrivateKey(
        NETWORK,
        quote,
        process.env.WALLET_KEY as string,
        amount,
        0,
        '0x50724411eb1817822e2590a43a8F0859FCc6fCD5',
        undefined,
        undefined,
        undefined,
        RPC_SOLANA,
        RPC_BSC,
    );

    console.log('signData', signData);

    const relay = new Relay(RELA_URL);
    const business: PreBusiness = await relay.swap(quote, signData.signData, signData.signed);

    console.log('business', business);

    if (business.locked == true) {
        await doTxOut(business);
        await waitTxIn(business);

        await doTxOutCfm(business);
        await waitTxInCfm(business);
    }
};

const refund = async () => {
    const quote = await Ask();
    const signData: { signData: SignData; signed: string } = await solana.signQuoteByPrivateKey(
        NETWORK,
        quote,
        process.env.WALLET_KEY as string,
        amount,
        0,
        '0x50724411eb1817822e2590a43a8F0859FCc6fCD5',
        undefined,
        undefined,
        undefined,
        RPC_SOLANA,
        RPC_BSC,
    );

    console.log('signData', signData);

    const relay = new Relay(RELA_URL);
    const business: PreBusiness = await relay.swap(quote, signData.signData, signData.signed);

    console.log('business', business);

    if (business.locked == true) {
        await doTxOut(business);
        await waitTxIn(business);

        await doTxRefund(business);
    }
};

swap();
// refund()
