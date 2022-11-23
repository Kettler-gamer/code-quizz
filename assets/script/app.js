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
let correctChoiceIndex;

const main = (async () => {
  await Promise.all([questionTemplate, questionsJSON]).then(
    async (response) => {
      template = await response[0].text();
      questionsArray = await response[1].json();
      for (let i = 0; i < questionsArray.length; i++) {
        choises.push(-1);
      }
      onQuestionsLoaded();
    }
  );
})();

function onQuestionsLoaded() {
  pageContent.children[0].classList.add("fade-in-anim");
}

function onStartClick() {
  pageContent.children[0].style = "opacity: 0;";
  pageContent.childNodes[1].remove();
  pageContent.children[1].style = "";
  pageContent.children[1].classList.add("fade-in-anim");

  setQuestion();
}

function setQuestion() {
  const domParser = new DOMParser();
  const currentQuestion = questionsArray[questionIndex];

  let question = template;
  correctChoiceIndex = currentQuestion.correctChoiceIndex;

  question = question.replace("{{questionTitle}}", currentQuestion.title);
  for (let i = 1; i <= 4; i++) {
    const checked = choises[questionIndex] === i - 1 ? " checked" : "";
    question = question.replace(`{{checked}}`, checked);
    question = question.replace(
      `{{answer${i}}}`,
      currentQuestion.choices[i - 1] + checked
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
    if (choises[i] === questionsArray[i].correctChoiceIndex) {
      res++;
    }
  }

  backButton.parentElement.classList.remove("fade-in-anim");
  backButton.parentElement.style = "opacity: 0;";
  backButton.disabled = true;
  nextButton.disabled = true;

  resultPage.hidden = false;
  resultPage.children[1].textContent = `${res}/${questionsArray.length}`;
  resultPage.children[2].textContent = getResultText(res);

  const div = document.createElement("div");
  resultPage.append(div);

  for (let i = 0; i < questionsArray.length; i++) {
    const container = document.createElement("section");
    container.style =
      "border-top: 2px solid black; border-radius:50%; border-bottom:2px solid black; padding: 4em 0";

    const title = document.createElement("h2");
    title.innerHTML = questionsArray[i].title;
    title.className = "result-title";
    title.style = "width: 75%; text-align: none; margin: 2em auto 0 auto;";

    container.append(title);
    for (let j = 0; j < questionsArray[i].choices.length; j++) {
      const element = questionsArray[i].choices;
      const correctIndex = questionsArray[i].correctChoiceIndex;
      const alternative = document.createElement("p");
      alternative.className = "result-text";
      alternative.textContent = element[j];
      alternative.style = "width:75%; margin: 1em auto";

      if (choises[i] == j) {
        alternative.style.color = "rgb(255,255,0)";
      }

      if (correctIndex == j) {
        alternative.style.color = "rgb(0,255,0)";
      }

      container.append(alternative);
    }
    div.append(container);
  }
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
    case res > 0:
      return "Väldigt dåligt!";
    case res === 0:
      return "Du ska kanske satsa på en karriär utanför IT?";
  }
}
