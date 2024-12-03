import { Business, BusinessFullData, Relay } from '../src/index';

const RELA_URL = 'https://5b4522f4.nathanielight.myterminus.com';
const HASH = '0x5b8df971a65da5e7564549c64f9163b19ef26622ca4852ebe6e49d843e811d02';

const GetBusiness = async () => {
    const business: Business = (await new Relay(RELA_URL).getBusiness(HASH)) as Business;
    console.log('business', business);

    const businessFull: BusinessFullData = (await new Relay(RELA_URL).getBusiness(HASH, {
        detailed: true,
    })) as BusinessFullData;
    console.log('full business', businessFull);
};

GetBusiness();
