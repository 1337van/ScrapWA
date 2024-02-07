function doGet(e) {
  var page = e.parameter.page;
  // Check the 'page' parameter to decide which HTML file to serve
  if (page === 'ProductionOrderReporting') {
    return HtmlService.createHtmlOutputFromFile('ProductionOrderReporting')
        .setTitle('Production Order Reporting');
  } else if (page === 'CMA_Scrap_Form_WA') {
    return HtmlService.createHtmlOutputFromFile('CMA_Scrap_Form_WA')
        .setTitle('Scrap Reporting Form');
  } else {
    // Serve the main dashboard or another default page if no specific page is requested
    var template = HtmlService.createTemplateFromFile('CMA_Scrap_Form_WA');
    template.message = ''; // Optional: Pass any messages or data to the template
    return template.evaluate().setTitle('Your Web App Title');
  }
}
function getUrl() {
  return ScriptApp.getService().getUrl();
}

function getDropdownOptions(rangeA1Notation) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DATA TABLES'); // Ensure the sheet name matches exactly
  var range = sheet.getRange(rangeA1Notation);
  var values = range.getValues();
  var options = values.flat().filter(function(option) { return option !== ''; });
  return options;
}

function getDataForPRD(prdNumber) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Odata');
    const data = sheet.getDataRange().getValues();
    let items = [];
    let batches = {}; // To store batches for each item

    data.forEach(row => {
        if (row[0] === prdNumber) { // column A
            if (!items.includes(row[3])) { // column D
                items.push(row[3]);
                batches[row[3]] = [];
            }
            if (!batches[row[3]].includes(row[4])) { // column E
                batches[row[3]].push(row[4]);
            }
        }
    });

    return { items: items, batches: batches };
}
/////////Sheet call for Batch/Item match
function getBatchesForItem(item, prdNumber) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Odata');
    const data = sheet.getDataRange().getValues();
    let batches = [];

    data.forEach(row => {
        if (row[0] === prdNumber && row[3] === item) { // Check both PRD # and Item #
            if (!batches.includes(row[4])) { // Assuming column E contains the batch numbers
                batches.push(row[4]);
            }
        }
    });

    return batches;
}


function processFormData(formData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scrap_Data');
  formData.entries.forEach(function(entry) {
    sheet.appendRow([
      new Date(), // Time stamp
      formData.dataEnteredBy, // Data Entered By
      formData.job, // Job
      formData.prdNumber, // PRD Number
      entry.componentItem, // Component Item Number
      entry.batchNumber, // Batch Number
      entry.ncCode, // NC Code
      entry.quantity, // Quantity
      entry.goodwillVendor, // Goodwill or Vendor
      formData.signature // Include the signature
    ]);
  });

  return true;
}

////////////Production Reporting///////////////
function appendProductionOrderData(formData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CMA_Data');
  
  // Prepare the row data
  var rowData = [
    formData.prdNumber1, // Production Order #
    formData.job1, // Job
    formData.status, // Status
    formData.fullName, // Full Name
    formData.timestamp, // Timestamp
    formData.startQuantity, // Start Quantity
    formData.finishQuantity, // Finish Quantity
    formData.totalScrap // Total Scrap
  ];

  // Append the data to the sheet
  sheet.appendRow(rowData);

  return true; // Return a value to confirm successful execution
}
