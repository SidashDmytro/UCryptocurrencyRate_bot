require('dotenv').config();
const axios = require('axios');
const coinmarket_api_key = process.env.COINMARCETCAP_API_KEY;

async function getCryptocurrencyRate(cryptocurrencies) {
    let response = null;
    let length = cryptocurrencies.length;
    let listCurrencies = '';

    for (i = 0; i < length; i++) {
        (i == length - 1) ? listCurrencies += cryptocurrencies[i] : listCurrencies += `${cryptocurrencies[i]},`
    }

    let apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${listCurrencies}`;

    return new Promise(async (resolve, reject) => {
        try {
            response = await axios.get(apiUrl, {
                headers: {
                    'X-CMC_PRO_API_KEY': coinmarket_api_key,
                },
            });
        } catch (ex) {
            response = null;
            // error
            console.log(ex);
            reject(ex);
        }
        if (response) {
            // success
            const json = response.data;
            let obj = {};

            for (i = 0; i < length; i++) {
                obj[cryptocurrencies[i]] = json.data[`${cryptocurrencies[i]}`]['quote']['USD']['price'].toFixed(2);
            }

            console.log(obj);
            resolve(obj);
        }
    });
}

module.exports = { getCryptocurrencyRate };
