import express from 'express';
import fs from 'node:fs';
import crypto from 'node:crypto';
import z from 'zod';
import cors from 'cors';
import { validateMovie, validatePartialMovie } from './schemas/movies.mjs';

// Metodos normales: GET/HEAD/POST

// Metodos complejos: PUT/PATCH/DELETE

// CORS PRE-FLIGHT
// OPTIONS

// Synchronous reading of JSON file
const movies = JSON.parse(fs.readFileSync('./movies.json'));

const PORT = process.env.PORT || 6969;

const app = express();
app.use(express.json());

const ACCEPTED_ORIGINS = ['http://localhost:8080', 'http://localhost:1234'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (ACCEPTED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            if (!origin) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
    })
);

app.disable('x-powered-by');

// Get all movies
app.get('/movies', (req, res) => {
    const origin = req.header('origin');

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    const { genre } = req.query;
    if (genre) {
        const filteredMovies = movies.filter((movie) =>
            movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
        );
        return res.json(filteredMovies);
    }
    res.json(movies);
});

// Get a specific movie by id
app.get('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movie = movies.find((movie) => movie.id === id);
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).json({ message: 'Movie not found' });
    }
});

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body);

    // 422 Unprocessable Entity
    if (!result.success) {
        return res
            .status(422)
            .json({ error: JSON.parse(result.error.message) });
    }

    // WIP database
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data,
        createdAt: new Date().toISOString(),
    };

    movies.push(newMovie);

    res.status(201).json(newMovie);
});

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin');

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    const { id } = req.params;

    // Trying to find the movie
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    // Movie not found
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    movies.splice(movieIndex, 1);

    return res.json({ message: 'Movie deleted' });
});

app.patch('/movies/:id', (req, res) => {
    const { id } = req.params;

    // Validations
    const result = validatePartialMovie(req.body);
    // 422 Unprocessable Entity
    if (!result.success) {
        return res
            .status(422)
            .json({ error: JSON.parse(result.error.message) });
    }

    // Trying to find the movie
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    // Movie not found
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data,
    };

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
});

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin');

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
        res.status(200);
        res.send();
    }

    res.status(400);
    res.send();
});

// 404 on invalid route
app.use((req, res) => {
    res.status(404).send('Not Found');
});
app.listen(PORT, () => {
    console.log(`Server is running\nhttp://localhost:${PORT}`);
});
