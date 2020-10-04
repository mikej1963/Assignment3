
var principal, startdate, years, rate;
var vals = {};

$( document ).ready(function(){
    var currentParams = getAllParams();
    Object.entries(currentParams).forEach(function(entry) {
        console.log("key: " + entry[0] + " :  value: " + entry[1]);
        $("#"+entry[0]).val(entry[1]);
    });
    vals.menu = currentParams.menu; 
    // alert("After load, got: " + JSON.stringify(currentParams));
});

$('#mainexit').click(function() {
    var msg = "Unable to close the window, because " + 
        "Google disabled the window.close() function. " + 
        " Please simply close your browser window. Thanks. ";
    alert(msg);
});

$('#debt_pmt_calc').click(function() {
    vals = getValsByCalcType(vals);
    console.log("vals: " + JSON.stringify(vals));

    if( okayToCalculate(vals)) {
            vals.payment = getPayment(vals);
            vals.interestexpense = getInterestExpense(vals);
            var newUrl = getNewUrl(vals);
            // alert("Calculate Debt Payment, url: " + newUrl + "  all values present: ");
            window.open(newUrl, "_self");
    } else {
            alert("Calculate Debt Payment, missing values: " + 
            JSON.stringify(vals));
    }
});


$('#future_val_calc').click(function() {
    vals = getValsByCalcType(vals);
    console.log("vals: " + JSON.stringify(vals));

    if( okayToCalculate(vals)) {
            // vals.payment = getPayment(vals);
            vals.futurevalue = parseFloat(getFutureValue(vals)) + parseFloat(getSimpleInterest(vals));
            vals.interestrevenue = getInterestRevenue(vals);
            vals.futurevalue = (Math.round(vals.futurevalue * 100) / 100).toFixed(2);
            var newUrl = getNewUrl(vals);
            // alert("Calculate Debt Payment, url: " + newUrl + "  all values present: ");
            window.open(newUrl, "_self");
    } else {
            alert("Calculate Future Value, missing values: " + 
            JSON.stringify(vals));
    }
});

$('#simple_int_calc').click(function() {
    vals = getValsByCalcType(vals);
    console.log("vals: " + JSON.stringify(vals));

    if( okayToCalculate(vals)) {
            vals.futurevalue = getSimpleInterest(vals);
            vals.interestrevenue = parseFloat(vals.futurevalue) - vals.currentvalue;
            var newUrl = getNewUrl(vals);
            // alert("Calculate Debt Payment, url: " + newUrl + "  all values present: ");
            window.open(newUrl, "_self");
    } else {
            alert("Calculate Future Value, missing values: " + 
            JSON.stringify(vals));
    }
});

function okayToCalculate(vals) {
    var func = "okayToCalculate";
    var okayToProceed = false;
    console.log(func + ", starting");
    	switch(vals.menu) {
    	  case 'debtPmt':
            if( vals.principal && vals.startdate && vals.years && vals.rate) {
                okayToProceed = true;
            }
    	    break;
    	  case 'futureVal':
            if( vals.payment && vals.startdate && vals.years && vals.rate) {
                okayToProceed = true;
            }
    	    break;
    	  case 'simpleInt':
            if( vals.currentvalue && vals.startdate && vals.years && vals.rate) {
                okayToProceed = true;
            }
    	    break;
    	  default:
    	    // Set up main menu
			alert(func + ", should not be here");
        }
    console.log(func + ", ending. Returning: " + okayToProceed);
    return okayToProceed;
};

function getValsByCalcType(vals) {
    var func = "getValsByCalcType";
    console.log(func + ", starting");
    	switch(vals.menu) {
    	  case 'debtPmt':
            vals.principal = $("#principal").val();
            vals.startdate = $("#startdate").val();
            vals.years = $("#years").val();
            vals.rate = $("#rate").val();
    	    break;
    	  case 'futureVal':
            vals.currentvalue = $("#currentvalue").val();
            vals.startdate = $("#startdate").val();
            vals.years = $("#years").val();
            vals.rate = $("#rate").val();
            vals.payment = $("#payment").val();
    	    break;
    	  case 'simpleInt':
            vals.currentvalue = $("#currentvalue").val();
            vals.startdate = $("#startdate").val();
            vals.years = $("#years").val();
            vals.rate = $("#rate").val();
    	    break;
    	  default:
    	    // Set up main menu
			alert(func + ", should not be here");
        }
    console.log(func + ", ending. Returning: " + JSON.stringify(vals));
    return vals;
};

function getNewUrl(vals) {
    var newUrl = getFullUrl();
    for(var x in vals) {
        newUrl = addParam(newUrl, x, vals[x]);
    } 
    return newUrl;
};

/**
 * input: params - JSON object with key value pairs for parameters
 * output: url with params attached
 */
function addParam(url, param, value) {
    var a = document.createElement('a'); 
    var regex = /(?:\?|&amp;|&)+([^=]+)(?:=([^&]*))*/g;
    var match, str = []; 
    a.href = url;
    param = encodeURIComponent(param);
    while (match = regex.exec(a.search))
        if (param != match[1]) str.push(match[1]+(match[2]?"="+match[2]:""));
    str.push(param+(value?"="+ encodeURIComponent(value):""));
    a.search = str.join("&");
    return a.href;
 }

function getFullUrl() {
    return window.location.href;
}

function getAllParams() {
    var retObj = {};
    var url_str = getFullUrl();
    var url = new URL(url_str);
    var search_params = url.searchParams;
    search_params.forEach(function(value, key) {
       retObj[key] = value;
    });
    return retObj;
};
/**
 * get the request parameters / saved search filters
 * @description - calculates payment based on formula: Pmt = Principal (rate(1+rate)^number of periods / ((1+rate)^number of periods -1))
 * @param {parameters} values for the calculation
 * @returns {float} - the calculated payment amount
 */
