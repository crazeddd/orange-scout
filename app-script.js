var RAW_SHEET_NAME = "Raw Data";
var MASTER_SHEET_NAME = "Master Sheet";
var RAW_HEADERS = [
  "Received At",
  "Scout Name",
  "Entry Type",
  "Match Number",
  "Team Number",
  "Starting Position",
  "Alliance",
  "Auton Climb Level",
  "Teleop Climb Level",
  "Played Defense",
  "Disconnected",
  "No Show",
  "Estimated Auto Fuel Scored",
  "Estimated Teleop Fuel Scored",
  "Passed Fuel",
  "Passed Fuel Amount",
  "Used Corral",
  "Drivetrain",
  "Gear Ratio",
  "Fuel Capacity",
  "Autonomous Summary",
  "Teleop Summary",
  "Pit Climb Capability",
  "Can Go Under Trench",
  "Can Go Over Bump",
  "Notes",
  "Created At"
];

var MASTER_HEADERS = [
  "Team",
  "Scout Entries",
  "Avg Auto Fuel",
  "Avg Teleop Fuel",
  "Avg Total Fuel",
  "Teleop Climb Success %",
  "Auton Climb Success %",
  "Defense %",
  "Passed Fuel %",
  "Avg Passed Amount",
  "Disconnected %",
  "No Show %",
  "Pit Climb Capability",
  "Drivetrain"
];

var MASTER_SORT_OPTIONS = [
  "Avg Total Fuel",
  "Avg Auto Fuel",
  "Avg Teleop Fuel",
  "Teleop Climb Success %",
  "Auton Climb Success %",
  "Defense %",
  "Passed Fuel %",
  "Avg Passed Amount",
  "Disconnected %",
  "No Show %",
  "Team"
];

function formatStartingPosition(position) {
  if (position === "hub") return "Hub";
  if (position === "trench" || position === "trench (left)") return "Trench (left)";
  if (position === "fender" || position === "trench (right)") return "Trench (right)";
  if (position === "bump" || position === "bump (left)") return "Bump (left)";
  if (position === "other" || position === "bump (right)") return "Bump (right)";
  return position || "";
}

function ensureHeaders(sheet, headers) {
  var maxColumns = sheet.getMaxColumns();
  if (maxColumns < headers.length) {
    sheet.insertColumnsAfter(maxColumns, headers.length - maxColumns);
  }

  var needsHeader = sheet.getLastRow() === 0;
  if (!needsHeader) {
    var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      if (current[i] !== headers[i]) {
        needsHeader = true;
        break;
      }
    }
  }

  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  sheet.setFrozenRows(1);
}

function toBool(value) {
  return value === true || value === "Yes";
}

