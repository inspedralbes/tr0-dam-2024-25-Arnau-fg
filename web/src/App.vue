<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { createQuestion, getQuestions, getQuestionById, getAnswers, editQuestion, deleteQuestion } from './communicationManager'

const preguntes = ref([]);
const preguntaAEditar = ref(null);
const page = ref('preguntes');
const interactor = ref(null);
const correctAnswerEditar = ref(null);
const correctAnswerCrear = ref(null);
const respostes = ref([]);
const preguntaACrear = reactive({
  pregunta: '',
  respostes: [
    { id: 0, resposta: '', correcta: false },
    { id: 1, resposta: '', correcta: false },
    { id: 2, resposta: '', correcta: false },
    { id: 3, resposta: '', correcta: false }
  ]  
})





const changePage = async (newPage) => {
  page.value = newPage;
}
const goToPreguntes = async () => {
  preguntes.value = await getQuestions();

  changePage("preguntes");
}

const goToEdit = async (id) => {
  interactor.value = id;
  preguntaAEditar.value = await getQuestionById(id);
  respostes.value = await getAnswers();
  changePage("editar")
  // console.log("editant pregunta ", id);
}

const goToCreate = async () => {
  respostes.value = await getAnswers();
  changePage("afegir")
}

const modalBorrar = (id) => {
  if (confirm(`Segur que vols borrar la pregunta ${id}?`)) {
    deletePregunta(id);
  } 
  // else {
  //   console.log("no borrem pregunta ", id);
  // }
}
const savePregunta = async () => {
  preguntaAEditar.value.respostes.forEach((modificar) => {
    modificar.imatge = respostes.value.find((correcta) => correcta.resposta === modificar.resposta).imatge;
  })

  // console.log(preguntaAEditar.value);
  let response = await editQuestion(preguntaAEditar.value.id, preguntaAEditar.value);

  // if (response.updated) {
  //   console.log("Pregunta actualitzada correctament");
  // } else {
  //   console.log("Error al actualitzar la pregunta");
  // }

  goToPreguntes();
}

const crearPregunta = async () => {
  preguntaACrear.respostes.forEach((modificar) => {
    modificar.imatge = respostes.value.find((correcta) => correcta.resposta === modificar.resposta).imatge;
  })

  // console.log(preguntaACrear);
  let response = await createQuestion(preguntaACrear);

  // if (response.created) {
  //   console.log("Pregunta creada correctament");
  // } else {
  //   console.log("Error al crear la pregunta");
  // }

  resetCrear();

  goToPreguntes();
}

const deletePregunta = async (id) => {
  let response = await deleteQuestion(id);

  // if (response.deleted) {
  //   console.log("Pregunta eliminada correctament");
  // } else {
  //   console.log("Error al eliminar la pregunta");
  // }

  goToPreguntes();
}

const resetCrear = () => {
  preguntaACrear.pregunta = '';
  preguntaACrear.respostes.forEach((resposta) => {
    resposta.resposta = '';
    resposta.correcta = false;
  })
}

watch(correctAnswerEditar, (newValue) => {
  preguntaAEditar.value.respostes.forEach((resposta) => {
    resposta.correcta = resposta.id === newValue;
  })
})

watch(correctAnswerCrear, (newValue) => {
  preguntaACrear.respostes.forEach((resposta) => {
    resposta.correcta = resposta.id === newValue;
  })
})

onMounted(async () => {
  preguntes.value = await getQuestions();

  // console.log(preguntes.value)
})

</script>

