<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { getQuestions, getQuestionById, getAnswers } from './communicationManager'

const preguntes = ref([]);
const preguntaAEditar = ref(null);
const page = ref('preguntes');
const interactor = ref(null);
const correctAnswer = ref(null);
const respostes = ref([]);






const changePage = (newPage) => {
  page.value = newPage;
}

const goToEdit = async (id) => {
  interactor.value = id;
  preguntaAEditar.value = await getQuestionById(id);
  respostes.value = await getAnswers();
  page.value = 'editar';
  console.log("editant pregunta ", id);
}

const modalBorrar = (id) => {
  if (confirm(`Segur que vols borrar la pregunta ${id}?`)) {
    console.log("borrant pregunta ", id);
  } else {
    console.log("no borrem pregunta ", id);
  }
}

const respostesFiltrades = computed(() => {
  return respostes.value.filter((resposta) => {
    return 
  })
})

watch(correctAnswer, (newValue) => {
  preguntaAEditar.value.respostes.forEach((resposta) => {
    resposta.correcta = resposta.id === newValue;
  })
})

onMounted(async () => {
  preguntes.value = await getQuestions();

  console.log(preguntes.value)
})

</script>

<template>
  <button @click="changePage('afegir')">Afegir</button>
  <button @click="changePage('preguntes')">Mostrar preguntes</button>
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
          <option v-for="opcio in respostes.filter(opcio => opcio.resposta != resposta.resposta)" :key="opcio.id" :value="opcio.resposta">
              {{ opcio.resposta }}
          </option>
        </select>
        <input type="radio" :value="resposta.id" :name="preguntaAEditar.id" v-model="correctAnswer">
      </div>
      <button>Guardar</button>
    </div>
  </div>
  <div v-else-if="page == 'afegir'">
    <h1>Afegir</h1>
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