
const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);

    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//get movieName

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT movie_name FROM movie`;

  const movieNameArray = await db.all(getMovieQuery);

  response.send(
    movieNameArray.map((eachMovieName) => ({
      movieName: eachMovieName.movie_name,
    }))
  );
});

//add movieName

app.post("/movies/", async (request, response) => {
  const addMovie = request.body;

  const { directorId, movieName, leadActor } = addMovie;

  const postMovieQuery = `

  INSERT INTO

   movie (director_id,movie_name,lead_actor)

  VALUES

   (

    ${directorId},

     '${movieName}',

     '${leadActor}'

   );`;

  const dbResponse = await db.run(postMovieQuery);

  const movieId = dbResponse.lastID;

  response.send("Movie Successfully Added");

  //response.send({ movieId: movieId });
});

//get movieId in movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId}`;

  const movieArray = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieArray));
});

//update movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const updateMovie = request.body;

  const { directorId, movieName, leadActor } = updateMovie;

  const updateMovieQuery = `

  UPDATE 

  movie

  SET

  director_id = ${directorId},

  movie_name = '${movieName}',

  lead_actor = '${leadActor}';

  WHERE 

   movie_id = ${movieId}`;

  const update = await db.run(updateMovieQuery);

  response.send("Movie Details Updated");

  //response.send(update);
});

//DELETE movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;

  const movieArray = await db.run(deleteMovieQuery);

  response.send("Movie Removed");
});

//get director

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director`;

  const directorDetails = await db.all(getDirectorQuery);

  response.send(
    directorDetails.map((eachDirector) =>
      convertDirectorDbToResponseObject(eachDirector)
    )
  );
});

//get director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMovieQuery = `
  SELECT 
    movie_name
FROM 
    movie
WHERE 
    director_id = '${directorId}';`;

  const movieArray = await db.all(getMovieQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;





