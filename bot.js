require('dotenv').config();
const { getUser, createUser, updateStatus, addOrDeleteCryptocurrency, printCryptocurrenciesList, getAllUsers } = require('./functions');
const TelegramBot = require('node-telegram-bot-api');
const CronJob = require('cron').CronJob;
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const txt = require('./txt.json');

const keyboard = {
    reply_markup: {
        keyboard: [
            [{ text: txt.buttons.checkBtn }, { text: txt.buttons.addBtn }, { text: txt.buttons.deleteBtn }]
        ],
        resize_keyboard: true,
    }
};

bot.on('polling_error', (error) => {
    console.error('[polling_error]', error);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text.toString();

    switch (message) {
        case txt.commands.start:
            try {
                if (await getUser(chatId) === null) { // if the user doesn't exist
                    await createUser(chatId, ['BTC', 'ETH']); // create user with start list of cryptocurrencies 
                    bot.sendMessage(chatId, txt.messages.startMsg, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
                } else {
                    bot.sendMessage(chatId, txt.messages.defaultMsg, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
                }
            } catch (error) {
                console.error(error);
            }
            break;
        case txt.buttons.checkBtn:
            bot.sendMessage(chatId, await printCryptocurrenciesList(chatId, false), keyboard);
            await updateStatus(chatId, 'default');
            break;
        case txt.buttons.addBtn:
            bot.sendMessage(chatId, txt.messages.addMsg, { reply_markup: keyboard.reply_markup });
            await updateStatus(chatId, 'add');
            break;
        case txt.buttons.deleteBtn:
            bot.sendMessage(chatId, txt.messages.deleteMsg, { reply_markup: keyboard.reply_markup });
            await updateStatus(chatId, 'delete');
            break;
        default:
            const result = await getUser(chatId);
            switch (result['status']) {
                case 'add':
                    bot.sendMessage(chatId, await addOrDeleteCryptocurrency(msg, 'add'), keyboard);
                    break;
                case 'delete':
                    bot.sendMessage(chatId, await addOrDeleteCryptocurrency(msg, 'delete'), keyboard);
                    break;
                default:
                    bot.sendMessage(chatId, txt.messages.defaultMsg, { reply_markup: keyboard.reply_markup });
                    break;
            }
            break;
    }
})

let job = new CronJob(
    '0 9 * * *',
    async function () {
        try {
            let allUsers = await getAllUsers();
            for (let user of allUsers) {
                try {
                    console.log(user);
                    await bot.sendMessage(user, await printCryptocurrenciesList(user, true), keyboard);
                }
                catch (error) {
                    console.log(`Error sending message to user ${user}: `, error);
                }
            }

        } catch (error) {
            console.error(error);
        }
    },
    null,
    false
);

job.start();