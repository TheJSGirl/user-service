const Joi = require('joi')

module.exports = {
    signup: {
        body: {
            email: Joi.string().email().required(),
            name: Joi.string(),
            mobile: Joi.string().min(9).max(10),
            username: Joi.string().min(4).required(),
            password: Joi.string().min(4).required()
        }
    },
    update: {
        body: {
            name: Joi.string(),
            email: Joi.string().email(),
            mobile: Joi.string().min(9).max(10),
            username: Joi.string().min(4),
        }
    },
    availability: {
        body: {
            username: Joi.string().min(4).required(),
        }
    },
    signin: {
        body: {
            username: Joi.string().min(4).required(),
            password: Joi.string().min(4).required()
        }
    }
}

