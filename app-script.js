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
  "Auto Scoring Category",
  "Scoring Category",
  "Missed Balls Per Cycle",
  "Shooting Accuracy",
  "Driving Quality",
  "Driving Quality Notes",
  "Defense Rating",
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

function buildHeaderMap(headers) {
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[headers[i]] = i;
  }
  return map;
}

var RAW_HEADER_INDEX = buildHeaderMap(RAW_HEADERS);

function createRawRow() {
  var row = [];
  for (var i = 0; i < RAW_HEADERS.length; i++) {
    row.push("");
  }
  return row;
}

function setRawValue(row, header, value) {
  var index = RAW_HEADER_INDEX[header];
  if (typeof index === "number") {
    row[index] = value;
  }
}

function getRawValue(row, header) {
  var index = RAW_HEADER_INDEX[header];
  if (typeof index !== "number") return "";
  return row[index];
}

var MASTER_HEADERS = [
  "Team",
  "Scout Entries",
  "Auto High Scorer %",
  "Overall High Scorer %",
  "Avg Shooting Accuracy %",
  "Teleop Climb Success %",
  "Auton Climb Success %",
  "Defense %",
  "Avg Defense Rating",
  "Passed Fuel %",
  "Avg Passed Amount",
  "Disconnected %",
  "No Show %",
  "Pit Climb Capability",
  "Drivetrain"
];

