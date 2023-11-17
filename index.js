//   const input = req.body;
let input = "010628108631004510114819017260601210000000000UA0";

function mainHandler(input) {
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
}

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

console.log(mainHandler(input));
