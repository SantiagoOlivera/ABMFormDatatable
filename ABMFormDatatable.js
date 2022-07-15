function ABMFormDatatable(){

    var defaultRowStatus = -1;
    var _datatable = null;
    var _inputProperty = "duxdata";
    var _formInputs = null;
    
    var rowStatus = [
        {
            state: "Normal",
            text: 'Normal',
            class: 'badge bg-primary',
            buttonText: 'Modificar',
            buttonCss: 'btn btn-primary'
        },
        {
            state: "New",
            text: 'Nuevo!',
            class: 'badge bg-success',
            buttonText: 'Agregar',
            buttonCss: 'btn btn-success'   
        },
        {
            state: "Edit",
            text: 'Modificado',
            class: 'badge bg-warning',
            buttonText: 'Modificar',
            buttonCss: 'btn btn-warning'
        },
        {
            state: "Delete",
            text: 'Eliminar',
            class: 'badge bg-danger',
            buttonText: 'Eliminar',
            buttonCss: 'btn btn-danger'
        },
        
        {
            state: "Deleted",
            text: 'Eliminado',
            class: 'badge bg-danger',
            buttonText: 'Reactivar',
            buttonCss: 'btn btn-danger'
        },
    ]

    var _operationButtons = {
        new: _new,
        edit: _edit,
        delete: _delete,
    }

    var _data = [
        {
            status: 0,
            name:"asd1",
            position: "asd1",
            office: "asd1"
        },
        {
            status: 0,
            name:"asd1",
            position: "asd1",
            office: "asd1"
        },
        {
            status: 0,
            name:"asd2",
            position: "asd2",
            office: "asd2"
        },
        {
            status: 0,
            name:"asd3",
            position: "asd3",
            office: "asd3"
        },
        {
            status: 0,
            name:"asd",
            position: "asd",
            office: "asd"
        }
    ];


    var _dtDefaultConfig = function() {

        return {
            dom: 'Bfrtip',
            buttons: [
                {
                    text: `<i class="bi bi-plus"></i>`,
                    tooltip: 'Nuevo!',
                    className: 'btn btn-success',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.new();
                    }
                },
                {
                    text: `<i class="bi bi-pencil-square"></i>`,
                    className: 'btn btn-warning',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.edit();
                    }
                },
                {
                    text: `<i class="bi bi-trash3"></i>`,
                    className: 'btn btn-danger',
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
            columns: _config.columns
        }
    }

    _config = {
        datatable: null,
        form: null,
        config: null,
        formStatusTag: null,
        operationButton: null,
        dtId: null,
    }


    function _init(config) {

        if( config ) {

            _config = config;
           

            if(config.form){

                _formInputs = document.querySelectorAll('#' + config.form[0].id + ' input[' + _inputProperty + ']');
                //agregamos el form estatus al form
                
                _config.form.prepend(`<span id="rowStatus" rowStatus="${defaultRowStatus}" class="invisible"></span>`);
                _config.formStatusTag = $('#rowStatus');
                _config.formStatus = _config.formStatusTag.attr('rowStatus');

                _config.form.append(`<br/><button name="operationButton" type="button" id="operationButton" class="invisible"></button><br/><br/>`);
                _config.operationButton = $('#operationButton');



                //agregamos el change de cada input

                _formInputs.forEach(e => {
                    
                    var type = e.getAttribute('type'); 

                    if(type == 'text'){
                        e.addEventListener('keyup', _changeTextbox);
                    }
                    
                })
                
            }else{

                throw("Form is not defined!");

            }

            if( config.columns != null && 
                config.columns != undefined 
            ){

                _config.columns = config.columns;

                _config.columns.unshift(
                    {
                        title: "Estado",
                        data: "status",
                        "render": function ( data, type, row, meta ) {
                            return `<span class="${rowStatus[data].class}">${rowStatus[data].text}</span>`;
                        }
                    }
                );


            }else{

                throw("Columns are not defined!");

            }

            if(config.datatable) {

                _datatable = _config.datatable.DataTable(_dtDefaultConfig());
                _config.dtId = _datatable.table().node().id;

                var columns = [];

                _datatable.on('select', function(event, row, type, rowIdx){
                    //console.log(event, row , type, rowIdx);
                    //_config.operationButton.addClass('invisible');
                    //_config.formStatusTag.addClass('invisible');

                    var data = _datatable.data().toArray()[rowIdx];
                    
                    _bindDataInForm(data);

                });

                _datatable.on('deselect', function(event, row, type, rowIdx){
                    _bindDataInForm(null);
                });


            }else{

                throw("Datatable not defined");

            }

            _initDatatableCssStyles();

        }


    }

    function _changeTextbox(event){
        
        //console.log("Cambiaste", event);

        var status = _config.formStatus;

        if(status === 0) {
            
            //normal
            _changeFormStatusTag(2);
            _changeFormStatusButton(2);

        }else if(status === 1){
            //nuevo
            _changeFormStatusTag(1);
            _changeFormStatusButton(1);
            
        }


    }

    function _bindDataInForm(data) {

        if(data){

            _changeFormStatusTag(data['status']);
            _changeFormStatusButton(data['status']);

            _formInputs.forEach(e => {

                var columnName = e.getAttribute(_inputProperty);
                
                var value = data[`${columnName}`];

                if(value != null){
                    e.setAttribute('value', value );
                    e.value = value;
                }else{
                    e.setAttribute('value', '' );
                    e.value = '';
                }
                

            });
            
            
            switch(data['status']){
                case 1:
                    _disableForm(false);
                    break;
                default:
                    _disableForm(true);
                    break;
            }

        }else{

            _blankForm();
            
        }
        
        
    }

    function _getDataFromForm(model){


        _formInputs.forEach(e => {
            var field = e.getAttribute('duxdata');
            console.log(e.value, e.getAttribute('value') );
            model[`${field}`] = e.value;
        })
    
        return model;
    }

    function _changeFormStatusButton(status){

         _config.operationButton.attr('class' , '');
         _config.operationButton.addClass(rowStatus[status].buttonCss);
         _config.operationButton.text(rowStatus[status].buttonText);
         
         switch(status){
            case 0:
                _config.operationButton.addClass('invisible');
                break;
            case 1:
             _config.operationButton.on('click', _add);
                break;
             case 2:
                _config.operationButton.on('click', _update);
                break;
         }

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
            _datatable.rows({ selected: true }).deselect();
        }
    }


    function _new() {

        console.log("New");

       

        _deselectRow();
        _blankForm();

        var model = _getObjectModel();

        _bindDataInForm(model);

        _disableForm(false);



    }

    function _edit() {

        console.log("Edit");

        var row = _datatable.rows({ selected: true })[0];

        if(row.length === 0){

            console.log('Elemento no seleccionado')

        }else{

            _config.formStatusTag.removeClass('invisible');
            _config.formStatusTag.addClass(rowStatus[0].class);
            _config.formStatusTag.text(rowStatus[0].text);

            _disableForm(false);

        }


       

    }

    function _delete() {
        console.log("Delete");
    }


    function _changeFormStatusTag(status){

        _config.formStatusTag.removeClass('invisible');
        _config.formStatusTag.attr('class' , '');
        _config.formStatusTag.addClass(rowStatus[status].class);
        _config.formStatusTag.text(rowStatus[status].text);
        _config.formStatus = status;
      
    }

    function _update(){

        console.log('update');
        
        var row = _datatable.rows({ selected: true });
        var rowData = row.data().toArray();

        var data = _getDataFromForm(rowData);
        console.log(data);
        var columns = Object.keys(rowData);

        columns.forEach(e => {
            rowData[e] = data[e];
        })

        //row.select();

    }

    function _getObjectModel() {

        var model = {}; 

        if(_datatable){

            _datatable.settings().init().columns.forEach(function(e){
                model[e.data] = null;
            });

            model['status'] = 1 //new ;
        }

        return model;
        
    }

    function _add(){
        
        var model = _getObjectModel();
        data = _getDataFromForm(model);

        _datatable.row.add(data).draw();


    }


    function _initDatatableCssStyles(){
       
        console.log(
            _datatable.table().node().id,
            $('#'+_config.dtId + '_wrapper button')
        );

        _datatable.buttons().container()
        .appendTo( '#' +_config.dtId +  '.col-md-6:eq(0)' );

        $('#'+_config.dtId + '_wrapper button').each(function(){
            $(this).removeClass('dt-button');
        })
    }

    return {
        init: _init,
        operationButtons: _operationButtons,
    }

}