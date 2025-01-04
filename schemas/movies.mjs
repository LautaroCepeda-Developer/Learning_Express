import z from 'zod';

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Title must be a string',
        required_error: 'Title is required',
    }),
    genre: z.array(
        z.enum([
            'Action',
            'Comedy',
            'Crime',
            'Drama',
            'Horror',
            'Adventure',
            'Fantasy',
            'Horror',
            'Thriller',
            'Sci-Fi',
            'Mystery',
            'Romance',
            'Animation',
            'Documentary',
            'Musical',
            'Western',
        ]),
        {
            required_error: 'Genre is required',
            invalid_type_error: 'Genre must be an array of enum Genre',
        }
    ),
    year: z
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1),
    director: z.string(),
    duration: z.number().int().positive(),
    poster: z.string().url({ message: 'Poster must be a valid URL' }),
    rate: z.number().min(0).max(10).default(5),
});

function validateMovie(object) {
    return movieSchema.safeParse(object);
}

function validatePartialMovie(object) {
    return movieSchema.partial().safeParse(object);
}

export { validateMovie, validatePartialMovie };
