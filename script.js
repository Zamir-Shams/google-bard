
const sideNavigation = document.querySelector(".sideNavigation");
const sideBarToggle = document.querySelector(".fa-bars");
const startContentUl = document.querySelector(".startContent ul");
const inputArea = document.querySelector(".inputArea input");
const sendRequest = document.querySelector(".fa-paper-plane");
const chatHistory = document.querySelector(".chatHistory ul");
const startContent = document.querySelector(".startContent");
const chatContent = document.querySelector(".chatContent");
const results = document.querySelector(".results");

promptQuestions = [
  {
    question: "What would you like help with today?",
    icon: "fa-solid fa-wand-magic-sparkles",
  },
  {
    question: "Can you describe the issue you're facing?",
    icon: "fa-solid fa-code",
  },
  {
    question: "What technology are you working with?",
    icon: "fa-solid fa-laptop-code",
  },
  {
    question: "Would you like me to review your code?",
    icon: "fa-solid fa-database",
  },
];

// Update questions on load
window.addEventListener("load", () => {
  promptQuestions.forEach((data) => {
    let item = document.createElement("li");
    item.addEventListener("click", () => {
      getGeminiResponse(data.question, true);
    });
    item.innerHTML = `
      <div class="promptSuggestion">
        <p>${data.question}</p>
        <div class="icon"><i class="${data.icon}"></i></div>
      </div>`;
    startContentUl.append(item);
  });
});

// Toggling side navigation
sideBarToggle.addEventListener("click", () => {
  sideNavigation.classList.toggle("hide");
});

// Show send icon while typing
inputArea.addEventListener("keyup", (e) => {
  if (e.target.value.length > 0) {
    sendRequest.style.display = "inline";
    sendRequest.style.transition = "200ms";
  } else {
    sendRequest.style.display = "none";
  }
});

// Handle send request and call the API
sendRequest.addEventListener("click", () => {
  getGeminiResponse(inputArea.value, true);
});

function getGeminiResponse(question, appendHistory) {
  // Append to chat history if needed
  if (appendHistory) {
    let historyLi = document.createElement("li");
    historyLi.addEventListener("click", () => {
      getGeminiResponse(question, false);
    });
    historyLi.innerHTML = `<i class="fa-regular fa-message"></i> ${question}`;
    chatHistory.append(historyLi);
  }

  // Clear previous results
  results.innerHTML = "";
  inputArea.value = "";

  // Show chat content and hide start content
  startContent.style.display = "none";
  chatContent.style.display = "block";

  // Display the question in the result
  let resultTitle = `
    <div class="resultTitle">
      <img src="https://lh3.googleusercontent.com/a/ACg8ocITti8KKjP_xak2uiTWpSwYfSqo7dbGMfrkN16fuNVBjJhu5G65=s64-c">
      <p>${question}</p>
    </div>
  `;
  let resultData = `
    <div class="resultData">
      <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg">
      <div class="loader">
        <div class="animatedGB"></div>
        <div class="animatedGB"></div>
        <div class="animatedGB"></div>
      </div>
    </div>
  `;
  results.innerHTML += resultTitle;
  results.innerHTML += resultData;

  // Fetch the response from the API
  const apiKey = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBv-m_aPn8-etrJjKIQGAhh3AZlYo9sms0';

  fetch(apiKey, {
    method: "POST",
    body: JSON.stringify({
      contents: [{ parts: [{ text: question }] }],
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Remove the loader
      document.querySelector(".results .resultData").remove();

      // Process the response data
      let responseData = jsonEscape(data.candidates[0].content.parts[0].text);
      let responseArray = responseData.split("**");
      let newResponse = "";

      for (let i = 0; i < responseArray.length; i++) {
        if (i == 0 || i % 2 !== 1) {
          newResponse += responseArray[i];
        } else {
          // Use correct join for non-breaking spaces
          newResponse += "<strong>" + responseArray[i].split(" ").join("&nbsp;") + "</strong>";
        }
      }

      let newResponse2 = newResponse.split("*").join(" ");
      
      // Append result
      results.innerHTML += `
        <div class="resultResponse">
          <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg">
          <p id="typeEffect"></p>
        </div>
      `;

      // Typing effect
      let newResponseData = newResponse2.split(" ");
      for (let j = 0; j < newResponseData.length; j++) {
        timeOut(j, newResponseData[j] + " ");
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  // Typing effect function
  const timeOut = (index, nextWord) => {
    setTimeout(function () {
      document.getElementById("typeEffect").innerHTML += nextWord;
    }, 75 * index); // Delay for smooth typing
  };
}

// Utility to escape JSON response
function jsonEscape(str) {
  return str
    .replace(new RegExp("\r?\n\n", "g"), "<br>")
    .replace(new RegExp("\r?\n", "g"), "<br>");
}

function newChat() {
  startContent.style.display = "block";
  chatContent.style.display = "none";
}
