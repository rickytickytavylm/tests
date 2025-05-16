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
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    
    // Специальное оформление для последнего вопроса
    if (isLastQuestion) {
        progressText.textContent = `Последний вопрос (${currentQuestionIndex + 1} из ${totalQuestions})`;
        progressText.classList.add('font-bold', 'text-brand-textPurple');
        progressFill.style.width = '100%';
        progressFill.classList.add('bg-brand-hover');
    } else {
        progressText.textContent = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;
        progressText.classList.remove('font-bold', 'text-brand-textPurple');
        progressFill.style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;
        progressFill.classList.remove('bg-brand-hover');
    }

    // Получаем текущий вопрос
    const question = currentTest.questions[currentQuestionIndex];

    // Создаем HTML для вопроса
    const questionDiv = document.createElement('div');
    
    // Специальное оформление для последнего вопроса
    if (isLastQuestion) {
        questionDiv.className = 'bg-white/90 rounded-xl p-5 shadow-lg mb-4 border-2 border-brand-primary';
    } else {
        questionDiv.className = 'bg-white/80 rounded-xl p-5 shadow-md mb-4';
    }
    
    const questionText = document.createElement('p');
    questionText.className = isLastQuestion ? 'text-lg mb-4 font-semibold' : 'text-lg mb-4';
    questionText.textContent = question.text;
    questionDiv.appendChild(questionText);
    
    // Добавляем подсказку для последнего вопроса
    if (isLastQuestion) {
        const hintText = document.createElement('p');
        hintText.className = 'text-sm text-brand-textPurple mb-4 italic';
        hintText.textContent = 'После ответа на этот вопрос будет показан результат теста';
        questionDiv.appendChild(hintText);
    }
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'flex gap-4 justify-center mt-6';
    
    // Для теста на устойчивость к стрессу инвертируем ответы (да = положительно)
    const isStressTest = currentTest.title.includes('устойчивость к стрессу');
    
    // Создаем кнопку "Да"
    const yesButton = document.createElement('button');
    yesButton.type = 'button';
    yesButton.className = 'py-3 px-8 bg-white hover:bg-brand-primary hover:text-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
    yesButton.textContent = 'Да';
    
    // Обработчик клика на кнопку "Да"
    yesButton.onclick = function() {
        // Визуально выделяем кнопку
        yesButton.className = 'py-3 px-8 bg-brand-primary text-white font-semibold rounded-lg shadow-md transform scale-105 transition-all';
        noButton.className = 'py-3 px-8 bg-white hover:bg-brand-primary hover:text-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
        
        // Сохраняем ответ
        userAnswers[currentQuestionIndex] = 1;
        
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
    
    // Создаем кнопку "Нет"
    const noButton = document.createElement('button');
    noButton.type = 'button';
    noButton.className = 'py-3 px-8 bg-white hover:bg-brand-primary hover:text-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
    noButton.textContent = 'Нет';
    
    // Обработчик клика на кнопку "Нет"
    noButton.onclick = function() {
        // Визуально выделяем кнопку
        noButton.className = 'py-3 px-8 bg-brand-primary text-white font-semibold rounded-lg shadow-md transform scale-105 transition-all';
        yesButton.className = 'py-3 px-8 bg-white hover:bg-brand-primary hover:text-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
        
        // Сохраняем ответ
        userAnswers[currentQuestionIndex] = 0;
        
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
    
    // Добавляем кнопки в контейнер
    optionsDiv.appendChild(yesButton);
    optionsDiv.appendChild(noButton);
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
        
        // Отображаем результат - только количество баллов
        scoreElement.textContent = `Результат: ${score} баллов`;
    } else {
        // Обычный расчет
        interpretation = currentTest.interpretations.find(
            interp => score >= interp.min && score <= interp.max
        );
        
        // Отображаем результат - только количество баллов
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
