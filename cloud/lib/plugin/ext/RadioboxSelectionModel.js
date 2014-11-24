
/**
 * @class Ext.grid.RadioboxSelectionModel
 * @extends Ext.grid.RowSelectionModel
 * A custom selection model that renders a column of checkboxes that can be toggled to select or deselect rows.
 * @constructor
 * @param {Object} config The configuration options
 */
Ext.grid.RadioboxSelectionModel = Ext.extend(Ext.grid.RowSelectionModel, {
    //header: '<div class="x-grid3-hd-radio">&#160;</div>',
    header:null,
    singleSelect:true,
    width: 20,
    sortable: false,
	menuDisabled:true,
    fixed:true,
    dataIndex: '',
    id: 'checker',
    // private
    initEvents : function(){
        Ext.grid.RadioboxSelectionModel.superclass.initEvents.call(this);
        this.grid.on('render', function(){
            var view = this.grid.getView();
            view.mainBody.on('mousedown', this.onMouseDown, this);
        }, this);
    },
    // private
    onMouseDown : function(e, t){
        if(e.button === 0 && t.className == 'x-grid3-row-radio'){ // Only fire if left-click
            e.stopEvent();
            var row = e.getTarget('.x-grid3-row');
            if(row){
                var index = row.rowIndex;
                if(this.isSelected(index)){
                    this.deselectRow(index);
                }else{
                    this.selectRow(index, true);
                }
            }
        }
    },
    // private
    renderer : function(v, p, record){
        return '<div class="x-grid3-row-radio">&#160;</div>';
    }
});