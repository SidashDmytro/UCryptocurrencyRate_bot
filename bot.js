require('dotenv').config();
const { getCryptocurrencyRate } = require('./functions');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', msg => {
    const chatId = msg.chat.id;
    const cryptocurrencies = ['BTC', 'ETC', 'WLKN']; // following cryptocurrencies

    getCryptocurrencyRate(cryptocurrencies)
        .then(obj => {
            let text = '';
            let entries = Object.entries(obj);
            let length = entries.length;

            for (let i = 0; i < length; i++) {
                text += `${entries[i][0]}: $${entries[i][1]}\n`
            }
            bot.sendMessage(chatId, text);
        })
        .catch(error => console.error(error));
})