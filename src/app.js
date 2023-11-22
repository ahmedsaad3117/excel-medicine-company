const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const reader = require("node-xlsx");
const path = require("path");
const multer = require("multer");

const app = express();
const port = 3002;

app.use(bodyParser.text());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.text());

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 megabytes limit
  fileFilter: (req, file, cb) => {
    // Check if the file has a valid Excel extension
    const allowedFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  },
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/transform", upload.single("excelFile"), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send("No file uploaded");
      return;
    }

    let data = [];

    const obj = reader.parse(req.file.buffer);

    obj[0].data.forEach((row) => {
      data.push(mainHandler(row[0]));
    });

    const sheet = [["Existing Data"], [""], ["New Data"]];
    data.forEach((value) => {
      sheet.push(["", value]);
    });

    const buffer = reader.build([{ name: "Sheet 1", data: sheet }]);
    fs.writeFileSync("output.xlsx", buffer);

    res.download("output.xlsx", "output.xlsx");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/transform", (req, res) => {
//   //   const input = req.body;

//   let data = [];

//   var obj = reader.parse(fs.readFileSync("80813576.xlsx"));

//   obj[0].data.forEach((res) => {
//     data.push(mainHandler(res[0]));
//   });

//   const sheet = [["Existing Data"], [""], ["New Data"]];
//   data.forEach((value) => {
//     sheet.push(["", value]); // Add an empty cell in the first column for each row
//   });

//   // Create a buffer for the Excel file
//   const buffer = reader.build([{ name: "Sheet 1", data: sheet }]);
//   fs.writeFileSync("80813576.xlsx", buffer);

//   // Write the buffer to a file

//   res.send("send");
// });

function dateHandler(inputDate) {
  // Extract day, month, and year components
  const twoDigitYear = inputDate.substring(0, 2);
  const month = inputDate.substring(2, 4);
  const day = inputDate.substring(4);

  // Convert two-digit year to four-digit year for the range 2000-2099
  const fourDigitYear =
    twoDigitYear >= 0 && twoDigitYear <= 99
      ? 2000 + parseInt(twoDigitYear, 10)
      : parseInt(twoDigitYear, 10);

  // Create a formatted date string
  const formattedDate = `${String(day).padStart(2, "0")}/${String(
    month
  ).padStart(2, "0")}/${fourDigitYear}`;

  return formattedDate;
}

function mainHandler(input) {
  try {
    if (!input) {
      res.status(400).send("Invalid input");
      return;
    }
    const regex01 = /01(\d{14})/;
    const regex17WithDate = /17(\d{2}[01]\d[0-3]\d)/;
    const regex21 = /.{3,}(21)(.*)/;
    const regex10 = /.{5,}(10)(.*)/;

    // Extract values using regular expressions
    const valueGUID = input.match(regex01)[1];
    input = input.replace("01" + valueGUID, "");
    console.log(input, "new1");

    const valueDate17 = input.match(regex17WithDate)[1];
    input = input.replace(`17${valueDate17}`, "");
    console.log(valueDate17, "----", input, "new2");

    let valueDate21SN;
    let valueDate10BT;
    if (input.startsWith("10")) {
      valueDate21SN = input.match(regex21)[2];
      input = input.replace(`21${valueDate21SN}`, "");
      console.log(valueDate21SN, "----", input, "new3");

      valueDate10BT = input.substring(2);
    }

    if (input.startsWith("21")) {
      valueDate10BT = input.match(regex10)[2];
      input = input.replace(`10${valueDate10BT}`, "");
      console.log(valueDate10BT, "----", input, "new3");

      valueDate21SN = input.substring(2);
    }

    const dateFromted = dateHandler(valueDate17);

    const output = `${valueGUID};${valueDate21SN};${valueDate10BT};${dateFromted}`;

    return output;
  } catch (err) {
    console.log(err);
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
