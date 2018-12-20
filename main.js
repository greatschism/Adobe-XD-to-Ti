/*
 * Copyright (c) 2018 Peter Flynn
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*jshint esnext: true */
/*globals console, require, exports */

var sg = require("scenegraph");
var clipboard = require("clipboard");

function styleToWeight(fontStyle) {

  if (fontStyle.match(/\bBold\b/i)) {
    return "bold";
  } else if (fontStyle.match(/\bBlack\b/i) || fontStyle.match(/\bHeavy\b/i)) { // TODO: "extra bold"? (move precedence higher if so)
    return "semibold";
  } else if (fontStyle.match(/\bSemi[- ]?bold\b/i) || fontStyle.match(
      /\bDemi[- ]?bold\b/i)) {
    return "semibold";
  } else if (fontStyle.match(/\bMedium\b/i)) {
    return "normal";
  } else if (fontStyle.match(/\bLight\b/i)) {
    return "light";
  } else if (fontStyle.match(/\bUltra[- ]light\b/i)) {
    return "ultralight";
  } else {
    return "normal";
  }
}

function camelize(str) {


  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function styleIsItalic(fontStyle) {
  return (fontStyle.match(/\bItalic\b/i) || fontStyle.match(/\bOblique\b/i));
}

function colorToCSS(solidColor) {
  return solidColor.toHex();
}


function num(value) {

  value = value < 0 ? 0 : value
  return parseInt(value);
}
// TODO: omit "px" suffix from 0s

function numINt(value) {
  value = value < 0 ? 0 : value

  return parseInt(value);

}

function eq(num1, num2) {
  return (Math.abs(num1 - num2) < 0.001);
}

var parentsName = "";

var parentWidth = "";
var parentHeight = "";
const {
  Artboard, Rectangle, Ellipse, Text, Color
} = require("scenegraph");

function getPercentage(x, y) {}


function copy(selection) {
  var node = selection.items[0];

  // if (!parentsName) {
  //   parentsName = 1;
  //   // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", node.globalDrawBounds)
  // }

  // Size - for anything except point text
  if (!(node instanceof sg.Text && !node.areaBox)) {
    var bounds = node.localBounds;
    parentHeight = parseInt(bounds.height);
    parentWidth = parseInt(bounds.width);
  }


  //console.log();


  // Size - for anything except point text
  //    if ((node.text)) {
  //     		console.log(">>>>>>>>> node", node.text)
  //     }

  var tss = [];
  var xmlView = [];
  // Print out types of all child nodes (if any)

  function myCopy(childNode) {
    var mynode = childNode;
    var css = "";

    // console.log(">>>>>>>>> bounds", mynode.boundsInParent);
    // console.log(">>>>>>>>> bounds", mynode.boundsInParent.x);
    // console.log(">>>>>>>>> bounds", mynode.boundsInParent[0].y);

    // Size - for anything except point text
    if ((mynode instanceof sg.Text)) {
      // console.log(">>>>>>>>> node.textAlign ", mynode.textAlign)

      //     		var bounds = node;
      var bounds = mynode.localBounds;



      css += `width: ${num(bounds.width)},`;
      css += `height: ${num(bounds.height)},`;
      css += `left: ${numINt(mynode.boundsInParent.x)},`;
      css += `top: ${numINt(mynode.boundsInParent.y)},`;

      css += "text:\"" + mynode.text + "\", "
        //         css += `textAlign : ${num(bounds.y)},`;

    }

    // Size - for anything except point text
    if (!(node instanceof sg.Text && !node.areaBox)) {
      var bounds = mynode.localBounds;
      css += `width: ${num(bounds.width)},`;
      css += `height: ${num(bounds.height)},`;
      css += `left: ${num(bounds.x)},`;
      css += `top: ${num(bounds.y)},`;


      css += `backgroundImage : "assets/ass/${camelize(mynode.name)}.png",`;
      // css += `widthP: ${num(bounds.width)},`;
      // css += `heightP: ${num(bounds.height)},`;
      css += "width:\"" + parseInt(bounds.width / parentWidth * 100) + "%\","
      css += "height:\"" + parseInt(bounds.height / parentWidth * 100) +
        "%\","
        // css += parseInt(bounds.width / parentWidth * 100) +"%\","
      console.log(">>>>>>>>> numINt${camelize(mynode.name)}",
        camelize(mynode.name), ((bounds.width + numINt(
          mynode.boundsInParent
          .x))));

      // css += `left: ${numINt(mynode.boundsInParent.x)},`;
      // css += `top: ${numINt(mynode.boundsInParent.y)},`;


      // console.log("hello" + i + ">>>>>>>" + childNode);
      // console.log(camelize(childNode.name), ":{width:\"" + parseInt(
      //     boundschildNode.width / parentWidth * 100) +
      //   "%\",\n height:\"" +
      //   parseInt(boundschildNode.height / parentHeight * 100) +
      //   "%\"}");

    }

    // Corner metrics
    if (node.hasRoundedCorners) {
      var corners = mynode.effectiveCornerRadii;
      var tlbr = eq(corners.topLeft, corners.bottomRight);
      var trbl = eq(corners.topRight, corners.bottomLeft);
      if (tlbr && trbl) {
        if (eq(corners.topLeft, corners.topRight)) {
          css += `borderRadius: ${num(corners.topLeft)},`;
        } else {
          css +=
            `borderRadius: ${num(corners.topLeft)}px ${num(corners.topRight)},`;
        }
      } else {
        css +=
          `borderRadius: ${num(corners.topLeft)}px ${num(corners.topRight)}px ${num(corners.bottomRight)}px ${num(corners.bottomLeft)},`;
      }
    }

    // Text styles
    if (node instanceof sg.Text) {
      var textStyles = mynode.styleRanges[0];
      if (textStyles.fontFamily.includes(" ")) {
        css += `fontFamily: "${textStyles.fontFamily}",`;
      } else {
        css += `fontFamily: "${textStyles.fontFamily}",`;
      }
      css += `fontWeight :" ${styleToWeight(textStyles.fontStyle)}",`;

      if (styleIsItalic(textStyles.fontStyle)) {
        css += `fontStyle: "italic",`;
      }

      css += `fontSize: ${num(textStyles.fontSize)},`;

      if (styleIsItalic(textStyles.fontStyle)) {
        css += `textAlign: ${node.textAlign},`;
      }


    }

    // Fill
    var fillName = (mynode instanceof sg.Text) ? "color" : "backgroundColor";

    if (node.fill && mynode.fillEnabled) {
      var fill = node.fill;
      if (fill instanceof sg.Color) {
        var c = String(colorToCSS(fill));
        // console.log(c)
        css += `backgroundColor: "${c}" ,`;
      } else if (fill.colorStops) {
        var stops = fill.colorStops.map(stop => {
          return colorToCSS(stop.color) + " " + num(stop.stop * 100) +
            "%";
        });
        css += `${fillName}: linear-gradient(${ stops.join(", ") });\n`; // TODO: gradient direction!
      }
    }
    // Stroke
    if (mynode.stroke && mynode.strokeEnabled) {
      var stroke = mynode.stroke;
      css += `borderWidth : ${num(mynode.strokeWidth)},`
      css += `borderColor : "${colorToCSS(stroke)}",`;
      // TODO: dashed lines!
    }

    // Opacity
    // if (mynode) {
    //   css += `opacity: ${num(mynode.opacity)},`;
    // }

    //     clipboard.copyText(css);
    // console.log(node.parent.name)

    if (node.parent.name === "iPhone5") {
      tss.push("\"#" + camelize(mynode.name) +
        "[if=Alloy.Globals.isiPhone5]\": {" + css +
        "} \n");

    }
    if (node.parent.name == "iPhone6") {
      tss.push("\"#" + camelize(mynode.name) +
        "[if=Alloy.Globals.isiPhone6]\": {" + css +
        "} \n");

    }
    if (node.parent.name == "iPhone6plus") {
      tss.push("\"#" + camelize(mynode.name) +
        "[if=Alloy.Globals.isiPhone6Plus]\": {" +
        css + "} \n");

    }
    if (node.parent.name == "iPhoneX") {
      tss.push("\"#" + camelize(mynode.name) +
        "[if=Alloy.Globals.isiPhoneX]\": {" + css +
        "} \n");

    }

    if (node.parent.name == "iPhoneXplus") {
      tss.push("\"#" + camelize(mynode.name) +
        "[if=Alloy.Globals.iPhoneX_Plus]\": {" + css +
        "} \n");

    }

    //    console.log(css);

    // css = "#" + node.name + ": {"+ css +"}"
    //
    //

    // return css;

  }


  function returnView(x, name) {

    var view = ""

    if (x == "Rectangle") {
      view = "<View id=\"" + name + "\"></View>"
    } else if (x == "Group") {
      view = "<View id=\"" + name + "\"></View>"

    } else if (x == "Text") {
      view = "<Label id=\"" + name + "\"></Label>"

    } else if (x == "Line") {
      view = "<View id=\"" + name + "\"></View>"

    }

    return view;
  }



  node.children.forEach(function(childNode, i) {

    if (childNode.markedForExport) {



      if (childNode.children) {
        // console.log(returnView(childNode.constructor.name, camelize(childNode.name)));

        xmlView.push(returnView(childNode.constructor.name, camelize(
          childNode.name)))
        var boundschildNode = childNode.localBounds;

        childNode.children.forEach(function(childNodeq, i) {
          //                     console.log(childNodeq.constructor.name);
          // console.log(returnView(childNodeq.constructor.name,camelize(childNodeq.name)));

          xmlView.push(returnView(childNodeq.constructor.name,
            camelize(childNodeq.name)) + "\n")

          myCopy(childNodeq)

        });
      }

      myCopy(childNode)
    }
  });



  if (!node) {
    return;
  }

  // var css = "";
  //
  //
  // // Size - for anything except point text
  // if ((node instanceof sg.Text)) {
  //   //     		console.log(">>>>>>>>> node", node.localBounds)
  //
  //   //     		var bounds = node;
  //   var bounds = node.localBounds;
  //   css += `width: ${num(bounds.width)},`;
  //   css += `height: ${num(bounds.height)},`;
  //   css += `left: ${num(bounds.x)},`;
  //   css += `top: ${num(bounds.y)},`;
  //
  // }
  //
  // // Size - for anything except point text
  // if (!(node instanceof sg.Text && !node.areaBox)) {
  //   var bounds = node.localBounds;
  //   css += `width: ${num(bounds.width)},`;
  //   css += `height: ${num(bounds.height)},`;
  //   css += `left: ${num(bounds.x)},`;
  //   css += `top: ${num(bounds.y)},`;
  //
  // }
  //
  // // Corner metrics
  // if (node.hasRoundedCorners) {
  //   var corners = node.effectiveCornerRadii;
  //   var tlbr = eq(corners.topLeft, corners.bottomRight);
  //   var trbl = eq(corners.topRight, corners.bottomLeft);
  //   if (tlbr && trbl) {
  //     if (eq(corners.topLeft, corners.topRight)) {
  //       css += `borderRadius: ${num(corners.topLeft)},`;
  //     } else {
  //       css +=
  //         `borderRadius: ${num(corners.topLeft)}px ${num(corners.topRight)},`;
  //     }
  //   } else {
  //     css +=
  //       `borderRadius: ${num(corners.topLeft)}px ${num(corners.topRight)}px ${num(corners.bottomRight)}px ${num(corners.bottomLeft)},`;
  //   }
  // }
  //
  // // Text styles
  // if (node instanceof sg.Text) {
  //   var textStyles = node.styleRanges[0];
  //   if (textStyles.fontFamily.includes(" ")) {
  //     css += `fontFamily: "${textStyles.fontFamily}",`;
  //   } else {
  //     css += `fontFamily: "${textStyles.fontFamily}",`;
  //   }
  //   css += `fontWeight :" ${styleToWeight(textStyles.fontStyle)}",`;
  //
  //   if (styleIsItalic(textStyles.fontStyle)) {
  //     css += `fontStyle: "italic",`;
  //   }
  //
  //   css += `fontSize: ${num(textStyles.fontSize)},`;
  //
  //   if (styleIsItalic(textStyles.fontStyle)) {
  //     css += `textAlign: ${node.textAlign},`;
  //   }
  //
  //
  // }
  //
  // // Fill
  // var fillName = (node instanceof sg.Text) ? "color" : "backgroundColor";
  //
  // if (node.fill && node.fillEnabled) {
  //   var fill = node.fill;
  //   if (fill instanceof sg.Color) {
  //     var c = String(colorToCSS(fill));
  //     console.log(c)
  //     css += `backgroundColor: ${c} ,`;
  //   } else if (fill.colorStops) {
  //     var stops = fill.colorStops.map(stop => {
  //       return colorToCSS(stop.color) + " " + num(stop.stop * 100) + "%";
  //     });
  //     css += `${fillName}: linear-gradient(${ stops.join(", ") });\n`; // TODO: gradient direction!
  //   }
  // }
  // // Stroke
  // if (node.stroke && node.strokeEnabled) {
  //   var stroke = node.stroke;
  //   css += `borderWidth : ${num(node.strokeWidth)}`
  //   css += `borderColor :String(${colorToCSS(stroke)})`;
  //   // TODO: dashed lines!
  // }
  //
  // // Opacity
  // if (node.opacity !== 1) {
  //   css += `opacity: ${num(node.opacity)},`;
  // }

  //     clipboard.copyText(css);

  //         console.log( "#" + node.name + ": {"+ css +"}");


  //    console.log(css);

  // var myVar = "#" + node.name + ": {" + css + "}"

  clipboard.copyText(tss +
    " ________________________________________________________________________________________________________________________________________________" +
    xmlView);

}

exports.commands = {
  copyMe: copy
};
