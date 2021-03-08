const mongoose = require('mongoose');

mongoose.connect('MONGODB', {useNewUrlParser: true}, 
function(error){
    if(error) {
        throw error;
    }else {
        console.log('Conectado a MongoDB');
    }
})

mongoose.set('useFindAndModify', false);

module.exports = mongoose;

