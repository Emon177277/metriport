//fetch user
$(document).ready(function () {
    var userSelect = $('#userSelect');
    $.ajax({
        url: 'http://ec2-3-133-12-188.us-east-2.compute.amazonaws.com:8080/user',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            data.forEach(function (user) {
                userSelect.append($('<option>', {
                    value: user._id,
                    text: user.firstName
                }));
            });
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
});

const chartForm = document.getElementById('chartForm');
let deviceName = $('#deviceInfo').val();
let selectedInterval = 'daily';
let datasetInterval = {
    daily: 1,
    weekly: 7,
    monthly: 30
}
// Add device name here
let originalDataset = {
    "fitbit": [],
    "google": [],
    "userInfo": null
}

// Add event listeners for radio buttons to update the selected interval
document.querySelectorAll('input[name="datasetVisibility"]').forEach(input => {
    input.addEventListener('change', function () {
        selectedInterval = this.value;
        if (deviceName === "fitbit") {
            generateChart(originalDataset.fitbit, datasetInterval[selectedInterval]);
        }
        else if (deviceName === "google") {
            generateChart(originalDataset.google, datasetInterval[selectedInterval]);
        }
    });
});
// Add event listener to show the chart
chartForm.addEventListener('submit', function (event) {
    event.preventDefault();
    originalDataset = {
        "fitbit": [],
        "google": [],
        "userInfo": null
    }
    deviceName = $('#deviceInfo').val();
    var formData = {
        user: $('#userSelect').val(),
        device: $('#deviceInfo').val(),
        startDate: $('#startDate').val(),
        endDate: $('#endDate').val()
    };

    let datasetUrl = 'http://ec2-3-133-12-188.us-east-2.compute.amazonaws.com:8080/'

    let restUrl = "?user_id=" + formData.user +
        "&startDate=" + formData.startDate +
        "&endDate=" + formData.endDate;

    let datasetUrls = [
        { url: datasetUrl + "heart-rate" + restUrl },
        { url: datasetUrl + "respiration-rate" + restUrl },
        { url: datasetUrl + "temparature" + restUrl },
        { url: datasetUrl + "glucose" + restUrl }
    ];

    let promises = datasetUrls.map(function (datasetInfo) {
        return ajaxCallToFetchDataset(datasetInfo.url);
    });

    Promise.all(promises)
        .then(function () {
            //console.log("original dataset:", originalDataset);

            const chartContainer = $('#chartContainer');
            const fitbitData = originalDataset.fitbit;
            const googleData = originalDataset.google;

            if (formData.device === "fitbit" && fitbitData.length > 0) {
                chartContainer.css('display', 'block');
                $('#firstNameInSideChart').val(originalDataset.userInfo.firstName);
                $('#lastNameInSideChart').val(originalDataset.userInfo.last_name);
                generateChart(fitbitData, datasetInterval[selectedInterval]);
            } else if (formData.device === "google" && googleData.length > 0) {
                chartContainer.css('display', 'block');
                $('#firstNameInSideChart').val(originalDataset.userInfo.firstName);
                $('#lastNameInSideChart').val(originalDataset.userInfo.last_name);
                //console.log("inside: ", selectedInterval);
                generateChart(googleData, datasetInterval[selectedInterval]);
            } else {
                chartContainer.css('display', 'none');
                const toast = new bootstrap.Toast(toastMessage);
                toast.show();
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });

});

function ajaxCallToFetchDataset(url) {
    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    }).then(function (data) {
        //console.log("data: ", data);
        if (data.chartDataResult.length) {
            originalDataset.userInfo = data.userInfo;
            for (let i = 0; i < data.chartDataResult.length; i++) {
                if (data.chartDataResult[i].source === "fitbit") {
                    originalDataset.fitbit.push(data.chartDataResult[i]);
                }
                if (data.chartDataResult[i].source === "google") {
                    originalDataset.google.push(data.chartDataResult[i]);
                }
            }
        }
    }).fail(function (error) {
        console.error('Error sending GET request:', error);
    });
}

function generateChart(fetchedData, selectedInterval) {
    
    let modifiedDate = [];
    let cnt = 0;
    for (let i = 0; i < fetchedData[0].dates.length; i += selectedInterval) {
        modifiedDate[cnt++] = fetchedData[0].dates[i];
    }

    const xValues = modifiedDate;
    let datasets = [];
    let legendText = "";
    const lineColors = ["red", "green", "blue", "orange"];

    datasets = generateHearRateDataset(fetchedData, lineColors, selectedInterval);
    let ctx = document.getElementById('myChartHearRate').getContext('2d');
    generateLineChart(datasets, xValues, ctx, "Heart Rate");

    datasets = generateAvgResperationRateDataset(fetchedData, lineColors, selectedInterval);
    ctx = document.getElementById('myChartRespiration').getContext('2d');
    generateLineChart(datasets, xValues, ctx, "Respiration Rate");

    datasets = generateAvgTemparatureDataset(fetchedData, lineColors, selectedInterval);
    ctx = document.getElementById('myChartTemperature').getContext('2d');
    generateLineChart(datasets, xValues, ctx, "Temperature");

    datasets = generateAvgBloodGlucoseDataset(fetchedData, lineColors, selectedInterval);
    ctx = document.getElementById('myChartGlucose').getContext('2d');
    generateLineChart(datasets, xValues, ctx, "Glucose");

    datasets = generatePairDataset(fetchedData, lineColors, selectedInterval);
    ctx = document.getElementById('myChartPair').getContext('2d');
    generateLineChart(datasets, xValues, ctx, "Pairs");
}

function generateLineChart(datasets, xValues, ctx, legendText) {
    const myChartPair = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: datasets
        },
        options: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: legendText
            },
            pan: {
                enabled: true,
                mode: 'xy',
            },
            zoom: {
                enabled: true,
                mode: 'xy',
                sensitivity: 3,
                minZoom: 0.1,
                maxZoom: 10,
            }
        }
    });
}

