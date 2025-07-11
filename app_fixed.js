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
let isButtonDisabled = false; // Добавляем переменную для отслеживания состояния кнопок

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
    // Очищаем контейнер с вопросами перед отрисовкой нового вопроса
    questionsContainer.innerHTML = '';
    
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
        // Предотвращаем двойные нажатия
        if (isButtonDisabled) return;
        isButtonDisabled = true;
        
        // Визуально выделяем кнопку только на текущем экране
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
            // Сбрасываем блокировку кнопок для следующего вопроса
            isButtonDisabled = false;
        }, 300);
    };
    
    // Создаем кнопку "Нет"
    const noButton = document.createElement('button');
    noButton.type = 'button';
    noButton.className = 'py-3 px-8 bg-white hover:bg-brand-primary hover:text-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
    noButton.textContent = 'Нет';
    
    // Обработчик клика на кнопку "Нет"
    noButton.onclick = function() {
        // Предотвращаем двойные нажатия
        if (isButtonDisabled) return;
        isButtonDisabled = true;
        
        // Визуально выделяем кнопку только на текущем экране
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
            // Сбрасываем блокировку кнопок для следующего вопроса
            isButtonDisabled = false;
        }, 300);
    };
    
    // Добавляем кнопки в контейнер
    optionsDiv.appendChild(yesButton);
    optionsDiv.appendChild(noButton);
    questionDiv.appendChild(optionsDiv);
    
    // Добавляем новый вопрос
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
}

// Функция для отображения результата теста
function showTestResult() {
    // Подсчитываем результат
    const score = userAnswers.reduce((sum, answer) => sum + answer, 0);
    
    // Определяем интерпретацию результата
    let interpretation = '';
    
    if (currentTest.title.includes('признаки созависимости')) {
        if (score <= 5) {
            interpretation = 'У вас низкий уровень созависимых паттернов. Вы, скорее всего, способны устанавливать здоровые границы в отношениях и заботиться о собственных потребностях.';
        } else if (score <= 15) {
            interpretation = 'У вас средний уровень созависимых паттернов. В некоторых ситуациях вы можете терять контакт с собственными потребностями, чрезмерно фокусируясь на других.';
        } else {
            interpretation = 'У вас высокий уровень созависимых паттернов. Вам может быть сложно отделить свои чувства и потребности от чувств и потребностей близких людей. Рекомендуем обратиться к специалисту.';
        }
    } else if (currentTest.title.includes('эмоционального выгорания')) {
        if (score <= 7) {
            interpretation = 'У вас низкий уровень эмоционального выгорания. Вы хорошо справляетесь со стрессом и сохраняете энергию.';
        } else if (score <= 15) {
            interpretation = 'У вас средний уровень эмоционального выгорания. Обратите внимание на свое состояние и найдите способы восстановления энергии.';
        } else {
            interpretation = 'У вас высокий уровень эмоционального выгорания. Рекомендуем обратиться к специалисту и внести изменения в свой образ жизни.';
        }
    } else if (currentTest.title.includes('уровень тревожности')) {
        if (score <= 7) {
            interpretation = 'У вас низкий уровень тревожности. Вы хорошо справляетесь с неопределенностью и стрессовыми ситуациями.';
        } else if (score <= 15) {
            interpretation = 'У вас средний уровень тревожности. В некоторых ситуациях вы можете испытывать беспокойство и напряжение.';
        } else {
            interpretation = 'У вас высокий уровень тревожности. Рекомендуем обратиться к специалисту для получения поддержки.';
        }
    } else if (currentTest.title.includes('устойчивость к стрессу')) {
        if (score <= 7) {
            interpretation = 'У вас низкая устойчивость к стрессу. Вам может быть сложно восстанавливаться после стрессовых ситуаций.';
        } else if (score <= 15) {
            interpretation = 'У вас средняя устойчивость к стрессу. Вы обладаете некоторыми навыками совладания со стрессом, но иногда они могут быть недостаточными.';
        } else {
            interpretation = 'У вас высокая устойчивость к стрессу. Вы хорошо справляетесь с трудностями и быстро восстанавливаетесь после стрессовых ситуаций.';
        }
    }
    
    // Отображаем результат
    scoreElement.textContent = `${score} из ${currentTest.questions.length}`;
    interpretationElement.textContent = interpretation;
    
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
