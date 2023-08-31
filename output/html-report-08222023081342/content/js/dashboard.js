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

    var data = {"OkPercent": 98.87005649717514, "KoPercent": 1.1299435028248588};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.876647834274953, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7537593984962406, 500, 1500, "Echo"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 9"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 8"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 1"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 0"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 10"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 3"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 2"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 5"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 4"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 7"], "isController": false}, {"data": [1.0, 500, 1500, "dummy 6"], "isController": false}, {"data": [1.0, 500, 1500, "dummy ${variable}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 531, 6, 1.1299435028248588, 479.8154425612054, 50, 4454, 273.0, 1173.4000000000003, 1826.9999999999961, 2930.879999999993, 8.859302267380748, 2.776091979912241, 0.5550750162670804], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Echo", 266, 6, 2.255639097744361, 677.9210526315793, 216, 4454, 258.5, 1810.0000000000018, 2489.5999999999985, 3259.6999999999985, 4.463162133592846, 2.757098483196027, 0.5582229777345258], "isController": false}, {"data": ["dummy 9", 14, 0, 0.0, 295.1428571428571, 57, 492, 286.0, 488.5, 492.0, 492.0, 0.28081436164878143, 0.0021938622003811054, 0.0], "isController": false}, {"data": ["dummy 8", 24, 0, 0.0, 257.04166666666663, 54, 490, 236.5, 472.0, 488.25, 490.0, 0.4413224964142547, 0.0034478320032363652, 0.0], "isController": false}, {"data": ["dummy 1", 21, 0, 0.0, 308.80952380952374, 103, 493, 319.0, 477.4, 491.5, 493.0, 0.39596492882059015, 0.003093476006410861, 0.0], "isController": false}, {"data": ["dummy 0", 24, 0, 0.0, 305.95833333333337, 59, 458, 351.0, 429.5, 453.25, 458.0, 0.4215703495520815, 0.0032935183558756367, 0.0], "isController": false}, {"data": ["dummy 10", 19, 0, 0.0, 275.6842105263158, 50, 480, 281.0, 468.0, 480.0, 480.0, 0.4321914380601429, 0.0033764956098448658, 0.0], "isController": false}, {"data": ["dummy 3", 26, 0, 0.0, 299.8076923076923, 78, 497, 310.0, 483.3, 494.9, 497.0, 0.4799438834843926, 0.003749561589721817, 0.0], "isController": false}, {"data": ["dummy 2", 26, 0, 0.0, 262.19230769230774, 52, 480, 265.0, 475.9, 479.3, 480.0, 0.48165095126062873, 0.003762898056723662, 0.0], "isController": false}, {"data": ["dummy 5", 32, 0, 0.0, 271.96875, 54, 472, 264.5, 436.8, 455.74999999999994, 472.0, 0.6007584575526602, 0.004693425449630158, 0.0], "isController": false}, {"data": ["dummy 4", 30, 0, 0.0, 297.5, 63, 494, 294.5, 472.1, 484.65, 494.0, 0.5503678291658258, 0.004299748665358014, 0.0], "isController": false}, {"data": ["dummy 7", 25, 0, 0.0, 241.68000000000004, 52, 451, 224.0, 437.8, 450.1, 451.0, 0.4493089628151902, 0.0035102262719936736, 0.0], "isController": false}, {"data": ["dummy 6", 18, 0, 0.0, 313.22222222222223, 57, 497, 322.0, 492.5, 497.0, 497.0, 0.37537537537537535, 0.0029326201201201204, 0.0], "isController": false}, {"data": ["dummy ${variable}", 6, 0, 0.0, 194.66666666666669, 69, 417, 150.5, 417.0, 417.0, 417.0, 0.11526270291038325, 9.004898664873691E-4, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 6, 100.0, 1.1299435028248588], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 531, 6, "502/Bad Gateway", 6, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Echo", 266, 6, "502/Bad Gateway", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
