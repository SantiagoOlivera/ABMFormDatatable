function ABMFormDatatable(){

    jQuery.validator.setDefaults({
        debug: true,
        success: "valid"
    });

    var defaultRowStatus = -1;
    var _datatable = null;
    var _inputProperty = "duxdata";
    var _formInputs = null;
    var bkp = null;
    
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
            class: 'badge bg-warning text-dark',
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
        save: _save,
        undo: _undo,
        changeDatatableFormEdit: _changeDatatableFormEdit,
    }

    _config = {
        datatable: null,
        form: null,
        config: null,
        formStatusTag: null,
        operationButton: null,
        dtId: null,
    }

    var _dtDefaultConfig = function() {

        return {
            dom: 'Bfrtip',
            buttons: [
                {
                    text: `<i class="bi bi-plus"></i>`,
                    titleAttr: 'Nuevo',
                    className: 'btn btn-success',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.new();
                    }
                },
                {
                    text: `<i class="bi bi-pencil-square"></i>`,
                    className: 'btn btn-warning',
                    titleAttr: 'Modificar',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.edit();
                    }
                },
                {
                    text: `<i class="bi bi-trash3"></i>`,
                    className: 'btn btn-danger',
                    titleAttr: 'Eliminar',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.delete();
                    }
                },
                {
                    text: `<i class="bi bi-save"></i>`,
                    titleAttr: 'Guardar',
                    className: 'btn btn-primary',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.save();
                    }
                },
                {
                    extend: 'excelHtml5',
                    text:`<i class="bi bi-filetype-xlsx"></i>`,
                    className: 'btn btn-success',
                    titleAttr: 'Excel',
                },
                {
                    
                    text:`<i class="bi bi-table"></i>`,
                    className: 'btn btn-dark',
                    titleAttr: 'Tabla editable',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.changeDatatableFormEdit();
                    }
                },
                {
                    
                    text:`<i class="bi bi-x"></i>`,
                    className: 'btn btn-dark',
                    titleAttr: 'Deshacer',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.undo();
                    }
                }
                
            ],
            order: false,
            paging: true,
            pageLength: 5,
            select: { style: 'single' },
            data: _config.data,
            columns: _config.columns,
            columnDefs: [
                { className: "dt-head-center", targets: [ 0 ] }
            ],
        }
    }


    function _init( config ) {

        if( config ) {

            _config = config;
           
            if(config.form){

                _formInputs = document.querySelectorAll('#' + config.form[0].id + ' [' + _inputProperty + ']');
                
                var rowStatusIsUndefined = $('#rowStatus')[0];
                //agregamos el form estatus al form
                if(rowStatusIsUndefined === undefined) {
                    //if it is already definded not created again on destroy datatable
                    _config.form.prepend(`<span id="rowStatus" rowStatus="${defaultRowStatus}" class="invisible"></span>`);
                } 

                _config.formStatusTag = $('#rowStatus'); 
                _config.formStatus = _config.formStatusTag.attr('rowStatus');

                var isOperationButtonUndefined = $('#operationButton')[0];
                if(isOperationButtonUndefined === undefined) {
                        //if it is already definded not created again on destroy datatable
                    _config.form.append(`<br/><button name="operationButton" type="button" id="operationButton" class="invisible"></button><br/><br/>`);
                }
                _config.operationButton = $('#operationButton');
                
                
                //agregamos el change de cada input
                _formInputs.forEach(e => {
                    
                    var type = e.getAttribute('type'); 

                    if(type == 'text'){
                        e.addEventListener('keyup', _changeTextbox);
                    }else if(type == 'select'){
                        e.addEventListener('change', _changeSelect);
                    }
                    
                });

                _blankForm();
                
            }else{

                throw("Form is not defined!");

            }

            if( 
                config.columns != null 
                && 
                config.columns != undefined 
            ){

                _config.columns = config.columns;

                var columnStatus = _config.columns.find(e => e.data === 'status' );

                if(columnStatus === undefined){

                    _config.columns.unshift(
                        {
                            title: "Estado",
                            className: 'dt-body-center',
                            data: "status",
                            "render": function ( data, type, row, meta ) {
                                return `<span class="${rowStatus[data].class}">${rowStatus[data].text}</span>`;
                            }
                        }
                    );

                }

            }else{

                throw("Columns are not defined!");

            }

            if(config.datatable) {
                
                _datatable = _config.datatable.DataTable(_dtDefaultConfig());
                
                _config.dtId = _datatable.table().node().id;

                bkp = _datatable.data().toArray();

                _datatable.on('select', function(event, row, type, rowIdx){
                    //console.log(event, row , type, rowIdx);
                    //_config.operationButton.addClass('invisible');
                    //_config.formStatusTag.addClass('invisible');

                    var data = _datatable.data().toArray()[rowIdx];
                    
                    _bindDataInForm(data);

                });


                _datatable.on('deselect', function(event, row, type, rowIdx){

                    _bindDataInForm(null);
                    _disableForm(true);

                });



            }else{

                throw("Datatable not defined");

            }

            _initDatatableCssStyles();

        }


    }


    function _detroyDatatable(){

        _datatable.rows().remove();
        _datatable.destroy();
        $('#'+ _config.dtId + ' thead').html("");
        $('#'+ _config.dtId + ' tbody').html("");
        $('#'+ _config.dtId + ' tfoot').html("");
        $('#'+ _config.dtId + '_wrapper').html("");
        
    }

    function _changeDatatableFormEdit(){

        if(_config.form.is(":visible")){

            var config = _config;
            config.data = _datatable.data();
            _config.form.hide();

            _detroyDatatable();
            _init(config);


        }else{

            _config.form.show();
            _blankForm();
            _datatable.rows().deselect();
        }

        

    }

    function _changeSelect( event ){

        _change( event.target );
    }

    function _changeTextbox( event ){
        
        console.log("Cambiaste", event);
        

        _change( event.target );
        
    }

    function _validateForm(){
        return _config.form.valid();
    }

    function _save(){
        var data = _datatable.data().toArray();
        console.log(data);
        return data;
    }

    function _change( input ){

        var row = _datatable.rows( { selected: true } );
        var rowData = row.data()[0];
        
        //if row is not defined is new row not added to datatable
        if(rowData !== undefined){
            
            var status = rowData['status'];
            var field = input.getAttribute('duxdata');
            var type = input.getAttribute('type');

            if(status === 0){
                //normal: change to edited
                rowData['status'] = 2; 
            }

            if(type == 'text'){
                rowData[`${field}`] = input.value;
            }else if(type == 'select'){
                rowData[`${field}`] = { id: input.value , text: input.selectedOptions[0].innerHTML };
            }

            _changeFormStatusTag(rowData['status']);

            _updateDataInDatatable();

        }
        

    }


    function _bindDataInForm(data) {

        if(data){

            _changeFormStatusTag(data['status']);
            //_changeFormStatusButton(data['status']);

            _formInputs.forEach(e => {

                var columnName = e.getAttribute(_inputProperty);
                var type = e.getAttribute('type');
                
                var value = data[`${columnName}`] ? data[`${columnName}`] : '';

                if(type == 'text'){

                    e.setAttribute('value', value );
                    e.value = value;

                }else if(type == 'select'){

                    e.setAttribute('value', value["id"]);
                    e.value = value["id"];
                }

                
                
            });
            
            
            switch(data['status']){
                case 1:
                    _disableForm(false);
                    break;
                case 2:
                    _disableForm(false);
                    break;
                default:
                    _disableForm(true);
                    break;
            }



        }else{

            //remove form status tag
            _config.formStatusTag.attr('class', '');
            _config.formStatusTag.text('');
            //blank form data
            _blankForm();
            
        }

      //remove add button
      _config.operationButton.attr('class' , '');
      _config.operationButton.addClass('invisible');
      
      
      _config.form.find("label.error").hide();
      
        
    }

    function _getDataFromForm(model){


        _formInputs.forEach(e => {
            var field = e.getAttribute('duxdata');
            var type = e.getAttribute('type');
            if(type == 'text'){
                model[`${field}`] = e.value;
            }else if(type == 'select'){
                model[`${field}`] = { id: e.value,  text: e.selectedOptions[0].innerHTML };
            }
            //console.log(e.value, e.getAttribute('value') );
            
        })
    
        return model;
    }


    function _changeFormStatusButton(status){

        debugger;
         _config.operationButton.attr('class' , '');
         _config.operationButton.addClass(rowStatus[status].buttonCss);
         _config.operationButton.text(rowStatus[status].buttonText);
         
         //remove all click events in the button
         _config.operationButton.unbind('click');

         switch(status){
            case 0:
                _config.operationButton.addClass('invisible');
                break;
            case 1:
                _config.operationButton.on('click', _add);
                break;
             case 2:
                _config.operationButton.on('click', _update);
            case 3:
                _config.operationButton.addClass('invisible');
                break;
            default:
                _config.operationButton.addClass('invisible');
                break;
         }


    }

    function _blankForm(){

        _formInputs.forEach(e => {
            e.setAttribute('value', '');
            e.value = '';
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

        _config.operationButton.attr('class' , '');
        _config.operationButton.addClass(rowStatus[1].buttonCss);
        _config.operationButton.text(rowStatus[1].buttonText);
        _config.operationButton.removeClass('invisible');
        //remove all click events in the button
        _config.operationButton.unbind('click');
        _config.operationButton.on('click', _add);

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

        var row = _datatable.rows({ selected: true })[0];
        
        if(row.length === 0){

            console.log('Elemento no seleccionado');

        }else{

            //get data from row
            var data = _datatable.rows(row).data()[0];

            switch(data['status']){
                case 0:
                    //normal: mark row as delete 
                    data['status'] = 3;
                    _config.formStatusTag.removeClass('invisible');
                    _config.formStatusTag.addClass(rowStatus[3].class);
                    _config.formStatusTag.text(rowStatus[3].text);
                    _datatable.columns('status').cells().invalidate().render();
                    break;
                case 1:
                    //new: remove row
                    _datatable.rows(row).remove().draw();
                    break;
                case 2:
                    //edited: mark row as delete 
                    data['status'] = 3;
                    _config.formStatusTag.removeClass('invisible');
                    _config.formStatusTag.addClass(rowStatus[3].class);
                    _config.formStatusTag.text(rowStatus[3].text);
                    _datatable.columns('status').cells().invalidate().render();
                    break;
                default:
                    break;
            }

        }

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
        var rowData = row.data().toArray()[0];
        rowData['status'] = 2; //edit
        var newData = _getDataFromForm(rowData);
        
        var columns = Object.keys(rowData);

        columns.forEach(e => {
            rowData[e] = newData[e];
        })

        _updateDataInDatatable();



    }

    function _updateDataInDatatable() {

        var columns = _datatable.settings().init().columns;

        columns.forEach(e => {
            _datatable.columns(e["data"]).cells().invalidate().render();
        });

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

        if(_validateForm()) {

            data = _getDataFromForm(model);

            var row = _datatable.row.add(data).draw();

            _datatable.rows(row).select();

            //remove add button
            _config.operationButton.attr('class' , '');
            _config.operationButton.addClass('invisible');

        }

    }


    function _undo(){

        debugger;
        var row = _datatable.rows({ selected: true });
        var rowIdx = _datatable.rows({ selected: true })[0][0];
        rowStatus = _datatable.rows(row).data()[0].status;

        switch(rowStatus){
            case 0:
                console.log("Do nothing");
                break;
            case 1:
                _datatable.rows().deselect();
                _datatable.rows(rowIdx).remove().draw();
                break;

        }
        

    }


    function _initDatatableCssStyles(){
       
        $('input[type=search]').addClass('form-control');
        $('#'+ _config.dtId + '_filter label').css('font-weight', 'bold');
        

        console.log(
            _datatable.table().node().id,
            $('#'+_config.dtId + '_wrapper button')
        );

        /* _datatable.buttons().container()
        .appendTo( '#' +_config.dtId +  '.col-md-6:eq(0)' ); */

        $('#'+_config.dtId + '_wrapper button').each(function(){
            $(this).removeClass('dt-button');
        });

        /* $('.paginate_button').each(function(){
            $(this).removeClass('paginate_button');
            $(this).addClass('btn btn-primary p-2');
        }); */
        
    }

    return {
        init: _init,
        operationButtons: _operationButtons,
    }

}
