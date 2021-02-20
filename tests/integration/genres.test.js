const mongoose = require('mongoose');
const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../app');
    });
    afterEach( async () => {
        await Genre.deleteMany({});
    })

    // describe('GET /', () => {



    //     it('should return all genres', async () => {
    //         await Genre.insertMany([
    //             { name: 'genre1'},
    //             { name: 'genre2'}
    //         ]);

    //         const res = await request(server).get('/api/genres');

    //         expect(res.status).toBe(200);
    //         expect(res.body.length).toBe(2);
    //         expect(res.body.some( (g => g.name === 'genre1'))).toBeTruthy();
    //         expect(res.body.some( (g => g.name === 'genre2'))).toBeTruthy();
    //     });
    // });

    describe('GET /:id', () => {
        it('should return 404 when genre id is not valid', async () => {
            const res = await request(server).get('/api/genres/1');
            expect(res.status).toBe(404);
        });

        it('should return 404 when genre id is not found', async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/genres/${genreId}`);
            expect(res.status).toBe(404);
        });

        it('should return a genre when passed a proper id', async () => {
            const genre = new Genre({ name: 'genre1'});
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });
    });

    describe('POST /', () => {

        // Define the happy path, and then in each test, we change
        // one parameter that clearly aligns with the name of the
        // test.
        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'gener1';
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            name = '1234';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {
            await exec();

            const genre = await Genre.find({ name: name });
            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        });
    });

    describe('PUT /:id', () => {
        let token;
        let genreId;
        let genreObj;

        const exec = async () => {
            return await request(server)
                .put(`/api/genres/${genreId}`)
                .set('x-auth-token', token)
                .send(genreObj);
        }

        beforeEach( async () => {
            token = new User().generateAuthToken();
            const genre = new Genre({ name: 'genre1'});
            await genre.save();

            genreId = genre._id;
            genreObj = { name: 'genre2' };
        })

        afterEach( async () => {
            await Genre.remove({});
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 when genre id is not valid', async () => {
            genreId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 when genre id is not found', async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 400 when the updated information is missing the name', async () => {
            genreObj = {};
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 when the passed in name is less than 5 characters long', async () => {
            genreObj = { name: '1234' };
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 when the passed in name is more than 50 characters long', async () => {
            const name = new Array(52).join('a');
            genreObj = { name: name };
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return a genre when passed a proper id and update object with a name in the body', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genreObj.name);
        });

        
    });

    describe('DELETE /', () => {
        let token;
        let genreId;

        beforeEach( async () => {
            token = new User({ isAdmin: true }).generateAuthToken();
            const genre = new Genre({ name: 'genre1'});
            await genre.save();

            genreId = genre._id;
        })

        afterEach( async () => {
            await Genre.remove({});
        })

        const exec = async () => {
            return await request(server)
                .delete(`/api/genres/${genreId}`)
                .set('x-auth-token', token)
                .send({ name: 'genre1' });
        }

        it('should return 404 if a genre with the passed id is not found', async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if an invalid id is passed', async () => {
            genreId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 403 if user is not admin', async() => {
            token = new User({ isAdmin: false }).generateAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 200 if the genre was found and deleted', async() => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should return a genre object if the genre was found and deleted', async() => {
            const res = await exec();

            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });
});