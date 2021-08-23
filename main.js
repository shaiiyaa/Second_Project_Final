$(function () {// IIFE
    let coins = [];
    let picked_coins = [];// picked for graph
    $(document).ready( async function() {// on load async request function
    
        try {// api coins request
            $( "#progressbar" ).progressbar({ value: false });
            $(".parallax").css("height", "100vh");//background adjusment
            
            coins = await getDataAsync(`https://api.coingecko.com/api/v3/coins`);  

            $( "#progressbar" ).progressbar("destroy");
        }
        catch (err) { // error message
            alert("Error: " + err.status);
        }

        $(".parallax").css("height", "100%");// background adjusment
        printCards(coins);// print cards
        
        $("#mostTradedBtn").on("click", ()=>{//switch between Div's | cards button
            $("#chartContainer").hide();
            $("#aboutPage").hide();
            $("#displaySection").show();
            $(".parallax").css("height", "100%");
        });
        
        $("#aboutBtn").on("click", ()=> {// about page
            $(".parallax").css("height", "100%")
            $("#chartContainer").hide();
            $("#displaySection").hide();
            $("#aboutPage").show();
        });


        let coin_id ;//clicked checkbox card id
        $('input[type="checkbox"]').on('click', function () {// on click checkbox
            coin_id = this.id;
            $(this).attr('state','on');// add attr to checked for term
            
            if ($('[state= "on"]').length <= 5) {// maximum 5 coins for the grap
                switch ($(this).prop("checked")) {
                    case true:// if checked
                    picked_coins.push(coin_id);
                    break
                    case false:// if unchecked
                    $(this).removeAttr('state', 'on');
                    const index = picked_coins.indexOf(this.id);
                    picked_coins.splice(index, 1);  
                    break
                }
            } 
            else {// if there more then 5 coins in the graph
                $(this).removeAttr('state', 'on');
                
                $(".modal-body").empty();// clear and show modal\window
                $(".modal-title").text('Maximum Number Of Coins Is 5!\nYou Must Uncheck One Exsisting Coin');
                $("#myModal").modal('show');
                
                printDecreaseModal();

                $(`#${coin_id}`).prop("checked", false);// uncheck the 5th coin
            }
        
            $('[name="modalCheckBox"]').on('click',function() {// if clicked to uncheck one of the coins 
                const index = picked_coins.indexOf(this.id);// find selected index
                picked_coins.splice(index, 1);                          //
                $(`#${this.id}`).removeAttr('state', 'on');             //remove it
                $(`#${this.id}`).not(this.id).prop("checked" , false);  //
                $("#myModal").modal('toggle');                              
                
                picked_coins.push(coin_id);                             // add new selected coin to graph                                //
                $(`#${coin_id}`).attr('state', 'on');                   //
                $(`#${coin_id}`).prop("checked", true);                 //
            });
        });
    });


    function getDataAsync(url) { // promise function get request
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,// url from argument
                success: data => resolve(data), 
                reject: err => reject(err)
            });
        });
    };


    function printDecreaseModal() { // print into modal window to uncheck a coin 
        for(let i=0; i<picked_coins.length; i++) {// show the picked coins in the modal
            const coinIndex = coins.findIndex(x => x.symbol === picked_coins[i].toLowerCase());// fing image in coins array
            $(".modal-body").append(// print selected coins and checkboxes in modal
                `<div class="card"><div class="card-body">
                <h5 class="card-title"><img src="${coins[coinIndex].image.thumb}">&nbsp;&nbsp;&nbsp;${picked_coins[i]} 
                    <input type="checkbox" checked id="${picked_coins[i]}" name="modalCheckBox" style="width: 20px; height: 20px; float: right">
                    <p class="card-text">${coins[coinIndex].name}</p>
                </h5>
            </div></div>`);
        };
    }


    function printCards(coins) {// print bootstrap cards function
        let rowCounter = 0;
        let cardCounter = 0;
        for (let coin in coins) { // extract coins from api request array
            if (cardCounter % 3 === 0) { // every 3 cards opens new bootstrap row
                rowCounter++;
                $("#displaySection").append(`<div class="row no-gutters rowCounter${rowCounter}"></div>`);
            };
            
            const id = coins[coin].id;
            const symbol = coins[coin].symbol.toUpperCase();
            const name = coins[coin].name;
            const image = coins[coin].image.thumb;
            // appending card attributes and variables
            $(`div.rowCounter${rowCounter}`).append(`
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title"><img src="${image}">&nbsp;&nbsp;${symbol} 
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" name="switchToggle" id="${symbol}" >
                                    <label class="custom-control-label" for="${symbol}"></label>
                                </div>
                            </h5>
                            <p class="card-text">${name}</p>
                            <a id="${id}" class="target btn btn-primary" name="mainInfoCollapse" data-toggle="collapse" href="#infoCollapse-${id}" role="button" aria-expanded="false" aria-controls="infoCollapse-${id}">More Info</a>
                            <div class="collapse"  id="infoCollapse-${id}"></div>
                        </div>
                    </div>
                </div>
                `);

            cardCounter++;
        };
    };

    
    $(document).on('click','.target', async function() { //request function for "more info" button/class=target
        const operator = this.name// where to direct the printing main/modal
        const thisCoin = this.id;
        const existingCoin = JSON.parse(sessionStorage.getItem(`${thisCoin}`));
        // check if specific coin storage is exsisted
        if((existingCoin === null) ) {
            try {
                //close progressbar location
                if(operator === "mainInfoCollapse") { $( "#progressbar" ).progressbar({ value: false }); }
                else { $("#modalProgBar").progressbar({ value: false }); }

                $(`#infoCollapse-${thisCoin}`).empty(); // clear previous info/data
                
                const coin = await getDataAsync(`https://api.coingecko.com/api/v3/coins/${thisCoin}`); 
                
                const coinCurrency = { // save request data into object
                    usd: coin.market_data.current_price.usd,
                    eur: coin.market_data.current_price.eur,
                    ils: coin.market_data.current_price.ils,
                };
                
                sessionStorage.setItem(thisCoin, JSON.stringify(coinCurrency)); // set json data to storage
                // set timer to remove data from storage after 2 min
                setTimeout(() => {
                    sessionStorage.removeItem(`${thisCoin}`);
                }, 20000);
                
                // appending recens data to info collapse
                collapseData = ` 
                <br/>USD: ${coin.market_data.current_price.usd} $ דולר
                <br/>EUR: ${coin.market_data.current_price.eur} € יורו
                <br/>ILS: ${coin.market_data.current_price.ils} ₪ שקל
                `
                // append data location
                if (operator === "mainInfoCollapse") { $(`#infoCollapse-${thisCoin}`).append(collapseData); }
                else{ $(`#infoCollapse-${thisCoin}modal`).append(collapseData); }
                //close progressbar location
                if(operator === "mainInfoCollapse") { $( "#progressbar" ).progressbar("destroy"); }
                else { $( "#modalProgBar" ).progressbar("destroy"); } 
            }
            catch (err) { // error message
                    alert("Error: " + err.status);
            }
        }

        else { //  if there is valid data in storage, appending the info to the collapse
            const collapseData = `
            <br/>USD: ${existingCoin.usd} $ דולר
            <br/>EUR: ${existingCoin.eur} € יורו
            <br/>ILS: ${existingCoin.ils} ₪ שקל`
            
            // where the click event is comming from
            if(operator === "mainInfoCollapse"){ $(`#infoCollapse-${thisCoin}`).empty().append(collapseData); }
            else{ $(`#infoCollapse-${thisCoin}modal`).empty().append(collapseData); };
        }     
    });


    $("#searchBtn").on("click", function() {// search click event

        const input = $("#searchField").val().toLowerCase();
        let found;// boolean to indicate if search match 
        let coinCounter = 0;
        for(let coin in coins) {// run through all coins
            const id = coins[coin].id;
            const symbol = coins[coin].symbol;
            const name = coins[coin].name;
            switch (input) {// search by id,symbol, name
                case id:
                    ShowResult(coinCounter);
                    found = true;
                    console.log(input+"id");
                    break
                    case symbol:
                        ShowResult(coinCounter);
                        console.log(input+"symbol");
                        found = true;
                        break
                        case name:
                            ShowResult(coinCounter);
                            console.log(input+"name");
                    found = true;
                    break
            }
            coinCounter++;
        };
        
        if(found !== true) {// if didn't find match, clear input and "placeholder" text
            $("#searchField").val("").attr("placeholder", "Sorry No Match");
        };
    });


    function ShowResult(coinCounter) {// print search result in case of a match
        const mySearchCoin = coins[coinCounter];
        const id = mySearchCoin.id;
        const name = mySearchCoin.name;
        const symbol = mySearchCoin.symbol.toUpperCase();
        const image = mySearchCoin.image.thumb;

        $(".modal-body").empty();// clear and show modal\window
        $("#myModal").modal('toggle'); 
        
        let check = "";
        if(picked_coins.includes(symbol)) {check = "checked"}// if client search a checked coin

        $(".modal-title").text('');
        $(".modal-body").append(// print searched coin and checkbox in modal
            `<div class="card-body">
                <h5 class="card-title"><img src="${image}">&nbsp;&nbsp;${symbol} 
                    <input type="checkbox" ${check} name="searchModalCheck" id="${symbol}" style="width: 20px; height: 20px; float: right">
                </h5>
                <div id="modalProgBar"></div>
                <p class="card-text">${name}</p>
                <a id="${id}" name="modalInfoCollapse" class="target btn btn-primary"  data-toggle="collapse" href="#infoCollapse-${id}modal" role="button" aria-expanded="false" aria-controls="infoCollapse-${id}modal">More Info</a>
                <div class="collapse" id="infoCollapse-${id}modal"></div>
            </div>`
        );

        
        // on click checkbox inside modal search
        let coin_id ;
        $('input[name="searchModalCheck"]').on('click', function () {
            coin_id = this.id;

            if($(this).prop("checked")){
                if(picked_coins.length < 5) {
                    $(`#${this.id}`).not(this.id).prop("checked" , true);// visual checks the coin
                    $(`#${this.id}`).not(this.id).attr('state','on');// add attr to checked for graph term
                    picked_coins.push(coin_id);// add to graph
                    $("#myModal").modal('toggle');
                } else {
                    $(".modal-body").empty();
                    $(".modal-title").text('The Maximum Number Of Coins Is 5!\nYou Have To Uncheck One Existing Coin');
                    
                    printDecreaseModal();

                    $('[name="modalCheckBox"]').on('click',function() {// if clicked to uncheck one of the coins
                        $(`#${this.id}`).removeAttr('state', 'on');             //remove it
                        $(`#${this.id}`).not(this.id).prop("checked" , false);  //
                        const index = picked_coins.indexOf(this.id);// find selected index
                        picked_coins.splice(index, 1);                          //
                        $("#myModal").modal('toggle');                              
                        
                        picked_coins.push(coin_id);                             // add new selected coin to graph                                //
                        $(`#${coin_id}`).attr('state', 'on');                   //
                        $(`#${coin_id}`).prop("checked" , true);;                 //
                    });
                }
                
                
            } else {
                $(`#${this.id}`).not(this.id).prop("checked" , false);
                $(`#${this.id}`).not(this.id).removeAttr('state','on');// add attr to checked for grap term
                const index = picked_coins.indexOf(coin_id);
                picked_coins.splice(index, 1); 
                $("#myModal").modal('toggle');
            } 
        });
    }

    // open graph click event
    $("#liveReportsBtn").on("click", async function() {
        $(".parallax").css("height", "100vh");// background adjusment
    
            if(picked_coins.length < 1) {
                $("#myModal").modal('toggle');
                $(".modal-content").css("width", "50%") 
                $(".modal-title").text("Please pick your coins");
                $(".modal-body").hide();
                
                setTimeout(() => { // close modal after 2sec
                    $("#myModal").modal('hide');
                    $(".modal-content").css("width", "100%")  
                    $(".modal-body").show();    
                }, 2000);
            }
            else {
                $("#displaySection").hide();// switch between card and grapg section
                $("#aboutPage").hide();// switch between card and grapg section
                $("#chartContainer").show();
    
                const dataCoin1 = [];
                const dataCoin2 = [];
                const dataCoin3 = [];
                const dataCoin4 = [];
                const dataCoin5 = [];
                
                const options = {
                    title: { text: "USD$ Crypto Currency Real-Time" },
                    axisX: { title: "chart updates every 2 secs" },
                    axisY: { suffix: "USD" },
                    toolTip: { shared: true },
                legend: {
                    cursor: "pointer",
                    verticalAlign: "top",
                    fontSize: 22,
                    fontColor: "dimGrey",
                    itemclick: toggleDataSeries
                },
                    // Each selected coin data
                    data: [{
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "#####.##USD",
                        xValueFormatString: "hh:mm:ss TT",
                        showInLegend: true,
                        name: picked_coins[0],
                        dataPoints: dataCoin1
                    },
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "#####.##USD",
                        xValueFormatString: "hh:mm:ss TT",
                        showInLegend: true,
                        name: picked_coins[1],
                        dataPoints: dataCoin2
                    }, 
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "#####.##USD",
                        xValueFormatString: "hh:mm:ss TT",
                        showInLegend: true,
                        name: picked_coins[2],
                        dataPoints: dataCoin3
                    }, 
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "#####.##USD",
                        xValueFormatString: "hh:mm:ss TT",
                        showInLegend: true,
                        name: picked_coins[3],
                        dataPoints: dataCoin4
                    }, 
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "#####.##USD",
                        xValueFormatString: "hh:mm:ss TT",
                        showInLegend: true,
                        name: picked_coins[4],
                        dataPoints: dataCoin5
                    }]
                };
                
                const chart = $("#chartContainer").CanvasJSChart(options);
                
                function toggleDataSeries(e) {
                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    }
                    else {
                        e.dataSeries.visible = true;
                    }
                    e.chart.render();
                }
    
                // initial values
                const time = new Date;
                async function updateChart(count) {
                
                    const coins = await getDataAsync(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${picked_coins[0]},${picked_coins[1]},${picked_coins[2]},${picked_coins[3]},${picked_coins[4]}&tsyms=USD`); // end of url is variable fron the event listeners 
                    
                    coinsValue = [];
                    for(let coin in coins) {
                    let value = coins[coin].USD;
                    coinsValue.push(value); 
                    }
    
                    // updating legend text with  updated with y Value 
                    options.data[0].legendText = picked_coins[0] + ":" + coinsValue[0] + " $USD";
                    options.data[1].legendText = picked_coins[1] + ":" + coinsValue[1] + " $USD";
                    options.data[2].legendText = picked_coins[2] + ":" + coinsValue[2] + " $USD";
                    options.data[3].legendText = picked_coins[3] + ":" + coinsValue[2] + " $USD";
                    options.data[4].legendText = picked_coins[4] + ":" + coinsValue[2] + " $USD";
                    
                    count = count || 1;
                    let deltaY1, deltaY2, deltaY3;
                    for (let i = 0; i < count; i++) {
                        time.setTime(time.getTime() + 2000);
                        deltaY1 = coinsValue[0];
                        deltaY2 = coinsValue[1];
                        deltaY3 = coinsValue[2];
                        deltaY4 = coinsValue[3];
                        deltaY5 = coinsValue[4];
                
                        // pushing the new values if they are picked
                        if (coinsValue.length > 0) {dataCoin1.push({ x: time.getTime(), y: coinsValue[0] })};
                        if (coinsValue.length > 1) {dataCoin2.push({ x: time.getTime(), y: coinsValue[1] })};
                        if (coinsValue.length > 2) {dataCoin3.push({ x: time.getTime(), y: coinsValue[2] })};
                        if (coinsValue.length > 3) {dataCoin4.push({ x: time.getTime(), y: coinsValue[3] })};
                        if (coinsValue.length > 4) {dataCoin5.push({ x: time.getTime(), y: coinsValue[4] })};
                    }
                
                    $("#chartContainer").CanvasJSChart().render();
                }
                updateChart(5);// generates first set of dataPoints 
                // update every 2sec
                setInterval(function () { updateChart() }, 2000);
                };
        });

    // visual sticky navbar
    $(document).ready( async function() {
        
        var stickyNavTop = $(".stickyNavbar").offset().top;
        function stickyNav(){
        var scrollTop = $(window).scrollTop(); 
        if (scrollTop > stickyNavTop - 7) { 
            $(".stickyNavbar").addClass('sticky');
        } else { $(".stickyNavbar").removeClass('sticky'); }
        };
        //run it again every time you scroll
        $(window).scroll(function() {
            stickyNav();
        });
    });
});
