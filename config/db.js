const mongooose = require('mongoose');

const connectDB = async() => {
    const conn = await mongooose.connect('mongodb+srv://mohit2000:mohit2000@test.wc3kw.mongodb.net/test?retryWrites=true&w=majority', {
        useNewUrlParser:true,
        useUnifiedTopology:true
    });

   console.log(`Mongo db connected to ${conn.connection.host}`);
};

module.exports = connectDB;