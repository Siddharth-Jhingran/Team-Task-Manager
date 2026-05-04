const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async() =>{
try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("mongodb connected");
  }
  catch(error){
    console.log("Error connecting to Mongo  DB:"+ error);
    process.exit(1);
  }
}
module.exports = connectDB;