var MASTER_SORT_OPTIONS = [
  "Auto High Scorer %",
  "Overall High Scorer %",
  "Avg Shooting Accuracy %",
  "Teleop Climb Success %",
  "Auton Climb Success %",
  "Defense %",
  "Avg Defense Rating",
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
  var autoHighScorerCount = 0;
  var overallHighScorerCount = 0;
  var shootingAccuracyTotal = 0;
  var passedFuelCount = 0;
  var passedFuelAmountTotal = 0;
  var defenseCount = 0;
  var defenseRatingTotal = 0;
  var disconnectedCount = 0;
  var noShowCount = 0;
  var teleClimbSuccessCount = 0;
  var autonClimbSuccessCount = 0;

  for (var i = 0; i < scoutEntries.length; i++) {
    var entry = scoutEntries[i];
    if ((entry.autoScoringCategory || "") === "high") autoHighScorerCount += 1;
    if ((entry.scoringCategory || "") === "high") overallHighScorerCount += 1;
    shootingAccuracyTotal += toNumber(entry.shootingAccuracy);
    if (toBool(entry.passedFuel)) {
      passedFuelCount += 1;
      passedFuelAmountTotal += toNumber(entry.passedFuelAmount);
    }
    if (toBool(entry.playedDefense)) defenseCount += 1;
    defenseRatingTotal += toNumber(entry.defenseRating);
    if (toBool(entry.disconnected)) disconnectedCount += 1;
    if (toBool(entry.noShow)) noShowCount += 1;
    if (isSuccessfulClimb(entry.teleopClimbLevel)) teleClimbSuccessCount += 1;
    if (isSuccessfulClimb(entry.autonClimbLevel)) autonClimbSuccessCount += 1;
  }

  var latestPit = getLatestPitEntry(pitEntries);

  return {
    teamNumber: teamNumber,
    scoutCount: scoutCount,
    autoHighScorerRate: scoutCount ? (autoHighScorerCount / scoutCount) : 0,
    overallHighScorerRate: scoutCount ? (overallHighScorerCount / scoutCount) : 0,
    avgShootingAccuracy: scoutCount ? shootingAccuracyTotal / scoutCount : 0,
    teleClimbSuccessRate: scoutCount ? (teleClimbSuccessCount / scoutCount) : 0,
    autonClimbSuccessRate: scoutCount ? (autonClimbSuccessCount / scoutCount) : 0,
    defenseRate: scoutCount ? (defenseCount / scoutCount) : 0,
    avgDefenseRating: scoutCount ? (defenseRatingTotal / scoutCount) : 0,
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
  rows.push(["Auto High Scorer Rate", asPercent(stats.autoHighScorerRate, 1)]);
  rows.push(["Overall High Scorer Rate", asPercent(stats.overallHighScorerRate, 1)]);
  rows.push(["Average Shooting Accuracy", stats.avgShootingAccuracy.toFixed(1) + "%"]);
  rows.push(["Teleop Climb Success Rate", asPercent(stats.teleClimbSuccessRate, 1)]);
  rows.push(["Auton Climb Success Rate", asPercent(stats.autonClimbSuccessRate, 1)]);
  rows.push(["Played Defense Rate", asPercent(stats.defenseRate, 1)]);
  rows.push(["Average Defense Rating", stats.avgDefenseRating.toFixed(2)]);
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
    "Auto Scorer Category",
    "Scoring Category",
    "Missed Per Cycle",
    "Shooting Accuracy",
    "Auton Climb",
    "Teleop Climb",
    "Passed Fuel",
    "Passed Amount",
    "Used Corral",
    "Defense",
    "Defense Rating",
    "Driving Quality",
    "Driving Quality Notes",
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
      scout.autoScoringCategory || "",
      scout.scoringCategory || "",
      toNumber(scout.missedBallsPerCycle),
      toNumber(scout.shootingAccuracy),
      scout.autonClimbLevel || "",
      scout.teleopClimbLevel || "",
      toBool(scout.passedFuel) ? "Yes" : "No",
      toNumber(scout.passedFuelAmount),
      toBool(scout.usedCorral) ? "Yes" : "No",
      toBool(scout.playedDefense) ? "Yes" : "No",
      toNumber(scout.defenseRating),
      scout.drivingQuality || "",
      scout.drivingQualityNotes || "",
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
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].length > width) {
      width = rows[i].length;
    }
  }
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
    var teamNumber = toNumber(getRawValue(row, "Team Number"));
    if (teamNumber <= 0) continue;
    if (!buckets[teamNumber]) {
      buckets[teamNumber] = { pitEntries: [], scoutEntries: [] };
    }

    var item = {
      receivedAt: getRawValue(row, "Received At"),
      scoutName: getRawValue(row, "Scout Name"),
      type: getRawValue(row, "Entry Type"),
      matchNumber: getRawValue(row, "Match Number"),
      teamNumber: getRawValue(row, "Team Number"),
      startingPosition: getRawValue(row, "Starting Position"),
      alliance: getRawValue(row, "Alliance"),
      autonClimbLevel: getRawValue(row, "Auton Climb Level"),
      teleopClimbLevel: getRawValue(row, "Teleop Climb Level"),
      playedDefense: getRawValue(row, "Played Defense"),
      disconnected: getRawValue(row, "Disconnected"),
      noShow: getRawValue(row, "No Show"),
      autoScoringCategory: getRawValue(row, "Auto Scoring Category"),
      scoringCategory: getRawValue(row, "Scoring Category"),
      missedBallsPerCycle: getRawValue(row, "Missed Balls Per Cycle"),
      shootingAccuracy: getRawValue(row, "Shooting Accuracy"),
      drivingQuality: getRawValue(row, "Driving Quality"),
      drivingQualityNotes: getRawValue(row, "Driving Quality Notes"),
      defenseRating: getRawValue(row, "Defense Rating"),
      passedFuel: getRawValue(row, "Passed Fuel"),
      passedFuelAmount: getRawValue(row, "Passed Fuel Amount"),
      usedCorral: getRawValue(row, "Used Corral"),
      drivetrain: getRawValue(row, "Drivetrain"),
      gearRatio: getRawValue(row, "Gear Ratio"),
      fuelCapacity: getRawValue(row, "Fuel Capacity"),
      autonomousSummary: getRawValue(row, "Autonomous Summary"),
      teleopSummary: getRawValue(row, "Teleop Summary"),
      climbCapability: getRawValue(row, "Pit Climb Capability"),
      canGoUnderTrench: getRawValue(row, "Can Go Under Trench"),
      canGoOverBump: getRawValue(row, "Can Go Over Bump"),
      notes: getRawValue(row, "Notes"),
      createdAt: getRawValue(row, "Created At")
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
  return 4; // Avg Shooting Accuracy %
}

