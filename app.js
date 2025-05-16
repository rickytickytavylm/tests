// Инициализация Telegram WebApp
let tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.MainButton.hide();
}

// Глобальные переменные
let currentTest = null;
let currentQuestionIndex = 0;
let userAnswers = [];

// DOM-элементы
const startScreen = document.getElementById('start-screen');
const testScreen = document.getElementById('test-screen');
const resultScreen = document.getElementById('result-screen');
const testTitle = document.getElementById('test-title');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const questionsContainer = document.getElementById('questions-container');
const calculateResultButton = document.getElementById('calculate-result');
const scoreElement = document.getElementById('score');
const interpretationElement = document.getElementById('interpretation');
const backToTestsButton = document.getElementById('back-to-tests');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчики событий для карточек тестов
    document.querySelectorAll('.test-card').forEach(card => {
        card.addEventListener('click', () => {
            const testId = parseInt(card.getAttribute('data-test-id'));
            startTest(testId);
        });
    });

    // Обработчик для кнопки подсчета результатов
    calculateResultButton.addEventListener('click', showTestResult);

    // Обработчик для кнопки возврата к тестам
    backToTestsButton.addEventListener('click', goBackToTests);
});

// Функция для начала теста
function startTest(testId) {
    // Сбрасываем предыдущие ответы и устанавливаем текущий тест
    currentTest = testsData[testId];
    currentQuestionIndex = 0;
    userAnswers = Array(currentTest.questions.length).fill(null);

    // Обновляем заголовок теста
    testTitle.textContent = currentTest.title;

    // Отображаем первый вопрос
    renderCurrentQuestion();
    
    // Сначала удаляем все существующие кнопки "Вернуться к тестам"
    const existingBackButtons = document.querySelectorAll('#back-to-tests-from-test, .back-button-container');
    existingBackButtons.forEach(button => button.remove());
    
    // Добавляем кнопку "Вернуться к тестам"
    const backButtonContainer = document.createElement('div');
    backButtonContainer.className = 'mt-6 text-center back-button-container';
    
    const backButton = document.createElement('button');
    backButton.id = 'back-to-tests-from-test';
    backButton.className = 'flex items-center justify-center mx-auto bg-white/80 hover:bg-white text-brand-textPurple font-semibold py-2 px-4 rounded-lg transition-colors shadow-md';
    backButton.textContent = '← Вернуться к тестам';
    backButton.onclick = goBackToTests;
    
    backButtonContainer.appendChild(backButton);
    
    // Добавляем кнопку после кнопки "Посчитать результат"
    const calculateButtonParent = calculateResultButton.parentNode;
    calculateButtonParent.appendChild(backButtonContainer);

    // Переключаем экраны
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    testScreen.classList.remove('hidden');
    testScreen.classList.add('active');
    resultScreen.classList.remove('active');
    resultScreen.classList.add('hidden');

    // Если используется Telegram WebApp, настраиваем кнопку назад
    if (tg) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => goBackToTests());
    }
}

// Функция для отображения текущего вопроса
function renderCurrentQuestion() {
    // Обновляем индикатор прогресса
    const totalQuestions = currentTest.questions.length;
    progressText.textContent = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;
    progressFill.style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;

    // Получаем текущий вопрос
    const question = currentTest.questions[currentQuestionIndex];

    // Создаем HTML для вопроса
    const questionDiv = document.createElement('div');
    questionDiv.className = 'bg-white/80 rounded-xl p-5 shadow-md mb-4';
    
    const questionText = document.createElement('p');
    questionText.className = 'text-lg mb-4';
    questionText.textContent = question.text;
    questionDiv.appendChild(questionText);
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'flex gap-6';
    
    // Для теста на устойчивость к стрессу инвертируем ответы (да = положительно)
    const isStressTest = currentTest.title.includes('устойчивость к стрессу');
    
    // Создаем опцию "Да"
    const yesLabel = document.createElement('label');
    yesLabel.className = 'flex items-center cursor-pointer';
    
    const yesInput = document.createElement('input');
    yesInput.type = 'radio';
    yesInput.name = `question-${currentQuestionIndex}`;
    yesInput.value = '1';
    yesInput.className = 'mr-2 h-5 w-5 accent-brand-primary';
    if (userAnswers[currentQuestionIndex] === 1) {
        yesInput.checked = true;
    }
    
    yesInput.onclick = function() {
        let value = 1;
        userAnswers[currentQuestionIndex] = value;
        
        // Задержка перед переходом к следующему вопросу или показу результата
        setTimeout(() => {
            if (currentQuestionIndex < currentTest.questions.length - 1) {
                currentQuestionIndex++;
                renderCurrentQuestion();
            } else {
                // Если это последний вопрос, сразу показываем результат
                showTestResult();
            }
        }, 300);
    };
    
    const yesText = document.createElement('span');
    yesText.textContent = 'Да';
    
    yesLabel.appendChild(yesInput);
    yesLabel.appendChild(yesText);
    
    // Создаем опцию "Нет"
    const noLabel = document.createElement('label');
    noLabel.className = 'flex items-center cursor-pointer';
    
    const noInput = document.createElement('input');
    noInput.type = 'radio';
    noInput.name = `question-${currentQuestionIndex}`;
    noInput.value = '0';
    noInput.className = 'mr-2 h-5 w-5 accent-brand-primary';
    if (userAnswers[currentQuestionIndex] === 0) {
        noInput.checked = true;
    }
    
    noInput.onclick = function() {
        let value = 0;
        userAnswers[currentQuestionIndex] = value;
        
        // Задержка перед переходом к следующему вопросу или показу результата
        setTimeout(() => {
            if (currentQuestionIndex < currentTest.questions.length - 1) {
                currentQuestionIndex++;
                renderCurrentQuestion();
            } else {
                // Если это последний вопрос, сразу показываем результат
                showTestResult();
            }
        }, 300);
    };
    
    const noText = document.createElement('span');
    noText.textContent = 'Нет';
    
    noLabel.appendChild(noInput);
    noLabel.appendChild(noText);
    
    // Добавляем опции в контейнер
    optionsDiv.appendChild(yesLabel);
    optionsDiv.appendChild(noLabel);
    questionDiv.appendChild(optionsDiv);
    
    // Очищаем и добавляем новый вопрос
    questionsContainer.innerHTML = '';
    questionsContainer.appendChild(questionDiv);
    
    // Скрываем кнопку подсчета результатов
    calculateResultButton.style.display = 'none';
}

