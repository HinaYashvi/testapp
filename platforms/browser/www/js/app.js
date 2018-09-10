// Initialize your app
var $$ = Dom7;
var app = new Framework7({  
  root: '#app', // App root element
  pushState: true,
  //popupCloseByOutside:true,
  name: 'Complaint Manager',  // App Name
  //id: 'com.myapp.test',  // App id
  id: 'com.phonegap.complaintmanager',
  panel: {
    swipe: 'left', // Enable swipe panel
  },
  //theme:'material',
  //material: true, //enable Material theme
  routes: routes,
  clicks: {
    externalLinks: '.external',
  },
  navbar: {
    hideOnPageScroll: true,
    iosCenterTitle: false,
  },
  picker: {
    rotateEffect: true,
    openIn: 'popover', 
  },
  popover: {
    closeByBackdropClick: true,
  },
  // Hide and show indicator during ajax requests
    onAjaxStart: function (xhr) {
      app.showIndicator();
    },
    onAjaxComplete: function (xhr) {
      app.hideIndicator();
    }
});

var pictureSource; // picture source
var destinationType; // sets the format of returned value

//$( document ).ready(function() { 

document.addEventListener("deviceready", checkStorage, false); 
    //document.addEventListener("backbutton", onBackKeyDown, false);
//});
var base_url = 'http://starprojects.in/complain_manage/';   // TEST SERVER //
//var base_url = '';   // LIVE SERVER //

// --------------------------- C H E C K  I N T E R N E T  C O N N E C T I O N --------------------- //
function checkConnection() {
    var networkState = navigator.connection.type;
    //alert(networkState);
    if(networkState=='none'){  
        app.router.navigate('/internet/'); 
    }
}
// ******************************************************************************************************* //

// ------------------------------------------- C H E C K  S T O R A G E ------------------------------- //
function checkStorage(){  

  pictureSource = navigator.camera.PictureSourceType;
  destinationType = navigator.camera.DestinationType;
  checkConnection();  
  var sess_u_id = window.localStorage.getItem("session_u_id");
  //alert(sess_u_id); 
  if(sess_u_id==null){
    var sess_u_id = window.localStorage.getItem("session_admin_u_id");  
  }
  document.addEventListener("backbutton", function (e) {
    e.preventDefault(); 
    navigator.notification.confirm("Do you want to Exit ?", onConfirmExit, "Exit Application");
  }, false );
  if(sess_u_id==null){
    app.router.navigate('/');   
  }else{  
    app.router.navigate('/dashboard/'); 
  }
}

// ------------------------------------------- LOGIN : C H E C K L O G I N ------------------------------- //
function checklogin(){
    checkConnection();    
    if (!$$('#loginForm')[0].checkValidity()) { 
     // alert('Check Validity!');
     // console.log('Check Validity!');
    }else{ 
      var form = $(".loginForm").serialize();
      var url=base_url+'app_controller/chklogin'; 
      //console.log(form); 
      $.ajax({
        'type':'POST',
        'url': url, 
        'data':form, 
        success:function(data){
          var json = $.parseJSON(data);
          var json_res = json.loggedin_user[0];
          //console.log("!!!!!!!!"+json_res);
          if(json_res!=undefined){ 
          //alert("in if"); 
            //window.localStorage.setItem("session_u_id",json.loggedin_user[0].u_id);
            window.localStorage.setItem("session_u_fullname",json.loggedin_user[0].u_fullname);
            window.localStorage.setItem("session_u_name",json.loggedin_user[0].u_name);
            window.localStorage.setItem("session_u_mo",json.loggedin_user[0].u_mo);
            window.localStorage.setItem("session_u_pwd",json.loggedin_user[0].u_pwd);
            window.localStorage.setItem("session_u_type",json.loggedin_user[0].u_type);
            var u_type = json.loggedin_user[0].u_type;
            if(u_type==0){
              // ADMIN //
              window.localStorage.setItem("session_admin_u_id",json.loggedin_user[0].u_id);
            }else if(u_type==1){
              // USER //
              window.localStorage.setItem("session_u_id",json.loggedin_user[0].u_id);
            }
            app.router.navigate("/dashboard/");
          }else{
            app.dialog.alert("Authentication Failed!");
            $("#username").val('');
            $("#password").val('');
          }
        }
      });
    }
} 
// ******************************************************************************************************* //

