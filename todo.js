const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const calendar = document.getElementById("calendar");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

let planner = JSON.parse(localStorage.getItem("planner")) || {};

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

/* Populate Years */
for (let i = currentYear - 5; i <= currentYear + 5; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  yearSelect.appendChild(option);
}
yearSelect.value = currentYear;

/* Populate Months */
const months = ["January","February","March","April","May","June",
"July","August","September","October","November","December"];

months.forEach((m, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = m;
  monthSelect.appendChild(option);
});
monthSelect.value = currentMonth;

/* Save Data */
function saveData() {
  localStorage.setItem("planner", JSON.stringify(planner));
}

/* Update Progress Based on Completed TASKS */
function updateProgress(year, month) {
  const days = planner[year]?.[month] || {};

  let totalTasks = 0;
  let completedTasks = 0;

  Object.values(days).forEach(day => {
    day.tasks.forEach(task => {
      totalTasks++;
      if (task.completed) completedTasks++;
    });
  });

  const percent = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  progressBar.style.width = percent + "%";
  progressText.textContent = "Progress: " + Math.round(percent) + "%";
}

/* Generate Calendar */
function generateCalendar() {
  calendar.innerHTML = "";

  const year = yearSelect.value;
  const month = monthSelect.value;

  if (!planner[year]) planner[year] = {};
  if (!planner[year][month]) planner[year][month] = {};

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {

    if (!planner[year][month][day]) {
      planner[year][month][day] = { tasks: [] };
    }

    const dayData = planner[year][month][day];

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    const number = document.createElement("div");
    number.classList.add("day-number");
    number.textContent = day;

    dayDiv.appendChild(number);

    /* Display Tasks */
    dayData.tasks.forEach((taskObj, index) => {

      const taskDiv = document.createElement("div");
      taskDiv.classList.add("task");

      if (taskObj.completed) {
        taskDiv.style.textDecoration = "line-through";
        taskDiv.style.opacity = "0.6";
      }

      const span = document.createElement("span");
      span.textContent = taskObj.text;

      /* ✔ Tick Button */
      const tickBtn = document.createElement("button");
      tickBtn.textContent = "✔";
      tickBtn.style.background = "green";

      tickBtn.onclick = (e) => {
        e.stopPropagation();
        taskObj.completed = !taskObj.completed;
        saveData();
        generateCalendar();
      };

      /* ❌ Delete Button */
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "X";
      deleteBtn.style.background = "red";

      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        dayData.tasks.splice(index, 1);
        saveData();
        generateCalendar();
      };

      taskDiv.appendChild(span);
      taskDiv.appendChild(tickBtn);
      taskDiv.appendChild(deleteBtn);

      dayDiv.appendChild(taskDiv);
    });

    /* Add Task */
    dayDiv.addEventListener("click", () => {
      const taskText = prompt("Enter task:");
      if (taskText) {
        dayData.tasks.push({
          text: taskText,
          completed: false
        });
        saveData();
        generateCalendar();
      }
    });

    calendar.appendChild(dayDiv);
  }

  updateProgress(year, month);
}

yearSelect.addEventListener("change", generateCalendar);
monthSelect.addEventListener("change", generateCalendar);

generateCalendar();

/* 🔔 Reminder */
if ("Notification" in window) {
  Notification.requestPermission();

  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 9 && now.getMinutes() === 0) {
      new Notification("Planner Reminder 🔔", {
        body: "Check today's tasks!"
      });
    }
  }, 60000);
}
