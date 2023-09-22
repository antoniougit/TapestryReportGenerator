Date.prototype.dateToday = function () {
  const local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};

function dateIncrement(date, increment) {
  const parts = date.split("-");
  const dt = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
  dt.setDate(dt.getDate() + increment);
  parts[0] = "" + dt.getFullYear();
  parts[1] = "" + (dt.getMonth() + 1);
  if (parts[1].length < 2) {
    parts[1] = "0" + parts[1];
  }
  parts[2] = "" + dt.getDate();
  if (parts[2].length < 2) {
    parts[2] = "0" + parts[2];
  }
  return parts.join("-");
}

const fourDaysAgo = dateIncrement(new Date().dateToday(), -4);

document.getElementById("date").max = new Date().dateToday();
document.getElementById("date").value = fourDaysAgo;

const campaignSelect = document.querySelector(
    "#container > div:nth-child(1) > div.select"
  ),
  accountSelect = document.getElementById("account"),
  storageAccount = sessionStorage.getItem("account"),
  storageCampaign = sessionStorage.getItem("campaign");

if (storageAccount) {
  accountSelect.value = storageAccount;
}

if (storageCampaign) {
  document.getElementById(storageCampaign).checked = true;
}

accountSelect.addEventListener("change", () => {
  sessionStorage.setItem("account", accountSelect.value);
});

campaignSelect.addEventListener("change", function (e) {
  if (e.target.name === "radio") {
    sessionStorage.setItem("campaign", e.target.value);
  }
});

window.onload = function () {
  countClicks("info");
  showHide();
  if (typeof window.FileReader !== "function") {
    alert("File API not supported on this browser yet!");
  }
};

// window.onerror = function () {
//     alert('No data found!');
// };

const file = document.getElementById("file");
file.addEventListener("change", (e) => {
  if (Object.keys(GAData).length === 0) {
    return;
  }
  const [file] = e.target.files,
    { name: fileName, size } = file,
    fileSize = (size / 1000).toFixed(2),
    fileNameAndSize = `${fileName} - ${fileSize}KB`;
  document.querySelector(".fileName").textContent = fileNameAndSize;
});

function countClicks(endpoint) {
  const xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `https://api.countapi.xyz/${endpoint}/gantoniou/tapestryrepgen`
  );
  xhr.responseType = "json";
  if (endpoint === "info") {
    xhr.onload = function () {
      document.querySelector("#clickCounter > span").textContent =
        this.response.value;
    };
  }
  xhr.send();
}

function showHide() {
  const pred = document.getElementById("pred"),
    ose = document.getElementById("ose"),
    expl = document.getElementById("expl"),
    bcst = document.getElementById("bcst"),
    sfmcDiv = document.getElementById("sfmcDiv"),
    attentDiv = document.getElementById("attentDiv");
  sfmcDiv.style.display = pred.checked ? "block" : "none";
  sfmcDiv.style.display =
    ose.checked || expl.checked || bcst.checked || sms.checked
      ? "none"
      : "block";
  attentDiv.style.display = sms.checked ? "block" : "none";
}

let startTime,
  endTime = 0;

function reportStart() {
  document.getElementById("container").style.display = "none";
  document.getElementById("loader").style.display = "block";
  startTime = performance.now();
}

function reportEnd() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("container").style.display = "block";
  endTime = performance.now();
  console.log(
    `GA API call took ${((endTime - startTime) / 1000).toFixed(
      2
    )} seconds`
  );
}

