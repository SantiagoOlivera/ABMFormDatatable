var liveSearchInputs = document.querySelectorAll('.live-search-input');

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
    .live-search-options-container{
        width: 100%;
        position: relative;
    }
    .live-search-options{
        width: inherit;
        height: auto;
        border-radius: 3px;
        position: absolute;
        outline: 1px solid black;
        background: grey;
        z-index: 5000;
    }
    .live-search-options-spinner{
        width: 100%;
        height: 100%;
        border: 1px solid green;
    }
`;

document.getElementsByTagName('head')[0].appendChild(style);

var _liveSearchData = {
    "45": [
        { id: "op1" , text: "option 1" },
        { id: "op2" , text: "option 2" },
        { id: "op3" , text: "option 3" },
        { id: "op4" , text: "option 4" },
        { id: "op5" , text: "option 5" },
    ]
};

liveSearchInputs.forEach(e => {
    
    el = document.createElement('div');
    el.classList.add('live-search-options-container');
    e.addEventListener('focus', _showLiveSearchOptions);
    e.addEventListener('focusout', _hideLiveSearchOptions);
    e.after(el);
    
});

function _loadLiveSearchOptions(e) {

    var options;
    var optionsDiv = e.target.nextElementSibling;
    var input = e.target;
    var dataType = input.getAttribute('dataType');
    

    if(_liveSearchData[dataType]){

        options = _liveSearchData[dataType];

    }else{

        options = _getOptions(dataType);
        _liveSearchData[dataType] = options;

    }


    optionsHtml = '';
    options.forEach(o => {
        optionsHtml += `<div>${o.id} - ${o.text} </div>`;
    });

    optionsDiv.innerHTML = `<div class="live-search-options" >${optionsHtml}</div>`;

}

function _getOptions(dataType){
    switch(dataType){
        case 45:

            break;
    }
}

function _showLiveSearchOptions(e){

    var options = e.target.nextElementSibling;

    options.innerHTML = `
        <div class="live-search-options-spinner">
            <div class="spinner-border" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
    `;

    
    _loadLiveSearchOptions(e);
    

}

function _hideLiveSearchOptions(e){

    var options = e.target.nextElementSibling;

    options.innerHTML = '';
}

function _showLiveSearchOptionsSpinner(){

}

