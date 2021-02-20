const moment = require('moment');
const { User } = require('../../models/user');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const mongoose = require('mongoose');
const request = require('supertest');
const _ = require('lodash');
const { exceptions } = require('winston');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId; 
    let rental;
    let token;
    let movie;

    beforeEach( async () => {
        server = require('../../app');
         
        movieId = mongoose.Types.ObjectId();    
        customerId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            genre: { name: 'genre1' },
            numberInStock: 0,
            dailyRentalRate: 2
        }); 
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movie._id,
                title: movie.title,
                dailyRentalRate: movie.dailyRentalRate
            }
        });

        await rental.save()
    });

    afterEach( async () => {
        await Rental.deleteMany({});
        await Movie.deleteMany({});
    });

    // POST /api/returns {customerId, movieId}
    describe('POST /', () => {

        const exec = async () => {
            return await request(server)
                .post('/api/returns')
                .set('x-auth-token', token)
                .send({
                    customerId: customerId,
                    movieId: movieId
                });
        };

        // Return 401 if client is not logged in
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
    
            expect(res.status).toBe(401);
        });
        
        // Return 400 if customerId is not provided
        it('should return 400 if customerId is not provided', async () => {
            movieId = '';
            const res = await exec();
    
            expect(res.status).toBe(400);
        });

        // Return 400 if movieId is not provided
        it('should return 400 if movieId is not provided', async () => {
            customerId = '';
            const res = await exec();
    
            expect(res.status).toBe(400);
        });

        // Return 404 if no rental found for this customer/movie
        it('should return 404 if no rental found for this customer/movie', async () => {
            await Rental.deleteOne({});
            const res = await exec();

            expect(res.status).toBe(404);
        });

        // Return 400 if rental already processed
        it('should return 400 if rental already processed', async () => {
            rental.rentalEndDate = new Date();
            await rental.save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        // Return 200 if valid request
        it('should return 200 if valid request', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        // Set the return date
        it('should set the return date if the request is valid', async () => {
            const res = await exec();

            rental = await Rental.findById(rental._id);
            const diff = new Date() - rental.rentalEndDate;
            expect(diff).toBeLessThan( 10 * 1000 );
        });

        // Calculate the rental fee
        it('should calculate the rental fee if the request is valid', async () => {
            rental.rentalStartDate = moment().add(-7, 'days').toDate();
            await rental.save()
            const res = await exec();

            rentalInDb = await Rental.findById(rental._id);
            expect(rentalInDb.rentalFee).toBe( 14 );
        });

        // Increase the stock of the movie
        it('should increase the stock of the movie by 1 if the request is valid', async () => {
            const res = await exec();
            movieInDb = await Movie.findById(rental.movie._id);

            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
        });

        // Return the rental (object)
        it('should return the rental object in the body of the response if the request is valid', async () => {
            const res = await exec();
            rentalInDb = await Rental.findById(rental._id);

            expect(Object.keys(res.body))
                .toEqual(
                    expect.arrayContaining(
                        ['movie', 'rentalStartDate', 'rentalEndDate', 'rentalFee', 'customer']
                    )
                )
        });
    })

        
        
});