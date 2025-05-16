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
let isButtonDisabled = false; // Переменная для отслеживания состояния кнопок

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
    
    // Сбрасываем блокировку кнопок при новом вопросе
    isButtonDisabled = false;
    
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
    yesButton.className = 'py-3 px-8 bg-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
    yesButton.textContent = 'Да';
    
    // Обработчик клика на кнопку "Да"
    yesButton.onclick = function() {
        // Предотвращаем двойные нажатия
        if (isButtonDisabled) return;
        isButtonDisabled = true;
        
        // Визуально выделяем кнопку только на текущем экране
        yesButton.className = 'py-3 px-8 bg-brand-primary text-white font-semibold rounded-lg shadow-md transform scale-105 transition-all';
        noButton.className = 'py-3 px-8 bg-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
        
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
    noButton.className = 'py-3 px-8 bg-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
    noButton.textContent = 'Нет';
    
    // Обработчик клика на кнопку "Нет"
    noButton.onclick = function() {
        // Предотвращаем двойные нажатия
        if (isButtonDisabled) return;
        isButtonDisabled = true;
        
        // Визуально выделяем кнопку только на текущем экране
        noButton.className = 'py-3 px-8 bg-brand-primary text-white font-semibold rounded-lg shadow-md transform scale-105 transition-all';
        yesButton.className = 'py-3 px-8 bg-white text-brand-textPurple font-semibold rounded-lg shadow-md transition-all';
        
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
        if (score <= 6) {
            interpretation = '🟢 Почти нет признаков созависимости.\n\n' +
                'Вы, скорее всего, умеете слышать свои потребности, уважаете личные границы и способны поддерживать здоровую автономию в отношениях. Это не значит, что вы не заботитесь о других — просто вы не жертвуете собой. Поддерживайте это внутреннее равновесие и будьте внимательны к себе в моменты стресса.';
        } else if (score <= 13) {
            interpretation = '🟡 Умеренные проявления созависимости.\n\n' +
                'Похоже, в отношениях вам иногда бывает сложно отделить собственные чувства от чувств другого человека. Вы склонны к чрезмерной заботе, можете забывать о себе ради других, переживать из-за отказа. Это может быть следствием воспитания или личного опыта. Сейчас хорошее время, чтобы мягко вернуть внимание к себе — через работу с границами и самоподдержку.';
        } else if (score <= 20) {
            interpretation = '🔸 Выраженная созависимость.\n\n' +
                'Ваши отношения, возможно, построены на страхе быть отвергнутым, чувстве вины и чрезмерном контроле. Вы стараетесь «спасти» других, забывая про себя, часто подавляете чувства, чтобы сохранить мир. Это не ваша вина — это стратегия выживания. Но теперь вы можете выбрать путь, в котором есть место вам. Начните с первого шага: признание своей ценности.';
        } else {
            interpretation = '🔴 Высокий уровень созависимости.\n\n' +
                'Вы, возможно, почти полностью растворяетесь в других. Живёте тревогой, виной, необходимостью быть «нужным», «правильным». Это не слабость — это результат накопленного опыта, где быть собой было небезопасно. Сейчас особенно важно восстановить внутренний контакт с собой, позволить себе быть живым, чувствующим. Начните с раздела 1 курса — это бережный путь возвращения к себе.';
        }
    
    } else if (currentTest.title.includes('эмоционального выгорания')) {
        if (score <= 4) {
            interpretation = '🟢 Низкий уровень выгорания.\n\n' +
                'Вы, похоже, умеете своевременно восстанавливаться, прислушиваться к своему телу и эмоциональному состоянию. Это не значит, что в вашей жизни нет трудностей — скорее, у вас есть внутренние ресурсы и зрелая способность регулировать нагрузку. Поддерживайте баланс между делом и отдыхом — и будьте внимательны к первым признакам переутомления.';
        } else if (score <= 9) {
            interpretation = '🟡 Умеренное выгорание.\n\n' +
                'Появляются первые сигналы эмоционального истощения: апатия, раздражительность, усталость без видимой причины. Возможно, вы слишком долго «держались» и не дали себе восстановиться. Сейчас критично важно замедлиться, снизить нагрузку, пересмотреть роли, в которых вы постоянно «тянете». Начните возвращать энергию в своё тело и внимание — себе.';
        } else {
            interpretation = '🔴 Выраженное эмоциональное выгорание.\n\n' +
                'Ваш ресурс на исходе. Это не лень и не слабость — это крик тела и психики, уставших «тащить». Возможно, вы уже чувствуете бессмысленность, дистанцируетесь от близких, сомневаетесь в себе. Сейчас приоритет — не «делать», а «быть». Поддержка, отдых, выход из постоянного «должен» — жизненно необходимы. Начните с мягких шагов: забота, границы, чувства.';
        }
    
    } else if (currentTest.title.includes('уровень тревожности')) {
        if (score <= 6) {
            interpretation = '🟢 Низкий уровень тревожности.\n\n' +
                'Вы, вероятно, умеете регулировать эмоциональное напряжение, справляетесь с неопределённостью и не застреваете в мысленных сценариях. Это зрелое состояние, в котором страх не управляет вами, а помогает быть внимательным. Поддерживайте осознанность, и не забывайте беречь себя в периоды повышенной нагрузки.';
        } else if (score <= 13) {
            interpretation = '🟡 Средний уровень тревожности.\n\n' +
                'Тревожность влияет на вашу жизнь: вызывает напряжение, мешает отдыхать, влияет на решения. Это частая реакция в условиях давления или прошлого опыта, где «надо быть наготове». Сейчас важно вернуть себе ощущение безопасности — хотя бы частично. Помогут телесные практики, дыхание, снижение самокритики и поддержка.';
        } else {
            interpretation = '🔴 Высокий уровень тревожности.\n\n' +
                'Похоже, вы живёте в состоянии постоянной настороженности. Ум не останавливается, тело в напряжении, внутри — ощущение опасности. Это не черта характера — это работа нервной системы. Она не враг — она устала. Начните заботиться о себе, как о человеке, который слишком долго справлялся. Это можно изменить.';
        }
    
    } else if (currentTest.title.includes('устойчивость к стрессу')) {
        if (score <= 5) {
            interpretation = '🔻 Низкая устойчивость к стрессу.\n\n' +
                'Вас могут легко выбить даже незначительные сложности. После трудностей вы долго приходите в себя или чувствуете, что «проваливаетесь». Это не про «слабость» — это про уставшую, перегруженную психику. Сейчас важно начать с телесного восстановления: сон, питание, безопасность. И постепенно — возвращать себе ощущение опоры.';
        } else if (score <= 10) {
            interpretation = '🟡 Умеренная устойчивость.\n\n' +
                'Вы способны справляться с трудностями, но временами чувствуете внутреннее истощение. Иногда вы «тянете» из последних сил. Это сигнал — вам важно учиться не только выдерживать, но и восстанавливаться. Пересмотрите, откуда вы черпаете силы, и где — просто терпите.';
        } else {
            interpretation = '🟢 Высокая устойчивость к стрессу.\n\n' +
                'У вас сформированы внутренние ресурсы: способность восстанавливаться, гибкость, навык переживать трудности, не разрушаясь. Это не значит, что вам легко — но вы знаете, как поддержать себя. Сохраняйте этот контакт с собой и делитесь им с другими, когда можете.';
        }
    }
    // Отображаем результат
    scoreElement.textContent = `${score} из ${currentTest.questions.length}`;
    interpretationElement.innerHTML = interpretation;
    
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
