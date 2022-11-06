const questionTemplate = fetch("assets/template/question.html");
const questionsJSON = fetch("assets/json/questions.json");
const pageContent = document.querySelector(".page-content");
const resultPage = document.querySelector(".content-result");
const backButton = document.querySelector(".page-buttons").children[0];
const nextButton = document.querySelector(".page-buttons").children[1];
backButton.disabled = true;
nextButton.disabled = true;

const choises = [];
let questionIndex = 0;
let template;
let questionsArray;
let correctAnswerIndex;

const main = (async () => {
  await Promise.all([questionTemplate, questionsJSON]).then(
    async (response) => {
      template = await response[0].text();
      questionsArray = await response[1].json();
      for (let i = 0; i < questionsArray.length; i++) {
        choises.push(-1);
      }
      setQuestion();
    }
  );
})();

function setQuestion() {
  const domParser = new DOMParser();
  const currentQuestion = questionsArray[questionIndex];

  let question = template;
  correctAnswerIndex = currentQuestion.correctAnswerIndex;

  question = question.replace("{{questionTitle}}", currentQuestion.name);
  for (let i = 1; i <= 4; i++) {
    const checked = choises[questionIndex] === i - 1 ? " checked" : "";
    question = question.replace(`{{checked}}`, checked);
    question = question.replace(
      `{{answer${i}}}`,
      currentQuestion.questions[i - 1] + checked
    );
  }

  question = domParser
    .parseFromString(question, "text/html")
    .querySelector(".content-question");

  pageContent.firstChild.before(question);

  nextButton.disabled = choises[questionIndex] === -1;
}

function nextQuestion() {
  if (choises[questionIndex] === -1) return;

  pageContent.firstChild.remove();

  questionIndex++;

  if (questionIndex > questionsArray.length - 1) {
    seeResultPage();
  } else {
    setQuestion();

    backButton.disabled = false;
  }
}

function previousQuestion() {
  questionIndex--;

  if (questionIndex === 0) {
    backButton.disabled = true;
  }

  pageContent.firstChild.remove();

  setQuestion();
  nextButton.disabled = false;
}

function onChoiceClick(value) {
  choises[questionIndex] = value;
  nextButton.disabled = false;
}

function seeResultPage() {
  let res = 0;

  for (let i = 0; i < choises.length; i++) {
    if (choises[i] === questionsArray[i].correctAnswerIndex) {
      res++;
    }
  }

  backButton.parentElement.style = "opacity: 0;";
  backButton.disabled = true;
  nextButton.disabled = true;

  resultPage.hidden = false;
  resultPage.children[1].textContent = `${res}/${questionsArray.length}`;
  resultPage.children[2].textContent = getResultText(res);
}

function getResultText(res) {
  switch (true) {
    case res === 10:
      return "Perfekt!";
    case res > 7:
      return "Bra jobbat!";
    case res > 5:
      return "Helt okej!";
    case res > 3:
      return "Dåligt!";
    case res > 1:
      return "Väldigt dåligt!";
    case res === 0:
      return "Fucking sämsta resultatet jag har behövt rätta i hela mitt dataliv! Tror du själv att du kan bli programmerare? Jävla nolla!";
  }
}