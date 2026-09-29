const ITCYBER_SUPABASE_WEBHOOK =
  "https://bvygcyllsdkqxjvdlrno.supabase.co/functions/v1/google-form-admission";

/**
 * Install once from a script bound to the Google Form.
 * It creates an installable "On form submit" trigger.
 */
function installITCyberAdmissionSync() {
  const form = FormApp.getActiveForm();
  if (!form) throw new Error("Open this Apps Script from the Google Form first.");

  // Avoid duplicate triggers if setup is run more than once.
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "syncITCyberAdmission")
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("syncITCyberAdmission")
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log("ITCYBER Google Form → Supabase sync installed.");
}

/**
 * Automatically runs whenever a new Google Form response is submitted.
 */
function syncITCyberAdmission(e) {
  if (!e || !e.response) throw new Error("This function must run from the form-submit trigger.");
  sendResponseToITCyber(e.response);
}

/**
 * Run once if you want to import responses that were submitted before
 * the integration was installed. Safe to run again because Supabase
 * de-duplicates by Google response ID.
 */
function syncExistingITCyberResponses() {
  const form = FormApp.getActiveForm();
  if (!form) throw new Error("Open this Apps Script from the Google Form first.");

  const responses = form.getResponses();
  responses.forEach(sendResponseToITCyber);
  Logger.log("Existing Google Form responses synced: " + responses.length);
}

function sendResponseToITCyber(response) {
  const namedValues = {};

  response.getItemResponses().forEach(itemResponse => {
    const title = itemResponse.getItem().getTitle();
    const answer = itemResponse.getResponse();
    namedValues[title] = Array.isArray(answer) ? answer : String(answer ?? "");
  });

  // Collected email may not appear as a normal question.
  try {
    const respondentEmail = response.getRespondentEmail();
    if (respondentEmail && !namedValues["Email"]) {
      namedValues["Email"] = respondentEmail;
    }
  } catch (_) {}

  const payload = {
    responseId: response.getId(),
    timestamp: response.getTimestamp().toISOString(),
    namedValues
  };

  const result = UrlFetchApp.fetch(ITCYBER_SUPABASE_WEBHOOK, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = result.getResponseCode();
  const body = result.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error("ITCYBER Supabase sync failed (" + code + "): " + body);
  }

  return body;
}