function buildMasterSheet(ss, buckets) {
  var masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!masterSheet) {
    masterSheet = ss.insertSheet(MASTER_SHEET_NAME);
  }

  var selectedMetric = masterSheet.getRange("B1").getValue();
  if (!selectedMetric || MASTER_SORT_OPTIONS.indexOf(selectedMetric) === -1) {
    selectedMetric = "Avg Shooting Accuracy %";
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
      Number((stats.autoHighScorerRate * 100).toFixed(1)),
      Number((stats.overallHighScorerRate * 100).toFixed(1)),
      Number(stats.avgShootingAccuracy.toFixed(1)),
      Number((stats.teleClimbSuccessRate * 100).toFixed(1)),
      Number((stats.autonClimbSuccessRate * 100).toFixed(1)),
      Number((stats.defenseRate * 100).toFixed(1)),
      Number(stats.avgDefenseRating.toFixed(2)),
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
      var isPit = getRawValue(row, "Entry Type") === "pit";
      var teamNumber = toNumber(getRawValue(row, "Team Number"));
      if (isPit && teamMap[teamNumber]) {
        rawSheet.deleteRow(idx + 2);
      }
    }
  }

  var pitRows = [];
  for (var t = 0; t < teamKeys.length; t++) {
    var teamNumberKey = teamKeys[t];
    var pit = latestPitByTeam[teamNumberKey];
    var pitRow = createRawRow();
    setRawValue(pitRow, "Received At", new Date());
    setRawValue(pitRow, "Scout Name", pit.scoutName || "");
    setRawValue(pitRow, "Entry Type", "pit");
    setRawValue(pitRow, "Team Number", toNumber(pit.teamNumber));
    setRawValue(pitRow, "Drivetrain", pit.drivetrain || "");
    setRawValue(pitRow, "Gear Ratio", pit.gearRatio || "");
    setRawValue(pitRow, "Fuel Capacity", toNumber(pit.fuelCapacity));
    setRawValue(pitRow, "Autonomous Summary", pit.autonomousSummary || "");
    setRawValue(pitRow, "Teleop Summary", pit.teleopSummary || "");
    setRawValue(pitRow, "Pit Climb Capability", pit.climbCapability || "");
    setRawValue(pitRow, "Can Go Under Trench", pit.canGoUnderTrench ? "Yes" : "No");
    setRawValue(pitRow, "Can Go Over Bump", pit.canGoOverBump ? "Yes" : "No");
    setRawValue(pitRow, "Notes", pit.notes || "");
    setRawValue(pitRow, "Created At", pit.createdAt || "");
    pitRows.push(pitRow);
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
    var scoutRow = createRawRow();
    setRawValue(scoutRow, "Received At", new Date());
    setRawValue(scoutRow, "Scout Name", entry.scoutName || fallbackScoutName || "");
    setRawValue(scoutRow, "Entry Type", "scout");
    setRawValue(scoutRow, "Match Number", toNumber(entry.matchNumber));
    setRawValue(scoutRow, "Team Number", teamNumber);
    setRawValue(scoutRow, "Starting Position", formatStartingPosition(entry.startingPosition));
    setRawValue(scoutRow, "Alliance", entry.alliance || "");
    setRawValue(scoutRow, "Auton Climb Level", entry.autonClimbLevel || "");
    setRawValue(scoutRow, "Teleop Climb Level", entry.teleopClimbLevel || "");
    setRawValue(scoutRow, "Played Defense", entry.playedDefense ? "Yes" : "No");
    setRawValue(scoutRow, "Disconnected", entry.disconnected ? "Yes" : "No");
    setRawValue(scoutRow, "No Show", entry.noShow ? "Yes" : "No");
    setRawValue(scoutRow, "Auto Scoring Category", entry.autoScoringCategory || "");
    setRawValue(scoutRow, "Scoring Category", entry.scoringCategory || "");
    setRawValue(scoutRow, "Missed Balls Per Cycle", toNumber(entry.missedBallsPerCycle));
    setRawValue(scoutRow, "Shooting Accuracy", toNumber(entry.shootingAccuracy));
    setRawValue(scoutRow, "Driving Quality", entry.drivingQuality || "");
    setRawValue(scoutRow, "Driving Quality Notes", entry.drivingQualityNotes || "");
    setRawValue(scoutRow, "Defense Rating", toNumber(entry.defenseRating));
    setRawValue(scoutRow, "Passed Fuel", entry.passedFuel ? "Yes" : "No");
    setRawValue(scoutRow, "Passed Fuel Amount", toNumber(entry.passedFuelAmount));
    setRawValue(scoutRow, "Used Corral", entry.usedCorral ? "Yes" : "No");
    setRawValue(scoutRow, "Notes", entry.notes || "");
    setRawValue(scoutRow, "Created At", entry.createdAt || "");
    rowsToAppend.push(scoutRow);
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