define(["esri/dijit/Legend", "dojo/_base/declare"], 
function ( Legend, declare) {
    return declare(null, {
        
        // Sample function, welcome to AMD!
        _treeGetOverlayLayers: function () {
            //legend.startup();
            var inputs = $(".overlayLayer");
            var visible = [1,27,28,29]; //street and city labels
            for (var i = 0, il = inputs.length; i < il; i++) {
                var layerLabel = $(inputs[i]).find("label:first").html();  //To select labels to check, we must nest <label tag> in htm. and somehow select that nested label
                //console.log('layerLabel: ',layerLabel);
                var layerCheckState = $(inputs[i]).find("input:first");
                //console.log('layerCheckState: ',layerCheckState);
                var layerObject = this._objectFindByKey(globalMapLayers, 'name', layerLabel);
                //console.log('layerObject: ',layerObject);
                if ($(layerCheckState).prop("checked")) {
                   visible.push(layerObject.id);           
                   //console.log(layerObject.id);
                } else {
                    $(layerCheckState).removeAttr("checked");
                    var elem = $('li.current_sub').prevAll("checked:first");
                    elem.removeClass("checked");
                }
            }

            overlayLayer.setVisibleLayers(visible);
            legend.refresh();
        },
        
        //doIdentify
        //Public Class
        _treeGetUtilityLayers: function () {
            //legend.startup();
            //var inputs = dojo.query(".utilityLayer");
            var inputs = $(".utilityLayer");
            //console.log(inputs);
            var visible = [-1];
            for (var i = 0, il = inputs.length; i < il; i++) {
                var layerLabel = $(inputs[i]).find("label:first").html();
                //console.log('layerLabel: ',layerLabel);
                var layerCheckState = $(inputs[i]).find("input:first");
                //console.log('layerCheckState: ',layerCheckState);
                var layerObject = this._objectFindByKey(globalMapLayers, 'name', layerLabel);
                //console.log('layerObject: ',layerObject);
                if ($(layerCheckState).prop("checked")) {
                    visible.push(layerObject.id);
                    //console.log(layerObject.id);
                    //console.log(visible);
                }
            }
            if (visible.length > 0) {
                utilityMap.setVisibleLayers(visible);       
            } else {
                utilityMap.setVisibleLayers([-1]);
                map.graphics.clear();
            }
            legend.refresh();
        }, 


        _objectFindByKey:   function(array, key, value) {
            //alert(value);
            for (var i = 0; i < array.length; i++) {
                //alert(array[i].name);
                if (array[i][key] === value) {
                    return array[i];
                }
            }
            return null;
        } 


        
        
        
        
    //end   
    });
});
