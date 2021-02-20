const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        min: 5,
        max: 1024,
        required: true
    },
    isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({
        _id: this._id,
        isAdmin: this.isAdmin
    }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model( 'User', userSchema );

  function validateUser(user) {
    const schema = Joi.object({
        name: Joi
            .string()
            .min(5)
            .max(50)
            .required(),

        email: Joi
            .string()
            .min(5)
            .max(255)
            .email()
            .required(),

        password: Joi
            .string()
            .min(5)
            .max(255)
            .required()
    });

    return schema.validate(user);
  }
  
  exports.User = User;
  exports.validate = validateUser;