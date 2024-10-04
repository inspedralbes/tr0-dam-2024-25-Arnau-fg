const express = require('express');
let file = require("./JSON/preguntes.json");
const respostesFile = require("./JSON/respostes.json");
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { spawn, exec } = require('child_process');
const app = express()
const port = 3000
let playerStates = [];


app.use(express.json()); //support regular json
app.use(cors());

// inici joc

app.post('/', (req, res) => {
   let gameQuestions = file.preguntes;
   let formattedGameQuestions = [];
   const numOfQuestions = req.body.numOfQuestions || 10;

   const sessionToken = getSessionToken(req.body.token);

   randomizeArray(gameQuestions);

   const slicedGameQuestions = gameQuestions.slice(0, numOfQuestions);

   slicedGameQuestions.forEach(pregunta => {
      formattedGameQuestions.push(questionFormatter(pregunta));
   });

   playerStates[sessionToken] = slicedGameQuestions;

   // console.log(playerStates);

   res.send({
      token: sessionToken,
      formattedGameQuestions
   })
});

// respostes

app.post('/finalitza', (req, res) => {
   const currentDate = new Date();
   const directoryName = currentDate.toISOString().split('T')[0];
   const directoryAnswers = path.join(__dirname, "answers");
   const directoryPath = path.join(directoryAnswers, directoryName);

   const sessionToken = req.body.token;

   if (!playerStates[sessionToken]) {
      res.send({
         valid: false,
      });
      return;
   }

   if (!req.body.answers) {
      res.send({
         valid: false,
      });
      return;
   }

   const playerAnswers = req.body.answers;

   let encertades = 0;
   const totals = playerStates[sessionToken].length;

   let estadistiquesPartida = [];

   playerAnswers.forEach((answer, index) => {

      let answered = {
         id: playerStates[sessionToken][index].id,
         acertat: false
      }

      const respostaCorrecta = playerStates[sessionToken][index].respostes.find(resposta => {
         return resposta.correcta == true;
      });

      if (answer == respostaCorrecta.id) {
         answered.acertat = true;
         encertades++;
      }

      estadistiquesPartida.push(answered);
   });

   let playerScore = {
      encertades,
      totals
   }



   if (!fs.existsSync("answers")) {
      fs.mkdirSync("answers");
   }

   if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
   }

   let statsParsed

   if (fs.existsSync(directoryPath + "/stats.json")) {
      console.log("hola");
      const stats = fs.readFileSync(directoryPath + "/stats.json");
      statsParsed = JSON.parse(stats);
   } else {
      statsParsed = { playerScore, individualStats: [] }

      file.preguntes.forEach((pregunta) => {
         crearPreguntaStats(pregunta.id, statsParsed);
      })
   }

   estadistiquesPartida.forEach((estadistica) => {
      const index = statsParsed.individualStats.findIndex((pregunta) => {
         return pregunta.id == estadistica.id;
      });

      if (index == -1) {
         crearPreguntaStats(estadistica.id, statsParsed);

         statsParsed.individualStats[statsParsed.individualStats.length - 1].nJugades++;

         if (estadistica.acertat) {
            statsParsed.individualStats[statsParsed.individualStats.length - 1].nEncertades++;
         }
      } else {
         statsParsed.individualStats[index].nJugades++;

         if (estadistica.acertat) {
            statsParsed.individualStats[index].nEncertades++;
         }
      }


   });

   const filesInDirectory = fs.readdirSync(directoryPath);
   const fileName = `stats.json`;
   const filePath = path.join(directoryPath, fileName);

   fs.writeFileSync(filePath, JSON.stringify(statsParsed));

   res.send({
      valid: true,
      playerScore
   });
});



// estadistiques

