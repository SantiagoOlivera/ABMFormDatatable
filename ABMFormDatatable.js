function ABMFormDatatable(){

    var _datatable = null;
    var _inputProperty = "duxdata";
    var _formInputs = null;
    
    var rowStates = {
        0: {
            state: "Normal",
            text: 'Normal',
            class: 'badge bg-primary'
        },
        1: {
            state: "New",
            text: 'Nuevo!',
            class: 'badge bg-success'
        },
        2: {
            state: "Edited",
            text: 'Modificado',
            class: 'badge bg-warning'
        },
        3: {
            state: "Delete",
            text: 'Eliminar',
            class: 'badge bg-danger'
        },
        4: {
            state: "Deleted",
            text: 'Eliminado',
            class: 'badge bg-danger'
        },
    }

    var _operationButtons = {
        new: _new,
        edit: _edit,
        delete: _delete,
    }

    var _data = [
        {
            rowState: 0,
            name:"asd1",
            position: "asd1",
            office: "asd1"
        },
        {
            rowState: 0,
            name:"asd1",
            position: "asd1",
            office: "asd1"
        },
        {
            rowState: 0,
            name:"asd2",
            position: "asd2",
            office: "asd2"
        },
        {
            rowState: 0,
            name:"asd3",
            position: "asd3",
            office: "asd3"
        },
        {
            rowState: 0,
            name:"asd",
            position: "asd",
            office: "asd"
        }
    ];

    var _columns = [
        {
            title: "Estado",
            data: "rowState",
            "render": function ( data, type, row, meta ) {
                return `<span class="${rowStates[data].class}">${rowStates[data].text}</span>`;
            }
        },
        {
            title: "Name",
            data: "name"
        },
        {
            title: "Position",
            data: "position"
        },
        {
            title: "Office",
            data: "office"
        }
    ];

    var _dtDefaultConfig = {
        dom: 'Bfrtip',
        buttons: [
            {
                text: 'Nuevo!',
                action: function ( e, dt, node, config ) {
                    _operationButtons.new();
                }
            },
            {
                text: 'Editar',
                action: function ( e, dt, node, config ) {
                    _operationButtons.edit();
                }
            },
            {
                text: 'Eliminar',
                action: function ( e, dt, node, config ) {
                    _operationButtons.delete();
                }
            },
            'excelHtml5',
        ],
        order: false,
        paging: true,
        select: {
            style: 'single'
        },
        data: _data,
        columns: _columns
    }

    _config = {
        datatable: null,
        form: null,
        formStatusTag: null,
        operationButton: null,
    }


    function _init(config) {

        if( config ) {

            _config = config;
           

            if(config.form){

                _formInputs = document.querySelectorAll('#' + config.form[0].id + ' input[' + _inputProperty + ']');
                //agregamos el form estatus al form
                
                _config.form.prepend(`<span id="rowState" class="invisible"></span>`);
                _config.formStatusTag = $('#rowState');

                _config.form.append(`<br/><button type="button" id="operationButton" class="invisible"> asd </button>`);
                _config.operationButton = $('#operationButton');

                _formInputs.forEach(e => {
                    e.addEventListener('keypress', _change)
                })
                
            }else{

                throw("Form is not defined");

            }

            if(config.datatable) {

                _datatable = _config.datatable.DataTable(_dtDefaultConfig);


                _datatable.on('select', function(event, row, type, rowIdx){
                    //console.log(event, row , type, rowIdx);
                    _config.operationButton.addClass('invisible');
                    _config.formStatusTag.addClass('invisible');

                    var data = _datatable.data().toArray()[rowIdx];
                    _bindDataInForm(data);

                });

                _datatable.on('deselect', function(event, row, type, rowIdx){
                    _bindDataInForm(null);
                });


            }else{

                throw("Datatable not defined");

            }

            

        }


    }

    function _change(){
        console.log("Cambiaste");
    }

    function _bindDataInForm(data) {
        
        console.log(data);

        if(data){

            _formInputs.forEach(e => {

                var columnName = e.getAttribute(_inputProperty);
                //console.log(columnName, data[`${columnName}`]);
                e.setAttribute('value', data[`${columnName}`]);
                //e.change();
            });

            _disableForm(true);

        }else{

            _blankForm();
            
        }
        
        
    }

    function _getDataFromForm(){



    }


    function _blankForm(){
        _formInputs.forEach(e => {
            e.setAttribute('value', '');
        });
    }

    function _disableForm(state){
        if(_config.datatable) {
            if(!state){
                _formInputs.forEach(e => {
                    e.removeAttribute("disabled");
                });
            }else{
                _formInputs.forEach(e => {
                    e.setAttribute("disabled", true);
                });
            }
        }
    }

    function _deselectRow(){
        if(_datatable) {
            _datatable.rows('.selected').deselect();
        }
    }


    function _new() {
        console.log("New");

        _config.formStatusTag.removeClass('invisible');
        _config.formStatusTag.addClass(rowStates[1].class);
        _config.formStatusTag.text(rowStates[1].text);

        _config.operationButton.removeClass('invisible');
        _config.operationButton.addClass('btn btn-success');
        _config.operationButton.text("Agregar");

        _deselectRow();
        _blankForm();
        _disableForm(false);



    }

    function _edit() {

        console.log("Edit");

        _config.formStatusTag.removeClass('invisible');
        _config.formStatusTag.addClass(rowStates[0].class);
        _config.formStatusTag.text(rowStates[0].text);

        //var rowData =  _datatable.rows('.selected').data().toArray();
        _disableForm(false);

    }

    function _delete() {
        console.log("Delete");
    }

    return {
        init: _init,
        operationButtons: _operationButtons,
    }

}