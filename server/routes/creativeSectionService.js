/**
 * Created by Jack V on 9/22/2017.
 */

let CreativeSection = '';
const init = (app, mongoose) =>
{
    CreativeSection = mongoose.model('CreativeSection');
    app.post('/editCreativeSection', editCreativeSection);
    app.post('/getCreativeSection', getCreativeSection);
    app.get('/getAllCreativeSections', getAllCreativeSections);
};

function editCreativeSection(req, res)
{
    let creativeSection = req.creativeSection;
    if(creativeSection === undefined || creativeSection === null || creativeSection.name.length < 1 || creativeSection.id.length < 1)
    {
        return res.json({code: -1, message: 'Please provide creative Section'});
    }
    else
    {
        CreativeSection.findOne({_id: creativeSection.id}, (err, existingCreativeSection) =>
        {
            if (!existingCreativeSection)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingCreativeSection.name = creativeSection.name;
                return existingCreativeSection.save((err, savedCreativeSection) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeSectionId: savedCreativeSection.id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function getCreativeSection(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        CreativeSection.findOne({_id: id}, (err, creativeSection) =>
        {
            if (!creativeSection)
            {
                return res.json({code: -1, message: 'Creative Section was not found'});
            }
            else
            {
                return res.json({code: 5, creativeSection: creativeSection});
            }
        });
    }

}

const getAllCreativeSections = (req, res) =>
{
    CreativeSection.find({}).exec((error, creativeSections) =>
    {
        return res.json(creativeSections);
    });
};

module.exports = init;