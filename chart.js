function chartData(biometricData, startDate, endDate, chartType) {
    var blankDataInDateRange = getDatesInRange(startDate,endDate)
    var blankSourceData      = getUniqueSources(biometricData, blankDataInDateRange);
    var sourceData           = updateSourceDataFromBioMetric(biometricData, blankSourceData, chartType);
    var chartData            = genarateChartData(sourceData,chartType);
    return chartData;
}

// ============================= HELPER FUNCTIONS =======================
function getDatesInRange(startDate, endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const dates = [];
    const data = [];
    if (startDateObj <= endDateObj) {
        let currentDate = startDateObj;
        while (currentDate <= endDateObj) {
            dates.push(currentDate.toISOString().split('T')[0]);
            data.push(null)
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    var dateAndData = {
        dates,
        data
    }

    return dateAndData;
}

function getUniqueSources(biometricData, blankDataInDateRange) {
    const hashMap = {};

    biometricData.forEach((item) => {
        if (item.source) {
            hashMap[item.source] = JSON.parse(JSON.stringify(blankDataInDateRange));
        }
    });

    return hashMap; 
}

function updateSourceDataFromBioMetric(biometricData, blankSourceData, chartType){
    biometricData.forEach(element => {
        var source = element.source;
        var indexNo = blankSourceData[source].dates.indexOf(element.date);
        blankSourceData[source].data[indexNo] = element[chartType];
    });

    return blankSourceData;
}

function genarateChartData(sourceData, chartType){
    var chartData            = [];
    var sourceList = Object.keys(sourceData)
    sourceList.forEach((item)=>{
        var dataPoint={};
        dataPoint["source"] = item;
        dataPoint["dates"] = sourceData[item].dates;
        dataPoint[chartType] = sourceData[item].data;
        chartData.push(dataPoint);
    })
    return chartData;
}


module.exports = {
    chartData
};