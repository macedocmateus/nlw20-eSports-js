const form = document.getElementById('form');
const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');

const markdownToHtml = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

const askAi = async (question, game, apiKey) => {
    const model = "gemini-2.5";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}-flash:generateContent?key=${apiKey}`;

    // Engenharia de prompt, utilizando cadeia de pensamento (chain of thought)
    const ask = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.

    ## Regras
    - Se você não sabe a resposta, responde com 'Não sei' não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
    - Considere a data atual ${new Date().toLocaleString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres. 
    - Responda em markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**/n/n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
    `;

    const contents = [{
        role: "user",
        parts: [
            {
                text: ask
            }
        ]
    }];

    const tools = [{
        google_search: {}
    }];

    // Chamada da API
    const response = await fetch(geminiURL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    });

    const data = await response.json();

    return data.candidates[0].content.parts[0].text;
}

const sendForm = async (event) => {
    event.preventDefault();

    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey == '' || game == '' || question == '') {
        alert('Preencha todos os campos');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading');

    try {
        const text = await askAi(question, game, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHtml(text);
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.log("Erro: ", error);
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }
}

form.addEventListener('submit', sendForm);