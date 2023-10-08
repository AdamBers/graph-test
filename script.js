// Создаем массив data
const data = [
  {
    tableId: "table1",
    graphId: "graph1",
    data: [],
  },
  {
    tableId: "table2",
    graphId: "graph2",
    data: [],
  },
  {
    tableId: "table3",
    graphId: "graph3",
    data: [],
  },
];

// Добавляем функцию addRow
function addRow(tableId) {
  const table = data.find((item) => item.tableId === tableId);
  if (table) {
    table.data.push({ x: 0, y: 0 });
    drawTable(tableId);
  }
}

document.getElementById("addRow1").addEventListener("click", () => {
  addRow("table1");
});
document.getElementById("addRow2").addEventListener("click", () => {
  addRow("table2");
});

// Добавляем функцию deleteRow
function deleteRow(tableId, rowNumber) {
  const table = data.find((item) => item.tableId === tableId);
  if (table) {
    table.data.splice(rowNumber, 1);
  }
  drawTable(tableId);
}

// Добавляем функцию Calculate
function calculate() {
  data[2].data = [];
  const minRowCount = Math.min(data[0].data.length, data[1].data.length);
  for (let i = 0; i < minRowCount; i++) {
    const row1 = data[0].data[i];
    const row2 = data[1].data[i];
    if (row1 && row2) {
      const newRow = {
        x: (row1.x + row2.x) / 2,
        y: (row1.y + row2.y) / 2,
      };
      data[2].data.push(newRow);
    }
  }
}
document.getElementById("calculate").addEventListener("click", () => {
  calculate();
  drawTable("table3");
  if (data[2].data.length > 0) {
    drawGraph("graph1");
    drawGraph("graph2");
    drawGraph("graph3");
  }
});

// Добавляем функцию drawTable
function drawTable(tableId) {
  const tableDiv = document.getElementById(tableId);
  const tbody = tableDiv.getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";
  let tableNum = data.findIndex((item) => item.tableId === tableId);
  const currentData = data[tableNum].data;
  currentData.forEach((item, index) => {
    let newRow = tbody.insertRow(-1);
    const cell1 = newRow.insertCell(-1);
    const cell2 = newRow.insertCell(-1);
    if (tableId !== "table3") {
      const cell3 = newRow.insertCell(-1);
      cell3.innerHTML = `<button class="deleteRow" >Delete</button>`;
      const deleteButton = cell3.querySelector(".deleteRow");
      deleteButton.addEventListener("click", () => {
        deleteRow(tableId, index);
      });
    }
    // ChangeHandler for X
    const xInput = document.createElement("input");
    xInput.type = "number";
    xInput.value = item.x;
    const xChangeHandler = (event) => {
      data[tableNum].data[index].x = parseFloat(event.target.value) || 0;
      drawTable(tableId);
    };
    xInput.addEventListener("change", xChangeHandler);
    // ChangeHandler for Y
    const yInput = document.createElement("input");
    yInput.type = "number";
    yInput.value = item.y;
    const yChangeHandler = (event) => {
      data[tableNum].data[index].y = parseFloat(event.target.value) || 0;
      drawTable(tableId);
    };
    yInput.addEventListener("change", yChangeHandler);
    cell1.appendChild(xInput);
    cell2.appendChild(yInput);
  });
}

// Добавляем функцию drawGraph
function drawGraph(graphId) {
  const curData = data.find((item) => item.graphId === graphId)?.data;
  if (data[0].data.length < 1 || data[1].data.length < 1) {
    // alert("Добавьте данные в обе таблицы");
    return 0;
  }
  const canvas = document.getElementById(graphId);
  const ctx = canvas.getContext("2d");

  canvas.width =
    canvas.parentElement.clientWidth - canvas.parentElement.clientWidth / 10;
  canvas.height =
    canvas.parentElement.clientHeight - canvas.parentElement.clientHeight / 10;

  const width = canvas.width;
  const height = canvas.height;

  // Настраиваем параметры графика
  // const minX = Math.min(...curData.map((point) => point.x));
  // const minY = Math.min(...curData.map((point) => point.y));
  const minX = 0;
  const minY = 0;
  const maxX = Math.max(...curData.map((point) => point.x));
  const maxY = Math.max(...curData.map((point) => point.y));

  const xRange = maxX - minX;
  const yRange = maxY - minY;

  const xStep = (width - 80) / xRange;
  const yStep = (height - 80) / yRange;

  // Рисуем оси
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.moveTo(40, height - 40); // Начало оси X
  ctx.lineTo(width - 40, height - 40); // Конец оси X
  ctx.moveTo(40, 40); // Начало оси Y
  ctx.lineTo(40, height - 40); // Конец оси Y
  ctx.strokeStyle = "blue";
  ctx.stroke();

  // Рисуем риски и подписи по осям X и Y
  for (let i = 0; i <= xRange; i++) {
    const x = 40 + i * xStep;
    ctx.beginPath();
    ctx.moveTo(x, height - 50);
    ctx.lineTo(x, height - 30);
    ctx.stroke();
    ctx.fillText(minX + i, x - 5, height - 10);
  }

  for (let i = 0; i <= yRange; i++) {
    const y = height - 40 - i * yStep;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(50, y);
    ctx.stroke();
    ctx.fillText(minY + i, 10, y + 5);
  }

  // Рисуем линию графика
  ctx.beginPath();
  ctx.moveTo(
    40 + (curData[0].x - minX) * xStep,
    height - 40 - (curData[0].y - minY) * yStep
  );
  curData.forEach((point) => {
    const x = 40 + (point.x - minX) * xStep;
    const y = height - 40 - (point.y - minY) * yStep;
    ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Добавляем подписи осей X и Y
  ctx.fillStyle = "blue";
  ctx.fillText("X", width - 20, height - 35);
  ctx.fillText("Y", 37, 20);
}

const graphContainers = document.querySelectorAll(".graph");
let resizeTimeout;

const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      drawGraph("graph1");
      drawGraph("graph2");
      drawGraph("graph3");
    }, 500);
  });
});

graphContainers.forEach((container) => {
  resizeObserver.observe(container);
});
