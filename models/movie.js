const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number,
        min: 0,
        max: 255,
        required: true
    },
    dailyRentalRate: {
        type: Number,
        min: 0,
        max: 255,
        required: true
    }
  });

const Movie = mongoose.model( 'Movie', movieSchema );

  function validateMovie(movie) {
    const schema = Joi.object({
        title: Joi
            .string()
            .min(5)
            .max(255)
            .required(),

        genreId: Joi
            .objectId()
            .required(),

        numberInStock: Joi
            .number()
            .min(0)
            .max(255)
            .required(),

        dailyRentalRate: Joi
            .number()
            .min(0)
            .max(255)
            .required()
    });

    return schema.validate(movie);
  }
  
  exports.Movie = Movie;
  exports.movieSchema = movieSchema;
  exports.validate = validateMovie;