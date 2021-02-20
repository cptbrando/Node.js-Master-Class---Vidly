const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    isGold: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const Customer = mongoose.model( 'Customer',customerSchema );

function validateCustomer (customer){
    const schema = Joi.object({
        name: Joi.string()
                .required()
                .min(5)
                .max(50),

        isGold: Joi.boolean(),

        phone: Joi.number()
                .required()
                .min(5)
                .max(50)
    })

    return schema.validate(customer)
}

exports.Customer = Customer;
exports.customerSchema = customerSchema;
exports.validate = validateCustomer;