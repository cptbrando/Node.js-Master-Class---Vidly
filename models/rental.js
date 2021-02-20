const Joi = require('joi');
const mongoose = require('mongoose');
const { movieSchema } = require('./movie');
const { customerSchema } = require('./customer');
const moment = require('moment');

const rentalSchema = new mongoose.Schema({
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 255
            },
            dailyRentalRate: {
                type: Number,
                required: true,

            }
        }),
        required: true
    },
    customer: {
        type: new mongoose.Schema({
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
        }),
        required: true
    },
    rentalStartDate: {
        type: Date,
        default: Date.now()
    },
    rentalEndDate: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

rentalSchema.statics.lookup = function(customerId, movieId) {
    return this.findOne({
        'customer._id': customerId,
        'movie._id': movieId
    })
}
rentalSchema.methods.return = function() {
    this.rentalEndDate = new Date();

    const daysRented = moment().diff(this.rentalStartDate, 'days');
    this.rentalFee = daysRented * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental (rental){
    const schema = Joi.object({
        movieId: Joi
            .objectId()
            .required()
            .min(5)
            .max(50),

        customerId: Joi
            .objectId()
            .required()
            .min(5)
            .max(50)
    })

    return schema.validate(rental)
}

exports.Rental = Rental;
exports.rentalSchema = rentalSchema;
exports.validate = validateRental;