function queryReports() {
  reportStart();
  let viewId = "238100595",
    campaignName = document.getElementById("campaignName").value.trim();
  if (!campaignName) {
    alert("Please enter a Campaign Name!");
    // location.reload();
  }
  const accountSelect = document.getElementById("account").value,
    campaignType = document.querySelector(
      'input[name="radio"]:checked'
    ).value,
    startDate = document.getElementById("date").value,
    endDate = dateIncrement(startDate, 3);
  if (endDate >= new Date().dateToday()) {
    alert("End date cannot be today or in the future!");
    //  location.reload();
  }
  if (
    accountSelect.includes("sw") &&
    (campaignName.includes("-OTLOPTIN") ||
      campaignName.includes("-SWSEGS"))
  ) {
    campaignName = campaignName
      .replace("-OTLOPTIN", "")
      .replace("-SWSEGS", "");
  }

  let dimensions = [],
    dimensionFilterClauses = [
      {
        filters: [
          {
            dimensionName: "ga:campaign",
            operator: "BEGINS_WITH",
            expressions: [campaignName],
          },
        ],
      },
    ],
    orderBys = [];

  switch (accountSelect) {
    // case 'coachNA':
    //     viewId = '249300291';
    //     break;
    case "coachUSout":
      viewId = "238100595";
      break;
    case "coachUSret":
      viewId = "234177249";
      break;
    case "ksUSret":
      viewId = "255937198";
      break;
    case "ksUSsur":
      viewId = "255935277";
      break;
    case "swCanada":
      viewId = "231373074";
      break;
    case "swUS":
      viewId = "231367597";
      break;
  }

  if (campaignType === "pred" || campaignType === "sms") {
    dimensions = [
      {
        name: "ga:campaign",
      },
    ];
    orderBys = [
      {
        fieldName: "ga:campaign",
        orderType: "VALUE",
        sortOrder: "ASCENDING",
      },
    ];
  } else {
    let variantNum = 0;
    const variantArray = [];

    if (campaignType === "expl") {
      variantNum = 17;
    } else if (campaignType === "bcst") {
      variantNum = 3;
    } else if (accountSelect.includes("sw")) {
      variantNum = 12;
    } else {
      variantNum = 19;
    }
    if (!accountSelect.includes("sw")) {
      for (let i = 1; i <= variantNum; i++) {
        variantArray.push(i.toString());
      }

      dimensionFilterClauses = [
        {
          operator: "AND",
          filters: [
            {
              dimensionName: "ga:campaign",
              operator: "BEGINS_WITH",
              expressions: [campaignName],
            },
            {
              dimensionName: "ga:dimension56",
              operator: "IN_LIST",
              expressions: variantArray,
            },
          ],
        },
      ];
    }

    dimensions = [
      {
        name: "ga:campaign",
      },
      {
        name: "ga:dimension56",
      },
    ];

    orderBys = [
      {
        fieldName: "ga:dimension56",
        orderType: "DIMENSION_AS_INTEGER",
        sortOrder: "ASCENDING",
      },
    ];
  }

  gapi.client
    .request({
      path: "/v4/reports:batchGet",
      root: "https://analyticsreporting.googleapis.com/",
      method: "POST",
      body: {
        reportRequests: [
          {
            viewId,
            samplingLevel: "LARGE",
            dateRanges: [
              {
                startDate,
                endDate,
              },
            ],
            metrics: [
              {
                expression: "ga:users",
              },
              {
                expression: "ga:transactions",
              },
              {
                expression: "ga:transactionRevenue",
              },
            ],
            dimensions,
            dimensionFilterClauses,
            orderBys,
          },
        ],
      },
    })
    .then(readGA, console.error.bind(console));
}

let fileData = {},
  GAData = {},
  results = [];

// function sortResultsByCD(a, b) {
//     return (
//         a['persado_email_version (u_cd56)'] -
//         b['persado_email_version (u_cd56)']
//     );
// }

