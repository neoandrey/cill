/**
* Template Name: Arsha - v4.3.0
* Template URL: https://bootstrapmade.com/arsha-free-bootstrap-html-template-corporate/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

const validImageFormats = ["jpeg", "jpg", "png", "gif", "tiff", "psd", "pdf", "eps", "ai", "indd", "raw"]

$.fn.isAlphabetic = (field) => {

    var letters = /^[A-Za-z]+$/;
    if (field.match(letters)) {
        return true;
    } else {

        //showAlert('Username must have alphabet characters only');
        return false;
    }

}

$.fn.areFieldsValid = (buttonID, siblingIDs) => {
  let response = false;
  let validCount = siblingIDs.length;
  for (let element of siblingIDs) {
      element = '#' + element;
      let value = $(element).val();
    if (value && value.trim() === "" || !$.fn.isAlphaNumSpecial(value)) {
      if (!$(element).hasClass('is-invalid')) {
        $(element).addClass('is-invalid')
      }
       $('#' + buttonID).attr('disabled', 'disabled')
         --validCount;
    } else {
      
        if ($(element).hasClass('is-invalid')) {
           $(element).removeClass('is-invalid');
      }
    }
  }
  //console.log(`${validCount} == ${siblingIDs.length}`)
  if (validCount == siblingIDs.length) {
    if ($('#' + buttonID).attr('disabled')=="disabled"||$('#' + buttonID).hasClass('disabled') ) {
         $('#' + buttonID).removeAttr('disabled')
    }
        response = true;
  }


  return response;
}

$.fn.isValidPass = (field) => {

    if ($.fn.isNumeric(field)) return false;
    if ($.fn.isAlphabetic(field)) return false;
    if ($.fn.isAlphaNumSpecial(field)) {

        return true;

    } else return false;
}

$.fn.isValidFile = (elementID) => {
  let files = document.getElementById(elementID).files;
  //console.log("files", files);
  if (files) {
      //console.log(files[0])
      let filePath = files[0]?.name;
      let fileSize  = files[0]?.size;
      const maxSize = window.appConfig.max_content_length;
      //console.log("fileType", fileType)
	  
      if (filePath && filePath.indexOf('.') > -1) {
        
       //let validFileFormats = validImageFormat ["jpeg", "jpg", "png", "gif", "tiff", "psd", "pdf", "eps", "ai", "indd", "raw"];
      //   window.appConfig.image_formats.forEach((imgFormat) => {
      //         validFileFormats.push(imgFormat);
      // })
      let fileExtension = filePath.split(".").splice(-1)[0].toLowerCase();
      return validImageFormats.map((fileFormat) => fileFormat.toLowerCase()).includes(fileExtension) && (maxSize > fileSize );

      } else {
        return false;
      }
  }
  return false;
}

$.fn.isValidImage = (elementID) => {
  let files = document.getElementById(elementID).files;
  if (files){
      let imagePath = files[0]?.name;
      let imgType = files[0]?.type;
      if (imgType && imgType != "" && imgType.split('/')[0] !== "image") {
        return false;
      }
      if (imagePath && imagePath.indexOf('.') > -1) {
        //let validImageFormats = window.appConfig["image_formats"]
        let imageExtension = imagePath.split(".").splice(-1)[0].toLowerCase()
        return validImageFormats.map((imgFormat)=>imgFormat.toLowerCase()).includes(imageExtension)
      } else {
        return false;
      }
}

}

$.fn.isAlphaNumSpecial = (fieldValue)=>{
  let pattern      =  /^[ A-Za-z0-9_@./:,#&+\s-]*$/i
  let matchDetails =  fieldValue && fieldValue.match(pattern)
  if (matchDetails && matchDetails.length> 0){
   return true
  }else {
   return false
  }

}

$.fn.isNumeric = (field) => {

    var numbers = /^[\d,\d.\d]+$/m;
    if (field.match(numbers)) {
        return true;
    } else {
        return false;
    }
}

$.fn.getDateFromObject =(dateObject) =>{
   let dateString =  dateObject;
    if(Object.keys( dateObject ).indexOf('$date') > -1){
      dateString = new Date(dateObject['$date']).toISOString();
   }
   return dateString;
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
$.fn.isValidJSON = (elementID, value, bttnID=null) => {
  let isJsonValid = true;
  try {
    
    JSON.parse(value)
    let classList = $(elementID).attr('class') 
    if (classList.indexOf('is-invalid') > -1) {
      $(elementID).removeClass('is-invalid')
      $(elementID).addClass('is-valid')
      if (bttnID) {
        $(bttnID).removeAttr('disabled', 'disabled')
      }
    }
    

  } catch (e) { 
    isJsonValid = false;
    $(elementID).addClass('is-invalid')
  if (bttnID) { $(bttnID).attr('disabled', 'disabled') }

  }
  return isJsonValid;
} 
$.fn.isValidURL= (value)=> {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(value);
}
$.fn.cancelDialog = () => { 
  
  if(event){ 
      event.preventDefault();
  }
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
  if (objectType.toLowerCase() == 'sitesettings') {
      $('.page-title').text('Site Settings')
  }else if (objectType.toLowerCase() == 'teammembers') {
      $('.page-title').text('Team Members')
  }else if (objectType.toLowerCase() == 'mailtemplates') {
      $('.page-title').text('Mail Templates')
  }else if (objectType.toLowerCase() == 'servicetypes') {
      $('.page-title').text('Service Types')
  }else if (objectType.toLowerCase() == 'audittrail') {
      $('.page-title').text('Audit Trail')
  }else{ 
    $('.page-title').text($.fn.capitalize(objectType))
  }
  
  let currentPage = DisplayManager.currentTab;
  const sidebarPositionMap = currentPage.toLowerCase() == 'configurations' ? {
	"sitesettings": 0
	,"banners": 1
	,"roles": 2
	,"users": 3
	,"teammembers": 4
	,"clients": 5
	,"partners": 6
	,"mailaccounts": 7
	,"mailtemplates": 8
	,"servicetypes": 9
	,"services": 10
	,"jobs": 11
	,"audittrail": 12
  } : currentPage.toLowerCase() == 'components' ? {
    "images": 0
    , "files": 1
    , "pages": 2
    , "sections": 3
  }: {
      
    "dashboard":0
    ,"status":1
    ,"messages":2
    ,"faqs":3

  }
     const position = sidebarPositionMap[objectType];
  $('#sidebarnav-node-' + position + '-link').addClass("active");
  $.fn.highlightNavHeader(DisplayManager.currentTab); 
}
$.fn.sortObject=(obj)=> {
  return Object.keys(obj).sort().reduce(function (result, key) {
      result[key] = obj[key];
      return result;
  }, {});
}
$.fn.checkForUpdates = (oldData, newData)=>{ 

	let dashDataUpdated = false;
	if (!oldData || (oldData.length != newData.length)){
	  	dashDataUpdated = true;
	}

	if(!dashDataUpdated){

		      for (let i in  oldData){
            let oldMetaRecords  = oldData[i]
  
            let newMetaRecords  = newData.filter((record)=> record['_id']==oldMetaRecords['_id'])
            if(newMetaRecords.length == 0){
              dashDataUpdated =true;
              break
            }else{
              newMetaRecords = newMetaRecords[0]
            }
            for( let k of Object.keys(oldMetaRecords)){
              //console.log(k)
             // console.log(oldMetaRecords[k])
             // console.log(newMetaRecords[k])
              if (k !== 'records' && oldMetaRecords[k].length >0 && oldMetaRecords[k] != newMetaRecords[k] ){
                dashDataUpdated = true;
                break;
              }else if (k == 'records'){
                    for(let j in oldMetaRecords[k]){
                       //console.log(j)
                      // console.log(oldMetaRecords[k][j])
                       let oldReportRecords = oldMetaRecords[k][j]

                       let newReportRecords = oldMetaRecords[k].filter((record)=> record['_id']==oldReportRecords['_id'])
                       if(newReportRecords.length== 0){
                            dashDataUpdated =True;
                            break
                       }else{

                        newReportRecords=newReportRecords[0]
                       }


                       for(let l of Object.keys(oldReportRecords)){
                          if(oldReportRecords[l]!==newReportRecords[l]){
                            dashDataUpdated = true;
                            break;
                          }

                       }
                        if(dashDataUpdated){
                          break;
                        }
                                    
                        }
        
        
        
              }


              if(dashDataUpdated){
                break;
              }
            }
            if(dashDataUpdated){
              break;
            }


		      }

	}
	return dashDataUpdated
}
$.fn.syncLokiCollection = (collectionName, callback) => {
  const updateSet = new Set()
  updateSet.add(collectionName);
  let updateCount = 0;
  let fetchUrl = `/cpanel/sync/${collectionName}`;
  let xmlhttp = new XMLHttpRequest();
  let updateQuery = {}
  xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              let results = JSON.parse(this.responseText);           
           
              if (results && Object.keys(results).length > 0 && !Object.keys(results).includes("message")) {
                  
                Object.keys(results).forEach((tableName) => {
                  
                  try{
                  updateQuery[tableName] = []
                  let liveTableData = results[tableName];
                  let localTableData = window.tableMap[tableName] && Object.keys(window.tableMap[tableName]).includes('data') ? tableMap[tableName].data : [];
                  let idField = window.config.syncInfo.cpanel.filter((table) => table.collectionName.toLowerCase() == tableName.toLowerCase())[0]['idField']
                  let localIdList = localTableData.map((record) => { return record[idField] })
                  let liveIdList = liveTableData.map((record) => { return record[idField] })
                  let removedIdList = localIdList.filter((id) => !liveIdList.includes(id))
                  let currentIdList = liveIdList.filter((id) => !removedIdList.includes(id))
                  if (removedIdList && removedIdList.length > 0) {
                    let query = {}
                    query[idField] = { "$in": removedIdList };
                    tableMap[tableName].chain().find(query).remove();
                    updateCount += removedIdList.length
                  }
                  // Clear local tables
                    
                  // if (tableName.toLowerCase() == "assortments") { 
                  //     tableMap[tableName].chain().find({}).remove(); 
                  // }
                  // 

                  //Filter records with version mismatch
                  // db.saveDatabase();
                  db.saveDatabase((data) => {
                    let table = $.fn.capitalize(collectionName); tableMap[table] = db.getCollection(table)
                  });
                  if (localTableData && localTableData.length > 0) {
                    //  console.log(currentIdList);
                    for (let id of currentIdList) {

                      let localRecord = localTableData.filter((record) => record[idField] == id)
                      let liveRecord = liveTableData.filter((record) => record[idField] == id)
                      localRecord = localRecord && localRecord.length > 0 ? localRecord[0] : null
                      liveRecord = liveRecord && liveRecord.length > 0 ? liveRecord[0] : null;
                      
                      if (!localRecord) {
                        updateQuery[tableName].push(id);
                      } else if (parseInt(localRecord['current_version']) != parseInt(liveRecord['current_version'])) {
                            
                        updateQuery[tableName].push(id);
                      }
                    }
                  } else {
                    
                    updateQuery[tableName] = currentIdList;

                  }
                }catch (e) { 
                    console.log(e)
                }

                  });

               
                  let count = 0;

                  Object.keys(updateQuery).forEach((tableName) => { 
                  updateCount +=  updateQuery[tableName].length;
                  count += updateCount;
                  if (updateCount == 0) { 
                    delete updateQuery[tableName];
                  } 

                  })
                
                if (count > 0) { 
                    
                          //  let fetchUrl = DataSynchronizer.mongoBridgeURL + 'localtables/update?q=' + JSON.stringify(updateQuery)
                  let fetchUrl =   '/cpanel/sync/update?q='+JSON.stringify(updateQuery)+`&acky=${currentUser.acky}`
                  Promise.resolve(DataSynchronizer.runGet(fetchUrl, DataSynchronizer.updateLocalTables, { 'updateSet': updateSet, "collectionSyncInfo": window.config.syncInfo.cpanel, 'updateCount': updateCount })).then((e) => { 
                  
                    
                   
                    db.saveDatabase((err) => {
                      if (!err) { 
                        //  console.log(`updating table`)
                             
    
                      } else { console.log(err) } });
                  

                  })
                  
                  
                  
                  
                  }
                  callback();

              }


            
                          
                          
                    
              return results.length
            }
          };
          xmlhttp.open("GET", fetchUrl, true);
          xmlhttp.setRequestHeader('Access-Control-Allow-Headers', '*');
          xmlhttp.setRequestHeader('Content-type', 'application/json');
          xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
          xmlhttp.setRequestHeader('Accept', 'application/json');
          xmlhttp.send()
 
		

}
$.fn.areFieldsValid = (buttonID, siblingIDs) => {
  let response = false;
  let validCount = siblingIDs.length;
  for (let element of siblingIDs) {
      element = '#' + element;
      let value = $(element).val();
    if (value && value.trim() === "" || !$.fn.isAlphaNumSpecial(value)) {
      if (!$(element).hasClass('is-invalid')) {
        $(element).addClass('is-invalid')
      }
       $('#' + buttonID).attr('disabled', 'disabled')
         --validCount;
    } else {
      
        if ($(element).hasClass('is-invalid')) {
           $(element).removeClass('is-invalid');
      }
    }
  }
  //console.log(`${validCount} == ${siblingIDs.length}`)
  if (validCount == siblingIDs.length) {
    if ($('#' + buttonID).attr('disabled')=="disabled"||$('#' + buttonID).hasClass('disabled') ) {
         $('#' + buttonID).removeAttr('disabled')
    }
        response = true;
  }


  return response;
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

  $('#modal-content').html(`            <div class="modal-header">
  <div id="dialog-header-span" class="modal-title col-12 h2">
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

(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    //console.log(el)
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Initiate  glightbox 
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });

    if (document.querySelector("#registration-form")) { 

        let imageUpdated     = false;
        let acceptedFormats  = ["jpeg", "jpg", "png", "gif", "tiff", "psd", "pdf", "eps", "ai", "indd", "raw"];
        let imageLabel       = 'Image File';
      
        $("#registration-form").html(`<div class="card card-dark">
                  <div class="card-header text-center">
                            <h3 class="card-title">Personal Information</h3>
                  </div>
              
                <form class="form-horizontal">
                  <div class="card-body">
                      <div class="form-group row">
                         <div class="col-md-2">
                          <label for="image-file">Profile Image</label>
                        </div>
                        <div class="col-md-10"> 
                        <div id="image-preview" class="text-center">
                            
                            <img class="rounded" id="preview-image" src="" alt="Profile Image"/> 
                            <input type="hidden" name="image_dimensions" id="image-dimensions" value="" />

                        </div>
                          <div class="input-group">
                            <div class="custom-file">
                              <input type="file" class="custom-file-input form-control-lg" accept="${acceptedFormats.join(",")}" id="image-file" name="image_file">
                              <label class="custom-file-label" for="image-file" id="image-label">${imageLabel}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="form-group row">
                              <label for="first-name" class="col-sm-2 form-label">First Name</label>
                              <div class="col-sm-10">
                                    <input type="text" class="form-control" name="first_name" id="first-name" value="" placeholder="First Name">
                              </div>
                        </div>
                        <div class="form-group row">
                            <label for="last-name" class="col-sm-2 form-label">last Name</label>
                            <div class="col-sm-10">
                              <input type="text" class="form-control" name="last_name" id="last-name" value="" placeholder="Last Name">
                          </div>
                        </div>
                  <div class="form-group row">
                      <label class="col-sm-2" >Date of Birth </label>
              
                  <div class="input-group date col-sm-10" id="date-of-birth" data-target-input="nearest">
                        <input type="text" id="birth-date" class="form-control form-control-lg datetimepicker-input" data-target="#date-of-birth" value=""/>
                         <div class="input-group-append" data-target="#date-of-birth" data-toggle="datetimepicker">
                              <div class="input-group-text">
                                    <i class="fa fa-calendar"></i>
                              </div>
                        </div>
                     </div>
                  </div>
                  <div class="form-group row">
                      <label for="email-address" class="col-sm-2 form-label">Email Address</label>
                      <div class="col-sm-10">
                        <input type="text" class="form-control" name="email_address" id="email-address" value="" placeholder="Email Address">
                       </div>
                  </div>
                  <div class="form-group row">
                      <label for="password" class="col-sm-2 col-form-label">Password</label>
                      <div class="col-sm-10">
                        <input type="password" class="form-control" name="password" id="password" value="" placeholder="Password" />
                      </div>
                  </div>

                  <div class="form-group row">
                      <label for="confirm-password" class="col-sm-2 form-label">Confirm Password</label>
                      <div class="col-sm-10">
                        <input type="password" class="form-control" name="confirm_password" id="confirm-password" value="" placeholder="Confirm Password" />
                      </div>
                  </div>

                  <div class="form-group row">
                        <label for="phone-number"  class="col-sm-2">Phone Number</label>
                      <div  class="col-sm-10">
                          <input type="text" class="form-control form-control-lg" name="phone_number" id="phone-number" placeholder="" value="">
                      </div>
                  </div>

                <div class="form-group row">
                  <label for="address" class="col-sm-2 form-label">Address</label>
                  <div class="col-sm-10">
                    <input type="text" class="form-control" name="address" id="address" value="" placeholder="Address">
                  </div>
                </div>

                </div>
                <div class="card-footer">
                    <button type="cancel" class="btn btn-default float-left" id="reg-clear-btn">Clear</button>
                    <button type="submit" class="btn btn-info float-right" id="reg-submit-btn">Submit</button>
                </div>
                </form>
                </div>
                ` );

            let passwordChanged = false;
            $('#reg-clear-btn').on('click', (e) => {
                  e.preventDefault();
                // $.fn.showTableRecords('clients');
              })

              //$('.select2').select2();
        

     
                    $('#date-of-birth').datetimepicker({ "date":(new Date()),format:'YYYY/MM/DDz'});
              
            
        $('.custom-control-input').click((e) => { 
          let elementID = e.target.id
          if ($(`#${elementID}`).attr("checked") == "checked") {
              $(`#${elementID}`).removeAttr("checked")
          } else {
                $(`#${elementID}`).attr("checked", "checked")   
          }
          switch (elementID) { 
    
              case 'reset':
                let resetLabel = $('#reset-label').html()
                if (resetLabel == 'Pending') {

                  $('#reset-label').html('')
                } else { 

                  $('#reset-label').html('Pending')
              }
           
          }
          
          
          })
        //    $('.select2').select2()
      
      $('#password,#confirm-password').each(function (e) {
                      
            $(this).on('change', function (e) {
                
                  passwordChanged = true;
                  //var id = e.target.id;
                  var password = $('#password').val()
                  var confirmPassword = $('#confirm-password').val()
                  var minPassLen = 8
                  //$('#' + id + '-errors').html('');
                  if (!password || password == '') {
                                                  
                    $('#password').addClass('is-invalid')
                    $('#user-submit-btn').attr('disabled', 'disabled')
                              
                  }

                  if (!confirmPassword || confirmPassword == '') {
                                                      
                    $('#confirm-password').addClass('is-invalid')
                    $('#user-submit-btn').attr('disabled', 'disabled')

                  }

                  if ((password  &&  password.length > 0) && (confirmPassword && confirmPassword.length > 0)) {

                    if ((password.length < minPassLen) || (password != confirmPassword) || (password == confirmPassword && !$.fn.isValidPass(password))) {
                                    
                      $('#password').addClass('is-invalid')
                      $('#confirm-password').addClass('is-invalid')
                      $('#user-submit-btn').attr('disabled', 'disabled')
                              
                    } else if (password == confirmPassword && $.fn.isValidPass(password)) {

                      $('#password').removeClass('is-invalid');
                      $('#confirm-password').removeClass('is-invalid');
                    
                    }

                  }

                })

          });

          
      $('#first-name').on('change', (e) => { $.fn.isFieldValid(e.target, 'reg-submit-btn', ['last-name', 'email-address', 'address', 'phone-number']) })
      $('#last-name').on('change', (e) => { $.fn.isFieldValid(e.target, 'reg-submit-btn', ['first-name', 'email-address', 'address', 'phone-number']) })
      $('#email-address').on('change', (e) => { $.fn.isFieldValid(e.target, 'reg-submit-btn', ['first-name','last-name', 'email-address', 'address', 'phone-number']) })
      $('#address').on('change', (e) => { $.fn.isFieldValid(e.target, 'reg-submit-btn', ['first-name','last-name', 'email-address', 'address', 'phone-number']) })
      $('#phone-number').on('change', (e) => { $.fn.isFieldValid(e.target, 'reg-submit-btn', ['first-name', 'last-name', 'email-address', 'address', 'phone-number']) })
      
      $('#image-file').on('change', (e) => {
           imageUpdated = true;
           if (!$.fn.isValidImage('image-file')) {
         
              $('#image-file').addClass('is-invalid')
              $('#image-file').val('')
              $('#image-preview').hide()
                              
           } else {
                                  
             $('#image-file').removeClass('is-invalid');
              const imgFile = e.target.files[0];
              
              let imageElement = document.getElementById('preview-image')  
              if (imgFile) {
                  
                  const fileReader = new FileReader();
                  fileReader.onload = event => {
                    imageElement.setAttribute('src', event.target.result);
                        
                        if (event.target.result && event.target.result != "") {
                             let theImage = new Image();
                             theImage.src = event.target.result;
                          $('#image-label').html(imgFile.name)
                          theImage.onload = () => { 
                             $('#image-dimensions').val(JSON.stringify({"width":  theImage.width,"height":  theImage.height}));
                          }
                         
                
                        } else { 
                          
                          $('#image-dimensions').val('');
                          $('#image-label').html('');
                    }
                  
                    $("#preview-div").show();
                 }
                 fileReader.readAsDataURL(imgFile);
              }
                        
        }

	    	});

      $(".form-control").on('keydown', function (e) {
            
          if (e.key === 'Enter' || e.keyCode === 13) {
                  e.preventDefault();
                  $('#reg-submit-btn').click()
          }
        
      });


      $('#reg-submit-btn').on('submit click', (e) => { 
        
                e.preventDefault();
                let firstName       = $('#first-name').val();
                let lastName        = $('#last-name').val()
                let emailAddress    = $('#email-address').val()
                let address         = $('#address').val();
                let birthDate       = $('#birth-date').val();
                let phoneNumber     = $('#phone-number').val();
                let profileImage    = $('#profile-image').val()
                let password        = $("#password").val();

                let imageName       = $('#image-label').html();
                let imageType       = "profile";
                let uploadedImage   = $('#image-file').val()
                let imageDimensions = $('#image-dimensions').val();
                let imageElement    = document.getElementById("preview-image") 
                if (imageElement) { 
                  imageDimensions = JSON.stringify({ 'width': imageElement.naturalWidth, 'height': imageElement.naturalHeight })
                }
                
                let isImageValid = imageUpdated ? $.fn.isValidImage('image-file') : true
                          
                let valid        = $.fn.areFieldsValid('creator-submit-btn', [ 'first-name', 'last-name','email-address', 'address', 'phone-number', 'password', 'confirm-password'])
                if (valid && isImageValid) {
                  
                     
                  const formData = new FormData();
                  formData.append("fmky", firstName);
                  formData.append("first_name", firstName);
                  formData.append("last_name", lastName);
                  formData.append("email_address", emailAddress);
                  formData.append("address", address);
                  formData.append("date_of_birth", birthDate);
                  formData.append("phone_number", phoneNumber);
                  formData.append("profile_image", profileImage);
                  formData.append("password", password);
                  formData.append("image_updated", imageUpdated);

                  if (imageUpdated) {
                      imageName= `${firstName}_${lastName}_${imageName}`
                      formData.append("image_name", imageName);
                      formData.append("image_type", imageType);
                      formData.append("image_updated", imageUpdated);
                      formData.append("image_dimensions", imageDimensions);
                      formData.append("image_file", $('#image-file').prop('files')[0], uploadedImage);
                      let image = document.getElementById('image-file').files[0];
                      let fields = ["lastModified", "name", "size", "type", "webkitRelativePath"]
                      if (image) {
                        fields.forEach((field) => {
                        formData.append(field, image[field])
                      });
                      }
                  }
                  //console.log("posting...")
                  $.ajax({
                        url: `/forms/registration`,
                        type: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        crossDomain: true,
                        success: (result) => {
                              //$.fn.showUpdatedTable(result, objectType)
                        },
                        error: (e) => {
                          //   $.fn.showAlert('Client Creation Failed', 'danger', () =>{$.fn.showTableRecords(objectType)})
                            
                        

                        }
                  })

                    } else { 
                    //    $.fn.showAlert("Please correct the values in the highlighted fields",'warning', '$.fn.closeDialog()')
                    }
                  
                    
                })


      

    }
  });

})()