// ------------------------------------------- D A S H B O A R D ----------------------------------------- //
$$(document).on('page:init', '.page[data-name="dashboard"]', function (e) {
  checkConnection();
  //console.log(cordova.file);
  app.preloader.show(); 
  //app.dialog.preloader();
  var sess_u_id = window.localStorage.getItem("session_u_id");
  //alert(sess_u_id);
  if(sess_u_id==null){
    // ADMIN //
    var data = {'session_u_id':'NULL'}   
  }else{
    // USER //
    var data = {'session_u_id':sess_u_id}
  }
  var url=base_url+'app_controller/getComplaintsStatusandCounts';
  $.ajax({
    'type':'POST',
    'url': url, 
    //'data':{'session_u_id':sess_u_id},
    'data':data,
    success:function(data){
      var json = $.parseJSON(data);
      var json_res = json.complaint_counts;
      console.log(json_res);
      var statusdata='';   
      for(var i=0;i<json_res.length;i++){
          var status_type=json_res[i].statustype;
          var status_id=json_res[i].s_id;  
          var status_counts=json_res[i].cnt;  
          var all_compcnt = json_res[i].all_compcnt; 

          if(status_type == 'Assigned'){
            var block_class = "block-assign";
          }else if(status_type == 'Executed'){
            var block_class = "block-exec";
          }else if(status_type == 'In progress'){
            var block_class = "block-preogress";
          }else if(status_type == 'Completed'){
            var block_class = "block-comp";
          }   
          statusdata +='<div class="md-only col-50 card-content card-content-padding dashboard-blocks text-uppercase '+block_class+'" onclick="getStatusWiseComps('+status_id+','+"'"+status_type+"'"+')"><span class="fs-14">'+status_type+'</span><p id="data_counts" class="fs-2em">'+status_counts+'</p></div>';   

          statusdata +='<div class="ios-only col-100 card-content card-content-padding dashboard-blocks text-uppercase '+block_class+'" onclick="getStatusWiseComps('+status_id+','+"'"+status_type+"'"+')"><span class="fs-16">'+status_type+'</span><p id="data_counts" class="fs-2em float-right">'+status_counts+'</p></div>'; 

          $('#dashboard-boxes').html(statusdata); 
          //app.preloader.hide();    
          $("#total_complaints").html(all_compcnt);
        }   
      }
    });
    app.preloader.hide();
});
function getStatusWiseComps(statusid,status_type){
  checkConnection();  
  app.router.navigate("/statusComp/");  
  app.preloader.show();
  //app.dialog.preloader();
  var sess_u_id = window.localStorage.getItem("session_u_id");
  var url=base_url+'app_controller/complinsByStatus';
  //var statusurl = base_url+"app_controller/assignedId";
  if(sess_u_id==null){
    // ADMIN // 
    var data = {'session_u_id':'NULL','statusid':statusid}   
  }else{
    // USER //
    var data = {'session_u_id':sess_u_id,'statusid':statusid}
  } 
  $.ajax({
    'type':'POST',
    'url': url, 
    //'data':{'session_u_id':sess_u_id,'statusid':statusid},
    'data': data,
    success:function(data){
      var json_comps = $.parseJSON(data);
      var json_compres = json_comps.complaintByStatus;
      console.log(json_compres);
      var comaplintStatusdata=''; 
      
      if(json_compres.length!=0){
        for(var j=0;j<json_compres.length;j++){
          var lightred='';
          var status=json_compres[j].statustype;
          var comp_no=json_compres[j].comp_no; 
          var s_id = json_compres[j].s_id;   
          var is_seen_byuser = parseInt(json_compres[j].is_seen_byuser);  
          
          if(status_type=='Assigned'){
            var badge_color = "color-custom";
            if(is_seen_byuser==0){
             lightred='notseen';
            }            
          }else if(status_type=='Executed'){
            var badge_color = "color-executed";
          }else if(status_type=='In progress'){
            var badge_color = "color-progress";
          }else if(status_type=='Completed'){
            var badge_color = "color-complete";
          }        
          
          comaplintStatusdata+='<tr onclick="comp_det_page('+"'"+comp_no+"'"+')" class="'+lightred+'"><td class="label-cell"><a onclick="comp_det_page('+"'"+comp_no+"'"+')">'+comp_no+'</a></td><td class="numeric-cell"><span class="badge '+badge_color+'">'+status_type+'</span></td></tr>';      
            //$('#complaintsbyStatus').html(comaplintStatusdata);
        }
    }else{
      comaplintStatusdata+='<tr><td>No Data Available.</td></tr>';
    }
    $("#page_title").html(status_type);
    $('#complaintsbyStatus').html(comaplintStatusdata);
      app.preloader.hide();
    }
  });
  
}
// ******************************************************************************************************* //

// ---------------------------------------- C O M P L A I N T S ----------------------------------------- //
$$(document).on('page:init', '.page[data-name="complaints"]', function (e) {
  checkConnection();
  app.preloader.show();
  var url=base_url+'app_controller/getAllComplaintsOfUser';
  var sess_u_id = window.localStorage.getItem("session_u_id");
  var sess_u_type = window.localStorage.getItem("session_u_type");
  /*if(sess_u_type==0){ 
    // ADMIN //
    $(".btnblck-custom").removeClass("display-none");
    $(".btnblck-custom").addClass("display-block");
  }*/
  //alert(sess_u_id); 
  if(sess_u_id==null){
    // ADMIN //
    var data = {'session_u_id':'NULL'}   
  }else{
    // USER //
    var data = {'session_u_id':sess_u_id}  
  }
  $.ajax({
    'type':'POST',
    'url': url, 
    //'data':{'session_u_id':sess_u_id},
    'data': data,
    success:function(data){
      var json = $.parseJSON(data);
      var json_res = json.AllComplaints;
      //console.log("*******"+json);
      var comaplintdata=''; 
      for(var j=0;j<json_res.length;j++){
        var lightred='';        
        var status=json_res[j].statustype;
        var comp_no=json_res[j].comp_no;
        var is_seen_byuser=json_res[j].is_seen_byuser;
        
        //var last_status_id = json_res[j].last_status_id;
        //var last_statustype = json_res[j].last_statustype;
        //var comp_status;
        //alert(status+"---"+comp_no+"---"+last_statustype+"---"+last_status_id);
        /*if(last_status_id!=null){
          var comp_status = last_statustype;
        }else{
          var comp_status = status;
        } */

        if(status=='Assigned'){
          var badge_color = "color-custom";
          if(is_seen_byuser==0){
            lightred='notseen';
          }
        }else if(status=='Executed'){
          var badge_color = "color-executed";
        }else if(status=='In progress'){
          var badge_color = "color-progress";
        }else if(status=='Completed'){
          var badge_color = "color-complete";
        }
        comaplintdata+='<tr onclick="comp_det_page('+"'"+comp_no+"'"+')" class="'+lightred+'"><td class="label-cell"><a onclick="comp_det_page('+"'"+comp_no+"'"+')">'+comp_no+'</a></td><td class="numeric-cell"><span class="badge '+badge_color+'">'+status+'</span></td></tr>';
        $('#complaints').html(comaplintdata);  
        app.preloader.hide(); 
      }

    }
  });
});

