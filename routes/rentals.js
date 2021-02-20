const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const { Rental, validate } = require('../models/rental');
const Joi = require('joi');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();
const validateMiddleware = require('../middleware/validate');

Fawn.init(mongoose);

// Get all
router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort("-rentalStartDate");

    res.send(rentals);
});

// Create
router.post('/', auth, validateMiddleware(validate), async (req, res) => {
    const movie = await Movie.findById(req.body.movieId);
    if( movie.numberInStock <= 0 ) return res.send(`Movie '${movie.title}' with id '${req.body.movieId}' is currently out of stock!`)
    if( !movie ) return res.status(404).send(`Movie with id '${req.body.movieId}' not found!`);

    const customer = await Customer.findById( req.body.customerId );
    if( !customer ) return res.status(404).send( `Customer with id '${req.body.customerId}' not found!` );
    
    
    let rental = new Rental({
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        },
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold
        }
    });

    try{
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id}, {
                $inc: { numberInStock: -1 }
            })
            .run();

            return res.send(rental);
    }
    catch(err) {
        return res.status(500).send(err);
    }
});

// Update
router.put('/:id', auth, validateMiddleware(validate), async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send(`Genre with id '${req.body.genreId}' not found!`);

    const movie = await Rental.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    }, { new: true });
    if(!movie) return res.status(404).send(`Movie with id '${req.params.id}' not found!`)

    movie.save();

    res.send(movie);
});

router.delete('/:id', auth, async (req, res) => {
    try{
        const rental = await Rental.findByIdAndDelete(req.params.id);
        if(!rental) return res.status(404).send(`Rental with id '${req.params.id}' not found!`);
        res.send(rental);
    }
    catch(err) {
        console.error(err);
        res.status(404).send(`Rental with id '${req.params.id}' not found!`);
    }
});

// Get one
router.get('/:id', validateObjectId, async (req, res) => {
    try{
        const rental = await Rental.findById(req.params.id);
        if(!rental) return res.status(404).send(`Rental with id '${req.params.id}' not found!`);
    
        res.send(rental);
    }
    catch(err) {
        res.status(404).send(`Rental with id '${req.params.id}' not found!`);
    }
});

module.exports = router;