const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true, useUnifiedTopology: true}, 
function(error){
    if(error) {
        throw `MongoDB: ${error}`;
    }else {
        console.log('Conectado a MongoDB');
    }
})

mongoose.set('useFindAndModify', false);

module.exports = mongoose;

