import Otmoic, { Business, BusinessFullData, SwapType } from '../src/index';

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const HASH = '0x0969c6ee0a8d9eeda513f50ad30db6b669480c120808dade3f1a6dfc36575996';

const GetBusiness = async () => {
    const business: Business = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH)) as Business;
    console.log('business', business);

    const businessFull: BusinessFullData = (await new Otmoic.Relay(RELA_URL).getBusiness(HASH, {
        detailed: true,
        swapType: SwapType.ATOMIC,
    })) as BusinessFullData;
    console.log('full business', businessFull);
};

GetBusiness();
