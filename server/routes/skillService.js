/**
 * Created by Jack V on 9/22/2017.
 */

let Skill = '';
const init = (app, mongoose) =>
{
    Skill = mongoose.model('Skill');
    app.post('/addSkill', addSkill);
    app.post('/editSkill', editSkill);
    app.post('/deleteSkill', deleteSkill);
    app.post('/getSkill', getSkill);
    app.get('/searchSkill', searchSkill);
    app.get('/getSkills', getSkills);
    app.get('/getAllSkills', getAllSkills);
};

function addSkill(req, res)
{
    let skill = req.skill;
    if(skill === undefined || skill === null || skill.name.length < 1)
    {
        return res.json({code: -1, message: 'Please provide skill'});
    }
    else
    {
        Skill.findOne({name: skill.name}, (err, existingSkill) =>
        {
            if (!existingSkill)
            {
                const newSkill = new Skill(skill);
                return newSkill.save((err, savedSkill) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, skillId: savedSkill.id, message: 'Skill was successfully added'});
                    }
                });

            }
            else {
                return res.json({code: 5, skillId: existingSkill.id, message: 'Request was successfully executed'});
            }
        });
    }

}

function editSkill(req, res)
{
    let skill = req.skill;
    if(skill === undefined || skill === null || skill.name.length < 1 || skill.id.length < 1)
    {
        return res.json({code: -1, message: 'Please provide skill'});
    }
    else
    {
        Skill.findOne({id: skill.id}, (err, existingSkill) =>
        {
            if (!existingSkill)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingSkill.name = skill.name;
                return existingSkill.save((err, savedSkill) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, skillId: existingSkill.id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function deleteSkill(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        Skill.remove({id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, skillId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getSkill(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        Skill.findOne({id: id}, (err, skill) =>
        {
            if (!skill)
            {
                return res.json({code: -1, message: 'Skill was not found'});
            }
            else
            {
                return res.json({code: 5, skill: skill});
            }
        });
    }

}

function searchSkill(req, res)
{
    let query = req.query;
    if(query === undefined || query === null || query.length < 1)
    {
        return res.json({code: -1, message: 'Invalid search criteris!'});
    }
    else
    {
        Skill.findOne({ name: {"$regex": req.body.searchText, "$options": "i" }}, (err, skills) =>
        {
            if (!skills)
            {
                return res.json({code: -1, message: 'Skill was not found'});
            }
            else
            {
                return res.json({code: 5, skills: skills});
            }
        });
    }

}

function getSkills(req, res)
{
    let find = req.body.searchText && req.body.searchText.length > 0? { name: { "$regex": req.body.searchText, "$options": "i" } } : {};
    return res.json({totalItems: Skill.find(find).count(), items: Skill.find(find).sort({[req.body.sortField]: req.body.sortOrder}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage)});
}

const getAllSkills = (req, res) =>
{
    Skill.find({}).exec((error, skills) =>
    {
        return res.json(skills);
    });
};

module.exports = init;