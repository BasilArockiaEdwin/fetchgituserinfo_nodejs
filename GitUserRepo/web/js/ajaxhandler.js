$(document).ready(function(){
	
	
	
    $("#submit").click(function(event){
        event.preventDefault();
		
		if($("#userName").val());{
			alert("Please Select User Name");
		}
		var request = $.ajax({
		  url: "/fetchGitUserInfo",
		  type: "GET",
		  data: {userName : $("#userName").val()},
		  dataType: "html"
		});

		request.done(function(msg) {
			alert("Done=-->"+msg);
		  $("#log").html( msg );
		});

		request.fail(function(jqXHR, textStatus) {
		  alert( "Request failed: " + textStatus );
		});
		
		
    });
});