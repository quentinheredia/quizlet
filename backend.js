const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");
const nextButton = document.getElementById("next");
const resetButton = document.getElementById("reset");

const quizPics = "quiz_pictures.json";
const quiz = "quiz.json";
const NET2012 = "NET2012_EXAM.json";
const NET2007 = "NET2007_Exam_Practice.json";

let questionsPerPage = 10;
let startIndex = 0;
let currentQuestionIndex = 0;

// Add reset button.

// Quiz Class
class Quiz {
  constructor() {
    this.questions = [];
  }

  addQuestion(question) {
    if (question instanceof Question) {
      this.questions.push(question);
    }
  }

  getQuestions() {
    return this.questions;
  }
}

class Question {
  /**
   * {
   * question: "question",
   * options: {
   *   a: "a",
   *   b: "b",
   *   c: "c",
   *   d: "d",
   * },
   * correctAnswer: "a",
   * },
   */
  constructor(question, a, b, c, d, answer, explanation, image) {
    this.question = question;
    this.options = {
      a,
      b,
      c,
      d,
    };
    this.answer = answer;
    this.explanation = explanation;
    this.image = image;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at indices i and j
  }
}

function shuffleQuiz(quiz) {
  // Shuffle questions
  shuffleArray(quiz.questions);
  // Shuffle options within each question
  quiz.questions.forEach((question) => {
    const optionsKeys = Object.keys(question.options);
    shuffleArray(optionsKeys);
    const shuffledOptions = {};
    optionsKeys.forEach((key) => {
      shuffledOptions[key] = question.options[key];
    });
    question.options = shuffledOptions;
  });
}

async function loadQuizFromJSON(filePath) {
  try {
    const response = await fetch(filePath);
    const quizData = await response.json();
    const questions = [];

    quizData.questions.forEach((questionData) => {
      const newQuestion = new Question(
        questionData.question,
        questionData.options.a,
        questionData.options.b,
        questionData.options.c,
        questionData.options.d,
        questionData.answer,
        questionData.explanation,
        questionData.image
      );
      questions.push(newQuestion);
    });

    return questions;
  } catch (err) {
    console.error("Error loading or parsing quiz data:", err);
    return null; // or throw an error, depending on your error handling strategy
  }
}

// Questions
/*
myQuestions = [
  {
    question: "question",
    options: {
      a: "a",
      b: "b",
      c: "c",
      d: "d",
    },
    correctAnswer: "a",
  },
  {
    question: "question",
    options: {
      a: "a",
      b: "b",
      c: "c",
      d: "d",
    },
    correctAnswer: "d",
  },
];*/

let myQuestions = new Quiz();
//myQuestions.addQuestion(await loadQuizFromJSON("/quiz.json"));

// Helper Function to reset quiz
function resetQuiz() {
  buildQuiz(startIndex, questionsPerPage);
}

function buildQuiz(startIndex, endIndex) {
  if (!quizContainer || !submitButton || !nextButton) return;

  const output = [];
  const questionsToShow = myQuestions
    .getQuestions()
    .slice(startIndex, endIndex);

    questionsToShow.forEach((currentQuestion, questionNumber) => {
      const options = [];
  
      if (currentQuestion.question.trim()) {
        let questionHtml = `<div class="question-container">
                              <div class="question">${currentQuestion.question}</div>`;
  
        for (let letter in currentQuestion.options) {
          if (currentQuestion.options[letter].trim()) {
            options.push(
              `<input type="radio" id="question${startIndex + questionNumber}_${letter}" 
                      name="question${startIndex + questionNumber}" value="${letter}">
               <label for="question${startIndex + questionNumber}_${letter}">
                  ${letter} : ${currentQuestion.options[letter]}
               </label>`
            );
          }
        }
  
        if (options.length > 0) {
          questionHtml += `<div class="options">${options.join("")}</div>`;
        }
  
        // Add explanation if it exists
        if (currentQuestion.explanation && currentQuestion.explanation.trim() !== "") {
          questionHtml += `<div class="explanation hidden">${currentQuestion.explanation}</div>`;
        }
  
        // Add Image if it exists
        if (currentQuestion.image && currentQuestion.image.trim() !== "") {
          questionHtml = `<img class="images" src="${currentQuestion.image}" />` + questionHtml;
        }
  
        questionHtml += `</div>`; // Close the question-container div
        output.push(questionHtml);
      }
  });
  

  quizContainer.innerHTML = output.join("");
  submitButton.classList.remove("hidden");
  nextButton.classList.add("hidden");
}