function comp_det_page(comp_no){
  //alert(comp_no);
  checkConnection();
  app.preloader.show();
  app.router.navigate("/complaintData/");
  var url=base_url+'app_controller/getComplaintData';
  var status_url = base_url+'app_controller/AllCompStatus';
  
  var sess_u_id = window.localStorage.getItem("session_u_id");
  var session_u_type = window.localStorage.getItem("session_u_type");

  $.ajax({
    'type':'POST',
    'url': url, 
    'data':{'comp_no':comp_no},
    success:function(data){
      var json = $.parseJSON(data);
      var json_res = json.complaint_data[0];
      //console.log(json_res+"*****");
      var showcomaplintdata=''; 

      var comp_id = json.complaint_data[0].comp_id;
      
      var complaint_no = json.complaint_data[0].comp_no;
      var complain = json.complaint_data[0].complain;
      var d_name = json.complaint_data[0].d_name;
      var u_fullname = json.complaint_data[0].u_fullname;
      var remarks = json.complaint_data[0].remarks;      
      var add_byfname = json.complaint_data[0].add_byfname;
      var comp_adddate = json.complaint_data[0].comp_adddate;
      var last_editbyadmin_date = json.complaint_data[0].last_editbyadmin_date;
      var u_mo = json.complaint_data[0].u_mo;
      //alert(u_mo);

      var s_id = json.complaint_data[0].s_id;
      var is_seen_byuser = json.complaint_data[0].is_seen_byuser;

      if(sess_u_id==null){
        // ADMIN //
        var u_id = window.localStorage.getItem("session_admin_u_id");        
      }else{
        // USER //
        var u_id = json.complaint_data[0].u_id;
      }
     // alert(is_seen_byuser);
     if(session_u_type==1){
      if(is_seen_byuser==0){
        UpdateIsseen(comp_no);
      }
     }
      if(last_editbyadmin_date!=null && last_editbyadmin_date!=undefined){
        var last_editbyadmin_dt=last_editbyadmin_date;
      }else{
        var last_editbyadmin_dt='---';
      }

      var last_editbyuser_date = json.complaint_data[0].last_editbyuser_date;

      if(last_editbyuser_date!=null && last_editbyuser_date!=undefined){
        var last_editbyuser_dt=last_editbyuser_date;
      }else{
        var last_editbyuser_dt='---';
      }

      var comp_respby = json.complaint_data[0].comp_respby;
      if(comp_respby!=null && comp_respby!=undefined){
        var comp_respby_dt=comp_respby;
      }else{
        var comp_respby_dt='---';
      }

      var comp_respdatetime = json.complaint_data[0].comp_respdatetime;
      if(comp_respdatetime!=null && comp_respdatetime!=undefined){
        var comp_respdatetime_dt=comp_respdatetime;
      }else{
        var comp_respdatetime_dt='---';
      }

      var statustype = json.complaint_data[0].statustype;
      //var file_type = json.complaint_data[0].file_type;
      //var file_path = json.complaint_data[0].file_path;
      //var last_status_id = json.complaint_data[0].last_status_id;
      //var last_statustype = json.complaint_data[0].last_statustype;

      //var comp_status;
      //alert(status+"---"+comp_no+"---"+last_statustype+"---"+last_status_id);
      /*if(last_status_id!=null){
        var comp_status = last_statustype;
      }else{
        var comp_status = statustype;
      } */

      //var attach_image = '<img src="'+base_url+file_path+'" width="280" height="200"/>';

      if(statustype=='Assigned'){
        var badge_color = "color-custom";
      }else if(statustype=='Executed'){
        var badge_color = "color-executed";
      }else if(statustype=='In progress'){
        var badge_color = "color-progress";
      }else if(statustype=='Completed'){
        var badge_color = "color-complete";
      }      
      
      //$(".totalattacehs").html("("+json_attach.length+")"); 

      showcomaplintdata='<div class="card data-table"><table><tbody><tr><td class="label-cell">Complain</td><td class="numeric-cell">'+complain+'</td></tr><tr><td class="label-cell">Department</td><td class="numeric-cell">'+d_name+'</td></tr><tr><td class="label-cell">Handled By</td><td class="numeric-cell">'+u_fullname+'<span class="col button color-green button-small outline-green button-outline float-right ml-5p"><span onclick="call_handler('+"'"+u_mo+"'"+')"><i class="fa fa-phone color-green"></i></span></span></td></tr><tr><td class="label-cell">Remarks</td><td class="numeric-cell">'+remarks+'</td></tr><tr><td class="label-cell">Complain Added By</td><td class="numeric-cell">'+add_byfname+'</td></tr><tr><td class="label-cell">Complain Date</td><td class="numeric-cell">'+comp_adddate+'</td></tr><tr><td class="label-cell">Admin Last Edit On</td><td class="numeric-cell">'+last_editbyadmin_dt+'</td></tr><tr><td class="label-cell">Last Edit On</td><td class="numeric-cell">'+last_editbyuser_dt+'</td></tr><tr><td class="label-cell">Response By</td><td class="numeric-cell">'+u_fullname+'</td></tr><tr><td class="label-cell">Response Date</td><td class="numeric-cell">'+comp_respdatetime_dt+'</td></tr><tr><td class="label-cell">Response Status</td><td class="numeric-cell"><span class="badge '+badge_color+'">'+statustype+'</span></td></tr></tbody></table><div class="list"><ul><form name="user_form" id="user_form" class="mb-15p"><input type="hidden" name="hidd_compid" id="hidd_compid" value="'+comp_id+'" /><input type="hidden" name="hidd_uid" id="hidd_uid" value="'+u_id+'" /><input type="hidden" name="hidd_compid" id="hidd_compid" value="'+comp_id+'" /><input type="hidden" name="hidd_compno" id="hidd_compno" value="'+complaint_no+'" /><div class="item-title item-label newlbl "></div><li class="item-content item-input show-attach display-none md-only"><div class="item-inner"><div class="item-input-wrap "><div class="list accordion-list"><ul class="accr-pad display-none"><li class="accordion-item grey-border"><a href="#" class="item-content item-link light-grey"><div class="item-inner "><div class="item-title text-uppercase grey-text fs-12">Complain Attachments<span class="ml-5p totalattacehs"></span></div></div></a><div class="accordion-item-content"><div class="block attach_collapse" id="attach_collapse"></div></div></li></ul></div></div></div></li><li class="item-content item-input show-attach display-none ios-only mb-2"><div class="item-inner"><div class="item-input-wrap "><div class="list accordion-list"><ul class="accr-pad display-none"><li class="accordion-item grey-border"><a href="#" class="item-content item-link light-grey"><div class="item-inner "><div class="item-title text-uppercase grey-text fs-12">Complain Attachments<span class="ml-5p totalattacehs"></span></div></div></a><div class="accordion-item-content"><div class="block attach_collapse" id="attach_collapse"></div></div></li></ul></div></div></div></li><li class="item-content item-input user-attach display-none md-only"><div class="item-inner"><div class="item-input-wrap "><div class="list accordion-list"><ul class="accr-pad display-none"><li class="accordion-item grey-border"><a href="#" class="item-content item-link light-grey"><div class="item-inner "><div class="item-title text-uppercase grey-text fs-12">User Attachments<span class="ml-5p totaluserattacehs"></span></div></div></a><div class="accordion-item-content"><div class="block attachuser_collapse" id="attachuser_collapse"></div></div></li></ul></div></div></div></li><li class="item-content item-input user-attach display-none ios-only mb-2"><div class="item-inner"><div class="item-input-wrap "><div class="list accordion-list"><ul class="accr-pad display-none"><li class="accordion-item grey-border"><a href="#" class="item-content item-link light-grey"><div class="item-inner "><div class="item-title text-uppercase grey-text fs-12">User Attachments<span class="ml-5p totaluserattacehs"></span></div></div></a><div class="accordion-item-content"><div class="block attachuser_collapse" id="attachuser_collapse"></div></div></li></ul></div></div></div></li><li class="item-content item-input showold-rems display-none md-only"><div class="item-inner"><div class="item-input-wrap"><div class="list accordion-list "><ul class="accr-pad display-none"><li class="accordion-item grey-border"><a href="#" class="item-content item-link light-grey"><div class="item-inner "><div class="item-title text-uppercase grey-text fs-12">user remark<span class="ml-5p totalremsxxxx"></span></div></div></a><div class="accordion-item-content"><div class="block rem_collapse" id=" rem_collapse"></div><div class="w-100 fs-16" id="remarkbtns"><span class="text-red float-right ml-5p mr-5p" onclick="deltLastRem('+comp_id+')"><div class="col button button-small button-round button-outline outline-dangerbtn mb-15p"><i class="fa fa-trash"></i></div></span><span class="grey-text float-right" onclick="editLastRem()"><div class="col button button-small button-round button-outline outline-orangebtn mb-15p"><i class="fa fa-pencil"></i></div></span></div></div></li></ul></div></div></div></li><li class="item-content item-input showold-rems display-none ios-only mb-2"><div class="item-inner"><div class="item-input-wrap"><div class="list accordion-list "><ul class="accr-pad display-none"><li class="accordion-item grey-border"><a href="#" class="item-content item-link light-grey"><div class="item-inner "><div class="item-title text-uppercase grey-text fs-12">user remark<span class="ml-5p totalremsxxxx"></span></div></div></a><div class="accordion-item-content"><div class="block rem_collapse" id=" rem_collapse"></div><div class="w-100 fs-16 id="remarkbtns"><span class="text-red float-right ml-5p mr-5p" onclick="deltLastRem('+comp_id+')"><i class="fa fa-trash"></i></span><span class="grey-text float-right" onclick="editLastRem()"><i class="fa fa-pencil"></i></span></div></div></li></ul></div></div></div></li><li class="item-content item-input md-only"><div class="item-inner"><div class="item-input-wrap"><label class="md-only">Remark</label><textarea rows="10" name="user_remarks" class="grey-border w-100 p-2" id="user_remarks"></textarea></div></div></li><li class="item-content item-input mb-2"><div class="item-inner"><div class="item-input-wrap"><label class="ios-only">Remark</label><textarea rows="10" name="user_remarks" class="grey-border w-100 p-2 ios-only" id="user_remarks"></textarea></div></div></li><li class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><select name="user_status" id="status_sel" class="grey-border fs-14 p-1"></select></div></div></li><li class="item-content item-input md-only"><div class="item-inner"><div class="item-input-wrap"><button class="col button button-small button-outline outline-orangebtn w-50" type="button" onclick="showIcons()">Upload Document</button></div></div></li><li class="item-content item-input ios-only mt-2p"><div class="item-inner"><div class="item-input-wrap"><button class="col button button-small button-outline outline-orangebtn w-50" type="button" onclick="showIcons()">Upload Document</button></div></div></li><li class="item-content item-input showtwoBlocks display-none md-only"><div class="item-inner"><div class="item-input-wrap"><div class="uploadDiv w-100 display-none"><div class="col-100"><div class="row"><div class="20"></div><div class="col-50 picbox text-white" ><a onclick="capturePhoto();" ><div class="innerDiv"><i class="f7-icons picbox-text">camera</i><br/><span class="picbox-text">Capture</span></div></a></div><div class="col-50 picbox text-white" ><a onclick="getPhoto(pictureSource.PHOTOLIBRARY);"><div class="innerDiv"><i class="f7-icons picbox-text">photos</i><br/><span class="picbox-text">Photo Gallery</span></div></a></div><div class="20"></div></div></div></div></div></div></li><li class="item-content item-input showtwoBlocks display-none ios-only"><div class="item-inner"><div class="item-input-wrap"><div class="uploadDiv w-35 display-none"><div class="col-100"><div class="row"><div class="20"></div><div class="col-50 picbox text-white" ><a onclick="capturePhoto();" ><div class="innerDiv"><i class="f7-icons picbox-text">camera</i><br/><span class="picbox-text">Capture</span></div></a></div><div class="col-50 picbox text-white" ><a onclick="getPhoto(pictureSource.PHOTOLIBRARY);"><div class="innerDiv"><i class="f7-icons picbox-text">photos</i><br/><span class="picbox-text">Photo Gallery</span></div></a></div><div class="20"></div></div></div></div></div></div></li><li class="item-content item-input imageblock display-none"><div class="item-inner"><div class="item-input-wrap"><img id="image" src="" style="display:none;width:100%;"></div></div></li><li class="item-content item-input upldbtnDiv display-none"><div class="item-inner"><div class="item-input-wrap"><button onclick="upload();" type="button" class="col button button-fill color-gray display-none " id="upldbtn">Upload</button></div></div></li><li class="item-content item-input md-only"><div class="item-inner"><div class="item-input-wrap"><a href="#" class="col button button-fill orange-btn grey-text " onclick="changeCompStatus('+"'"+complaint_no+"'"+')">Save</a></li><li class="item-content item-input ios-only"><div class="item-inner"><div class="item-input-wrap"><a href="#" class="col button button-big button-fill orange-btn grey-text " onclick="changeCompStatus('+"'"+complaint_no+"'"+')">Save</a></li></div></div></form></ul></div></div>';   


      

        $.ajax({
          'type':'GET',
          'url': status_url, 
          success:function(data){
            var json = $.parseJSON(data);
            var json_status = json.all_status;
            var complaint_status = '';
            complaint_status='<option value="" >--- COMPLAINT STATUS ---</option>';
            //console.log(json_status);
            for(var j=0;j<json_status.length;j++){ 
              var selected='';              
              var s_id_tbl = json_status[j].s_id; 
              var status_name = json_status[j].statustype; 
              if(s_id == s_id_tbl){
                selected = "selected";
              }
              complaint_status+='<option value="'+s_id_tbl+'" '+selected+'>'+status_name+'</option>';
              $("#status_sel").html(complaint_status);
            }          
          }         
        });

        getLastRemarksOfUser(comp_id,sess_u_id);
        /*var rem_url = base_url+"app_controller/getallRemarksbyUser"
        $.ajax({
          'type':'POST',
          'url': rem_url,
          'data':{'comp_id':comp_id,'sess_u_id':sess_u_id}, 
          success:function(rem_data){
            var json_data = $.parseJSON(rem_data);
            var json_rem = json_data.all_remarks;
            var alluser_rems = '';          
            //console.log(json_rem);
            if(json_rem.length!=0){
              $(".showold-rems").removeClass("display-none");
              $(".showold-rems").addClass("display-block");
              $(".accr-pad").removeClass("display-none");
              $(".accr-pad").addClass("display-block");
              $(".totalrems").html("("+json_rem.length+")"); // totalremsxxxx //
              for(var j=0;j<json_rem.length;j++){ 
              var remarks_user = json_rem[j].remarks; 
              var cs_id = json_rem[j].cs_id;
              $("#hidd_csid").val(cs_id);
              //alluser_rems+='<p>'+(j+1)+'. '+remarks_user+'</p>'; // OLD //
              alluser_rems+='<p class="remarknoteditable">'+remarks_user+'</p><input type="text" name="editablelastrem" id="editablelastrem" class="display-none" value="'+remarks_user+'"><button class="col button button-small button-fill color-black display-none" onclick="saveEditedRem()" id="remsvbtn" type="button">Save</button>';
              $(".rem_collapse").html(alluser_rems);
              }    
            }      
          }         
        });*/

        var attach_url = base_url+"app_controller/getallAttachmentsbyComp"
        $.ajax({
          'type':'POST',
          'url': attach_url,
          'data':{'comp_id':comp_id}, 
          success:function(att_data){
            var json_att = $.parseJSON(att_data);
            var json_attach = json_att.allCompAttached;
            //console.log(json_attach);
            var allcomp_attached = '';  
            if(json_attach.length!=0){
              $(".show-attach").removeClass("display-none");
              $(".show-attach").addClass("display-block");
              $(".accr-pad").removeClass("display-none");
              $(".accr-pad").addClass("display-block");
              $(".totalattacehs").html("("+json_attach.length+")");                    
            
              for(var j=0;j<json_attach.length;j++){ 
                var c_attach_id = json_attach[j].c_attach_id; 
                var file_path = json_attach[j].file_path;
                var file_type = json_attach[j].file_type;
                var file_name = json_attach[j].file_name;
                var full_path = base_url+file_path;
                allcomp_attached+='<p><a href="'+full_path+'" onclick="downloaddoc('+"'"+full_path+"'"+','+"'"+file_path+"'"+')">'+(j+1)+'. '+file_name+'</a></p>';
                $(".attach_collapse").html(allcomp_attached);             
              }    
            }      
          }       
        });

        var user_attaches = base_url+"app_controller/getAllUserAttaches";
        $.ajax({
          'type':'POST',
          'url': user_attaches,
          'data':{'comp_id':comp_id}, 
          success:function(useratt_data){
            var user_json_att = $.parseJSON(useratt_data);
            var user_json_attach = user_json_att.allUserAttached;
            console.log(user_json_attach);
            var alluser_attached = '';  
            if(user_json_attach.length!=0){ 
              $(".user-attach").removeClass("display-none");
              $(".user-attach").addClass("display-block");
              $(".accr-pad").removeClass("display-none");
              $(".accr-pad").addClass("display-block");
              $(".totaluserattacehs").html("("+user_json_attach.length+")");                    
            
              for(var j=0;j<user_json_attach.length;j++){ 
                var c_attach_id = user_json_attach[j].attach_id; 
                var u_attfile_path = user_json_attach[j].att_file_path;
                var u_attfile_type = user_json_attach[j].att_file_type;
                var u_attfile_name = user_json_attach[j].att_file_name;
                var u_attfull_path = base_url+u_attfile_path;
                //alluser_attached+='<p><a href="'+u_attfull_path+'">'+(j+1)+'. '+u_attfile_name+'</a></p>';
                alluser_attached+='<p><a download="'+u_attfull_path+'">'+(j+1)+'. '+u_attfile_name+'</a></p>';
                $(".attachuser_collapse").html(alluser_attached);              
              }    
            }      
          }       
        });

        $("#comp_no").html(complaint_no);
        $("#complaint_detail").html(showcomaplintdata);
        app.preloader.hide(); 
    }
  });
}
function call_handler(u_mo){
  window.plugins.CallNumber.callNumber(onSuccess, onError, u_mo, true);
}
function onSuccess(result){
  console.log("Success:"+result);
} 
function onError(result) {
  console.log("Error:"+result);
}
function getLastRemarksOfUser(comp_id,sess_u_id){
  var rem_url = base_url+"app_controller/getallRemarksbyUser"
        $.ajax({
          'type':'POST',
          'url': rem_url,
          'data':{'comp_id':comp_id,'sess_u_id':sess_u_id}, 
          success:function(rem_data){
            var json_data = $.parseJSON(rem_data);
            var json_rem = json_data.all_remarks;
            var alluser_rems = '';          
            //console.log(json_rem);
            //alert("json_rem.length---"+json_rem.length);  
            if(json_rem.length!=0){
              $(".showold-rems").removeClass("display-none");
              $(".showold-rems").addClass("display-block");
              $(".accr-pad").removeClass("display-none");
              $(".accr-pad").addClass("display-block");
              $(".totalrems").html("("+json_rem.length+")"); // totalremsxxxx //
              for(var j=0;j<json_rem.length;j++){ 
              var remarks_user = json_rem[j].remarks; 
              var cs_id = json_rem[j].cs_id;
              //alert(cs_id);
              //$("#hidd_csid").val(cs_id);
              //alluser_rems+='<p>'+(j+1)+'. '+remarks_user+'</p>'; // OLD //
              /*<input type="text" name="editablelastrem" id="editablelastrem" class="display-none" value="'+remarks_user+'>

              <textarea name="editablelastrem" id="editablelastrem" class="display-none">'+remarks_user+'</textarea>
              */
              alluser_rems+='<p class="remarknoteditable">'+remarks_user+'</p><input type="hidden" name="hidd_csid" id="hidd_csid" value="'+cs_id+'"/><input type="hidden" name="old_rem" id="old_rem" value="'+remarks_user+'" /><textarea name="editablelastrem" id="editablelastrem" class="display-none">'+remarks_user+'</textarea><button class="col button button-small button-fill color-black display-none" onclick="saveEditedRem('+comp_id+')" id="remsvbtn" type="button">Save</button>';

              //$(".rem_collapse").html(alluser_rems);
              }    
            }else{
              $("#remarkbtns").addClass("display-none");
              alluser_rems+='<p>No Remark.</p>';
            } 
            $(".rem_collapse").html(alluser_rems);     
          }         
        });
}
function deltLastRem(comp_id){ 
  var hidd_csid = $("#hidd_csid").val();
  var sess_u_id = window.localStorage.getItem("session_u_id");
  if(sess_u_id==null){
    // ADMIN //
    sess_u_id = window.localStorage.getItem("session_admin_u_id");        
  }else{
    // USER //
    sess_u_id = sess_u_id;
  }
  //alert(hidd_csid);
  var dltRemurl = base_url+"app_controller/DltLastRem";
  app.dialog.confirm('Do you want to delete this remark?', function () {
    $.ajax({
      'type':'POST',
      'url': dltRemurl, 
      'data':{'cs_id':hidd_csid,'sess_u_id':sess_u_id}, 
      success:function(dlt_data){
        //alert(dlt_data);
        if(dlt_data=='dltupdated'){          
          app.dialog.alert('Remark Deleted!');
          getLastRemarksOfUser(comp_id,sess_u_id);
        }
      }
    });    
  });
}
function editLastRem(){
  var hidd_csid = $("#hidd_csid").val();
  //var sess_u_id = window.localStorage.getItem("session_u_id");
  //alert(hidd_csid);
  $(".remarknoteditable").addClass("display-none");
  $("#remarkbtns").addClass("display-none");
  $("#editablelastrem").removeClass("display-none");
  $("#editablelastrem").addClass("display-block");
  $("#editablelastrem").focus(); 
  

  $("#remsvbtn").removeClass("display-none");
  $("#remsvbtn").addClass("display-block"); 
}
function saveEditedRem(comp_id){
  //app.preloader.show();
  var hidd_csid = $("#hidd_csid").val();
  var hidd_compid = $("#hidd_compid").val();
  var editablelastrem = $("#editablelastrem").val();

  var old_rem = $("#old_rem").val();
  //alert(editablelastrem);
  var sess_u_id = window.localStorage.getItem("session_u_id");

  if(sess_u_id==null){
    // ADMIN //
        sess_u_id = window.localStorage.getItem("session_admin_u_id");        
  }else{
        // USER //
        sess_u_id = sess_u_id;
  }

 // alert(hidd_csid);
  var editRemurl = base_url+"app_controller/EditLastRem";  
  $.ajax({
    'type':'POST',
    'url': editRemurl, 
    'data':{'cs_id':hidd_csid,'sess_u_id':sess_u_id,'remarks':editablelastrem,'hidd_compid':hidd_compid,'old_rem':old_rem}, 
    success:function(edit_data){
      //alert(edit_data);
      if(edit_data=='lastremupdated'){
        app.dialog.alert('Remark Saved!'); 
        $(".remarknoteditable").removeClass("display-none");
        $("#remarkbtns").removeClass("display-none");
        getLastRemarksOfUser(comp_id,sess_u_id);
        //$(".remarknoteditable").addClass("display-block");
        //$("#remarkbtns").addClass("display-block");  
        //app.preloader.hide();           
      }
    }
  });
}
function UpdateIsseen(comp_no){
  var seen_updturl = base_url+'app_controller/updateSeen';
  $.ajax({
    'type':'POST',
    'url': seen_updturl, 
    'data':{'comp_no':comp_no},
    success:function(seen_data){
    //alert(seen_data);             
    }
  });
}
function showIcons(){
  $(".showtwoBlocks").removeClass("display-none");
  $(".showtwoBlocks").addClass("display-block");
  $(".uploadDiv").removeClass("display-none");
  $(".uploadDiv").addClass("display-block");
}
function showUploadbtn(){
  $(".upldbtnDiv").removeClass("display-none");
  $(".upldbtnDiv").addClass("display-block");
  $("#upldbtn").removeClass("display-none");
  $("#upldbtn").addClass("display-block"); 
}
function downloaddoc(fullpath,folder_path){
  //alert(fullpath+"-----"+folder_path);

var assetURL = fullpath;
var store = cordova.file.externalRootDirectory; // output in android: file:///storage/emulated/0/
// or
// var store = "cdvfile://localhost/persistent/";
var fileName = folder_path;
// NOTE: Sounds folder should already be there in order to download file in that folder
alert(assetURL+"-----"+fileName);

var fileTransfer = new FileTransfer();
fileTransfer.download(assetURL, store + fileName, 
        function(entry) {
            console.log("Success!");
            //appStart();
        }, 
        function(err) {
            console.log("Error");
            console.dir(err);
        });
fileTransfer.onprogress = function(result){
     var percent =  result.loaded / result.total * 100;
     percent = Math.round(percent);
     console.log('Downloaded:  ' + percent + '%');    
     alert('Downloaded:  ' + percent + '%');
};

}
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
    quality: 30,
    targetWidth: 600,
    targetHeight: 600,
    destinationType: destinationType.FILE_URI,
    saveToPhotoAlbum: true
  }); 
}
function onPhotoDataSuccess(imageURI){
// Uncomment to view the base64-encoded image data
  console.log(imageURI);
  // Get image handle
  var cameraImage = document.getElementById('image');
  // Unhide image elements  
  $(".imageblock").removeClass("display-none");
  $(".imageblock").addClass("display-block");
  cameraImage.style.display = 'block';
  // Show the captured photo
  // The inline CSS rules are used to resize the image
  cameraImage.src = imageURI;
  showUploadbtn();
}
function onFail(message) {
  alert('Failed because: ' + message);
}