function getPayment(parameters){ 
    try {
        var func = "getPayment";
        var principal = parseFloat(parameters.principal);
        var rate =  parseFloat(parameters.rate) / 100; 
        var mRate = rate / 12; 
        var periods = parseFloat(parameters.years) * 12;
        var numerator = mRate * Math.pow(1 + mRate, periods);
        var denominator = Math.pow(1 + mRate, periods) - 1;
        var discount = numerator / denominator;
        var payment = principal * discount;
        payment = (Math.round(payment * 100) / 100).toFixed(2);

        console.log(func + ", " + JSON.stringify({
            principal: principal, 
            rate: rate, 
            mRate: mRate, 
            periods: periods,
            numerator: numerator,
            denominator: denominator,
            discount: discount,
            payment: payment
        }));
        
        return payment; 
    } catch(e) {
        log.error(e.name, JSON.stringify(e));
    }
    
}

/**
 * get the request parameters / saved search filters
 * @description - calculates total interest expense using: interest expense = (payment * number periods) - principal
 * @param {parameters} values for the calculation
 * @returns {float} - the calculated payment amount
 */
function getInterestExpense(parameters){ 
    try {
        var func = "getInterestExpense";
        var principal = parseFloat(parameters.principal);
        var payment = parseFloat(parameters.payment);
        var periods = parseFloat(parameters.years) * 12;
        var interestexpense = (payment * periods) - principal;
        interestexpense = (Math.round(interestexpense * 100) / 100).toFixed(2);

        console.log(func + ", " + JSON.stringify({
            principal: principal, 
            periods: periods,
            payment: payment,
            interestexpense: interestexpense
        }));
        
        return interestexpense; 
    } catch(e) {
        console.log(e.name + ", " +  JSON.stringify(e));
    }
    
}
/**
 * get the request parameters / saved search filters
 * @description - calculates future (FV) value of payments based on formula: FV = Payment ((1+rate)^number of periods - 1 / rate)
 * @param {parameters} values for the calculation
 * @returns {float} - the calculated future value amount
 */
function getFutureValue(parameters) {
//		    	principal = getFutureValue({payment: payment, years: years, rate: rate});
    try {
        var func = "getFutureValue";
        var payment = parseFloat(parameters.payment);
        var rate =  parseFloat(parameters.rate) / 100; 
        var mRate = rate / 12; 
        var periods = parseFloat(parameters.years) * 12;
        var numerator = (Math.pow(1 + mRate, periods)) - 1;
        var denominator = mRate;
        var discount = numerator / denominator;
        var principal = payment * discount;
        principal = (Math.round(principal * 100) / 100).toFixed(2);

        console.log(func + ", " +  JSON.stringify({
            principal: principal, 
            rate: rate, 
            mRate: mRate, 
            periods: periods,
            numerator: numerator,
            denominator: denominator,
            discount: discount,
            payment: payment
        }));
        return principal; 
    } catch(e) {
        console.log(e.name + ", " +  JSON.stringify(e));
    }
    
}
	/**
	 * get the request parameters / saved search filters
	 * @description - calculates total interest revenue using: interest revenue = future value -  (payment * number periods)
	 * @param {parameters} values for the calculation
	 * @returns {float} - the calculated payment amount
	 */
	function getInterestRevenue(parameters){ 
//		    	interestrevenue = getInterestRevenue({principal: principal, years: years, payment: payment });
		try {
			var func = "getInterestRevenue";
			var futurevalue = parseFloat(parameters.futurevalue);
            var currentvalue = isNaN(parseFloat(parameters.currentvalue))
                ? 0
                : parseFloat(parameters.currentvalue);
			var payment = parseFloat(parameters.payment);
			var periods = parseFloat(parameters.years) * 12;
			var interestrevenue = futurevalue - (payment * periods) - currentvalue;
			interestrevenue = (Math.round(interestrevenue * 100) / 100).toFixed(2);

			console.log(func + ", " + JSON.stringify({
				futurevalue: futurevalue, 
				periods: periods,
				payment: payment,
				interestrevenue: interestrevenue
			}));
			
			return interestrevenue; 
		} catch(e) {
			log.error(e.name, JSON.stringify(e));
			console.log(e.name + ", " + JSON.stringify(e));
		}
		
	}
/**
 * get the request parameters / saved search filters
 * @description - calculates future (FV) value of simple interest based on formula: FV = Present Value ((1+rate/number of periods)^number of periods)
 * @param {parameters} values for the calculation
 * @returns {float} - the calculated future value amount
 */
function getSimpleInterest(parameters) {
//		    	principal = getSimpleInterest({currentvalue: currentvalue, years: years, rate: rate});
    try {
        var func = "getSimpleInterest";
        var currentvalue = isNaN(parseFloat(parameters.currentvalue))
            ? 0
            : parseFloat(parameters.currentvalue);
        var rate =  parseFloat(parameters.rate) / 100; 
        var mRate = rate / 12; 
        var periods = parseFloat(parameters.years) * 12;
        var factor = Math.pow(1 + mRate, periods);
        var principal = currentvalue * factor;
        principal = (Math.round(principal * 100) / 100).toFixed(2);

        console.log(func + ", " + JSON.stringify({
            principal: principal, 
            rate: rate, 
            mRate: mRate, 
            periods: periods,
            factor: factor,
            currentvalue: currentvalue 
        }));
        
        return principal; 
    } catch(e) {
        console.log(e.name + ", " +  JSON.stringify(e));
    }
    
	}