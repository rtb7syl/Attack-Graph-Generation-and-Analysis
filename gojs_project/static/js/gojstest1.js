/*global go*/
/*global jQuery*/

var $ = go.GraphObject.make;
var $j = jQuery.noConflict();
var myDiagram = 
        $(go.Diagram, "myDiagramDiv",

           { initialContentAlignment: go.Spot.Center, // center Diagram contents
           	 "undoManager.isEnabled": true  // enable Ctrl-Z to undo and Ctrl-Y to redo


           });

function makeButton(text, action, visiblePredicate) {
      return $("ContextMenuButton",
               $(go.TextBlock, text),
               { click: action },
               // don't bother with binding GraphObject.visible if there's no predicate
               visiblePredicate ? new go.Binding("visible", "", function(o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
    }
var nodeMenu =  // context menu for each Node
      $(go.Adornment, "Vertical",
        makeButton("Copy",
                   function(e, obj) { e.diagram.commandHandler.copySelection(); }),
        makeButton("Delete",
                   function(e, obj) { e.diagram.commandHandler.deleteSelection(); }),
        $(go.Shape, "LineH", { strokeWidth: 2, height: 1, stretch: go.GraphObject.Horizontal }),
        makeButton("Add top port",
                   function (e, obj) { addPort("top"); }),
        makeButton("Add left port",
                   function (e, obj) { addPort("left"); }),
        makeButton("Add right port",
                   function (e, obj) { addPort("right"); }),
        makeButton("Add bottom port",
                   function (e, obj) { addPort("bottom"); })
      );
var portSize = new go.Size(3, 3);

var portMenu =  // context menu for each port
      $(go.Adornment, "Vertical",
        makeButton("Remove port",
                   // in the click event handler, the obj.part is the Adornment;
                   // its adornedObject is the port
                   function (e, obj) { removePort(obj.part.adornedObject); }),
        makeButton("Change color",
                   function (e, obj) { changeColor(obj.part.adornedObject); }),
        makeButton("Remove side ports",
                   function (e, obj) { removeAll(obj.part.adornedObject); })
      );







myDiagram.nodeTemplate =
    $(go.Node, "Spot",
    
     
      {  
        //mouseEnter: function (e, obj) { showPorts(obj.part, true); },
        //mouseLeave: function (e, obj) { showPorts(obj.part, false); },
        locationObjectName: "BODY",
        locationSpot: go.Spot.Center,
        selectionObjectName: "BODY",
        contextMenu: nodeMenu
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      //$(go.Shape, { fill: "lightgray" }),
      //$("PanelExpanderButton"),
      $(go.Panel, "Vertical",
        
        $(go.Picture,

            {margin:4, width: 60, height: 50, background: "white" },
            new go.Binding("source")),
        $(go.TextBlock, new go.Binding("text", "key"),
           {font: "bold 12pt sans-serif",alignment: go.Spot.Center,wrap: go.TextBlock.WrapFit }),

      //$(go.Shape, { fill: "lightgray" }),
        $("PanelExpanderButton", "LIST1"),
        $(go.Panel, "Table",
        
           {visible:false, name: "LIST1"},
           new go.Binding("itemArray", "props"),
            { margin: 4,
             defaultAlignment: go.Spot.Left,

            itemTemplate:
              $(go.Panel, "TableRow",
              //{ name: "LIST1", column: 1, columnSpan: 2 },
              //new go.Binding("background", "back"),
                 $(go.TextBlock, new go.Binding("text", "name"),
                    { column: 0, margin: 2, font: "bold 10pt sans-serif",alignment: go.Spot.Center }),
                 $(go.TextBlock, new go.Binding("text", "value").makeTwoWay(),
                    { column: 1, margin: 2,editable:true,alignment: go.Spot.Center })
              //$(go.TextBlock, new go.Binding("text", "loc"),
                //{ column: 2, margin: 2 })
            )  // end of itemTemplate
         }),
        ),
        // the Panel holding the left port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.leftArray
      $(go.Panel, "Vertical",
          new go.Binding("itemArray", "leftArray"),
          { row: 0, column: 0,alignment: go.Spot.Left,
            itemTemplate:
              $(go.Panel,

                { _side: "left", 
                  //alignment: go.Spot.Left, // internal property to make it easier to tell which side it's on
                  fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(1,0)},
                    //fill: "transparent"})
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        ),  // end Vertical Panel
        // the Panel holding the top port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.topArray
      $(go.Panel, "Horizontal",
          new go.Binding("itemArray", "topArray"),
          { row: 0, column: 1,alignment: go.Spot.Top,
            itemTemplate:
              $(go.Panel,
                { _side: "top",
                  fromSpot: go.Spot.Top, toSpot: go.Spot.Top,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(0, 1)},
                    //alignment: go.Spot.Top},
                    //alignmentFocus: spot},
                   // fill: "transparent"})
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        ),  // end Horizontal Panel
        // the Panel holding the right port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.rightArray
      $(go.Panel, "Vertical",
          new go.Binding("itemArray", "rightArray"),
          { row: 0, column: 2,alignment: go.Spot.Right,
            itemTemplate:
              $(go.Panel,
                { _side: "right",
                  fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(1, 0)} ,
                    //fill: "transparent"})
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        ),  // end Vertical Panel
        // the Panel holding the bottom port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.bottomArray
      $(go.Panel, "Horizontal",
          new go.Binding("itemArray", "bottomArray"),
          { row: 2, column: 1,alignment: go.Spot.Bottom,
            itemTemplate:
              $(go.Panel,
                { _side: "bottom",
                  fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(0, 1)},
                    //fill: "transparent"})
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        )  // end Horizontal Panel
    );  // end Node



function CustomLink() {
    go.Link.call(this);
  };
go.Diagram.inherit(CustomLink, go.Link);
CustomLink.prototype.findSidePortIndexAndCount = function(node, port) {
    var nodedata = node.data;
    if (nodedata !== null) {
      var portdata = port.data;
      var side = port._side;
      var arr = nodedata[side + "Array"];
      var len = arr.length;
      for (var i = 0; i < len; i++) {
        if (arr[i] === portdata) return [i, len];
      }
    }
    return [-1, len];
  };
  
CustomLink.prototype.computeEndSegmentLength = function(node, port, spot, from) {
    var esl = go.Link.prototype.computeEndSegmentLength.call(this, node, port, spot, from);
    var other = this.getOtherPort(port);
    if (port !== null && other !== null) {
      var thispt = port.getDocumentPoint(this.computeSpot(from));
      var otherpt = other.getDocumentPoint(this.computeSpot(!from));
      if (Math.abs(thispt.x - otherpt.x) > 20 || Math.abs(thispt.y - otherpt.y) > 20) {
        var info = this.findSidePortIndexAndCount(node, port);
        var idx = info[0];
        var count = info[1];
        if (port._side == "top" || port._side == "bottom") {
          if (otherpt.x < thispt.x) {
            return esl + 4 + idx * 8;
          } else {
            return esl + (count - idx - 1) * 8;
          }
        } else {  // left or right
          if (otherpt.y < thispt.y) {
            return esl + 4 + idx * 8;
          } else {
            return esl + (count - idx - 1) * 8;
          }
        }
      }
    }
    return esl;
  };
  
CustomLink.prototype.hasCurviness = function() {
    if (isNaN(this.curviness)) return true;
    return go.Link.prototype.hasCurviness.call(this);
  };
  
CustomLink.prototype.computeCurviness = function() {
    if (isNaN(this.curviness)) {
      var fromnode = this.fromNode;
      var fromport = this.fromPort;
      var fromspot = this.computeSpot(true);
      var frompt = fromport.getDocumentPoint(fromspot);
      var tonode = this.toNode;
      var toport = this.toPort;
      var tospot = this.computeSpot(false);
      var topt = toport.getDocumentPoint(tospot);
      if (Math.abs(frompt.x - topt.x) > 20 || Math.abs(frompt.y - topt.y) > 20) {
        if ((fromspot.equals(go.Spot.Left) || fromspot.equals(go.Spot.Right)) &&
            (tospot.equals(go.Spot.Left) || tospot.equals(go.Spot.Right))) {
          var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
          var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
          var c = (fromseglen - toseglen) / 2;
          if (frompt.x + fromseglen >= topt.x - toseglen) {
            if (frompt.y < topt.y) return c;
            if (frompt.y > topt.y) return -c;
          }
        } else if ((fromspot.equals(go.Spot.Top) || fromspot.equals(go.Spot.Bottom)) &&
                   (tospot.equals(go.Spot.Top) || tospot.equals(go.Spot.Bottom))) {
          var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
          var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
          var c = (fromseglen - toseglen) / 2;
          if (frompt.x + fromseglen >= topt.x - toseglen) {
            if (frompt.y < topt.y) return c;
            if (frompt.y > topt.y) return -c;
          }
        }
      }
    }
    return go.Link.prototype.computeCurviness.call(this);
  };











myDiagram.linkTemplate =

    $(CustomLink,
      {
      	routing: go.Link.AvoidsNodes,
      	curve: go.Link.JumpGap,
      	corner: 4, //toShortLength: 4,
      	relinkableFrom: true,
      	relinkableTo: true,
      	reshapable: true,
      	resegmentable: true,
      },
      /*
      new go.Binding("fromSpot", "fromSpot", go.Spot.parse),
      new go.Binding("toSpot", "toSpot", go.Spot.parse),
      new go.Binding("routing", "routing"),
      */
      new go.Binding("points").makeTwoWay(),
      $(go.Shape, { stroke: "#2F4F4F", strokeWidth: 2 })
      
    );



myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
      name: "Unit",
      leftArray: [],
      rightArray: [],
      topArray: [],
      bottomArray: []
    };

myDiagram.contextMenu =
      $(go.Adornment, "Vertical",
          makeButton("Paste",
                     function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                     function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
          makeButton("Undo",
                     function(e, obj) { e.diagram.commandHandler.undo(); },
                     function(o) { return o.diagram.commandHandler.canUndo(); }),
          makeButton("Redo",
                     function(e, obj) { e.diagram.commandHandler.redo(); },
                     function(o) { return o.diagram.commandHandler.canRedo(); })
      );



function sameNA(Subnet_Address, Host_IP) {
   var n = Host_IP.indexOf("/");
   var subnet_mask = Number(Host_IP.slice(n + 1));
   var no_start_bits = Math.floor(subnet_mask/8);
   var no_var_bits = subnet_mask % 8;
   var dotArray = [];

   for(var i = 0;i < Host_IP.length;i++){
    if(Host_IP[i] === '.'){
       dotArray.push(i);
    }
   }
   dotArray.push(n);
   if(no_start_bits > 0){
    var start_address = Host_IP.slice(0, dotArray[no_start_bits - 1] + 1);
    var var_field =  Number(Host_IP.slice(dotArray[no_start_bits - 1] + 1, dotArray[no_start_bits]));
   }
   else{
    var start_address = '';
    var var_field =  Number(Host_IP.slice(0, dotArray[0]));
   }
  
   if(var_field >= 128){
    var var_field_bin = var_field.toString(2);
   }
   else{
    var var_field_to_bin = var_field.toString(2);
    var repeat_times = 8 - var_field_to_bin.length;
    var var_field_bin = '0'.repeat(repeat_times) + var_field_to_bin;
   }
   var net_bits = var_field_bin.slice(0,no_var_bits) + '0'.repeat(8 - no_var_bits);
   var net_bits_to_dec = parseInt(net_bits, 2).toString();

   if(no_start_bits <= 2){
    var net_address = start_address + net_bits_to_dec + '.0'.repeat(3 - no_start_bits );
   }
   else if(no_start_bits === 3){
    var net_address = start_address + net_bits_to_dec;
   }
   else{
    var net_address = start_address.slice(0,-1);
   }
   //console.log(net_address);

   if(Subnet_Address === net_address){
    return true;
   }
   else{
    return false;
   }
   
}




function sameSubnet(group, node) {
    if (group === null) return true;  // when maybe dropping a node in the background
    else if (node instanceof go.Group) return false;  // don't add Groups to Groups
    else{
       return sameNA(group.data.address,node.data.props[4].value);
    }
    //return group.data.text === node.data.text;
  };

function makeSwitchPorts(p,n){
  var s = p - n;
  console.log(n);
  for(var i = 0;i < s;i++){
    addPort("right");
  }
}

myDiagram.addDiagramListener('TextEdited', function(e) {
  var part = e.subject.part;
  if(part.data.header == "Switch"){
    var num_top_ports = part.data["topArray"].length;
    var num_bottom_ports = part.data["bottomArray"].length;
    var num_right_ports = part.data["rightArray"].length;
    var num_left_ports = part.data["leftArray"].length;
    var total_ports = num_left_ports + num_right_ports + num_bottom_ports + num_top_ports;
    makeSwitchPorts(part.data.props[0].value,total_ports);
  }

});


myDiagram.groupTemplate =
    $(go.Group, "Vertical",
      { selectionObjectName: "SHAPE",
        locationObjectName: "SHAPE",
        resizable: true,
        resizeObjectName: "SHAPE",
        // only allow those simple nodes that have the same data key prefix:
        memberValidation: sameSubnet,
        // don't need to define handlers on member Nodes and Links
        handlesDragDropForMembers: true,
        // support highlighting of Groups when allowing a drop to add a member
        mouseDragEnter: function(e, grp, prev) {
          // this will call samePrefix; it is true if any node has the same key prefix
          if (grp.canAddMembers(grp.diagram.selection)) {
            var shape = grp.findObject("SHAPE");
            if (shape) shape.fill = "green";
            grp.diagram.currentCursor = "";
          } else {
            grp.diagram.currentCursor = "not-allowed";
          }
        },
        mouseDragLeave: function(e, grp, next) {
          var shape = grp.findObject("SHAPE");
          if (shape) shape.fill = "white";
          grp.diagram.currentCursor = "";
        },
        // actually add permitted new members when a drop occurs
        mouseDrop: function(e, grp) {
          if (grp.canAddMembers(grp.diagram.selection)) {
            // this will only add nodes with the same key prefix
            grp.addMembers(grp.diagram.selection, true);
          } else {  // and otherwise cancel the drop
            grp.diagram.currentTool.doCancel();
          }
        }
      },
      // make sure all Groups are behind all regular Nodes
      { layerName: "Background" },
      new go.Binding("location", "loc", go.Point.parse),

      $(go.TextBlock,
        { alignment: go.Spot.Center, font: "Bold 12pt Sans-Serif"},
        new go.Binding("text", "key")),

      $("PanelExpanderButton", "LIST1"),
      $(go.Panel, "Horizontal",
         {visible:false, name: "LIST1"},

         $(go.TextBlock,
           { alignment: go.Spot.Left, font: "Bold 12pt Sans-Serif", text: "Network Address :   "}),

         $(go.TextBlock,
           { font: "12pt Sans-Serif",editable:true}, new go.Binding("text", "address").makeTwoWay())
        ),
      $(go.Shape,  "RoundedRectangle",
        {  parameter1: 30,
           name: "SHAPE", //width: 500, height: 250,
          fill: "white" }, new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify))
    );

myDiagram.mouseDrop = function(e) {
    // dropping in diagram background removes nodes from any group
    myDiagram.commandHandler.addTopLevelParts(myDiagram.selection, true);
  };

myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;


$j.ajax({
  type: 'GET',
  
  dataType: 'json',
  contentType: 'application/json',
  url: 'http://sql0-sritabrata.c9users.io:8080/nodes',            
  success: function(data) {
      console.log('success!!!!');
      console.log(data);
      console.log(data.length);
      myDiagram.model.nodeDataArray = data;
  }
});

$j.ajax({
  type: 'GET',
  
  dataType: 'json',
  contentType: 'application/json',
  url: 'http://sql0-sritabrata.c9users.io:8080/links',            
  success: function(data) {
      console.log('success!!!!');
      console.log(data);
      console.log(data.length);
      myDiagram.model.linkDataArray = data;
  }
});

myDiagram.model = $(go.GraphLinksModel,
	                { linkFromPortIdProperty: "fromPort",  // required information:
	                  linkToPortIdProperty: "toPort",      // identifies data property names
                    copiesArrays: true,
                    copiesArrayObjects: true,
                    /*nodeDataArray: [
                        { key: "Subnet",text: "Subnet", address: "10.7.128.0" , isGroup: true,size: "600 300"},
                          //leftArray:[ {portColor:"#425e5c", portId:"left0"} ], },


                        { key: "Host0",
                          props: [
                           { name: "Host Name : ", value: "HP-PC"},
                           { name: "OS-Name : ", value: "Linux Mint"},
                           { name: "OS-Version : ", value: "19.1"},
                           { name: "No-Of-Network-Interfaces : ", value: "7"},
                           { name: "IPv4 Address : ", value: "10.7.130.6/20" },
                           { name: "Subnet Mask :  ", value: "20" },
                           { name: "WiFi MAC Address :  ", value: " D1-A9-P0-C7-F2-CB" }
                           
                           //{ name: "Carol", phone: "1111", loc: "C4-E23" },
                           //{ name: "Ted", phone: "2222", loc: "C4-E197" }
                           ], source: "images/pc1.png",  group: "Subnet", header: "Host",loc: "150 150",
                           leftArray:[ {portColor:"black", portId:"left0"} ],
                           topArray:[ {portColor:"black", portId:"top0"} ],
                           rightArray:[ {portColor:"black", portId:"right0"} ],
                           bottomArray:[ {portColor:"black", portId:"bottom0"} ]
                           },
                        { key: "Host01",
                          props: [
                           { name: "Host Name : ", value: "ASUS-ROG"},
                           { name: "OS-Name : ", value: "Windows"},
                           { name: "OS-Version : ", value: "10"},
                           { name: "No-Of-Network-Interfaces : ", value: "7"},
                           { name: "IPv4 Address : ", value: "10.7.130.4/20" },
                           { name: "Subnet Mask :  ", value: "20" },
                           { name: "WiFi MAC Address :  ", value: " B1-A3-P0-E7-F8-BA" }
                           //{ name: "Carol", phone: "1111", loc: "C4-E23" },
                           //{ name: "Ted", phone: "2222", loc: "C4-E197" }
                           ], source: "images/pc1.png",  group: "Subnet", header: "Host",loc: "450 150",
                           leftArray:[ {portColor:"black", portId:"left1"} ],
                           topArray:[ {portColor:"black", portId:"top1"} ],
                           rightArray:[ {portColor:"black", portId:"right1"} ],
                           bottomArray:[ {portColor:"black", portId:"bottom1"} ]
                           },

                        { key: "Switch", source: "images/hub.png",header: "Switch" ,loc: "270 400",
                          props: [
                           { name: "Number of Network Ports : ", value: "4" }],

                           leftArray:[ {portColor:"black", portId:"left0"} ],
                           topArray:[ {portColor:"black", portId:"top0"} ],
                           rightArray:[ {portColor:"black", portId:"right0"}],
                           bottomArray:[ {portColor:"black", portId:"bottom0"} ]


                        },
                        { key: "Router",
                          props: [
                           { name: "Router Name : ", value: "TL-8N14"},
                           //{ name: "No-Of-Network-Interfaces : ", value: "Windows"},
                           //{ name: "OS-Version : ", value: "10"},
                           { name: "No-Of-Network-Interfaces : ", value: "7"},
                           { name: "Default Gateway : ", value: "192.168.1.1" },
                           { name: "DHCP Server :  ", value: "192.168.1.1" },
                           { name: "MAC Address :  ", value: " A1-13-80-E0-F8-9A" }
                           //{ name: "Carol", phone: "1111", loc: "C4-E23" },
                           //{ name: "Ted", phone: "2222", loc: "C4-E197" }
                           ], source: "images/router.jpg", header: "Router",loc: "270 600",
                           leftArray:[ {portColor:"black", portId:"left1"} ],
                           topArray:[ {portColor:"black", portId:"top1"} ],
                           rightArray:[ {portColor:"black", portId:"right1"} ],
                           bottomArray:[ {portColor:"black", portId:"bottom1"} ]
                           },

                          { key:"Internet", header : "Internet", source: "http://weclipart.com/gimg/D81C4CA8FD5D1E8A/aTqGGnbTM.svg" , loc: "550 600",
                           leftArray:[ {portColor:"black", portId:"left1"} ],
                           topArray:[ {portColor:"black", portId:"top1"} ],
                           rightArray:[ {portColor:"black", portId:"right1"} ],
                           bottomArray:[ {portColor:"black", portId:"bottom1"} ]

                           },



                     ],
	                 linkDataArray: [

	                    {from: "Internet" , to: "Router" , fromPort: "left1", toPort: "right1"},
	                    //{ //from: "Router" , to: "Web Server" , fromPort: "R", toPort: "T"},
	                    //{ //from: "Router" , to: "Mail Server", fromPort: "R", toPort: "T"},
	                    { from: "Router", to:"Switch", fromPort: "top1", toPort: "bottom0"},
	                    //{ //from: "Switch", to: "Assignment Server", fromPort: "L", toPort: "R"},
	                    //{ //from: "Switch", to: "Access Point",fromPort: "L", toPort: "R" },
	                    //{ //from: "Switch", to: "Desktop", fromPort: "R", toPort: "L"},
	                    { from: "Switch", to: "Host0", fromPort: "left0", toPort: "bottom0"},
	                    { from: "Switch", to: "Host01", fromPort: "right0", toPort: "bottom1"}
	                 ]*/
	              });


//console.log(myDiagram.model.nodeDataArray)


  // This custom-routing Link class tries to separate parallel links from each other.
  // This assumes that ports are lined up in a row/column on a side of the node.
/*
function CustomLink() {
    go.Link.call(this);
  };
go.Diagram.inherit(CustomLink, go.Link);
CustomLink.prototype.findSidePortIndexAndCount = function(node, port) {
    var nodedata = node.data;
    if (nodedata !== null) {
      var portdata = port.data;
      var side = port._side;
      var arr = nodedata[side + "Array"];
      var len = arr.length;
      for (var i = 0; i < len; i++) {
        if (arr[i] === portdata) return [i, len];
      }
    }
    return [-1, len];
  };
  
CustomLink.prototype.computeEndSegmentLength = function(node, port, spot, from) {
    var esl = go.Link.prototype.computeEndSegmentLength.call(this, node, port, spot, from);
    var other = this.getOtherPort(port);
    if (port !== null && other !== null) {
      var thispt = port.getDocumentPoint(this.computeSpot(from));
      var otherpt = other.getDocumentPoint(this.computeSpot(!from));
      if (Math.abs(thispt.x - otherpt.x) > 20 || Math.abs(thispt.y - otherpt.y) > 20) {
        var info = this.findSidePortIndexAndCount(node, port);
        var idx = info[0];
        var count = info[1];
        if (port._side == "top" || port._side == "bottom") {
          if (otherpt.x < thispt.x) {
            return esl + 4 + idx * 8;
          } else {
            return esl + (count - idx - 1) * 8;
          }
        } else {  // left or right
          if (otherpt.y < thispt.y) {
            return esl + 4 + idx * 8;
          } else {
            return esl + (count - idx - 1) * 8;
          }
        }
      }
    }
    return esl;
  };
  
CustomLink.prototype.hasCurviness = function() {
    if (isNaN(this.curviness)) return true;
    return go.Link.prototype.hasCurviness.call(this);
  };
  
CustomLink.prototype.computeCurviness = function() {
    if (isNaN(this.curviness)) {
      var fromnode = this.fromNode;
      var fromport = this.fromPort;
      var fromspot = this.computeSpot(true);
      var frompt = fromport.getDocumentPoint(fromspot);
      var tonode = this.toNode;
      var toport = this.toPort;
      var tospot = this.computeSpot(false);
      var topt = toport.getDocumentPoint(tospot);
      if (Math.abs(frompt.x - topt.x) > 20 || Math.abs(frompt.y - topt.y) > 20) {
        if ((fromspot.equals(go.Spot.Left) || fromspot.equals(go.Spot.Right)) &&
            (tospot.equals(go.Spot.Left) || tospot.equals(go.Spot.Right))) {
          var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
          var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
          var c = (fromseglen - toseglen) / 2;
          if (frompt.x + fromseglen >= topt.x - toseglen) {
            if (frompt.y < topt.y) return c;
            if (frompt.y > topt.y) return -c;
          }
        } else if ((fromspot.equals(go.Spot.Top) || fromspot.equals(go.Spot.Bottom)) &&
                   (tospot.equals(go.Spot.Top) || tospot.equals(go.Spot.Bottom))) {
          var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
          var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
          var c = (fromseglen - toseglen) / 2;
          if (frompt.x + fromseglen >= topt.x - toseglen) {
            if (frompt.y < topt.y) return c;
            if (frompt.y > topt.y) return -c;
          }
        }
      }
    }
    return go.Link.prototype.computeCurviness.call(this);
  };

*/
  // end CustomLink class
  // Add a port to the specified side of the selected nodes.
function addPort(side) {
    myDiagram.startTransaction("addPort");
    myDiagram.selection.each(function(node) {
      // skip any selected Links
      if (!(node instanceof go.Node)) return;
      // compute the next available index number for the side
      var i = 0;
      while (node.findPort(side + i.toString()) !== node) i++;
      // now this new port name is unique within the whole Node because of the side prefix
      var name = side + i.toString();
      // get the Array of port data to be modified
      var arr = node.data[side + "Array"];
      if (arr) {
        // create a new port data object
        var newportdata = {
          portId: name,
          portColor: "black"
          // if you add port data properties here, you should copy them in copyPortData above
        };
        // and add it to the Array of port data
        myDiagram.model.insertArrayItem(arr, -1, newportdata);
      }
    });
    myDiagram.commitTransaction("addPort");
  }
  // Remove the clicked port from the node.
  // Links to the port will be redrawn to the node's shape.
function removePort(port) {
    myDiagram.startTransaction("removePort");
    var pid = port.portId;
    var arr = port.panel.itemArray;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].portId === pid) {
        myDiagram.model.removeArrayItem(arr, i);
        break;
      }
    }
    myDiagram.commitTransaction("removePort");
  }
  // Remove all ports from the same side of the node as the clicked port.
function removeAll(port) {
    myDiagram.startTransaction("removePorts");
    var nodedata = port.part.data;
    var side = port._side;  // there are four property names, all ending in "Array"
    myDiagram.model.setDataProperty(nodedata, side + "Array", []);  // an empty Array
    myDiagram.commitTransaction("removePorts");
  }
  // Change the color of the clicked port.
function changeColor(port) {
    myDiagram.startTransaction("colorPort");
    var data = port.data;
    myDiagram.model.setDataProperty(data, "portColor", go.Brush.randomColor());
    myDiagram.commitTransaction("colorPort");
  }







myDiagram.allowDrop = true;

var myPalette = $(go.Palette, "myPaletteDiv");

myPalette.nodeTemplate = 
       $(go.Node, "Vertical",

       	    $(go.Picture, 
       	         { width: 70, height: 60, background: "white" },
       	         new go.Binding("source")),

       	    $(go.TextBlock,
       	    	 { stroke: "black", font: "bold 16px sans-serif" , margin: 5, wrap: go.TextBlock.WrapFit,editable:true},
       	    	 new go.Binding("text", "key"))
       	);

myPalette.model.nodeDataArray = 
[  

  /*
  { key: "", source: "http://weclipart.com/gimg/D81C4CA8FD5D1E8A/aTqGGnbTM.svg" },
  { key: "Routers", source: "images/router.jpg" },
  { key: "Web Server",  source: "https://upload.wikimedia.org/wikipedia/commons/3/34/High-contrast-network-server.svg" },
  { key: "Mail Server",  source: "https://upload.wikimedia.org/wikipedia/commons/3/34/High-contrast-network-server.svg"},
  { key: "Switch", source: "images/hub.png"},
  { key: "Assignment Server",  source: "https://upload.wikimedia.org/wikipedia/commons/3/34/High-contrast-network-server.svg" },
  { key: "Access Point", source: "images/wifi.png"},
  { key: "Desktop", source: "images/pc1.png"},
  { key: "Assignment DB", source: "images/ass_db.png"},
  { key: "Web DB", source: "images/web_db.ico"}
  */
  { key:"Internet", header : "", source: "http://weclipart.com/gimg/D81C4CA8FD5D1E8A/aTqGGnbTM.svg" ,
     leftArray:[ {portColor:"black", portId:"left1"} ],
     topArray:[ {portColor:"black", portId:"top1"} ],
     rightArray:[ {portColor:"black", portId:"right1"} ],
     bottomArray:[ {portColor:"black", portId:"bottom1"} ]

    },
  
  { key: "Host0", text: "Host",
   props:[ 

           { name: "Host Name : ", value: "Enter Host Name"},
           { name: "OS-Name : ", value: "Enter OS-Name"},
           { name: "OS-Version : ", value: "Enter OS-Version"},
           { name: "No-Of-Network-Interfaces : ", value: "Enter No-Of-Network-Interfaces"},
           { name: "IPv4 Address : ", value: "Enter Host IPv4" },
           { name: "Subnet Mask :  ", value: "Enter Subnet Mask" },
           { name: "WiFi MAC Address :  ", value: "Enter WiFi MAC Address " }
          ],

    source: "images/pc1.png",header: "Host",

    leftArray:[ {portColor:"black", portId:"left0"} ],
    rightArray:[ {portColor:"black", portId:"right0"} ],
    bottomArray:[ {portColor:"black", portId:"bottom0"} ],
    topArray:[ {portColor:"black", portId:"top0"} ]},

    { key: "Switch", source: "images/hub.png",header: "Switch" ,
    props: [
    { name: "Number of Network Ports : ", value: "Enter number of ports" }],

    leftArray:[ {portColor:"black", portId:"left0"} ],
    topArray:[ {portColor:"black", portId:"top0"} ],
    rightArray:[ {portColor:"black", portId:"right0"} ],
    bottomArray:[ {portColor:"black", portId:"bottom0"} ]


    },
   { key: "Router",
      props: [
     { name: "Router Name : ", value: "Enter Router Name"},
     //{ name: "No-Of-Network-Interfaces : ", value: "Windows"},
     //{ name: "OS-Version : ", value: "10"},
     { name: "No-Of-Network-Interfaces : ", value: "Enter"},
     { name: "Default Gateway : ", value: "Enter Default Gateway" },
     { name: "DHCP Server :  ", value: "Enter IP of DHCP Server" },
     { name: "MAC Address :  ", value: " Enter MAC Address" }
     //{ name: "Carol", phone: "1111", loc: "C4-E23" },
     //{ name: "Ted", phone: "2222", loc: "C4-E197" }
     ], source: "images/router.jpg", header: "Router",
     leftArray:[ {portColor:"black", portId:"left1"} ],
     topArray:[ {portColor:"black", portId:"top1"} ],
     rightArray:[ {portColor:"black", portId:"right1"} ],
     bottomArray:[ {portColor:"black", portId:"bottom1"} ]
     },


    { key: "Subnet1",text: "Subnet",address:"Enter the Network Address",header: "Subnet", isGroup: true },

];



/*  // Make all ports on a node visible when the mouse is over the node
function showPorts(node, show) {
    var diagram = node.diagram;

    if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
    node.ports.each(function(port) {

        port.stroke = (show ? "blue" : null);
      });
  }


function makeSVG() {
    var svg = myDiagram.makeSvg({
        scale: 0.5
      });
    svg.style.border = "1px solid black";

    obj = document.getElementById("SVGArea");
    obj.appendChild(svg);

    if (obj.children.length > 0) {
      obj.replaceChild(svg, obj.children[0]);
    }
  }
*/

function save() {
     console.log(myDiagram.model.nodeDataArray);
     console.log(myDiagram.model.linkDataArray);
     var nodeArrayJSON = JSON.stringify(myDiagram.model.nodeDataArray);
     console.log(nodeArrayJSON);
     var linkArrayJSON = JSON.stringify(myDiagram.model.linkDataArray);
     //fs.writeFileSync('node_data_save.json',nodeArrayJSON);
     //var dataa = {a:1,b:2,c:3};
    $j.ajax({
      type: 'POST',
      data: nodeArrayJSON ,
      dataType: 'json',
      contentType: 'application/json',
      url: 'http://sql0-sritabrata.c9users.io:8080/node_save',            
      success: function(data) {
          console.log('success');
          console.log(JSON.stringify(data));
      }
  });
    $j.ajax({
      type: 'POST',
      data: linkArrayJSON ,
      dataType: 'json',
      contentType: 'application/json',
      url: 'http://sql0-sritabrata.c9users.io:8080/link_save',            
      success: function(data) {
          console.log('success');
          console.log(JSON.stringify(data));
      }
  });
}