function toNumber(value) {
  var num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toDateTime(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === "[object Date]") return value;
  var parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function asPercent(numerator, denominator) {
  if (!denominator) return "0.0%";
  return ((numerator / denominator) * 100).toFixed(1) + "%";
}

function isSuccessfulClimb(level) {
  return level === "L1" || level === "L2" || level === "L3";
}

function getLatestPitEntry(pitEntries) {
  if (!pitEntries || pitEntries.length === 0) return null;
  var copy = pitEntries.slice();
  copy.sort(function(a, b) {
    var aDate = toDateTime(a.createdAt) || toDateTime(a.receivedAt) || new Date(0);
    var bDate = toDateTime(b.createdAt) || toDateTime(b.receivedAt) || new Date(0);
    return bDate.getTime() - aDate.getTime();
  });
  return copy[0];
}

function deriveTeamStats(teamNumber, pitEntries, scoutEntries) {
  var scoutCount = scoutEntries.length;
  var autoFuelTotal = 0;
  var teleFuelTotal = 0;
  var passedFuelCount = 0;
  var passedFuelAmountTotal = 0;
  var defenseCount = 0;
  var disconnectedCount = 0;
  var noShowCount = 0;
  var teleClimbSuccessCount = 0;
  var autonClimbSuccessCount = 0;

  for (var i = 0; i < scoutEntries.length; i++) {
    var entry = scoutEntries[i];
    autoFuelTotal += toNumber(entry.estimatedAutoFuelScored);
    teleFuelTotal += toNumber(entry.estimatedTeleopFuelScored);
    if (toBool(entry.passedFuel)) {
      passedFuelCount += 1;
      passedFuelAmountTotal += toNumber(entry.passedFuelAmount);
    }
    if (toBool(entry.playedDefense)) defenseCount += 1;
    if (toBool(entry.disconnected)) disconnectedCount += 1;
    if (toBool(entry.noShow)) noShowCount += 1;
    if (isSuccessfulClimb(entry.teleopClimbLevel)) teleClimbSuccessCount += 1;
    if (isSuccessfulClimb(entry.autonClimbLevel)) autonClimbSuccessCount += 1;
  }

  var latestPit = getLatestPitEntry(pitEntries);

  return {
    teamNumber: teamNumber,
    scoutCount: scoutCount,
    avgAutoFuel: scoutCount ? autoFuelTotal / scoutCount : 0,
    avgTeleFuel: scoutCount ? teleFuelTotal / scoutCount : 0,
    avgTotalFuel: scoutCount ? (autoFuelTotal + teleFuelTotal) / scoutCount : 0,
    teleClimbSuccessRate: scoutCount ? (teleClimbSuccessCount / scoutCount) : 0,
    autonClimbSuccessRate: scoutCount ? (autonClimbSuccessCount / scoutCount) : 0,
    defenseRate: scoutCount ? (defenseCount / scoutCount) : 0,
    passedFuelRate: scoutCount ? (passedFuelCount / scoutCount) : 0,
    avgPassedFuelAmount: passedFuelCount ? (passedFuelAmountTotal / passedFuelCount) : 0,
    disconnectedRate: scoutCount ? (disconnectedCount / scoutCount) : 0,
    noShowRate: scoutCount ? (noShowCount / scoutCount) : 0,
    pitClimbCapability: latestPit ? (latestPit.climbCapability || "") : "",
    drivetrain: latestPit ? (latestPit.drivetrain || "") : "",
    latestPit: latestPit
  };
}

function buildTeamRows(teamNumber, pitEntries, scoutEntries) {
  var rows = [];
  var stats = deriveTeamStats(teamNumber, pitEntries, scoutEntries);

  rows.push(["Team " + teamNumber + " Summary"]);
  rows.push(["Last Updated", new Date()]);
  rows.push([""]);

  rows.push(["Pit Information"]);
  if (!stats.latestPit) {
    rows.push(["No pit data available yet."]);
  } else {
    var latestPit = stats.latestPit;
    rows.push(["Scout Name", latestPit.scoutName || ""]);
    rows.push(["Drivetrain", latestPit.drivetrain || ""]);
    rows.push(["Gear Ratio", latestPit.gearRatio || ""]);
    rows.push(["Fuel Capacity", toNumber(latestPit.fuelCapacity)]);
    rows.push(["Climb Capability", latestPit.climbCapability || ""]);
    rows.push(["Can Go Under Trench", toBool(latestPit.canGoUnderTrench) ? "Yes" : "No"]);
    rows.push(["Can Go Over Bump", toBool(latestPit.canGoOverBump) ? "Yes" : "No"]);
    rows.push(["Autonomous Summary", latestPit.autonomousSummary || ""]);
    rows.push(["Teleop Summary", latestPit.teleopSummary || ""]);
    rows.push(["Notes", latestPit.notes || ""]);
  }

  rows.push([""]);
  rows.push(["Scouting Averages"]);

  rows.push(["Scout Entries", stats.scoutCount]);
  rows.push(["Average Auto Fuel", stats.avgAutoFuel.toFixed(2)]);
  rows.push(["Average Teleop Fuel", stats.avgTeleFuel.toFixed(2)]);
  rows.push(["Average Total Fuel", stats.avgTotalFuel.toFixed(2)]);
  rows.push(["Teleop Climb Success Rate", asPercent(stats.teleClimbSuccessRate, 1)]);
  rows.push(["Auton Climb Success Rate", asPercent(stats.autonClimbSuccessRate, 1)]);
  rows.push(["Played Defense Rate", asPercent(stats.defenseRate, 1)]);
  rows.push(["Passed Fuel Rate", asPercent(stats.passedFuelRate, 1)]);
  rows.push(["Average Passed Fuel Amount", stats.avgPassedFuelAmount.toFixed(2)]);
  rows.push(["Disconnected Rate", asPercent(stats.disconnectedRate, 1)]);
  rows.push(["No Show Rate", asPercent(stats.noShowRate, 1)]);

  rows.push([""]);
  rows.push(["Scouting Match Log"]);
  rows.push([
    "Match",
    "Created At",
    "Scout",
    "Alliance",
    "Starting Position",
    "Auto Fuel",
    "Teleop Fuel",
    "Auton Climb",
    "Teleop Climb",
    "Passed Fuel",
    "Passed Amount",
    "Used Corral",
    "Defense",
    "Disconnected",
    "No Show",
    "Notes"
  ]);

  scoutEntries.sort(function(a, b) {
    var matchDiff = toNumber(a.matchNumber) - toNumber(b.matchNumber);
    if (matchDiff !== 0) return matchDiff;
    var aDate = toDateTime(a.createdAt) || new Date(0);
    var bDate = toDateTime(b.createdAt) || new Date(0);
    return aDate.getTime() - bDate.getTime();
  });

  for (var j = 0; j < scoutEntries.length; j++) {
    var scout = scoutEntries[j];
    rows.push([
      toNumber(scout.matchNumber),
      scout.createdAt || "",
      scout.scoutName || "",
      scout.alliance || "",
      formatStartingPosition(scout.startingPosition),
      toNumber(scout.estimatedAutoFuelScored),
      toNumber(scout.estimatedTeleopFuelScored),
      scout.autonClimbLevel || "",
      scout.teleopClimbLevel || "",
      toBool(scout.passedFuel) ? "Yes" : "No",
      toNumber(scout.passedFuelAmount),
      toBool(scout.usedCorral) ? "Yes" : "No",
      toBool(scout.playedDefense) ? "Yes" : "No",
      toBool(scout.disconnected) ? "Yes" : "No",
      toBool(scout.noShow) ? "Yes" : "No",
      scout.notes || ""
    ]);
  }

  return rows;
}

function writeTeamSheet(teamSheet, rows) {
  teamSheet.clearContents();
  teamSheet.clearFormats();

  var width = 16;
  var paddedRows = rows.map(function(row) {
    var copy = row.slice();
    while (copy.length < width) copy.push("");
    return copy;
  });

  teamSheet.getRange(1, 1, paddedRows.length, width).setValues(paddedRows);
  teamSheet.getRange(1, 1).setFontWeight("bold").setFontSize(14);
  teamSheet.autoResizeColumns(1, width);
  teamSheet.setFrozenRows(1);
}

function readRawBuckets(rawSheet) {
  var buckets = {};
  var lastRow = rawSheet.getLastRow();
  if (lastRow <= 1) return buckets;

  var values = rawSheet.getRange(2, 1, lastRow - 1, RAW_HEADERS.length).getValues();

  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    var teamNumber = toNumber(row[4]);
    if (teamNumber <= 0) continue;
    if (!buckets[teamNumber]) {
      buckets[teamNumber] = { pitEntries: [], scoutEntries: [] };
    }

    var item = {
      receivedAt: row[0],
      scoutName: row[1],
      type: row[2],
      matchNumber: row[3],
      teamNumber: row[4],
      startingPosition: row[5],
      alliance: row[6],
      autonClimbLevel: row[7],
      teleopClimbLevel: row[8],
      playedDefense: row[9],
      disconnected: row[10],
      noShow: row[11],
      estimatedAutoFuelScored: row[12],
      estimatedTeleopFuelScored: row[13],
      passedFuel: row[14],
      passedFuelAmount: row[15],
      usedCorral: row[16],
      drivetrain: row[17],
      gearRatio: row[18],
      fuelCapacity: row[19],
      autonomousSummary: row[20],
      teleopSummary: row[21],
      climbCapability: row[22],
      canGoUnderTrench: row[23],
      canGoOverBump: row[24],
      notes: row[25],
      createdAt: row[26]
    };

    if (item.type === "pit") {
      buckets[teamNumber].pitEntries.push(item);
    } else {
      buckets[teamNumber].scoutEntries.push(item);
    }
  }

  return buckets;
}

