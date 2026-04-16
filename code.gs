const SHEET_ID = "15h5H_Dw7MDUq9_hIcyLyB3rbXukacjVde5nmAZgyve4";
const CLIENTS_SHEET_NAME = "Clients";
const QUEUE_SHEET_NAME = "Queue";

function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  template.view = (e && e.parameter && e.parameter.view) ? e.parameter.view : "client";
  return template.evaluate().setTitle("Queue System");
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function getClientsSheet() {
  const sheet = getSpreadsheet().getSheetByName(CLIENTS_SHEET_NAME);
  if (!sheet) throw new Error(`Sheet '${CLIENTS_SHEET_NAME}' not found.`);
  return sheet;
}

function getQueueSheet() {
  const sheet = getSpreadsheet().getSheetByName(QUEUE_SHEET_NAME);
  if (!sheet) throw new Error(`Sheet '${QUEUE_SHEET_NAME}' not found.`);
  return sheet;
}

function getTodayString() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function getCurrentTime() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "h:mm a");
}

function formatTimeValue(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "h:mm a");
  }
  return String(value).trim();
}

function normalizeDateValue(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value).trim();
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function titleCase(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

function getClientsData() {
  const sheet = getClientsSheet();
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return [];

  return values.slice(1)
    .filter(row => String(row[0]).trim() !== "")
    .map(row => ({
      clientId: String(row[0]).trim(),
      firstName: String(row[1] || "").trim(),
      lastName: String(row[2] || "").trim(),
      createdDate: normalizeDateValue(row[3])
    }));
}

function getQueueData() {
  const sheet = getQueueSheet();
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return [];

  return values.slice(1)
    .filter(row => String(row[0]).trim() !== "")
    .map(row => ({
      queueId: String(row[0]).trim(),
      queueNumber: Number(row[1]) || 0,
      clientId: String(row[2] || "").trim(),
      firstName: String(row[3] || "").trim(),
      lastName: String(row[4] || "").trim(),
      clientType: String(row[5] || "").trim(),
      status: String(row[6] || "").trim(),
      timeIn: formatTimeValue(row[7]),
      date: normalizeDateValue(row[8])
    }))
    .filter(item => item.status !== "Done")
    .sort((a, b) => a.queueNumber - b.queueNumber);
}

function findMatchingClients(firstName, lastName) {
  const clients = getClientsData();
  const first = normalizeName(firstName);
  const last = normalizeName(lastName);

  return clients.filter(client =>
    normalizeName(client.firstName) === first &&
    normalizeName(client.lastName) === last
  );
}

function generateNextClientId() {
  const clients = getClientsData();

  if (clients.length === 0) return "C1001";

  const maxNumber = clients.reduce((max, client) => {
    const match = client.clientId.match(/^C(\d+)$/i);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 1000);

  return "C" + (maxNumber + 1);
}

function createClient(firstName, lastName) {
  const sheet = getClientsSheet();
  const clientId = generateNextClientId();
  const today = getTodayString();

  const cleanFirst = titleCase(firstName);
  const cleanLast = titleCase(lastName);

  sheet.appendRow([
    clientId,
    cleanFirst,
    cleanLast,
    today
  ]);

  SpreadsheetApp.flush();

  return {
    clientId,
    firstName: cleanFirst,
    lastName: cleanLast,
    clientType: "New"
  };
}

function findActiveQueueEntryForToday(clientId) {
  const today = getTodayString();
  const queue = getQueueData();

  return queue.find(item =>
    item.clientId === clientId &&
    item.date === today &&
    ["Waiting", "In Office", "Ready"].includes(item.status)
  ) || null;
}

function addToQueue(client) {
  const existingEntry = findActiveQueueEntryForToday(client.clientId);

  if (existingEntry) {
    return {
      success: false,
      alreadySignedIn: true,
      queueNumber: existingEntry.queueNumber,
      clientType: existingEntry.clientType,
      clientId: existingEntry.clientId,
      status: existingEntry.status
    };
  }

  const queueSheet = getQueueSheet();
  const today = getTodayString();
  const todaysQueue = getQueueData().filter(item => item.date === today);

  const nextQueueNumber = todaysQueue.length + 1;
  const queueId = "Q" + new Date().getTime();

  queueSheet.appendRow([
    queueId,
    nextQueueNumber,
    client.clientId,
    client.firstName,
    client.lastName,
    client.clientType,
    "Waiting",
    getCurrentTime(),
    today
  ]);

  SpreadsheetApp.flush();

  return {
    success: true,
    queueNumber: nextQueueNumber,
    clientType: client.clientType,
    clientId: client.clientId
  };
}

function beginSignIn(firstName, lastName) {
  firstName = String(firstName || "").trim();
  lastName = String(lastName || "").trim();

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required.");
  }

  const matches = findMatchingClients(firstName, lastName);

  if (matches.length > 0) {
    return {
      requiresConfirmation: true,
      firstName: titleCase(firstName),
      lastName: titleCase(lastName),
      matchedClient: matches[0]
    };
  }

  const newClient = createClient(firstName, lastName);
  const result = addToQueue(newClient);

  return {
    requiresConfirmation: false,
    result: result
  };
}

function confirmExistingClientSignIn(clientId) {
  clientId = String(clientId || "").trim();
  const clients = getClientsData();
  const client = clients.find(c => c.clientId === clientId);

  if (!client) {
    throw new Error("Matching client not found.");
  }

  return addToQueue({
    clientId: client.clientId,
    firstName: client.firstName,
    lastName: client.lastName,
    clientType: "Returning"
  });
}

function createDifferentPersonAndSignIn(firstName, lastName) {
  firstName = String(firstName || "").trim();
  lastName = String(lastName || "").trim();

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required.");
  }

  const newClient = createClient(firstName, lastName);
  return addToQueue(newClient);
}

function updateQueueStatus(queueId, newStatus) {
  const allowedStatuses = ["Waiting", "In Office", "Ready", "Done"];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error("Invalid status.");
  }

  const sheet = getQueueSheet();
  const values = sheet.getDataRange().getValues();

  if (newStatus === "In Office") {
    for (let i = 1; i < values.length; i++) {
      const existingStatus = String(values[i][6]).trim();
      const existingQueueId = String(values[i][0]).trim();

      if (existingStatus === "In Office" && existingQueueId !== String(queueId).trim()) {
        throw new Error("Another client is already in office.");
      }
    }
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(queueId).trim()) {
      sheet.getRange(i + 1, 7).setValue(newStatus);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }

  throw new Error("Queue item not found.");
}

function removeQueueItem(queueId) {
  const sheet = getQueueSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]).trim() === String(queueId).trim()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }

  throw new Error("Queue item not found.");
}

function callNextClient() {
  const sheet = getQueueSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][6]).trim() === "In Office") {
      return {
        success: false,
        message: "A client is already in office."
      };
    }
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][6]).trim() === "Waiting") {
      sheet.getRange(i + 1, 7).setValue("In Office");
      SpreadsheetApp.flush();
      return { success: true };
    }
  }

  return {
    success: false,
    message: "No waiting clients."
  };
}

function resetTodayQueue() {
  const sheet = getQueueSheet();
  const values = sheet.getDataRange().getValues();
  const today = getTodayString();

  for (let i = values.length - 1; i >= 1; i--) {
    const rowDate = normalizeDateValue(values[i][8]);
    if (rowDate === today) {
      sheet.deleteRow(i + 1);
    }
  }

  SpreadsheetApp.flush();
  return { success: true };
}