app.get('/estadistiques', (req, res) => {
   const ls = spawn("docker", ["run", "-rm", "-i", "python:3.13.0rc3-slim-bookworm", "python3", "./getWinrateStats.py"]);

   let objToSend = {
      correct: false,
      response: ""
   };

   ls.stdout.on("data", (data) => {

      console.log(data.toString());

      objToSend.correct = true;
      objToSend.response = data.toString();

   });

   ls.on('error', (error) => {
      console.log(`Error: ${error.message}`);
   });

   ls.on("close", (code) => {
      console.log(`Getting stats exited with code ${code}`);
      // res.send(JSON.stringify(objToSend));
      res.send("holiwiris")
   });
});

// ------------------- CRUD -------------------

// Create
app.post('/preguntes', (req, res) => {

   let newQuestion = {
      id: file.preguntes[file.preguntes.length - 1].id + 1,
      pregunta: req.body.pregunta,
      respostes: req.body.respostes
   }

   file.preguntes.push(newQuestion);

   fs.writeFileSync('./JSON/preguntes.json', JSON.stringify(file));

   res.send({
      created: true,
      error: null
   });
});

// Read
app.get('/preguntes/:id', (req, res) => {
   let objToSend = {};

   if (req.params.id) {
      let idToFind = req.params.id;

      let question = file.preguntes.find(pregunta => pregunta.id == idToFind);

      if (question) {
         objToSend = {
            foundQuestion: true,
            question: question
         }
      } else {
         objToSend = {
            foundQuestion: false,
            question: {}
         }
      }
   }

   res.send(JSON.stringify(objToSend));


});

// Read All
app.get('/preguntes', (req, res) => {
   res.send(file.preguntes)
});

// Read All Answers
app.get('/respostes', (req, res) => {
   res.send(respostesFile.respostes)
});

// Update
app.put('/preguntes/:id', (req, res) => {

   let response = {};

   let idToFind = req.params.id;

   let question = file.preguntes.find(pregunta => pregunta.id == idToFind);

   if (question) {
      question.pregunta = req.body.pregunta;
      question.respostes = req.body.respostes;
      response = {
         updated: true,
         error: null
      }
   } else {
      response = {
         updated: false,
         error: "Question not found"
      }
   }

   fs.writeFileSync('./JSON/preguntes.json', JSON.stringify(file));

   res.send(response);
});

// Delete
app.delete('/preguntes/:id', (req, res) => {

   let response = {};

   let idToFind = req.params.id;

   let questionIndex = file.preguntes.findIndex(pregunta => pregunta.id == idToFind);

   if (questionIndex != -1) {
      file.preguntes.splice(questionIndex, 1);
      response = {
         deleted: true,
         error: null
      }
   } else {
      response = {
         deleted: false,
         error: "Question not found"
      }
   }

   fs.writeFileSync('./JSON/preguntes.json', JSON.stringify(file));

   res.send(response);
});


function getSessionToken(token) {
   if (!token) {
      token = uuidv4();
   }

   return token;
}

function questionFormatter(question) {
   let formattedQuestion, formattedAnswers;

   randomizeArray(question.respostes);

   formattedAnswers = formatAnswers(question.respostes);

   formattedQuestion = {
      id: question.id,
      pregunta: question.pregunta,
      respostes: formattedAnswers
   }

   return formattedQuestion;
}

function randomizeArray(respostes) {

   let currentIndex = respostes.length;

   // While there remain elements to shuffle...
   while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [respostes[currentIndex], respostes[randomIndex]] = [
         respostes[randomIndex], respostes[currentIndex]];
   }
}

function formatAnswers(answers) {
   let formattedAnswers = [];

   formattedAnswers = answers.map(({ id, resposta, imatge }) => {
      return {
         id,
         resposta,
         imatge
      }
   })

   return formattedAnswers;

}

function crearPreguntaStats(id, statsParsed) {
   const stats = {
      id,
      nJugades: 0,
      nEncertades: 0
   }

   statsParsed.individualStats.push(stats);
}




app.listen(port, () => {

   console.log(`Example app listening on port ${port}`)
})