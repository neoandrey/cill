//import { RequestHandler, Preloader, Navbar, Sidebar ,ContentHeader, Footer,DisplayManager,DataSynchronizer,PunchBridge, Selector,DashboardTable } from './lib.js';

// import EditorJS from '@editorjs/editorjs';
// import Header from '@editorjs/header';
// import List from '@editorjs/list';

let currentUser = null;
let evaluationID = null
  if (Object.keys(window.defaultComponents).includes('currentUser')){ 
     currentUser = window.defaultComponents.currentUser;
  }
const syncInterval = window.config.syncInterval
const syncMode     = window.config.syncMode
//const dataSynchronizer = new DataSynchronizer();
//new DisplayManager()
////window.DisplayManager = DisplayManager; // Workaround for RequestHandler importing DisplayManager
//window.dataSynchronizer = dataSynchronizer; // Workaround for RequestHandler importing DataSynchronizer
//const defaultVersionMap = {}
//window.syncID = -1
//window.requestHandler = new RequestHandler();
const config = window.config
const appConfig  = window.appConfig
//window.isUpdateRunning= false
let  dashWorker = null;
let syncWorker  = null;

let dbName = config.lokiDBDatabase + '.db'
let idbAdapter = null;
let pa = null;
let db = null;
window.tableMap = {};

$.fn.getCurrentUser = ()=>{ 


  return currentUser;

}

$.fn.initLocalDB = () => { 
     idbAdapter = new LokiIndexedAdapter(dbName);
     pa = new loki.LokiPartitioningAdapter(idbAdapter, { paging: true });
     db = new loki(dbName, { adapter: pa });
     db.loadDatabase({}, function (err) {$.fn.databaseInitialize(); });
}
$.fn.initLocalDB();
$.fn.refreshDisplay = () => {
  //console.log("refreshing...")
 // idbAdapter = new LokiIndexedAdapter(dbName);
    pa = new loki.LokiPartitioningAdapter(idbAdapter, { paging: true });
    db = new loki(dbName, { adapter: pa });
    db.loadDatabase({}, function (err) {
      $.fn.databaseInitialize();
     // console.log(`DisplayManager.lastRunFunction:${DisplayManager.lastRunFunction}`)
      eval(DisplayManager.lastRunFunction);
    });
  
 
  
}

const acceptedFormats = [];

for (let imgFormat of appConfig["IMAGE_FORMATS"]) { 
      acceptedFormats.push(`.${imgFormat}`)
}
    
/**
 * ==============================================================================================================
 * 
 * Section for utility functions
 * 
 * ===============================================================================================================
 */

$.fn.databaseInitialize = () => {
  let dbCollections = [];
  db.collections.map((collection) => {
    dbCollections.push(collection.name);
    window.tableMap[collection.name]  = collection;
     
  })

    window.config.syncInfo.cpanel.filter((x => !dbCollections.includes(x.collectionName))).forEach((collection) => {

      window.tableMap[collection.collectionName] = db.addCollection(collection.collectionName, {
        indices: collection.matchingFields.concat(collection.watchedFields)
        , autoupdate: true
        , unique: [collection.idField]
      });
      
    })
    
}
db.loadDatabase({}, function (err) {
  $.fn.databaseInitialize();
});

// if (Object.keys(DisplayManager.collectionVersionMap).length > 0) {
//   window.config.syncInfo.cpanel.forEach((collection) => { defaultVersionMap[collection.collectionName] = 0 })
//   DisplayManager.collectionVersionMap = defaultVersionMap;
// }

$.fn.showText = (id, test) => {
  alert(test + ' ' + id)
}

function isOnline() {
  return window.navigator.onLine;
}


// function stopSync() {

//   clearInterval(window.syncID);
//   window.syncID = -1;
// }

