const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: '6gCI0jBicMCn8SqELeX0IN8uQnjOk5vL',
    formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports=geocoder;