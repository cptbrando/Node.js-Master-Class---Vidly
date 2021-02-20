const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const validateMiddleware = require('../middleware/validate');

// Get all
router.get('/', async (req, res) => {
    const movies = await Movie.find().sort("title");

    res.send(movies);
});

// Create
router.post('/', auth, validateMiddleware(validate), async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send(`Genre with id '${req.body.genreId}' not found!`);

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    await movie.save();

    res.send(movie);
});

// Update
router.put('/:id', auth, validateMiddleware(validate), async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send(`Genre with id '${req.body.genreId}' not found!`);

    const movie = await Movie.findByIdAndUpdate(req.params.id, {
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
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if(!movie) return res.status(404).send(`Movie with id '${req.params.id}' not found!`);
        res.send(movie);
    }
    catch(err) {
        console.error(err);
        res.status(404).send(`Movie with id '${req.params.id}' not found!`);
    }
});

// Get one
router.get('/:id', validateObjectId, async (req, res) => {
    try{
        const movie = await Movie.findById(req.params.id);
        if(!movie) return res.status(404).send(`Movie with id '${req.params.id}' not found!`);
    
        res.send(movie);
    }
    catch(err) {
        res.status(404).send(`Movie with id '${req.params.id}' not found!`);
    }
});

module.exports = router;