function readGA(response) {
  if (!response.result.reports[0].data.rowCount) {
    alert("No data found!");
    location.reload();
  } else if (response && !response.result.reports[0].data.isDataGolden) {
    alert(
      "Results have not been finalized yet! Please check again later!"
    );
  }
  fileData = {};
  GAData = {};
  results = [];
  let GAResults = [];

  const campaignType = document.querySelector(
    'input[name="radio"]:checked'
  ).value;

  const accountSelect = document.getElementById("account").value,
    rows = response.result.reports[0].data.rows;

  const customDimension = "persado_email_version (u_cd56)";

  for (let i = 0; i < rows.length; i++) {
    if (campaignType === "pred" || campaignType === "sms") {
      GAResults[i] = {
        Campaign: rows[i].dimensions[0],
        Users: Number(rows[i].metrics[0].values[0]),
        Transactions: Number(rows[i].metrics[0].values[1]),
        Revenue: Number(rows[i].metrics[0].values[2]),
      };
    } else {
      GAResults[i] = {
        Campaign: rows[i].dimensions[0],
        "persado_email_version (u_cd56)": rows[i].dimensions[1],
        Users: Number(rows[i].metrics[0].values[0]),
        Transactions: Number(rows[i].metrics[0].values[1]),
        Revenue: Number(rows[i].metrics[0].values[2]),
      };
    }
  }

  let conversions = 0,
    revenue = 0;

  if (document.getElementById("sms").checked) {
    for (const key in GAResults) {
      fileData[key] = GAResults[key];
    }
    GAData = Object.assign({}, fileData);
  } else if (!document.getElementById("pred").checked) {
    for (const key in GAResults) {
      fileData[key] = GAResults[key];
      const resultObj = Object.assign(fileData[key]);
      results.push(resultObj);
      // results = results.sort(sortResultsByCD);
    }
    const customDimension = "persado_email_version (u_cd56)",
      importOrder = ["|d_", "|l_", "|c_"];
    if (accountSelect.includes("sw")) {
      results = results.filter((item) =>
        importOrder.includes(
          item[customDimension].slice(
            item[customDimension].length - 4,
            item[customDimension].length - 1
          )
        )
      );
    }

    results = results.reduce(function (acc, val) {
      const o = acc
        .filter(function (obj) {
          return obj[customDimension] == val[customDimension];
        })
        .pop() || {
        Campaign: val.Campaign,
        [customDimension]: val[customDimension],
        Users: 0,
        Transactions: 0,
        Revenue: 0,
      };
      o.Campaign = val.Campaign;
      o.Users += val.Users;
      o.Transactions += val.Transactions;
      o.Revenue += Number(val.Revenue.toFixed(2));
      acc.push(o);
      return acc;
    }, []);

    results = results.filter(function (item, i, a) {
      return i == a.indexOf(item);
    });
    if (accountSelect.includes("sw")) {
      const sortByObject = importOrder.reduce((obj, item, index) => {
        return {
          ...obj,
          [item]: index,
        };
      }, {});

      results = results.sort(
        (a, b) =>
          sortByObject[
            a[customDimension].slice(
              a[customDimension].length - 4,
              a[customDimension].length - 1
            )
          ] -
          sortByObject[
            b[customDimension].slice(
              b[customDimension].length - 4,
              b[customDimension].length - 1
            )
          ]
      );
    } else {
      results[results.length - 1][customDimension] = "CTRL";
    }
    setTimeout(() => {
      campaignName = document.getElementById("campaignName").value.trim();
      downloadXL(`${campaignName}.xlsx`);
    }, 1000);
  } else {
    // if pred checked
    for (const key in GAResults) {
      fileData[key] = GAResults[key];
      conversions += fileData[key]["Transactions"];
      revenue += fileData[key]["Revenue"];

      GAData = {
        Conversions: conversions,
        Revenue: revenue,
      };
    }
  }
  reportEnd();
  console.log("fileData:", fileData);
  console.log("GAData:", GAData);
}

function formatDate(date) {
  const newDate = new Date(Date.UTC(0, 0, date - 1)).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
  return newDate;
}

function readSFMCFile(file) {
  if (Object.keys(GAData).length === 0) {
    alert("Please pull the GA results first!");
    return;
  }
  let SFMCData = {};
  let deliveries = 0,
    opens = 0,
    clicks = 0;

  let campaignRow = [],
    nameRow = 0;
  const dataLength = Object.keys(fileData).length;

  const name = file[0].name,
    reader = new FileReader();
  reader.onload = function (e) {
    const data = e.target.result,
      workbook = XLSX.read(data, {
        type: "binary",
      });

    const sheet = workbook.Sheets[workbook.SheetNames[0]],
      range = XLSX.utils.decode_range(sheet["!ref"]);

    if (dataLength > 1) {
      for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const secondCell =
          sheet[
            XLSX.utils.encode_cell({
              r: rowNum,
              c: 1,
            })
          ];
        if (secondCell && secondCell.v === "Email Content Name") {
          nameRow = rowNum;
        } else {
          for (const key in fileData) {
            if (
              secondCell &&
              secondCell.v === fileData[key]["Campaign"]
            ) {
              campaignRow[key] = rowNum;
              const xlRowObj = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[workbook.SheetNames[0]],
                { range: nameRow }
              );
              fileData[key] = xlRowObj[campaignRow[key] - nameRow - 1];
              deliveries += fileData[key]["Email Deliveries"];
              opens += fileData[key]["Email Unique Opens"];
              clicks += fileData[key]["Email Unique Clicks"];
            }
          }
        }
      }
    } else {
      for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const secondCell =
          sheet[
            XLSX.utils.encode_cell({
              r: rowNum,
              c: 1,
            })
          ];
        if (secondCell && secondCell.v === "Email Content Name") {
          nameRow = rowNum;
        } else if (
          secondCell &&
          secondCell.v === fileData[0]["Campaign"]
        ) {
          campaignRow.push(rowNum);
        }
      }

      const xlRowObj = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[workbook.SheetNames[0]],
        { range: nameRow }
      );

      for (let j = 0; j < campaignRow.length; j++) {
        fileData[j] = xlRowObj[campaignRow[j] - nameRow - 1];
        deliveries += fileData[j]["Email Deliveries"];
        opens += fileData[j]["Email Unique Opens"];
        clicks += fileData[j]["Email Unique Clicks"];
      }
    }

    SFMCData = {
      "Email Deliveries": deliveries,
      "Email Unique Opens": opens,
      "Email Unique Clicks": clicks,
    };

    delete fileData[0]["Email Unique Unsubscribes"];

    fileData[0]["Send Date"] = formatDate(fileData[0]["Send Date"]);

    if (dataLength > 1) {
      const lastIndex =
        fileData[0]["Email Content Name"].lastIndexOf("-");
      fileData[0]["Email Content Name"] = fileData[0][
        "Email Content Name"
      ].substring(0, lastIndex);
      fileData[0]["Email Job ID"] = "";
    }

    const resultObj = Object.assign(fileData[0], SFMCData, GAData);

    results.push(resultObj);
  };
  reader.readAsBinaryString(file[0]);

  setTimeout(() => {
    campaignName = document.getElementById("campaignName").value.trim();
    downloadXL(`${campaignName}.xlsx`);
  }, 1000);
}