<template>
  <div class="buttonContainer">
    <button class="buttonContainer__button button button__create" @click="goToCreate">Afegir pregunta</button>
    <button class="buttonContainer__button button button__preguntes" @click="goToPreguntes">Llistar preguntes</button>
  </div>
  
  <div class="container__preguntes" v-if="page == 'preguntes'">
    <h1 class="title">Preguntes</h1>
    <div class="preguntes__pregunta pregunta__explicacio">
      <div class="pregunta__id">
        Id
      </div>
      <div class="pregunta__text">
        Pregunta
      </div>
      <div class="pregunta__respostes">
        <div  class="respostes__resposta respostes__resposta__correcte ">
          Correcta
        </div>
        <div  class="respostes__resposta  respostes__resposta__incorrecte">
          Incorrecta
        </div>
        <div  class="respostes__resposta  respostes__resposta__incorrecte">
          Incorrecta
        </div>
        <div  class="respostes__resposta  respostes__resposta__incorrecte">
          Incorrecta
        </div>
      </div>
  
      <div class="pregunta__opcions">
        <div class="opcions__editar">
          <button class="button button__editar">Editar</button>
        </div>
        <div class="opcions__eliminar">
          <button class="button">Eliminar</button>
        </div>
      </div>
    </div>
    <div v-for="pregunta in preguntes" :key="pregunta.id" class="preguntes__pregunta">
      <div class="pregunta__id">
        {{ pregunta.id }}
      </div>
      <div class="pregunta__text">
        {{ pregunta.pregunta }}
      </div>
      <div class="pregunta__respostes">
        <div v-for="respAct in pregunta.respostes" :key="respAct.id" class="respostes__resposta"
          :class="respAct.correcta ? 'respostes__resposta__correcte' : 'respostes__resposta__incorrecte'">
          {{ respAct.resposta }}
        </div>
      </div>
      <div class="pregunta__opcions">
        <div class="opcions__editar">
          <button class="button button__editar" @click="goToEdit(pregunta.id)">Editar</button>
        </div>
        <div class="opcions__eliminar">
          <button class="button" @click="modalBorrar(pregunta.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="page == 'editar'">
    <h1 class="title">Editar</h1>
    <div class="editar__container container" v-if="preguntaAEditar">
      <textarea v-model="preguntaAEditar.pregunta" rows="4" cols="50" placeholder="Escriu aquí la pregunta"></textarea>
      <div class="resposta__select" v-for="resposta in preguntaAEditar.respostes" :key="resposta.id">
        <select v-model="resposta.resposta">
          <option :value="resposta.resposta">{{ resposta.resposta }}</option>
          <option v-for="opcio in respostes.filter(opcio => opcio.resposta != resposta.resposta)" :key="opcio.id"
            :value="opcio.resposta">
            {{ opcio.resposta }}
          </option>
        </select>
        <input type="radio" :value="resposta.id" :name="preguntaAEditar.id" v-model="correctAnswerEditar">
      </div>
      <div>
        <button class="button" @click="savePregunta()">Guardar</button>
      </div>
    </div>
  </div>
  <div v-else-if="page == 'afegir'">
    <h1 class="title">Crear</h1>
    <div class="crear__container container">
      <textarea v-model="preguntaACrear.pregunta" rows="4" cols="50" placeholder="Escriu aquí la pregunta"></textarea>
      <div class="resposta__select" v-for="resposta in preguntaACrear.respostes" :key="resposta.id">
      <select v-model="resposta.resposta">
        <option disabled value="">Escull una resposta</option>
        <option v-for="opcio in respostes" :key="opcio.id"
          :value="opcio.resposta">
          {{ opcio.resposta }}
        </option>
      </select>
      <input type="radio" :value="resposta.id" :name="preguntaACrear.id" v-model="correctAnswerCrear">
      
    </div>
    <div>
      <button class="button" @click="crearPregunta()">Guardar</button>
    </div>
    </div>
    

    
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

button {
  all: unset;
}

.buttonContainer {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.button {
  background-color: #ff8583;
  color: black;
  padding: 10px;
  border-radius: 5px;
  margin: 7px;
  cursor: pointer;
  font-size: 1.1em;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.button__create {
  background-color: #bafd87;
}
.button__preguntes {
  background-color: #79ffff;
}

.button__editar {
  background-color: #fcf96d;
}

.container__preguntes {
  display: grid;
  grid-template-columns: 1fr;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}

.pregunta__explicacio {
  background-color: beige;
}

.preguntes__pregunta {
  display: grid;
  grid-template-columns: 1fr 5fr 1fr 1fr;
  border: 1px solid black;
  border-radius: 5px;
  margin: 10px;
}

.pregunta__id {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4em;
}

.pregunta__text {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1em;
}

.pregunta__respostes {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  font-size: 1.1em;
}

.respostes__resposta {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.respostes__resposta__correcte {
  background-color: #cee3be;
}

.respostes__resposta__incorrecte {
  background-color: #f79c9b;
}

.pregunta__opcions {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;
}

.title{
  text-align: center;
  font-size: 2em;
  margin: 20px;
}

textarea {
  margin: 20px;
  max-width: 30vw;
  font-family: Arial, sans-serif;
  font-size: 1.1em;
}
.resposta__select{
  min-width: 350px;
}
.resposta__select select {
  appearance: none;
  width: 400px;
  font-size: 1.15rem;
  padding: 0.675em 6em 0.675em 1em;
  background-color: #fff;
  border: 1px solid #caced1;
  border-radius: 0.25rem;
  color: #000;
  cursor: pointer;
  margin: 20px;
}
</style>