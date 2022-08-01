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
    var _datatableType = 'DatatableForm';
    
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

    var _language = {
        decimal: ",",
        thousands: ".",
        /* search: "_INPUT_",
        searchPlaceholder: "Buscar", */
        /* lengthMenu: "Display _MENU_ records per page",
        zeroRecords: "Nothing found - sorry",
        info: "Mostrando page _PAGE_ of _PAGES_",
        infoEmpty: "No records available",
        infoFiltered: "(filtered from _MAX_ total records)" */
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
                /* {
                    
                    text:`<i class="bi bi-table"></i>`,
                    className: 'btn btn-dark',
                    titleAttr: 'Tabla editable',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.changeDatatableFormEdit();
                    }
                }, */
                {
                    
                    text:`<i class="bi bi-x"></i>`,
                    className: 'btn btn-dark',
                    titleAttr: 'Deshacer',
                    action: function ( e, dt, node, config ) {
                        _operationButtons.undo();
                    }
                }
                
            ],
            responsive: true,
            scrollX: true,
            order: false,
            paging: true,
            pageLength: 3,
            select: { style: 'single' },
            data: _config.data,
            columns: _config.columns,
            columnDefs: [
                { className: "dt-head-center", targets: [ 0 ] }
            ],
            language: _language,
            drawCallback: function(){

                $('.dataTables_paginate a').addClass('m-1');
                $('.dataTables_paginate a').addClass('btn btn-light');

                $('.dataTables_paginate .current').removeClass('btn btn-light');
                $('.dataTables_paginate .current').addClass('btn btn-primary');
                //$('.dataTables_paginate').addClass('pagination');
                //$('.dataTables_paginate a').addClass('page-item');
                $('.dataTables_paginate a').removeClass('paginate_button');
            },
            initComplete: function(){
                //$('.dataTables_filter').addClass('btn btn-sm btn-dark');
                
            }
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
                            render: function ( data, type, row, meta ) {
                                return `<span class="${rowStatus[data].class}">${rowStatus[data].text}</span>`;
                            }
                        }
                    );
                    
                    //column types
                    _config.columns.forEach(c => {
                        var type = c['type'];
                        if(type){
                            if (type === 'decimal'){
                                c['render'] = function(data,b,row,d){
                                    ;
                                    var formatFunction = format('decimal');
                                    var ret = formatFunction(data, c['decimals'], c['thousands']);
                                    return ret;
                                }
                            }
                        }
                    });

                }else{
                    
                    var columnIdx = _config.columns.indexOf(columnStatus);
                    ;
                    _config.columns[columnIdx] = {
                        title: "Estado",
                        className: 'dt-body-center',
                        data: "status",
                        render: function ( data, type, row, meta ) {
                            return `<span class="${rowStatus[data].class}">${rowStatus[data].text}</span>`;
                        }
                    }

                }

            }else{

                throw("Columns are not defined!");

            }

            if(config.datatable) {
                
                _datatable = _config.datatable.DataTable(_dtDefaultConfig());
                
                _config.dtId = _datatable.table().node().id;
                
                bkp = structuredClone( _datatable.data().toArray() );

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


        if(_datatableType == 'DatatableForm'){

            _datatableType = 'EditableDatatable'
            
            _config.columns.forEach(e => {
                e.render = renderInput;
            });

            var config = _config;
            config.data = _datatable.data();
            _config.form.hide();
            _detroyDatatable();

            _init(config);


        }else{
            
            _datatableType = 'DatatableForm'

            _config.columns.forEach(e => {
                e.render = renderData;
            });
            _detroyDatatable();
            _init(_config);

            _config.form.show();
            _blankForm();
            _datatable.rows().deselect();
        }

        

    }

    function renderData( data, type, row, meta ){
        return data;
    }

    function renderInput( data, type, row, meta ){
        var html = `<input value="${data}" class="form-control" onclick="event.stopPropagation();" disabled />`;
        return html;
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
            
            if(rowData[`${field}`] != input.value){

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

        ;
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

        var row = _datatable.rows({ selected: true });

        if(row[0].length === 0){

            console.log('Elemento no seleccionado')

        }else{
            ;
            var dataRow = row.data()[0];

            if(
                dataRow['status'] === 3 
            ){
                console.log('row deleted!!');
            }else{

                _config.formStatusTag.removeClass('invisible');
                _config.formStatusTag.addClass(rowStatus[0].class);
                _config.formStatusTag.text(rowStatus[0].text);
            
                _disableForm(false);

            }

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
                    _disableForm(true);
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
                    _disableForm(true);
                    break;
                default:
                    break;
            }

        }

    }


    function _changeFormStatusTag(status){
        
        console.log(rowStatus, status);

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

        var row = _datatable.rows({ selected: true });
        var rowIdx = _datatable.rows({ selected: true })[0][0];
        var status = _datatable.rows(row).data()[0].status;

        switch(status){
            case 0:
                //normal
                console.log("Do nothing");
                break;
            case 1:
                //new
                _datatable.rows().deselect();
                _datatable.rows(rowIdx).remove().draw();
            case 2:
                //edited
                var data = row.data().toArray()[0];
                var columns = Object.keys(data);
                if(bkp){
                    
                    columns.forEach(e => {
                        data[e] = bkp[rowIdx][e];
                    });

                }else{
                    throw('Back data is not defined');
                }

                _updateDataInDatatable();

                _datatable.rows(rowIdx).select();
            
                break;
            case 3:
                var data = row.data().toArray()[0];
                var columns = Object.keys(data);
                if(bkp){
                    
                    columns.forEach(e => {
                        data[e] = bkp[rowIdx][e];
                    });

                }else{
                    throw('Back data is not defined');
                }

                _updateDataInDatatable();

                _datatable.rows(rowIdx).select();
                break;

        }
        

    }


    function _initDatatableCssStyles(){
        var searchInput = $('input[type=search]');
        searchInput.addClass('form-control');
        var style = {
            margin: 0,
            width: "95%"
        }
        searchInput.css(style);
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

    function format(type){
        switch(type){
            case 'decimal':
                return formatDecimal;
            break;
        }
    }

    function formatDecimal(number, decimalPlaces, thousandsSeparator){
        
        ;
        var string = '';

        if( isNaN(number) ){
            throw('Number supplied is not a number');
        }else if(isNaN(decimalPlaces)){
            throw('Decimal places supplied is not a number');
        }

        var split = number.toString().split(".");
        
        if(split.length > 1){
            
            var int = split[0];
            var decimals = split[1];

            if(thousandsSeparator){
                
                var int = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
            }
            
            if(decimalPlaces === 0){
                decimals = '';
            }else if(decimals.length === decimalPlaces){
                decimals = ',' + split[1];
            }else if(decimals.length !== decimalPlaces){
                
                if(decimalPlaces < decimals.length){
                    decimals = "," + decimals.substring(0, decimalPlaces);    
                }else{
                    decimals = "," + decimals.padEnd(decimalPlaces, "0");
                }   

            }

            string = int + decimals;

        }else{
            ;
            var int;
            var decimals;

            if(thousandsSeparator){
                int = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
            }else{
                int = number.toString();
            }

            if( (decimalPlaces) && (decimalPlaces > 0) ){
                decimals = '';
                decimals = decimals.padEnd(decimalPlaces, "0" );
                decimals = ',' + decimals;
            }else{
                decimals = '';
            }
            
            string = int + decimals;
        }


        return string;

    }

    return {
        init: _init,
        operationButtons: _operationButtons,
    }

}
