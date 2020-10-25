$(document).ready(()=>{
    $("#notify").click(()=>{
        $.ajax({
            url:'/notifications',
            type:'GET',
            dataType: 'json',
            success:(data)=>{
                $('#notifier').text('');
                console.log('ajax success',data);
                data.forEach((notification)=>{
                    $('#notifier').append('<p>'+notification.message+'</p>');
                    $('#notifier').append('<p><a href="/profile/'+notification.sender+'">Click Here To View His Profile!</a></p>');
                    $('#notifier').append('<p>'+notification.date+'<span>   </span>'+notification.time+'</p>');
                });
                $('#notifier').toggleClass('show');
            };
        });
    });
});