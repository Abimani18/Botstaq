require("dotenv").config();

const Mongodb_URL = process.env.Mongodb_URL;
const Port = process.env.Port;
const Secret_key = process.env.Secret_key;

module.exports = { Mongodb_URL, Port, Secret_key };