function buildTeamSheets(ss, buckets) {
  var teamNumbers = Object.keys(buckets).map(function(key) { return Number(key); }).sort(function(a, b) { return a - b; });

  for (var t = 0; t < teamNumbers.length; t++) {
    var team = teamNumbers[t];
    var bucket = buckets[team] || { pitEntries: [], scoutEntries: [] };

    var teamSheetName = "Team " + team;
    var teamSheet = ss.getSheetByName(teamSheetName);
    if (!teamSheet) {
      teamSheet = ss.insertSheet(teamSheetName);
    }

    var teamRows = buildTeamRows(team, bucket.pitEntries, bucket.scoutEntries);
    writeTeamSheet(teamSheet, teamRows);
  }
}

function getSortMetricIndex(metric) {
  for (var i = 0; i < MASTER_HEADERS.length; i++) {
    if (MASTER_HEADERS[i] === metric) return i;
  }
  return 4; // Avg Total Fuel
}

function buildMasterSheet(ss, buckets) {
  var masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!masterSheet) {
    masterSheet = ss.insertSheet(MASTER_SHEET_NAME);
  }

  var selectedMetric = masterSheet.getRange("B1").getValue();
  if (!selectedMetric || MASTER_SORT_OPTIONS.indexOf(selectedMetric) === -1) {
    selectedMetric = "Avg Total Fuel";
  }

  masterSheet.clearContents();
  masterSheet.clearFormats();

  masterSheet.getRange("A1").setValue("Sort Metric");
  masterSheet.getRange("B1").setValue(selectedMetric);
  masterSheet
    .getRange("B1")
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(MASTER_SORT_OPTIONS, true)
        .setAllowInvalid(false)
        .build()
    );

  masterSheet.getRange(3, 1, 1, MASTER_HEADERS.length).setValues([MASTER_HEADERS]).setFontWeight("bold");

  var teamNumbers = Object.keys(buckets).map(function(key) { return Number(key); });
  var rows = [];
  for (var i = 0; i < teamNumbers.length; i++) {
    var team = teamNumbers[i];
    var bucket = buckets[team];
    var stats = deriveTeamStats(team, bucket.pitEntries, bucket.scoutEntries);

    rows.push([
      team,
      stats.scoutCount,
      Number(stats.avgAutoFuel.toFixed(2)),
      Number(stats.avgTeleFuel.toFixed(2)),
      Number(stats.avgTotalFuel.toFixed(2)),
      Number((stats.teleClimbSuccessRate * 100).toFixed(1)),
      Number((stats.autonClimbSuccessRate * 100).toFixed(1)),
      Number((stats.defenseRate * 100).toFixed(1)),
      Number((stats.passedFuelRate * 100).toFixed(1)),
      Number(stats.avgPassedFuelAmount.toFixed(2)),
      Number((stats.disconnectedRate * 100).toFixed(1)),
      Number((stats.noShowRate * 100).toFixed(1)),
      stats.pitClimbCapability,
      stats.drivetrain
    ]);
  }

  var metricIndex = getSortMetricIndex(selectedMetric);
  rows.sort(function(a, b) {
    var aValue = a[metricIndex];
    var bValue = b[metricIndex];
    if (metricIndex === 0) {
      return aValue - bValue;
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      if (bValue !== aValue) return bValue - aValue;
      return a[0] - b[0];
    }
    return String(aValue).localeCompare(String(bValue));
  });

  if (rows.length > 0) {
    masterSheet.getRange(4, 1, rows.length, MASTER_HEADERS.length).setValues(rows);
  }

  masterSheet.autoResizeColumns(1, MASTER_HEADERS.length);
  masterSheet.setFrozenRows(3);
}

