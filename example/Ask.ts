import { Bridge, Relay, Quote } from '../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';

const bridge: Bridge = {
    bridge_id: 6,
    src_chain_id: 9006,
    dst_chain_id: 9006,
    src_token: '0x0000000000000000000000000000000000000000',
    dst_token: '0xaCDA8BF66C2CADAc9e99Aa1aa75743F536E71094',
    bridge_name: undefined,
};

const Ask = async () => {
    const relay = new Relay(RELA_URL);

    relay.ask(
        {
            bridge,
            amount: '1',
        },
        {
            OnQuote: (quote: Quote) => {
                console.log('new quote', quote);
            },
        },
    );

    setTimeout(() => relay.stopAsk(), 30 * 1000);
};

Ask();
