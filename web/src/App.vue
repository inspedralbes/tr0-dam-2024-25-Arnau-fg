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

  goToPreguntes();
}

const goToEdit = async (id) => {
  interactor.value = id;
  preguntaAEditar.value = await getQuestionById(id);
  respostes.value = await getAnswers();
  changePage("editar")
  console.log("editant pregunta ", id);
}

const goToCreate = async () => {
  respostes.value = await getAnswers();
  changePage("afegir")
}

const modalBorrar = (id) => {
  if (confirm(`Segur que vols borrar la pregunta ${id}?`)) {
    deletePregunta(id);
  } else {
    console.log("no borrem pregunta ", id);
  }
}
const savePregunta = async () => {
  preguntaAEditar.value.respostes.forEach((modificar) => {
    modificar.imatge = respostes.value.find((correcta) => correcta.resposta === modificar.resposta).imatge;
  })

  console.log(preguntaAEditar.value);
  let response = await editQuestion(preguntaAEditar.value.id, preguntaAEditar.value);

  if (response.updated) {
    console.log("Pregunta actualitzada correctament");
  } else {
    console.log("Error al actualitzar la pregunta");
  }

  goToPreguntes();
}

const crearPregunta = async () => {
  preguntaACrear.respostes.forEach((modificar) => {
    modificar.imatge = respostes.value.find((correcta) => correcta.resposta === modificar.resposta).imatge;
  })

  console.log(preguntaACrear);
  let response = await createQuestion(preguntaACrear);

  if (response.created) {
    console.log("Pregunta creada correctament");
  } else {
    console.log("Error al crear la pregunta");
  }

  goToPreguntes();
}

const deletePregunta = async (id) => {
  let response = await deleteQuestion(id);

  if (response.deleted) {
    console.log("Pregunta eliminada correctament");
  } else {
    console.log("Error al eliminar la pregunta");
  }

  goToPreguntes();
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

  console.log(preguntes.value)
})

</script>

<template>
  <button @click="goToCreate">Afegir</button>
  <button @click="goToPreguntes()">Mostrar preguntes</button>
  <div class="container__preguntes" v-if="page == 'preguntes'">
    <h1>Preguntes</h1>
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
          <button @click="goToEdit(pregunta.id)">Editar</button>
        </div>
        <div class="opcions__eliminar">
          <button @click="modalBorrar(pregunta.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="page == 'editar'">
    <h1>Editar</h1>
    <div v-if="preguntaAEditar">
      <input type="text" v-model="preguntaAEditar.pregunta">
      <div v-for="resposta in preguntaAEditar.respostes" :key="resposta.id">
        <select v-model="resposta.resposta">
          <option :value="resposta.resposta">{{ resposta.resposta }}</option>
          <option v-for="opcio in respostes.filter(opcio => opcio.resposta != resposta.resposta)" :key="opcio.id"
            :value="opcio.resposta">
            {{ opcio.resposta }}
          </option>
        </select>
        <input type="radio" :value="resposta.id" :name="preguntaAEditar.id" v-model="correctAnswerEditar">
      </div>
      <button @click="savePregunta()">Guardar</button>
    </div>
  </div>
  <div v-else-if="page == 'afegir'">
    <h1>Crear</h1>
    <input type="text" v-model="preguntaACrear.pregunta">
    <div v-for="resposta in preguntaACrear.respostes" :key="resposta.id">
      <select v-model="resposta.resposta">
        <option disabled value="">Escull una resposta</option>
        <option v-for="opcio in respostes" :key="opcio.id"
          :value="opcio.resposta">
          {{ opcio.resposta }}
        </option>
      </select>
      <input type="radio" :value="resposta.id" :name="preguntaACrear.id" v-model="correctAnswerCrear">
      
    </div>
    <button @click="crearPregunta()">Guardar</button>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.container__preguntes {
  display: grid;
  grid-template-columns: 1fr;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
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
}

.pregunta__text {
  display: flex;
  justify-content: center;
  align-items: center;
}

.respostes__resposta {
  display: flex;
  justify-content: center;
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
</style>