// Функция для обновления состояния кнопки подсчета результатов
function updateCalculateButtonState() {
    // Проверяем, все ли вопросы отвечены
    const answeredQuestions = userAnswers.filter(answer => answer !== null).length;
    const totalQuestions = currentTest.questions.length;
    
    // Проверяем, является ли текущий вопрос последним
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    
    // Показываем кнопку только на последнем вопросе
    calculateResultButton.style.display = isLastQuestion ? 'block' : 'none';
    
    // На последнем вопросе кнопка всегда активна
    if (isLastQuestion) {
        calculateResultButton.disabled = false;
        calculateResultButton.classList.remove('opacity-50');
        calculateResultButton.classList.add('bg-brand-primary', 'hover:bg-brand-hover', 'shadow-md');
    } else {
        calculateResultButton.disabled = true;
        calculateResultButton.classList.add('opacity-50');
    }
    
    // Обновляем текст кнопки
    calculateResultButton.textContent = 'Посчитать результат';
}

// Функция для отображения результата теста
function showTestResult() {
    // Подсчитываем количество положительных ответов
    // Учитываем только отвеченные вопросы
    const answeredQuestions = userAnswers.filter(answer => answer !== null);
    const score = answeredQuestions.reduce((total, answer) => total + answer, 0);
    const totalAnswered = answeredQuestions.length;
    const totalQuestions = currentTest.questions.length;
    
    // Находим соответствующую интерпретацию
    let interpretation;
    
    // Если отвечены не все вопросы, но больше половины, пропорционально оцениваем результат
    if (totalAnswered < totalQuestions && totalAnswered > totalQuestions / 2) {
        // Пропорционально оцениваем скор
        const estimatedScore = Math.round(score * (totalQuestions / totalAnswered));
        interpretation = currentTest.interpretations.find(
            interp => estimatedScore >= interp.min && estimatedScore <= interp.max
        );
        
        // Отображаем результат с пометкой о неполном прохождении
        scoreElement.textContent = `Результат: ${score} баллов (пройдено ${totalAnswered} из ${totalQuestions} вопросов)`;
    } else {
        // Обычный расчет
        interpretation = currentTest.interpretations.find(
            interp => score >= interp.min && score <= interp.max
        );
        
        // Отображаем результат
        scoreElement.textContent = `Результат: ${score} баллов`;
    }

    // Отображаем интерпретацию
    interpretationElement.textContent = interpretation ? interpretation.text : 
        'Недостаточно данных для точной интерпретации. Пожалуйста, ответьте на большее количество вопросов.';

    // Переключаем экраны
    testScreen.classList.remove('active');
    testScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    resultScreen.classList.add('active');

    // Если используется Telegram WebApp, настраиваем кнопку назад
    if (tg) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => goBackToTests());
    }
}

// Функция для возврата к списку тестов
function goBackToTests() {
    // Переключаем экраны
    resultScreen.classList.remove('active');
    resultScreen.classList.add('hidden');
    testScreen.classList.remove('active');
    testScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');

    // Сбрасываем текущий тест и ответы
    currentTest = null;
    currentQuestionIndex = 0;
    userAnswers = [];

    // Если используется Telegram WebApp, скрываем кнопку назад
    if (tg) {
        tg.BackButton.hide();
    }
}
