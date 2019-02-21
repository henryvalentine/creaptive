/**
 * Created by Jack V on 8/21/2017.
 */
let Country = '';
const init = (app, mongoose) =>
{
    Country = mongoose.model('Country');
    app.get('/getAllCountries', getAllCountries);
};

let feedback = {code: -1, message: 'Process failed. Please try again later', itemId : '', successCount: 0, failedModels: []};

const getAllCountries = (req, res) =>
{
    Country.find({}).exec((error, countries) =>
    {
        return res.json(countries);
    });
};

module.exports = init;