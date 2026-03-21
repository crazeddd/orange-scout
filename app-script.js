function doPost(e) {
  var SHEET_NAME = "Raw Data";

  try {
    var data = JSON.parse(e.postData.contents);
    var entries = data.entries || data.submission || [];

    if (data.secret != "YOUR_SECRET") throw new Error("Invalid Secret: " + data.secret);
    if (!Array.isArray(entries) || entries.length === 0) throw new Error("No entries provided.");

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet '" + SHEET_NAME + "' not found. Please create it.");
    }

    entries.forEach((entry) => {
      var newRow = [
        new Date(),
        data.scoutName || "",
        entry.matchNumber || "",
        entry.teamNumber || "",
        entry.startingPosition || "",
        entry.alliance || "",
        entry.autonClimbLevel || "",
        entry.teleopClimbLevel || "",
        entry.playedDefense ? "Yes" : "No",
        entry.teamPointsPercentage || 0,
        entry.accuracyPercentage || 0,
        entry.notes || "",
        entry.createdAt || ""
      ];

      sheet.appendRow(newRow);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    Logger.log(error);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}