const mongoClient = require('./mongoConnection');

const dbName = 'crypto'
const collectionName = 'users'

async function createUserInDB(id, cryptocurrencies) {
    try {
        const user = mongoClient.db(dbName).collection(collectionName);
        const query = { chatId: id, symbols: cryptocurrencies, status: 'default' };
        const update = { $set: { chatId: id, symbols: cryptocurrencies } }
        const options = { upsert: true };

        await user.updateOne(query, update, options); // if chatId exists - update, if didn't exists - create document
        return;
    } catch (error) {
        console.error("Error of creating a user: ", error);
    }
}

async function getUserFromDB(id) {
    try {
        const users = mongoClient.db(dbName).collection(collectionName);
        let result = await users.findOne({ chatId: id });

        if (result === null) {
            console.log(result);
            return null;
        } else return result;
    } catch (error) {
        console.error("Error in getting a user : ", error);
    }
}

async function updateListOfCryptocurrenciesInDB(id, cryptocurrency, action) {
    try {
        const users = mongoClient.db(dbName).collection(collectionName);
        const updateMethod = action === 'add' ? { $push: { symbols: cryptocurrency } } : { $pull: { symbols: cryptocurrency } };
        await users.updateOne({ chatId: id }, updateMethod);
        return;
    } catch (error) {
        console.error("Error of pushing cryptocurrency : ", error);
    }
}

async function updateStatusInDB(id, newStatus) {
    try {
        const users = mongoClient.db(dbName).collection(collectionName);
        const query = { chatId: id };
        const update = { $set: { chatId: id, status: newStatus } };
        await users.updateOne(query, update); // if chatId exists - update, if didn't exists - create document
        return;
    } catch (error) {
        console.error("Error of update status : ", error);
    }
}

async function getAllUsersInDB() {
    try {
        const users = mongoClient.db(dbName).collection(collectionName);
        const allUsers = await users.find({}, { projection: { _id: 0, status: 0, symbols: 0 } }).toArray();
        const allUsersId = allUsers.map(user => user.chatId)
        return allUsersId;
    } catch (error) {
        console.error("Error getting users : ", error);
    }
}

module.exports = { getUserFromDB, updateListOfCryptocurrenciesInDB, createUserInDB, updateStatusInDB, getAllUsersInDB };