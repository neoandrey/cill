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

$.fn.checkReportFile = (element)=>{
  let value = $(element).val()
 // console.log(`Report uploaded: ${value}`)
  if(value.length>0 && value.indexOf('.')>-1 &&  window.config.UPLOAD_EXTENSIONS.indexOf(value.split('.').pop().toString().toLowerCase()) > -1){ 
    $("#report-header").removeClass("card-warning")
    $("#report-header").addClass("card-primary")
    $("#report-title").html("Juice Report Upload")
  }else{

    $("#report-header").removeClass("card-primary")
    $("#report-header").addClass("card-warning")
    $("#report-title").html("JUICE Report Upload - Please select a valid JUICE Report")

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

$.fn.resetModal = ()=>{

$('#modal-content').html(`            <div class="modal-header">
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

$.fn.getResultCount = () => { 

  const formData = new FormData();
  let resultCount = 0;
 //console.log(JSON.stringify(currentUser))
  if ((currentUser && currentUser.userID && evaluationID) || currentUser.roleID==1) { 
    
      formData.append('user_id', currentUser.userID);
      formData.append('evaluation_id', currentUser.userID);
      formData.append('acky',  $('#candidate-id').val());
     $.ajax({
                url: "/api/result_count",
                type: "POST",
                data: formData,
                processData: false,
                processData: false,
                contentType: false,
                crossDomain: true,
                success:  (result)=> {
                     return result?.count
                },
                error: (e)=>{
        
                  return 0;
        
                }
     })
    
  }
  
  return resultCount;

}

$.fn.navigateToPage = (page) => { 
  window.location= `/${page}`
}
$(() => {
  $('input[type=radio][name=response]').on('click', (e) => {

    let selectedOption = $('input[name="response"]:checked').attr('id');

    if (selectedOption.length > 0) {
      $("#eval-next-bttn").removeAttr('disabled')

      let finish = $("#eval-finish-bttn").val()
      if (finish) {

        $("#eval-finish-bttn").removeAttr('disabled')
      }
    }

  })

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



  $.fn.selectAwareness = () => {

    $.fn.getAlternative = (alternative) => {
      `<div class="form-check">
				<input class="form-check-input" type="radio" name="response" id="${alternative}">
				<label class="form-check-label" for="${alternative}">
				  ${alternative}
				</label>
			  </div>`
    }
    
    $.get(`/data/awareness?awareness={}&acky=${$('#candidate-id').val()}`, (response) => {
      let awareness = response && Object.keys(response).includes('awareness') ? response['awareness'] : [];
      let awarenessMethods = awareness.map((awareness) => {

        return $.fn.getAlternative(awareness)

      })

      let modalOptions = {
        keyboard: false,
        focus: true,
        backdrop: 'static'
      }


      $('#modal-content').html(`
  <div class="card card-primary" id="awareness-header">
    <div class= "card-header">
    <h3 class="card-title" id="awareness-title" >Choose Preferred Awareness Method</h3>
              </div >
  <form id="awareness-upload-form">
    <div class="card-body">
   
     ${awarenessMethods.join('')}
      
    </div>
    <div class="card-footer">
      <div class="row">
          <div class="col-6" align="left">
             
          </div>
          <div class="col-6" align="right">
              <button id="awareness-select-bttn" class="btn btn-primary">Finish</button>
          </div>
      </div>
    </div>
  </form>
  </div>`);
      $('#myModal').modal(modalOptions);
      $('#myModal').show();


      $('#awareness-select-bttn').on('click', (e) => {

        let selectedOption = $('input[name="response"]:checked').attr('id');
        let summaryID = $('#summary-id').val()


        if (selectedOption) {

          const formData = new FormData();
          formData.append("preferred_awareness_method", selectedOption);
          formData.append("summary_id", summaryID)
          formData.append('acky',  $('#candidate-id').val());

          $.ajax({
            url: "/api/update/summary",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            //async: true,
            crossDomain: true,
            success: (result) => {
              new Promise((resolve) => {
                resolve($.fn.resetModal())
              }).then(() => {

                $.fn.showAlert('Your preferred method of raising awareness has been saved', 'success', `$.fn.navigateToPage('results')`)
              })
              //alert('cill Report Uploaded Successful')
              // 
            },
            error: (e) => {

              new Promise((resolve) => {
                resolve($.fn.resetModal())
              }).then(() => {

                $.fn.showAlert('Unable to save preferred awareness method', 'danger', `$.fn.navigateToPage('results')`)
              })

            }
          });

        } else {

          alert("Please select an option to proceed.")
          e.preventDefault();

        }

      })


    }).fail((e) => {

      $.fn.showAlert("Unable to retrieve list of methods for creating awareness", 'warning', `$.fn.navigateToPage('index')`)
    });




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

    $('#dialog-bttns').html('<div class="row"><div class="col-md-6 text-left"><button class="btn btn-danger" onclick="$(\'#is-confirmed\').val(0); $.fn.navigateToPage(\'index\');" id="dialog-no-bttn">Exit</button></div><div class="col-md-6"><button class="btn  btn-success text-right"" onclick="(()=>{ $.fn.closeDialog(); ' + callback + '; })()" id="dialog-yes-bttn">Submit</button></div></div>')
    $('#dialog-bttns').show();
    $('#dialog-close-bttn').hide();
    $('#myModal').modal(modalOptions);
    $('#myModal').show();
  }


  $("#eval-next-bttn").on('click', (e) => {
    $("#eval-next-bttn").attr('disabled', 'disabled')
    let objectType = 'summaries'
    e.preventDefault()
    let candidateID = $('#candidate-id').val()
    let summaryID = $('#summary-id').val()
    let questionID = $('#question-id').val()
    let groupCode = $('#group-code').val()

    let formData = new FormData()
    formData.append("candidate_id", candidateID)
    formData.append("mode", "edit");
    formData.append("summary_id", summaryID)
    formData.append("current_question", questionID)
    if (groupCode && groupCode != "None" && groupCode != "") {
      formData.append("group_code", groupCode)
    }
    formData.append('acky', $('#candidate-id').val());
    
    $.ajax({
      url: `api/add/${objectType}`,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      crossDomain: true,
      success: (result1) => {
        
          objectType = 'details'
          let candidateID = $('#candidate-id').val()
          let summaryID   = $('#summary-id').val()
          let questionID  = $('#question-id').val()
          let groupCode   = $('#group-code').val()
          let detailID    = $('#detail-id').val()
            
          let selectedOption = $('input[name="response"]:checked').attr('id');
          let formData = new FormData()
          formData.append("candidate_id", candidateID)
          formData.append('acky', candidateID);
          if (detailID && detailID != "None" && detailID != "") {

            formData.append("mode", "edit");
            formData.append("detail_id", detailID);

          } else {
            formData.append("mode", "new");

          }
              
          formData.append("summary_id", summaryID)
          formData.append("current_question", questionID)
          if (groupCode && groupCode != "None" && groupCode != "") {
            formData.append("group_code", groupCode)
          }

          let temp = {}
          temp[questionID] = selectedOption
          formData.append("answer_map", JSON.stringify(temp))
          formData.append("acky", candidateID)
          $.ajax({
            url: `api/add/${objectType}`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            crossDomain: true,
            success: (result) => {

              if (result1.message == "evaluation complete") {

                let groupCodeCheck = $('#group-code').val();

                if (groupCodeCheck && groupCodeCheck.trim() != "None" && groupCodeCheck.trim().length > 0) {
                  //$.fn.selectAwareness();
                  window.location = `/awareness?c=${groupCode}&s=${summaryID}`
                } else {

                  $.fn.showAlert('Evaluation Complete', 'success', `$.fn.navigateToPage('results')`)
                  $.fn.showConcludeDialog('Evaluation Complete', 'This evaluation session has come to an end. Would you like to submit?', `$.fn.navigateToPage('results')`)

                }

              } else {

                window.location =  `/evaluation?c=${groupCode}&s=${summaryID}`

              }

            },
            error: (e) => {

              $.fn.showAlert('Unable to reach server', 'danger', '$.fn.closeDialog')

            }
          })

          

        
      },
        error: (e) => {
                
          $.fn.showAlert('Evaluation Could not be started', 'danger', '$.fn.closeDialog')

        }
      
    })
	

  })
  let response = document.getElementsByName("response");
  response.forEach((opt) => opt.removeAttribute("disabled"))
  
})