require('dotenv').config();
const axios = require('axios');
const { getUserFromDB, updateListOfCryptocurrenciesInDB, createUserInDB, updateStatusInDB, getAllUsersInDB } = require('./db/mongoFunctions');
const coinmarket_api_key = process.env.COINMARCETCAP_API_KEY;

async function createUser(id, cryptocurrencies) {
    try {
        await createUserInDB(id, cryptocurrencies)
        return;
    } catch (error) {
        throw new Error(`Failed to create new user: ${error}`);
    }
}
async function getAllUsers() {
    try {
        return await getAllUsersInDB();
    } catch (error) {
        throw new Error(`Error getting users: ${error}`);
    }
}

async function updateStatus(id, newStatus) {
    try {
        await updateStatusInDB(id, newStatus)
        return;
    } catch (error) {
        throw new Error(`Failed to update status: ${error}`);
    }
}

async function getUser(id) {
    try {
        return await getUserFromDB(id);
    } catch (error) {
        throw new Error(`Failed to get user: ${error}`);
    }
}

// action can be 'add' or 'delete'
async function updateListOfCryptocurrencies(id, cryptocurrency, action) {
    try {
        return await updateListOfCryptocurrenciesInDB(id, cryptocurrency, action)
    } catch (error) {
        throw new Error(`Failed of updating list of cryptocurrencies: ${error}`);
    }
}

async function getCryptocurrencyRate(cryptocurrencies) { // cryptocurrencies - is an array
    let listCurrencies = cryptocurrencies.join(',');
    let apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${listCurrencies}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'X-CMC_PRO_API_KEY': coinmarket_api_key,
            },
        });

        const json = response.data;
        const obj = {};

        for (let i = 0; i < cryptocurrencies.length; i++) {
            obj[cryptocurrencies[i]] = {
                price: json.data[cryptocurrencies[i]]['quote']['USD']['price'].toFixed(2),
                percent_change_24h: json.data[cryptocurrencies[i]]['quote']['USD']['percent_change_24h'].toFixed(2),
            };
        }

        return obj;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function isCryptocurrencyExist(cryptocurrency) {
    let apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cryptocurrency}`;
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'X-CMC_PRO_API_KEY': coinmarket_api_key,
            },
        });
        if (response.data.data && response.data.data[cryptocurrency]) return true;
        else return false;
    } catch (error) {
        throw error;
    }
}

async function addOrDeleteCryptocurrency(msg, action) {
    const chatId = msg.chat.id;
    const symbol = msg.text.replace(/\s+/g, '').toUpperCase();
    try {
        const isExist = await isCryptocurrencyExist(symbol);

        if (!isExist) {
            return `Вы допустили ошибку, криптовалюта '${symbol}' не существует. Исправьте ошибку и повторите ввод`;
        }
        await updateListOfCryptocurrencies(chatId, symbol, action);
        await updateStatus(chatId, 'default');
        return await printCryptocurrenciesList(chatId);
    } catch (error) {
        console.log(error);
    }
}

async function printCryptocurrenciesList(chatId) {
    try {
        const result = await getUser(chatId);
        if (result !== null) {
            try {
                const obj = await getCryptocurrencyRate(result['symbols']);
                let text = '';
                let entries = Object.entries(obj);

                for (let i = 0; i < entries.length; i++) {
                    let percentChange = +entries[i][1]['percent_change_24h'];
                    let percentPrint = (percentChange < 0) ? `${percentChange}% 🔻` : `${percentChange}% ⬆︎`

                    text += `${entries[i][0]}: $${entries[i][1]['price']} (${percentPrint})\n`
                }

                return text;
            } catch (error) {
                console.error(error)
            }
        } else {
            return 'Пользователь не существует';
        }
    } catch (error) {
        console.error(error)
    }
}


module.exports = { getCryptocurrencyRate, getUser, updateListOfCryptocurrencies, createUser, isCryptocurrencyExist, updateStatus, addOrDeleteCryptocurrency, printCryptocurrenciesList, getAllUsers };