function replacePitRows(rawSheet, latestPitByTeam) {
  var teamKeys = Object.keys(latestPitByTeam);
  if (teamKeys.length === 0) return;

  var teamMap = {};
  for (var i = 0; i < teamKeys.length; i++) {
    teamMap[toNumber(teamKeys[i])] = true;
  }

  var lastRow = rawSheet.getLastRow();
  if (lastRow > 1) {
    var values = rawSheet.getRange(2, 1, lastRow - 1, RAW_HEADERS.length).getValues();
    for (var idx = values.length - 1; idx >= 0; idx--) {
      var row = values[idx];
      var isPit = row[2] === "pit";
      var teamNumber = toNumber(row[4]);
      if (isPit && teamMap[teamNumber]) {
        rawSheet.deleteRow(idx + 2);
      }
    }
  }

  var pitRows = [];
  for (var t = 0; t < teamKeys.length; t++) {
    var teamNumberKey = teamKeys[t];
    var pit = latestPitByTeam[teamNumberKey];
    pitRows.push([
      new Date(),
      pit.scoutName || "",
      "pit",
      "",
      toNumber(pit.teamNumber),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      pit.drivetrain || "",
      pit.gearRatio || "",
      toNumber(pit.fuelCapacity),
      pit.autonomousSummary || "",
      pit.teleopSummary || "",
      pit.climbCapability || "",
      pit.canGoUnderTrench ? "Yes" : "No",
      pit.canGoOverBump ? "Yes" : "No",
      pit.notes || "",
      pit.createdAt || ""
    ]);
  }

  if (pitRows.length > 0) {
    rawSheet.getRange(rawSheet.getLastRow() + 1, 1, pitRows.length, RAW_HEADERS.length).setValues(pitRows);
  }
}