$.fn.isAlphaNumSpecial = (fieldValue)=>{
  let pattern      =  /^[ A-Za-z0-9_@./#&+\s-]*$/i
  let matchDetails =  fieldValue.match(pattern)
  if (matchDetails && matchDetails.length> 0){
   return true
  }else {
   return false
  }

}


$.fn.isFieldValid = (element, buttonID, siblingIDs) => {
  
  let value = $(element).val().trim();
  
  if (value === "" || !$.fn.isAlphaNumSpecial(value)) {
    
    $(element).addClass('is-invalid')
    $('#' + buttonID).attr('disabled', 'disabled')
    
  } else {
    
    $(element).removeClass('is-invalid');
    let validCount = siblingIDs.length;
    
     for (let id of siblingIDs){

         if($('#'+id).hasClass('is-invalid') ){
            --validCount;
         }

     }
    if (validCount == siblingIDs.length) { 
        
      $('#' + buttonID).removeAttr('disabled');

      }
  }

}


$.fn.cancelDialog = ()=>{ 
  event.preventDefault();
  $.fn.closeDialog();
  $.fn.resetModal();
}


$.fn.highlightSidebar = (objectType) =>{ 
    let navLinks = (document.querySelectorAll('.nav-link'))
    navLinks.forEach((link) => { 
      if (link.id.toLowerCase() !=="manage") {
          link.classList.remove("active")
      }
    })
  if (objectType == "users") {

    $('.page-title').text("Administrators");
    
  } else { 

      $('.page-title').text($.fn.capitalize(objectType))

  }
  let currentPage = DisplayManager.currentTab;
   
  const sidebarPositionMap = currentPage == 'Configurations' ? {
    "users": 0
    , "roles": 1
    , "categories": 2
    , "tactics": 3
    , "biases": 4
    , "principles": 5
    , "optionsets": 6
    , "questions": 7
    , "recommendations": 8
    , "audittrail": 9
  } : {

     "results": 0
    , "summary": 1
    , "details": 2

  }
     const position = sidebarPositionMap[objectType];
      $('#sidebarnav-node-'+position+'-link').addClass("active");
} 


$.fn.sortObject=(obj)=> {
  return Object.keys(obj).sort().reduce(function (result, key) {
      result[key] = obj[key];
      return result;
  }, {});
}



$.fn.areFieldsValid = (buttonID, siblingIDs) => {
  let response = false;
  for (let element of siblingIDs) { 
    element = '#' + element;
    let value = $(element).val();
    if (value === "" || !$.fn.isAlphaNumSpecial(value)) {
      $(element).addClass('is-invalid')
      $('#' + buttonID).attr('disabled', 'disabled')
    } else {
      $(element).removeClass('is-invalid');
      let validCount = siblingIDs.length;
      for (let id of siblingIDs) {
        if ($('#' + id).hasClass('is-invalid')) {
          --validCount;
        }

      }
      if (validCount == siblingIDs.length) {
        $('#' + buttonID).removeAttr('disabled')
        response = true;
      }
      return response;
    }

}
}

$.fn.getColumns = (records)=>{

 let largestColIndex = 0;
 let largestColSize  = 0;
 let index           = 0; 
 records.forEach((record) =>{
    if(Object.keys(record).length > largestColSize  ){
         largestColSize  =  Object.keys(record).length;
         largestColIndex = index;
      }
      index+=1
  })
 
  return Object.keys(records[largestColIndex])
}

$.fn.checkDateOfBirth = (dateValue) => { 
    let ageRestriction=  18
    let userAge = (Date.now() - Date.parse(dateValue)) / (1000 * 60 * 60 * 24 * 365)
    return  (userAge-ageRestriction)>=0
}

$.fn.resetModal = ()=>{

    $('#modal-content').html(`<div class="modal-header">
    <div id="dialog-header-span" class="modal-title col-12">
        <h5></h5>
    </div>
    </div>

    <div class="modal-body" id="dialog-message-div">
    <p>

    </p>
    </div>
    <div class="modal-footer" id="dialog-footer-div">
    <a href="#" type="button" class="btn btn-info" data-dismiss="modal" id="dialog-close-bttn">Close</a>
    <div class="row" id="dialog-bttns" style="display:none"> </div>
    </div>`)

}

$.fn.cancelDialog = ()=>{ 
  event.preventDefault();
  $.fn.closeDialog();
  $.fn.resetModal();
}

$.fn.getTotalDays = (month)=>{

  let days        = 31
  let DayMonths = [3,5,8,10]
  let febIndex    =  1

  if ((new Date()).getFullYear() %4==0 && month==1){
    days = 29
  }else if(month==1){
    days = 28

  }else if(DayMonths.indexOf(month) >-1){
    days = 30
  }
   return days
}

$.fn.getRepeatString = (repeat)=>{

  let repeatVal    = repeat?parseInt(repeat):0;
  let repeatString = "No";
  
  if  (repeatVal == (3600 *24 *30*12)){
  
       repeatVal = 'yearly';
   
  }else if(repeatVal == 3600 *24 *30*3){
  
    repeatString = 'quarterly';
  
  }else if(repeatVal == 3600 *24 *30){
  
    repeatString = 'monthly';
    
  }else if(repeatVal == 3600 *24 *7*2){
    repeatString = 'bi-weekly';
  }else if(repeatVal == 3600 *24 *7){
    repeatString = 'weekly'
  }else if(repeatVal == 3600 *24){
    repeatString = 'daily';
  }else if(repeatVal == 3600){
    repeatString = 'hourly';
  }else{
       repeatString="No";
  }

   return repeatString

}

$.fn.isValidDate = (element,submitBttn, siblings)=>{
 
    let startTime = $(element).val();
   // console.log(startTime)
    let startDate = startTime.length>0?  new Date(startTime):null;

    if(startDate){

      //console.log(new Date().getTime()  - startDate.getTime())
    }
    
 
    if(!startTime  ||  ( startDate && (new Date().getTime()  - startDate.getTime()) ) > 0){
   
      $(element).addClass('is-invalid')
    }else{
 
      let classList =  $(element).attr('class')
      if (classList.indexOf('is-invalid')> -1){
         $(element).removeClass('is-invalid')
      }
      for (let sibling of siblings){
        sibling = '#'+sibling;
        $.fn.isFieldValid(sibling, submitBttn, siblings) 

      }

 
    }
 
}



/**
 * =====================================================================================================================
 * 
 * This section is for functions that create tables on the Admin Panel
 * 
 * =======================================================================================================================
 */
$.fn.checkUserAccess = () => { 
 
   return currentUser? currentUser.roleID: 0
}

$.fn.navigateToPage = (page) => { 
  window.location= `/${page}`
}

$('input[type=radio][name=response]').on('click', (e) => { 

 let selectedOption =  $('input[name="response"]:checked').attr('id');

  if (selectedOption.length > 0) { 
    $("#eval-next-bttn").removeAttr('disabled')

    let finish = $("#eval-finish-bttn").val()
    if (finish) {

      $("#eval-finish-bttn").removeAttr('disabled')
    }
  }

})
$(() => {
  $('input[type=radio][name=response]').on('change', (e) => {

    let selectedOption = $('input[name="response"]:checked').attr('id');

    if (selectedOption.length > 0) {
      $("#eval-next-bttn").removeAttr('disabled')

      let finish = $("#eval-finish-bttn").val()
      if (finish) {

        $("#eval-finish-bttn").removeAttr('disabled')
      }
    }

  })


  $('.form-check-label').on('click', (e) => {
    let radioID = e.target.for
    $(`#${radioID}`).click();
    $("#eval-next-bttn").removeAttr('disabled');
  })

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  $.fn.showConcludeDialog = (header, message, callback) => {
    $.fn.resetModal();
    $('#modal-content').css('width', $.fn.dialogWidth);
    let modalOptions = {
      keyboard: false,
      focus: true,
      backdrop: 'static'
    }
    let logo = $('#site-logo').val();
    let name = $('#site-name').val();
    $('#dialog-close-bttn').hide();
    logo = '<img src="' + logo + '" alt="' + name + '  Logo" />';
    header = (header !== '' || header !== null) ? ('<div class="row"><div class="col-md-4">' + logo + '</div><div class="col-md-8">' + header + '</div></div>') : '<div>' + logo + ' ' + name + ' </div>';
    $('#dialog-header-span').html(header);
    $('#dialog-message-div').html(message);
    $('#dialog-message-div').css('float', 'center');
    $('#dialog-message-div').css('text-align', 'center');

    $('#dialog-bttns').html('<button class="btn btn-danger text-left col-sm-6" onclick="$(\'#is-confirmed\').val(0); $.fn.navigateToPage(\'index\');" id="dialog-no-bttn">Exit</button><button class="btn  btn-success text-right col-sm-6" onclick="(()=>{ $.fn.closeDialog(); ' + callback + '; })()" id="dialog-yes-bttn">Submit</button>')
    $('#dialog-bttns').show();
    $('#dialog-close-bttn').hide();
    $('#myModal').modal(modalOptions);
    $('#myModal').show();
  }

  const getUnique = (records) => {
    let uniqueSet = new Set();
    records.forEach((record) => {
      uniqueSet.add(record)
    })

    return Array.from(uniqueSet)

  }


  $("#pdf-export").on('click', (e) => {
    $("#pdf-export").attr('disabled', 'disabled')
    $.fn.showLoadingDialog('Downloading Results...');
    var body = document.body,
      html = document.documentElement;
    var width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    e.preventDefault();
    let form = $('#container')
                  
    //let cache_width = width
   let a4 = [595.28, 841.89]; // for a4 size paper width and height  
   let  doc = new jsPDF(
      'p', 'mm',a4 
    );
    html2canvas(document.getElementById('container'), {
      imageTimeout: 2000,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
    }).then(function (canvas) {
      let img = canvas.toDataURL("image/png")

      let imgWidth = doc.internal.pageSize.width;
      let pageHeight = doc.internal.pageSize.height;


      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      doc.addImage(img, "PNG", 0, position, imgWidth, imgHeight);

      while (heightLeft >= 0) {

        position -= pageHeight;
        doc.addPage();
        doc.addImage(img, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight
                
      }
                            
      var curDate = new Date();
      var yyyy = curDate.getFullYear();
      var mm = curDate.getMonth() < 9 ? "0" + (curDate.getMonth() + 1) : (curDate.getMonth() + 1); // getMonth() is zero-based
      var dd = curDate.getDate() < 10 ? "0" + curDate.getDate() : curDate.getDate();
      var hh = curDate.getHours() < 10 ? "0" + curDate.getHours() : curDate.getHours();
      var min = curDate.getMinutes() < 10 ? "0" + curDate.getMinutes() : curDate.getMinutes();
      var ss = curDate.getSeconds() < 10 ? "0" + curDate.getSeconds() : curDate.getSeconds();
      let suffix = "".concat(yyyy).concat(mm).concat(dd).concat("_").concat(hh).concat(min).concat(ss);
      doc.save(`cill_evaluation_report_${suffix}.pdf`);
      $("#pdf-export").removeAttr('disabled')
      $.fn.showAlert('Download Complete', 'success', '$.fn.cancelDialog()')

    });


  });

  let groupCode    = opts.groupCode;
  let displayInfo  = opts.displayInfo?opts.displayInfo:{}
  if (groupCode && groupCode != ""){
    displayInfo = displayInfo[0]
  }
  let tacticStats  = displayInfo.tactic_stats;
  let pecentages   = displayInfo.percentages;
  // console.log(displayInfo)
  // console.log(groupCode)
  if (!groupCode || groupCode == "") {

            
        let tacticMap     = {}
        let labelSet      = new Set();
        opts.tactics.forEach((tactic) => {
            if (tactic.tactic_name.toString().toLowerCase().trim() != "not applicable") {
              tacticMap[tactic.tactic_name] = tactic.description
            }
        })
        
        Object.keys(displayInfo.percentages).forEach((tactic_name)=>{
          labelSet.add(tactic_name)
        })

        let labels  = Array.from(labelSet);
        let negatives = []
        let positives = []
      
        labels.forEach((tactic) => {
     
           if(Object.keys(pecentages).includes(tactic)){ 
            positives.push(pecentages[tactic]['positive'] / pecentages[tactic]['total'] * 100.0)
            negatives.push(pecentages[tactic]['negative'] / pecentages[tactic]['total'] * 100.0)
           }
        })
            
        let resultChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Vulnerable',
              backgroundColor: '#F88379',//getRandomColor(), //
              borderColor: 'rgba(60,141,188,0.8)',
              pointRadius: false,
              pointColor: '#c1c7d1',
              pointStrokeColor: 'rgba(60,141,188,1)',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(60,141,188,1)',
              data: negatives
            },
            {
              label: 'Non-Vulnerable',
              backgroundColor:  '#50C878',
              borderColor: 'rgba(210, 214, 222, 1)',
              pointRadius: false,
              pointColor: 'rgba(210, 214, 222, 1)',
              pointStrokeColor: '#c1c7d1',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(220,220,220,1)',
              data: positives
            },
          ]
        }
            
        let barChartData = $.extend(true, {}, resultChartData)
        let temp0 = resultChartData.datasets[0]
        let temp1 = resultChartData.datasets[1]
        barChartData.datasets[0] = temp1
        barChartData.datasets[1] = temp0
        var stackedBarChartCanvas = $('#resultsChart').get(0).getContext('2d')
        var stackedBarChartData = $.extend(true, {}, barChartData)

        var stackedBarChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }

        new Chart(stackedBarChartCanvas, {
          type: 'bar',
          data: stackedBarChartData,
          options: stackedBarChartOptions
        })
            
          
        let tacticBoxes = [];
        let itemCount = labels.length
        let colCount = itemCount > 4 ? 4 : itemCount
        labels.forEach((tactic) => {
          
          let attackTactic = tactic;
          let border = "";

          if (parseInt(pecentages[tactic]['negative'] / pecentages[tactic]['total'] * 100) < 50) {

            border = "border border-success"
          } else if (parseInt(parseFloat(pecentages[tactic]['negative'])/parseFloat( pecentages[tactic]['total'] )* 100) >= 50 && parseInt(pecentages[tactic]['negative'] / pecentages[tactic]['total'] * 100) < 75) {
            border = "border border-warning"

          } else if (parseInt(parseFloat(pecentages[tactic]['negative']) /parseFloat( pecentages[tactic]['total']) * 100)  >= 75) {
            border =  "border border-danger"

          }
          //console.log(`tactic: ${tactic} =>n= ${pecentages[tactic]['negative']},p=${pecentages[tactic]['positive']}`)
          if(parseInt(parseFloat(pecentages[tactic]['negative']) / parseFloat(pecentages[tactic]['total']) * 100)  > 0){
                tacticBoxes.push(`
                                <div class="col-12 col-sm-${colCount}">
                                  <div class="info-box bg-light ${border}">
                                    <div class="info-box-content">
                                      <span class="info-box-text text-center text-muted">${attackTactic}</span>
                                      <span class="info-box-number text-center text-muted mb-0">${(pecentages[tactic]['negative'] / pecentages[tactic]['total'] * 100).toFixed(2)}%</span>
                                    </div>
                                  </div>
                                   </div>`);
          }
        })
            
    $('#tactic-boxes').html(tacticBoxes.join(''))
    let breakdownRows = []
    let tacticChecker = [] 
    Object.keys(tacticStats).forEach((tactic) => {
      if (!tacticChecker.includes(tactic) && (parseInt(pecentages[tactic]['negative'] / pecentages[tactic]['total'] * 100)  > 0)) {
        breakdownRows.push(`<div class="post">
        <h5><strong>Identified Vulnerable Attack: ${tactic}</strong></h5>
        <p>${tacticMap[tactic]} </p>
        <ul>
        <li class="description"><strong>Identified Exploitable Cognitive Biases:</strong> <ol><li>${tacticStats[tactic].bias?(tacticStats[tactic].bias).join('</li><li>'):''}</li></ol>
        <li class="description"><strong>Persuasive Principles Applied by Attacker:</strong><ol><li> ${tacticStats[tactic].principle?(tacticStats[tactic].principle).join('</li><li>'):''}</li></ol>
        <li align="justify"><strong>Recommendations:</strong>
          ${tacticStats[tactic].recommendation?(tacticStats[tactic].recommendation.join('')):''}
        </li>
        <li align="justify"><strong>Scenarios:</strong> <ol><li>${tacticStats[tactic].text?(tacticStats[tactic].text).join('</li><li>'):''}</li></ol>
        </ul>
        </div>`)
        tacticChecker.push(tactic)
      }
    })
          $('#breakdown').html('<h4>Breakdown</h4>' + breakdownRows.join(''));
        //})



  } else {

    // let totalCandidates = opts.results.length;


   
    //let tactics = opts.tactics && Object.keys(opts.tactics).length > 0 ? opts.tactics : [];
    let labelSet = new Set();
    let tacticMap = {}
          
    opts.tactics.forEach((tactic) => {          
      if (tactic.tactic_name.toString().toLowerCase().trim() != "not applicable") {
        tacticMap[tactic.tactic_name] = tactic.description
      }
    })
    Object.keys(displayInfo.percentages).forEach((tactic_name)=>{
      labelSet.add(tactic_name)
    })
  
    let candidateCount = displayInfo.candidate_count
    let attackTactics = []
    let negatives = []
    let positives = []
    let labels    = Array.from(labelSet)
    labels.forEach((tactic) => {
      
      if(Object.keys(pecentages).includes(tactic)){ 
        positives.push(pecentages[tactic]['positive'] / pecentages[tactic]['total'] * 100.0)
        negatives.push(pecentages[tactic]['negative'] / pecentages[tactic]['total'] * 100.0)
      }
    })
       
         
    let resultChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Vulnerable',
          backgroundColor: '#F88379',//getRandomColor(),
          borderColor: 'rgba(60,141,188,0.8)',
          pointRadius: false,
          pointColor: '#c1c7d1',
          pointStrokeColor: 'rgba(60,141,188,1)',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(60,141,188,1)',
          data: negatives
        },
        {
          label: 'Non-Vulnerable',
          backgroundColor: '#50C878',//getRandomColor(),
          borderColor: 'rgba(210, 214, 222, 1)',
          pointRadius: false,
          pointColor: 'rgba(210, 214, 222, 1)',
          pointStrokeColor: '#c1c7d1',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: positives
        },
      ]
    }
        
    let barChartData = $.extend(true, {}, resultChartData)
    let temp0 = resultChartData.datasets[0]
    let temp1 = resultChartData.datasets[1]
    barChartData.datasets[0] = temp1
    barChartData.datasets[1] = temp0
    var stackedBarChartCanvas = $('#resultsChart').get(0).getContext('2d')
    var stackedBarChartData = $.extend(true, {}, barChartData)

    var stackedBarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    }

    new Chart(stackedBarChartCanvas, {
      type: 'bar',
      data: stackedBarChartData,
      options: stackedBarChartOptions
    })
        
    let awarenessData = opts.awareness
    //console.log(awarenessData)
  
    let awarenessLabels = []
    let awarenessCounts = []
    let backgroundColour = []

    awarenessData.forEach((awrn) => {
      awarenessLabels.push(awrn['_id'])
      awarenessCounts.push(awrn['count'])
      backgroundColour.push(getRandomColor())
    })
    // console.log(awarenessLabels)
    // console.log(awarenessCounts)

    let awarenessChartData = {
      labels: awarenessLabels,
      datasets: [
        {
                          
          data: awarenessCounts
          , backgroundColor: backgroundColour
        }
                        
      ]
    }
                  
    let awrnChartData = $.extend(true, {}, awarenessChartData)
    var awarenessChartCanvas = $('#awarenessChart').get(0).getContext('2d')
    var awarenessBarChartData = $.extend(true, {}, awrnChartData)

    var pieOptions = {
      maintainAspectRatio: false,
      responsive: true,
    }
    new Chart(awarenessChartCanvas, {
      type: 'pie',
      data: awarenessBarChartData,
      options: pieOptions
    })

                
    let tacticBoxes = []
    attackTactics = getUnique(attackTactics)
    let colCount = 12 / (attackTactics.length)

    labels.forEach((tactic) => {
      let attackTactic = tactic
      let border = ""
      if (parseInt(  parseFloat(tacticStats[attackTactic]['candidate_count'])/parseFloat(candidateCount) * 100) < 50) {
        border = "border border-success"
      } else if (parseInt(parseFloat(tacticStats[attackTactic]['candidate_count'])/parseFloat(candidateCount) * 100) >= 50 && parseInt(pecentages[tactic]['negative'] / pecentages[tactic]['total'] * 100) < 75) {
        border = "border border-warning"
      } else if (parseInt(parseFloat(tacticStats[attackTactic]['candidate_count'])/parseFloat(candidateCount) * 100) >= 75) {
        border = "border border-danger"
      }
      if(parseInt(tacticStats[tactic]['candidate_count'] / candidateCount * 100)  > 0){
        tacticBoxes.push(` <div class="col-12 col-sm-${colCount}">
          <div class="info-box bg-light ${border}">
            <div class="info-box-content">
              <span class="info-box-text text-center ">${attackTactic} <span class="badge badge-primary">${tacticStats[attackTactic]['candidate_count']}</span></span>
              <span class="info-box-number text-center text-muted mb-0">${(tacticStats[attackTactic]['candidate_count']/candidateCount * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>`);
      }
    })
                  
    $('#tactic-boxes').html(tacticBoxes.join(''))
    let breakdownRows = []

     Object.keys(tacticStats).forEach( (tactic)=>{ 
       if(parseInt(tacticStats[tactic]['candidate_count'] / candidateCount * 100)  > 0){ 
          breakdownRows.push(`<div class="post">
          <h5><strong>Identified Vulnerable Attack: ${tactic}</strong></h5>
          <p>${tacticMap[tactic]} </p>
          <ul>
          <li class="description"><strong>Identified Exploitable Cognitive Biases:</strong> <ol><li>${tacticStats[tactic].bias?(tacticStats[tactic].bias).join('</li><li>'):''}</li></ol>
          <li class="description"><strong>Persuasive Principles Applied by Attacker:</strong><ol><li> ${tacticStats[tactic].principle?(tacticStats[tactic].principle).join('</li><li>'):''}</li></ol>
          <li align="justify"><strong>Recommendations:</strong>
            ${tacticStats[tactic].recommendation?(tacticStats[tactic].recommendation.join('')):''}
          </li>
          <li align="justify"><strong>Scenarios:</strong> <ol><li>${tacticStats[tactic].text?(tacticStats[tactic].text).join('</li><li>'):''}</li></ol>
          </ul>
          </div>`)
      }
               
            }
     )
      

    $('#breakdown').html('<h4>Breakdown</h4>' + breakdownRows.join(''))
  }
})