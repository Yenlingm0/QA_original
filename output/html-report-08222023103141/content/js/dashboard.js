/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9860248447204969, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "dummy 1"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 0"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 10"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 3"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 2"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 5"], "isController": false}, {"data": [0.9721362229102167, 500, 1500, "Echo"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 4"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 7"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 6"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 9"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 8"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 644, 0, 0.0, 276.44565217391334, 50, 2207, 223.0, 431.0, 474.25, 1267.499999999975, 10.785282443770829, 3.4274463666661084, 0.6765497301585972], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["dummy 1", 21, 0, 0.0, 271.8095238095238, 56, 477, 272.0, 462.40000000000003, 476.2, 477.0, 0.3975540957537436, 0.003105891373076122, 0.0], "isController": false}, {"data": ["dummy 0", 28, 0, 0.0, 293.7142857142857, 66, 499, 303.0, 431.80000000000007, 496.29999999999995, 499.0, 0.5164527076877675, 0.004034786778810683, 0.0], "isController": false}, {"data": ["dummy 10", 23, 0, 0.0, 326.0434782608696, 103, 484, 312.0, 477.0, 483.8, 484.0, 0.4222197745713551, 0.0032985919888387123, 0.0], "isController": false}, {"data": ["dummy 3", 42, 0, 0.0, 283.4285714285714, 50, 495, 293.0, 440.1000000000001, 480.35, 495.0, 0.7560619970837609, 0.005906734352216882, 0.0], "isController": false}, {"data": ["dummy 2", 30, 0, 0.0, 311.36666666666673, 72, 481, 326.5, 474.7, 478.8, 481.0, 0.5255321012525181, 0.004105719541035298, 0.0], "isController": false}, {"data": ["dummy 5", 27, 0, 0.0, 262.14814814814815, 58, 497, 231.0, 450.79999999999995, 494.2, 497.0, 0.4876727174207532, 0.0038099431048496343, 0.0], "isController": false}, {"data": ["Echo", 323, 0, 0.0, 273.3529411764708, 215, 2207, 221.0, 272.6, 384.0, 1852.0799999999997, 5.409388554872637, 3.3854471956590912, 0.6765497301585972], "isController": false}, {"data": ["dummy 4", 43, 0, 0.0, 249.65116279069767, 57, 442, 249.0, 404.2, 431.59999999999997, 442.0, 0.7692307692307693, 0.006009615384615385, 0.0], "isController": false}, {"data": ["dummy 7", 22, 0, 0.0, 280.95454545454544, 105, 491, 238.0, 482.5, 489.95, 491.0, 0.5283127611546035, 0.0041274434465203395, 0.0], "isController": false}, {"data": ["dummy 6", 34, 0, 0.0, 264.3235294117647, 74, 497, 237.0, 460.0, 491.75, 497.0, 0.5943224723814852, 0.004643144315480353, 0.0], "isController": false}, {"data": ["dummy 9", 21, 0, 0.0, 267.4761904761905, 71, 466, 291.0, 449.6, 465.3, 466.0, 0.37934211239364873, 0.0029636102530753807, 0.0], "isController": false}, {"data": ["dummy 8", 30, 0, 0.0, 282.1333333333333, 56, 478, 304.0, 468.40000000000003, 474.15, 478.0, 0.611085083413114, 0.004774102214164952, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 644, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