// ------------------------ FROM GALLERY -------------------------- //
function getPhoto(source) {  
  // Retrieve image file location from specified source
  //navigator.camera.getPicture(onPhotoURISuccess, onFail, {
 /* navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
    quality: 30,
    targetWidth: 600,
    targetHeight: 600,
    destinationType: destinationType.FILE_URI,
    sourceType: source
  });*/
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { 
    quality: 50,
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY, 
    allowEdit: true,
    targetWidth: 600,
    targetHeight: 600,
    destinationType: Camera.DestinationType.FILE_URI
  }); //cordova-plugin-photo-library@2.1.1
}
 


function upload(){ 
//alert("clicked");  
  var img = document.getElementById('image'); 
  //app.preloader.show();
  app.dialog.preloader('Uploading....');
  //app.showPreloadr();
  var imageURI = img.src;
  var options = new FileUploadOptions();
  options.fileKey="file";
  options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
  options.mimeType="image/jpeg";
  options.chunkedMode = false;
  //options.httpMethod = "POST";
  options.headers = {
     Connection: "close"
  };
  // setup parameters
  var params = {};
  params.fullpath =imageURI;
  params.name = options.fileName;
  var ft = new FileTransfer();
  //var url="";
  //ft.upload(imageURI, encodeURI(url+'www/contact_photo'), win, fail, options);
  var hidd_compid = $("#hidd_compid").val();
  //alert(hidd_compid);
  var sess_u_id = window.localStorage.getItem("session_u_id");
  var uploadControllerURL = base_url+"app_controller/photoupload/"+hidd_compid+"/"+sess_u_id;

  ft.upload(imageURI,uploadControllerURL, win, fail, options,true); 

  // for file download: https://ayyaz.io/cordova-download-file-get-dowload-progress //


  //alert(ft);
  //console.log(ft); 
  //app.preloader.hide();
  //app.hidePreloadr();
  //alert("done");
}
function win(r) {
    console.log("Code = " + r.responseCode);
    var responseCode = r.responseCode;
    if(responseCode==200){
      app.dialog.alert("Upload Done.");      
      app.dialog.close();
    }
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
}
function fail(error) {
  alert("An error has occurred: Code = " + error.code);
  alert("upload error source " + error.source);
  alert("upload error target " + error.target);
}

