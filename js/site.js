"use strict";
//socket reference

//prevent right click
//document.addEventListener('contextmenu', event => event.preventDefault());

var socket = undefined;
$(function(){


    

    socket = io(); //load socket.io-client and connect to the host that serves the page

    $( '#dl-menu' ).dlmenu({
        animationClasses : { classin : 'dl-animate-in-2', classout : 'dl-animate-out-2' },
        backTitle: "Vissza"
    });

    var displayMessagePrototype =  function (msg, timeout = 0){
        var instance = this;
        (function(){
            var $this = instance;
            var message = {
                message : "",
                title : "",
                type : "error",
            };

            $.extend(message, msg);

            var msgDiv = $(`<div class="container-fluid">
            <div class="row nb-notification ${message.type}" ><!-- role="alert"-->
            <div class="">
                    ${displayMessagePrototype.svg[message.type]}
                    <div class="nb-notification__text-wrapper">
                        <p class="nb-notification__title">${message.title}</p>
                        <p class="nb-notification__subtitle">${message.message}</p>
                    </div>
            </div>
            <button data-notification-btn="" class="nb-notification__close-button" type="button">
                    <svg class="nb-notification__close-icon" aria-label="close" width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.32 5L10 8.68 8.68 10 5 6.32 1.32 10 0 8.68 3.68 5 0 1.32 1.32 0 5 3.68 8.68 0 10 1.32 6.32 5z" fill-rule="nonzero"></path>
                    </svg>
            </button>
            </div>
            </div>`);
            msgDiv.appendTo($($this));

            $(msgDiv).find(".nb-notification__close-button")[0].element = msgDiv;
            
            if(timeout > 0){
                setTimeout(() => {
                    msgDiv.remove();
                }, timeout);
            }
            

            
        })();
    };

    displayMessagePrototype.svg = {
        info: `<svg aria-hidden="true" width="50" height="50" focusable="false" data-prefix="fas" data-icon="info-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="nb-notification__icon"><path fill="" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z" class=""></path></svg>`,
        error: `<svg aria-hidden="true" width="50" height="50" focusable="false" data-prefix="fas" data-icon="ban" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="nb-notification__icon"><path fill="" d="M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z" class=""></path></svg>`,
        success: `<svg aria-hidden="true" width="50" height="50" focusable="false" data-prefix="fas" data-icon="check-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="nb-notification__icon"><path fill="" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z" class=""></path></svg>`,
        warning: `<svg aria-hidden="true" width="50" height="50" focusable="false" data-prefix="fas" data-icon="exclamation-triangle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="nb-notification__icon"><path fill="" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z" class=""></path></svg>`,
    };
    
    $.fn.displayMessage = displayMessagePrototype;
    
    $(document).on("click", ".nb-notification__close-button", function(){
        $(this.element).remove();
    });

    $(document).on("click", "label.soft-input", function(){
        $.post("api/OpenSoftInput", {}, function(data){
            var success = data.success || false;
            
            if(!success){
                $("#generalMessage").displayMessage({message: data.error});
                return;
            }
            

        }, "json").always(function(){
            
        });
    });


    $(document).on("click", ".toggleFullScreen", function(e){

        $(this).removeClass("fa-compress").removeClass("fa-expand");
        var cl = "fa-expand";
        if(toggleFullScreen()){
            cl = "fa-compress";
        }

        $(this).addClass(cl);
    });

    $(document).find(".toggleFullScreen").first().trigger("click");

    $.datepicker.setDefaults({
        dateFormat : "yy-mm-dd",
        closeText: 'bezár',
        prevText: 'vissza',
        nextText: 'előre',
        currentText: 'ma',
        monthNames: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június','Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún',	'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'],
        dayNames: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
        dayNamesShort: ['Vas', 'Hét', 'Ked', 'Sze', 'Csü', 'Pén', 'Szo'],
        dayNamesMin: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
        weekHeader: 'Hét',
    });
    
    $(".date").datepicker();

    //Egyenlőre nem kell mert nincs kijelző
    // $("input:not(.date):not(.num)").keyboard();

    // $('input.num')
	// .keyboard({
	// 	layout : 'num',
	// 	restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
	// 	preventPaste : true,  // prevent ctrl-v and right click
	// 	autoAccept : true
	// });
    
    

    
    
});


function deepSerializeForm(form) {

    var obj = {};

    var formData = new FormData(form);

    var coerce_types = { 'true': !0, 'false': !1, 'null': null };

    /**
     * Get the input value from the formData by key
     * @return {mixed}
     */
    var getValue = function (formData, key) {

        var val = formData.get(key);

        val = val && !isNaN(val) ? +val              // number
            : val === 'undefined' ? undefined         // undefined
                : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                    : val;                                                // string

        return val;
    }

    for (var key of formData.keys()) {

        var val = getValue(formData, key);
        var cur = obj;
        var i = 0;
        var keys = key.split('][');
        var keys_last = keys.length - 1;


        if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {

            keys[keys_last] = keys[keys_last].replace(/\]$/, '');

            keys = keys.shift().split('[').concat(keys);

            keys_last = keys.length - 1;

        } else {

            keys_last = 0;
        }


        if (keys_last) {

            for (; i <= keys_last; i++) {
                key = keys[i] === '' ? cur.length : keys[i];
                cur = cur[key] = i < keys_last
                    ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
                    : val;
            }

        } else {

            if (Array.isArray(obj[key])) {

                obj[key].push(val);

            } else if (obj[key] !== undefined) {

                obj[key] = [obj[key], val];

            } else {

                obj[key] = val;

            }

        }

    }

    return obj;

}
    
function isInFullScreen(){
    return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement === true;
}

function requestFullScreen(){
    var el = document.documentElement;
    var rfs = el.requestFullscreen
        || el.webkitRequestFullScreen
        || el.mozRequestFullScreen
        || el.msRequestFullscreen 
    ;

    rfs.call(el);
}

function closeFullScreen(){
    var el = document;
    var rfs = el.exitFullscreen
        || el.webkitCancelFullScreen
        || el.mozCancelFullScreen
        || el.msExitFullscreen 
    ;

    rfs.call(el);
}

function toggleFullScreen(){
    var ret = !isInFullScreen();
    isInFullScreen()?closeFullScreen():requestFullScreen();
    return ret;
}


function debounce(fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}