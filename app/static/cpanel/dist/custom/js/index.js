
$.fn.checkUserAccess = () => {

   return currentUser ? currentUser.roleID : 0
}

$.fn.getResultCount = () => {

   const formData = new FormData();
   let resultCount = 0;
   //console.log(JSON.stringify(currentUser))
   if ((currentUser && currentUser.userID && evaluationID) || currentUser.roleID == 1) {

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
         success: (result) => {
            return result?.count
         },
         error: (e) => {

            return 0;

         }
      })

   }

   return resultCount;

}

$.fn.navigateToPage = (page) => {
   window.location = `/${page}`
}


$(() => {
   
   $('#self-eval-start-bttn').on('click', (e) => {
      let objectType = 'summaries'
      e.preventDefault()
      let candidateID = $('#candidate-id').val()
      let formData = new FormData()
      formData.append("candidate_id", candidateID)
      formData.append("mode", "new");
      formData.append("acky", candidateID)
      $.ajax({
         url: `api/add/${objectType}`,
         type: "POST",
         data: formData,
         processData: false,
         contentType: false,
         crossDomain: true,
         success: (result) => {
                        if (result.message == "Unathorized request detected. Please login to continue.") {
            
                  $.fn.showAlert("The Session timed out due to inactivity. Please refresh to continue")
       
               } else { 
                  let sid = Object.keys(result).includes('summary_id')?`s=${result.summary_id}`:``
                  window.location = `/evaluation?${sid}`
            }

         },
         error: (e) => {

            $.fn.showAlert('Evaluation Could not be started', 'danger', '$.fn.closeDialog')

         }
      })


   })


   $('#group-code').on('change', (e) => {
      let code = $('#group-code').val();
      if (code.length < 3) {
         $('#group-code').addClass('is-invalid')
         $('#group-eval-start-bttn').attr('disabled', 'disabled')
      } else {
      
         $.get(`/check/code/${code}&acky=${$('#candidate-id').val()}`, (gCode) => {
            let isValid = gCode && Object.keys(gCode).includes('code') ? true : false
            if (isValid) {
               $('#group-code').removeClass('is-invalid')
               $('#group-code').addClass('is-valid')
               $('#group-eval-start-bttn').removeAttr('disabled');

            }else if(Object.keys(gCode).includes('message')){
               $('#group-code').addClass('is-invalid')
               $('#group-eval-start-bttn').attr('disabled', 'disabled')
               

               if (gCode && gCode.message && gCode.message.toLowerCase().indexOf("Invalid") > -1) {
            
                  $.fn.showAlert("The Session timed out due to inactivity. Please refresh to continue")
       
               } else { 

                  $.fn.showAlert(gCode.message)
               }

            } else {

               $('#group-code').addClass('is-invalid')
               $('#group-eval-start-bttn').attr('disabled', 'disabled')
               $.fn.showAlert("Code is not valid")

            }

         }).fail((e) => {
            $('#group-code').addClass('is-invalid')
            $('#group-eval-start-bttn').attr('disabled', 'disabled')
            $.fn.showAlert("Type provide the unique three-digit code provided by the assessor")
         });
         ;
      }
   })

   $('#group-eval-start-bttn').on('click', (e) => {

      let groupCode = $('#group-code').val();
      if (!groupCode || groupCode.trim() === "" || (groupCode && groupCode.length < 3)) {
         $('#group-code').addClass('is-invalid')
         $('#group-eval-start-bttn').attr('disabled', 'disabled')
         $.fn.showAlert("Type provide the unique three-digit code provided by the assessor")
      } else {

         let objectType = 'summaries'
         e.preventDefault()
         let candidateID = $('#candidate-id').val()
         let formData = new FormData()
         formData.append("candidate_id", candidateID)
         formData.append("group_code", groupCode)
         formData.append("mode", "new");
         formData.append("acky",$('#candidate-id').val() )
         $.ajax({
            url: `api/add/${objectType}`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            crossDomain: true,
            success: (result) => {
               if (result.message == "Unathorized request detected. Please login to continue.") {
            
                  $.fn.showAlert("The Session timed out due to inactivity. Please refresh to continue")
       
               } else {
                  
                  let sid = Object.keys(result).includes('summary_id') ? `s=${result.summary_id}` : ``;
                  let gid = Object.keys(result).includes('group_code') ? `c=${result.group_code}` : ``;
                  if (gid.length > 0) { 
                     sid ='&'+sid
                  }
                    window.location = `/evaluation?${gid}${sid}`
            }

            },
            error: (e) => {

               $.fn.showAlert('Evaluation Could not be started', 'danger', '$.fn.closeDialog')

            }
         })






      }


   })
})