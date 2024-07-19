import { Business, BusinessFullData, Relay } from '../src/index'

const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com'
const HASH = '0xc3938b65e57a479b4622467e3c43f7f59d54f467a44793e9e2fb69f7076348a3'

const GetBusiness = async () => {
    const business: Business = await new Relay(RELA_URL).getBusiness(HASH)
    console.log('business', business)

    const businessFull: BusinessFullData = await new Relay(RELA_URL).getBusinessFull(HASH)
    console.log('full business', businessFull)
}

GetBusiness()