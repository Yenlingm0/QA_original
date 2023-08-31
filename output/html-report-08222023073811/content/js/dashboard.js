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

    var data = {"OkPercent": 98.16700610997964, "KoPercent": 1.8329938900203666};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8340122199592668, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6713709677419355, 500, 1500, "Echo"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 9"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 8"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 1"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 10"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 0"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 3"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 2"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 5"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 4"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 7"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 6"], "isController": false}, {"data": [1.0, 500, 1500, "dummy ${variable}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 491, 9, 1.8329938900203666, 602.0977596741351, 51, 5824, 291.0, 1629.400000000001, 2562.7999999999997, 3756.9199999999905, 7.8428240555866156, 2.457543202419935, 0.49543329706093764], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Echo", 248, 9, 3.629032258064516, 921.1169354838713, 223, 5824, 299.0, 2559.2, 3123.6499999999996, 4709.739999999996, 3.9613449404999606, 2.42721914683332, 0.49543329706093764], "isController": false}, {"data": ["dummy 9", 25, 0, 0.0, 275.6, 63, 500, 258.0, 492.4, 497.9, 500.0, 0.4712624177647081, 0.003681737638786782, 0.0], "isController": false}, {"data": ["dummy 8", 16, 0, 0.0, 268.00000000000006, 52, 454, 289.0, 437.20000000000005, 454.0, 454.0, 0.30122750207093907, 0.0023533398599292115, 0.0], "isController": false}, {"data": ["dummy 1", 26, 0, 0.0, 273.84615384615387, 94, 491, 272.0, 428.20000000000005, 474.8999999999999, 491.0, 0.5064770624330379, 0.003956852050258109, 0.0], "isController": false}, {"data": ["dummy 10", 17, 0, 0.0, 287.7647058823529, 56, 494, 327.0, 474.0, 494.0, 494.0, 0.3017608633910821, 0.002357506745242829, 0.0], "isController": false}, {"data": ["dummy 0", 24, 0, 0.0, 307.70833333333337, 57, 482, 306.0, 475.5, 480.5, 482.0, 0.44059333235423703, 0.003442135409017477, 0.0], "isController": false}, {"data": ["dummy 3", 13, 0, 0.0, 326.0769230769231, 132, 480, 321.0, 478.4, 480.0, 480.0, 0.23486052897817603, 0.0018348478826420004, 0.0], "isController": false}, {"data": ["dummy 2", 24, 0, 0.0, 236.83333333333334, 55, 427, 237.0, 390.0, 418.0, 427.0, 0.519356863084547, 0.004057475492848023, 0.0], "isController": false}, {"data": ["dummy 5", 17, 0, 0.0, 285.5882352941176, 51, 477, 280.0, 463.4, 477.0, 477.0, 0.3372681281618887, 0.0026349072512647552, 0.0], "isController": false}, {"data": ["dummy 4", 17, 0, 0.0, 258.6470588235294, 56, 434, 281.0, 413.2, 434.0, 434.0, 0.3362408275480132, 0.002626881465218853, 0.0], "isController": false}, {"data": ["dummy 7", 27, 0, 0.0, 269.74074074074076, 59, 492, 281.0, 448.59999999999997, 478.79999999999995, 492.0, 0.48040994982384966, 0.003753202732998826, 0.0], "isController": false}, {"data": ["dummy 6", 28, 0, 0.0, 258.2857142857143, 61, 456, 274.0, 426.20000000000005, 455.55, 456.0, 0.5324104884866232, 0.004159456941301744, 0.0], "isController": false}, {"data": ["dummy ${variable}", 9, 0, 0.0, 325.3333333333333, 168, 486, 317.0, 486.0, 486.0, 486.0, 0.22585259354061582, 0.0017644733870360613, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 9, 100.0, 1.8329938900203666], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 491, 9, "502/Bad Gateway", 9, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Echo", 248, 9, "502/Bad Gateway", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
