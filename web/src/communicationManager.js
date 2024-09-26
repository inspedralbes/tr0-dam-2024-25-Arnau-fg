const link = import.meta.env.VITE_FETCH_ROUTE;

// CRUD

// Create pregunta

export const createQuestion = async (question) => {
    const response = await fetch(`${link}/preguntes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(question)
    })
    const data = await response.json()
    return data;
}

// Get all preguntes
export const getQuestions = async () => {
    const response = await fetch(`${link}/preguntes`)
    const data = await response.json()
    return data;
}

// Get pregunta by id
export const getQuestionById = async (id) => {
    const response = await fetch(`${link}/preguntes/${id}`)
    const data = await response.json()

    if (data.foundQuestion) {
        return data.question;
    } else {
        return null;
    }
}

// Get all respostes
export const getAnswers = async () => {
    const response = await fetch(`${link}/respostes`)
    const data = await response.json()
    console.log(data);
    return data;
}

// Edit pregunta by id
export const editQuestion = async (id, question) => {
    const response = await fetch(`${link}/preguntes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(question)
    })
    const data = await response.json()
    return data;
}

export const deleteQuestion = async (id) => {
    const response = await fetch(`${link}/preguntes/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json()
    return data;
}