function showResults() {
  if (!quizContainer || !resultsContainer || !submitButton || !nextButton)
    return;

  let numCorrect = 0;
  const answerContainers = quizContainer.querySelectorAll(".options");

  myQuestions
    .getQuestions()
    .slice(currentQuestionIndex, currentQuestionIndex + questionsPerPage)
    .forEach((currentQuestion, questionNumber) => {
      const answerContainer = answerContainers[questionNumber];

      const userAnswers = answerContainer.querySelectorAll(
        'input[type="radio"]:checked'
      );

      let userAnswer = null;

      if (userAnswers.length > 0) {
        userAnswer = userAnswers[0].value;
      }

      const explanations = quizContainer.querySelectorAll(".explanation");
      explanations.forEach((explanation) => {
        explanation.classList.remove("hidden"); // This will make each explanation visible
      });

      // Update numCorrect and option colors
      // Update numCorrect and option colors
      answerContainer
        .querySelectorAll('input[type="radio"]')
        .forEach((option) => {
          const label = option.nextElementSibling; // Assuming the label is the immediate sibling
          if (option.value === currentQuestion.answer) {
            if (userAnswer === currentQuestion.answer) {
              numCorrect++;
            }
            label.style.backgroundColor = "#90EE90"; // Correct answer
          } else {
            if (option.value === userAnswer) {
              label.style.backgroundColor = "#FFA07A"; // Incorrect answer chosen by the user
            }
          }
        });
    });

  resultsContainer.innerHTML = `${numCorrect} out of ${questionsPerPage} questions correct`;
  nextButton.classList.remove("hidden");
  submitButton.classList.add("hidden");
  //explanation.classList.add("explanation");
}

function showNextQuestions() {
  if (!nextButton || !resultsContainer) return;

  currentQuestionIndex += questionsPerPage;
  if (currentQuestionIndex >= myQuestions.length) {
    resultsContainer.innerHTML += `<br>All questions completed!`;
    nextButton.classList.add("hidden");
    return;
  }
  buildQuiz(currentQuestionIndex, currentQuestionIndex + questionsPerPage);
}

// Update Questions Per Page\
/*
document.addEventListener("DOMContentLoaded", function () {
  function changeQuestiongPerPage() {
    const userInput = parseInt(document.getElementById("userInput").value);
    console.log("Echo: ", userInput);
    console.log("Array Length", myQuestions.questions.length);
    if (myQuestions.questions.length < userInput) {
      questionsPerPage = myQuestions.questions.length;
      console.log(questionsPerPage);
    } else {
      questionsPerPage = userInput;
      console.log(questionsPerPage);
    }
    buildQuiz(
      startIndex,
      parseInt(questionsPerPage, 10) + parseInt(startIndex, 10)
    );
  }

  document
    .getElementById("userInput")
    .addEventListener("change", changeQuestiongPerPage);
});*/

// Update Starting index
/*
document.addEventListener("DOMContentLoaded", function () {
  function changeStartIndex() {
    const numInput = parseInt(document.getElementById("numInput").value);
    console.log("Echo: ", numInput);
    startIndex = numInput;
    console.log("Start from:", startIndex);
    //currentQuestionIndex = startIndex;
    buildQuiz(
      startIndex,
      parseInt(questionsPerPage, 10) + parseInt(startIndex, 10)
    );
  }

  document
    .getElementById("numInput")
    .addEventListener("change", changeStartIndex);
}); */

// Changing the amount of questions per page
document.querySelectorAll(".question-count-btn").forEach((button) => {
  button.addEventListener("click", function () {
    console.log(myQuestions.questions);
    if (this.getAttribute("data-count") == "MAX") {
      questionsPerPage = myQuestions.questions.length;
    } else {
      questionsPerPage = parseInt(this.getAttribute("data-count"));
    }

    buildQuiz(0, questionsPerPage); // Rebuild the quiz starting from the first question

    // Highlight the active button
    document
      .querySelectorAll(".question-count-btn")
      .forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
  });
});

resetButton.addEventListener("click", resetQuiz);

if (submitButton && nextButton) {
  // Initialize first set of questions\
  async function initializeQuiz() {
    // Put the quiz .json filename here
    // Quiz Name
    const loadedQuestions = await loadQuizFromJSON(NET2012);
    console.log(loadedQuestions);
    currentQuestionIndex = startIndex;
    console.log("Currently on Question: ", currentQuestionIndex);
    if (loadedQuestions) {
      loadedQuestions.forEach((question) => {
        myQuestions.addQuestion(question);
      });

      buildQuiz(startIndex, questionsPerPage);
    } else {
      console.error("Failed to load questions.");
    }
  }
  initializeQuiz().catch(console.error);

  submitButton.addEventListener("click", showResults);
  nextButton.addEventListener("click", showNextQuestions);
}