function changeCompStatus(complaint_no){
  //alert(complaint_no);
  var hidd_compid = $("#hidd_compid").val();
  var hidd_uid = $("#hidd_uid").val();
  //alert("hidd_uid"+hidd_uid);
  var user_remarks = $("#user_remarks").val();
  var status_sel = $("#status_sel").val();
  var url = base_url+"app_controller/addUserRemark";
  //alert(hidd_compid+"---"+hidd_uid+"---"+user_remarks+"---"+status_sel);
  $.ajax({
    'type':'POST',
    'url': url, 
    'data':{'hidd_compid':hidd_compid,'hidd_uid':hidd_uid,'user_remarks':user_remarks,'status_sel':status_sel},

    success:function(data){ 
      if(data=='success'){
        app.dialog.alert("Complain updated successfully");
        app.router.navigate("/complaints/");
      }
    }
  });
}
// ******************************************************************************************************* //

// --------------------------------------------- L O G O U T ------------------------------------------ //
function logOut(){
  checkConnection();
  $(".popover-backdrop.backdrop-in").css("visibility","hidden");
  $(".popover.modal-in").css("display","none");
  window.localStorage.removeItem("session_u_fullname"); 
  window.localStorage.removeItem("session_u_id"); 
  window.localStorage.removeItem("session_u_mo"); 
  window.localStorage.removeItem("session_u_name");
  window.localStorage.removeItem("session_u_pwd");
  window.localStorage.removeItem("session_u_type");
  window.localStorage.removeItem("session_admin_u_id");
  app.router.navigate('/index/'); 
}
// ******************************************************************************************************* //