function appendScoutRows(rawSheet, scoutEntries, fallbackScoutName) {
  if (scoutEntries.length === 0) return;

  var rowsToAppend = [];
  for (var i = 0; i < scoutEntries.length; i++) {
    var entry = scoutEntries[i];
    var teamNumber = toNumber(entry.teamNumber);
    if (teamNumber <= 0) continue;
    rowsToAppend.push([
      new Date(),
      entry.scoutName || fallbackScoutName || "",
      "scout",
      toNumber(entry.matchNumber),
      teamNumber,
      formatStartingPosition(entry.startingPosition),
      entry.alliance || "",
      entry.autonClimbLevel || "",
      entry.teleopClimbLevel || "",
      entry.playedDefense ? "Yes" : "No",
      entry.disconnected ? "Yes" : "No",
      entry.noShow ? "Yes" : "No",
      toNumber(entry.estimatedAutoFuelScored),
      toNumber(entry.estimatedTeleopFuelScored),
      entry.passedFuel ? "Yes" : "No",
      toNumber(entry.passedFuelAmount),
      entry.usedCorral ? "Yes" : "No",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      entry.notes || "",
      entry.createdAt || ""
    ]);
  }

  if (rowsToAppend.length > 0) {
    rawSheet.getRange(rawSheet.getLastRow() + 1, 1, rowsToAppend.length, RAW_HEADERS.length).setValues(rowsToAppend);
  }
}

function rebuildDerivedSheets(ss) {
  var rawSheet = ss.getSheetByName(RAW_SHEET_NAME);
  if (!rawSheet) return;
  var buckets = readRawBuckets(rawSheet);
  buildTeamSheets(ss, buckets);
  buildMasterSheet(ss, buckets);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var entries = data.entries || data.submission || [];

    // if (data.secret != "YOUR_SECRET") throw new Error("Invalid Secret: " + data.secret);
    if (!Array.isArray(entries) || entries.length === 0) throw new Error("No entries provided.");

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rawSheet = ss.getSheetByName(RAW_SHEET_NAME);
    if (!rawSheet) {
      rawSheet = ss.insertSheet(RAW_SHEET_NAME);
    }

    ensureHeaders(rawSheet, RAW_HEADERS);

    var scoutEntries = [];
    var latestPitByTeam = {};
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.type === "pit") {
        var pitTeamNumber = toNumber(entry.teamNumber);
        if (pitTeamNumber <= 0) continue;
        latestPitByTeam[pitTeamNumber] = {
          scoutName: entry.scoutName || data.scoutName || "",
          teamNumber: pitTeamNumber,
          drivetrain: entry.drivetrain,
          gearRatio: entry.gearRatio,
          fuelCapacity: entry.fuelCapacity,
          autonomousSummary: entry.autonomousSummary,
          teleopSummary: entry.teleopSummary,
          climbCapability: entry.climbCapability,
          canGoUnderTrench: entry.canGoUnderTrench,
          canGoOverBump: entry.canGoOverBump,
          notes: entry.notes,
          createdAt: entry.createdAt
        };
      } else {
        scoutEntries.push(entry);
      }
    }

    appendScoutRows(rawSheet, scoutEntries, data.scoutName || "");
    replacePitRows(rawSheet, latestPitByTeam);
    rebuildDerivedSheets(ss);

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

function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== MASTER_SHEET_NAME) return;
  if (e.range.getA1Notation() !== "B1") return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  rebuildDerivedSheets(ss);
}