function generateHearRateDataset(fetchedData, lineColors, selectedInterval) {
    const datasets = [];

    for (let i = 0; i < fetchedData.length; i++) {
        let modifiedData = [];
        let cnt = 0;
        //console.log(fetchedData[i]);
        if (fetchedData[i].hasOwnProperty('heartRate')) {
            //console.log("inside hear rate");
            for (let j = 0; j < fetchedData[i].heartRate.length; j += selectedInterval) {
                modifiedData[cnt++] = fetchedData[i].heartRate[j];
            }
            const dataset = {
                data: modifiedData,
                label: "heartRate",
                borderColor: lineColors[i],
                backgroundColor: lineColors[i],
                fill: false,
                spanGaps: true
            };
            datasets.push(dataset);
        }
    }
    return datasets;
}

function generateAvgResperationRateDataset(fetchedData, lineColors, selectedInterval) {
    const datasets = [];

    for (let i = 0; i < fetchedData.length; i++) {
        let modifiedData = [];
        let cnt = 0;
        //console.log(fetchedData[i]);
        if (fetchedData[i].hasOwnProperty('avg_resperationRate')) {
            for (let j = 0; j < fetchedData[i].avg_resperationRate.length; j += selectedInterval) {
                modifiedData[cnt++] = fetchedData[i].avg_resperationRate[j];
            }
            const dataset = {
                data: modifiedData,
                label: "avg_resperationRate",
                borderColor: lineColors[i],
                backgroundColor: lineColors[i],
                fill: false,
                spanGaps: true
            };
            datasets.push(dataset);
        }
    }
    return datasets;
}

function generateAvgBloodGlucoseDataset(fetchedData, lineColors, selectedInterval) {
    const datasets = [];

    for (let i = 0; i < fetchedData.length; i++) {
        let modifiedData = [];
        let cnt = 0;
        //console.log(fetchedData[i]);
        if (fetchedData[i].hasOwnProperty('avg_blood_glucose')) {
            for (let j = 0; j < fetchedData[i].avg_blood_glucose.length; j += selectedInterval) {
                modifiedData[cnt++] = fetchedData[i].avg_blood_glucose[j];
            }
            const dataset = {
                data: modifiedData,
                label: "avg_blood_glucose",
                borderColor: lineColors[i],
                backgroundColor: lineColors[i],
                fill: false,
                spanGaps: true
            };
            datasets.push(dataset);
        }
    }
    return datasets;
}

function generateAvgTemparatureDataset(fetchedData, lineColors, selectedInterval) {
    const datasets = [];

    for (let i = 0; i < fetchedData.length; i++) {
        let modifiedData = [];
        let cnt = 0;
        //console.log(fetchedData[i]);
        if (fetchedData[i].hasOwnProperty('avg_temparature')) {
            for (let j = 0; j < fetchedData[i].avg_temparature.length; j += selectedInterval) {
                modifiedData[cnt++] = fetchedData[i].avg_temparature[j];
            }
            const dataset = {
                data: modifiedData,
                label: "avg_temparature",
                borderColor: lineColors[i],
                backgroundColor: lineColors[i],
                fill: false,
                spanGaps: true
            };
            datasets.push(dataset);
        }
    }
    return datasets;
}

function generatePairDataset(fetchedData, lineColors, selectedInterval) {
    const datasets = [];

    for (let i = 0; i < fetchedData.length; i++) {
        let modifiedData = [];
        let cnt = 0;
        //console.log(fetchedData[i]);
        if (fetchedData[i].hasOwnProperty('heartRate')) {
            //console.log("inside hear rate");
            for (let j = 0; j < fetchedData[i].heartRate.length; j += selectedInterval) {
                modifiedData[cnt++] = fetchedData[i].heartRate[j];
            }
            const dataset = {
                data: modifiedData,
                label: "heartRate",
                borderColor: lineColors[i],
                backgroundColor: lineColors[i],
                fill: false,
                spanGaps: true
            };
            datasets.push(dataset);
        }
        if (fetchedData[i].hasOwnProperty('avg_resperationRate')) {
            for (let j = 0; j < fetchedData[i].avg_resperationRate.length; j += selectedInterval) {
                modifiedData[cnt++] = fetchedData[i].avg_resperationRate[j];
            }
            const dataset = {
                data: modifiedData,
                label: "avg_resperationRate",
                borderColor: lineColors[i],
                backgroundColor: lineColors[i],
                fill: false,
                spanGaps: true
            };
            datasets.push(dataset);
        }
    }
    return datasets;
}