function readAttentFile(file) {
  const attentData = Object.assign({}, fileData);

  let campaignRow = [];

  const name = file[0].name,
    reader = new FileReader();
  reader.onload = function (e) {
    const data = e.target.result,
      workbook = XLSX.read(data, {
        type: "binary",
      });

    const sheet = workbook.Sheets[workbook.SheetNames[0]],
      range = XLSX.utils.decode_range(sheet["!ref"]);

    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      const secondCell =
        sheet[XLSX.utils.encode_cell({ r: rowNum, c: 1 })];

      for (const key in fileData) {
        if (
          secondCell &&
          secondCell.v
            .toLowerCase()
            .includes(
              attentData[key]["Campaign"]
                .toLowerCase()
                .replace(/\s+/g, "")
            )
        ) {
          campaignRow[key] = rowNum;
          const xlRowObj = XLSX.utils.sheet_to_row_object_array(
            workbook.Sheets[workbook.SheetNames[0]]
          );
          fileData[key] = xlRowObj[campaignRow[key] - 1];

          delete fileData[key]["Campaign Tags"];

          const dataLength = Object.keys(fileData).length;
          if (
            fileData[key]["Message"].toLowerCase().includes("variant")
          ) {
            fileData[key]["Message"] = fileData[key]["Message"].replace(
              /variant/gi,
              " VRNT"
            );
          } else if (
            fileData[key]["Message"].toLowerCase().includes("cntrl")
          ) {
            fileData[key]["Message"] = fileData[key]["Message"].replace(
              /cntrl/gi,
              " CTRL"
            );
          }

          fileData[key]["Send Date"] = formatDate(
            fileData[key]["Send Date"]
          );

          fileData[key]["Conversions"] = GAData[key]["Transactions"];
          fileData[key]["Revenue ($)"] = GAData[key]["Revenue"];

          fileData[key]["Click Rate (%)"] =
            (fileData[key]["Click Rate (%)"] * 100).toFixed(2) + "%";
          fileData[key]["Conversion Rate (%)"] =
            (fileData[key]["Conversion Rate (%)"] * 100).toFixed(2) + "%";
          fileData[key]["Opt Out Rate (%)"] =
            (fileData[key]["Opt Out Rate (%)"] * 100).toFixed(2) + "%";

          const resultObj = Object.assign(fileData[key]);
          results.push(resultObj);
        }
      }
    }
  };
  reader.readAsBinaryString(file[0]);

  setTimeout(() => {
    campaignName = document.getElementById("campaignName").value.trim();
    downloadXL(`${campaignName}.xlsx`);
  }, 1000);
}

function downloadXL(fileName) {
  fileName = fileName || "tapestryFinalReport.xlsx";

  const ws = XLSX.utils.json_to_sheet(results),
    wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, fileName);

  alert("Report created successfully!");
  // countClicks("hit");
  // location.reload();
}
