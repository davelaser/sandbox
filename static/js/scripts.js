/*
---
MooTools: the javascript framework

web build:
 - http://mootools.net/core/4c208e7a7ef518d4ae6561fb67433294

packager build:
 - packager build Core/Element.Dimensions Core/Fx.Morph Core/Request.HTML Core/Request.JSON Core/DOMReady

copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
(function(){this.MooTools={version:"1.3.2",build:"c9f1ff10e9e7facb65e9481049ed1b450959d587"};var o=this.typeOf=function(i){if(i==null){return"null";}if(i.$family){return i.$family();
}if(i.nodeName){if(i.nodeType==1){return"element";}if(i.nodeType==3){return(/\S/).test(i.nodeValue)?"textnode":"whitespace";}}else{if(typeof i.length=="number"){if(i.callee){return"arguments";
}if("item" in i){return"collection";}}}return typeof i;};var j=this.instanceOf=function(t,i){if(t==null){return false;}var s=t.$constructor||t.constructor;
while(s){if(s===i){return true;}s=s.parent;}return t instanceof i;};var f=this.Function;var p=true;for(var k in {toString:1}){p=null;}if(p){p=["hasOwnProperty","valueOf","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","constructor"];
}f.prototype.overloadSetter=function(s){var i=this;return function(u,t){if(u==null){return this;}if(s||typeof u!="string"){for(var v in u){i.call(this,v,u[v]);
}if(p){for(var w=p.length;w--;){v=p[w];if(u.hasOwnProperty(v)){i.call(this,v,u[v]);}}}}else{i.call(this,u,t);}return this;};};f.prototype.overloadGetter=function(s){var i=this;
return function(u){var v,t;if(s||typeof u!="string"){v=u;}else{if(arguments.length>1){v=arguments;}}if(v){t={};for(var w=0;w<v.length;w++){t[v[w]]=i.call(this,v[w]);
}}else{t=i.call(this,u);}return t;};};f.prototype.extend=function(i,s){this[i]=s;}.overloadSetter();f.prototype.implement=function(i,s){this.prototype[i]=s;
}.overloadSetter();var n=Array.prototype.slice;f.from=function(i){return(o(i)=="function")?i:function(){return i;};};Array.from=function(i){if(i==null){return[];
}return(a.isEnumerable(i)&&typeof i!="string")?(o(i)=="array")?i:n.call(i):[i];};Number.from=function(s){var i=parseFloat(s);return isFinite(i)?i:null;
};String.from=function(i){return i+"";};f.implement({hide:function(){this.$hidden=true;return this;},protect:function(){this.$protected=true;return this;
}});var a=this.Type=function(u,t){if(u){var s=u.toLowerCase();var i=function(v){return(o(v)==s);};a["is"+u]=i;if(t!=null){t.prototype.$family=(function(){return s;
}).hide();}}if(t==null){return null;}t.extend(this);t.$constructor=a;t.prototype.$constructor=t;return t;};var e=Object.prototype.toString;a.isEnumerable=function(i){return(i!=null&&typeof i.length=="number"&&e.call(i)!="[object Function]");
};var q={};var r=function(i){var s=o(i.prototype);return q[s]||(q[s]=[]);};var b=function(t,x){if(x&&x.$hidden){return;}var s=r(this);for(var u=0;u<s.length;
u++){var w=s[u];if(o(w)=="type"){b.call(w,t,x);}else{w.call(this,t,x);}}var v=this.prototype[t];if(v==null||!v.$protected){this.prototype[t]=x;}if(this[t]==null&&o(x)=="function"){m.call(this,t,function(i){return x.apply(i,n.call(arguments,1));
});}};var m=function(i,t){if(t&&t.$hidden){return;}var s=this[i];if(s==null||!s.$protected){this[i]=t;}};a.implement({implement:b.overloadSetter(),extend:m.overloadSetter(),alias:function(i,s){b.call(this,i,this.prototype[s]);
}.overloadSetter(),mirror:function(i){r(this).push(i);return this;}});new a("Type",a);var d=function(s,w,u){var t=(w!=Object),A=w.prototype;if(t){w=new a(s,w);
}for(var x=0,v=u.length;x<v;x++){var B=u[x],z=w[B],y=A[B];if(z){z.protect();}if(t&&y){delete A[B];A[B]=y.protect();}}if(t){w.implement(A);}return d;};d("String",String,["charAt","charCodeAt","concat","indexOf","lastIndexOf","match","quote","replace","search","slice","split","substr","substring","toLowerCase","toUpperCase"])("Array",Array,["pop","push","reverse","shift","sort","splice","unshift","concat","join","slice","indexOf","lastIndexOf","filter","forEach","every","map","some","reduce","reduceRight"])("Number",Number,["toExponential","toFixed","toLocaleString","toPrecision"])("Function",f,["apply","call","bind"])("RegExp",RegExp,["exec","test"])("Object",Object,["create","defineProperty","defineProperties","keys","getPrototypeOf","getOwnPropertyDescriptor","getOwnPropertyNames","preventExtensions","isExtensible","seal","isSealed","freeze","isFrozen"])("Date",Date,["now"]);
Object.extend=m.overloadSetter();Date.extend("now",function(){return +(new Date);});new a("Boolean",Boolean);Number.prototype.$family=function(){return isFinite(this)?"number":"null";
}.hide();Number.extend("random",function(s,i){return Math.floor(Math.random()*(i-s+1)+s);});var g=Object.prototype.hasOwnProperty;Object.extend("forEach",function(i,t,u){for(var s in i){if(g.call(i,s)){t.call(u,i[s],s,i);
}}});Object.each=Object.forEach;Array.implement({forEach:function(u,v){for(var t=0,s=this.length;t<s;t++){if(t in this){u.call(v,this[t],t,this);}}},each:function(i,s){Array.forEach(this,i,s);
return this;}});var l=function(i){switch(o(i)){case"array":return i.clone();case"object":return Object.clone(i);default:return i;}};Array.implement("clone",function(){var s=this.length,t=new Array(s);
while(s--){t[s]=l(this[s]);}return t;});var h=function(s,i,t){switch(o(t)){case"object":if(o(s[i])=="object"){Object.merge(s[i],t);}else{s[i]=Object.clone(t);
}break;case"array":s[i]=t.clone();break;default:s[i]=t;}return s;};Object.extend({merge:function(z,u,t){if(o(u)=="string"){return h(z,u,t);}for(var y=1,s=arguments.length;
y<s;y++){var w=arguments[y];for(var x in w){h(z,x,w[x]);}}return z;},clone:function(i){var t={};for(var s in i){t[s]=l(i[s]);}return t;},append:function(w){for(var v=1,t=arguments.length;
v<t;v++){var s=arguments[v]||{};for(var u in s){w[u]=s[u];}}return w;}});["Object","WhiteSpace","TextNode","Collection","Arguments"].each(function(i){new a(i);
});var c=Date.now();String.extend("uniqueID",function(){return(c++).toString(36);});})();Array.implement({every:function(c,d){for(var b=0,a=this.length;
b<a;b++){if((b in this)&&!c.call(d,this[b],b,this)){return false;}}return true;},filter:function(d,e){var c=[];for(var b=0,a=this.length;b<a;b++){if((b in this)&&d.call(e,this[b],b,this)){c.push(this[b]);
}}return c;},indexOf:function(c,d){var a=this.length;for(var b=(d<0)?Math.max(0,a+d):d||0;b<a;b++){if(this[b]===c){return b;}}return -1;},map:function(d,e){var c=[];
for(var b=0,a=this.length;b<a;b++){if(b in this){c[b]=d.call(e,this[b],b,this);}}return c;},some:function(c,d){for(var b=0,a=this.length;b<a;b++){if((b in this)&&c.call(d,this[b],b,this)){return true;
}}return false;},clean:function(){return this.filter(function(a){return a!=null;});},invoke:function(a){var b=Array.slice(arguments,1);return this.map(function(c){return c[a].apply(c,b);
});},associate:function(c){var d={},b=Math.min(this.length,c.length);for(var a=0;a<b;a++){d[c[a]]=this[a];}return d;},link:function(c){var a={};for(var e=0,b=this.length;
e<b;e++){for(var d in c){if(c[d](this[e])){a[d]=this[e];delete c[d];break;}}}return a;},contains:function(a,b){return this.indexOf(a,b)!=-1;},append:function(a){this.push.apply(this,a);
return this;},getLast:function(){return(this.length)?this[this.length-1]:null;},getRandom:function(){return(this.length)?this[Number.random(0,this.length-1)]:null;
},include:function(a){if(!this.contains(a)){this.push(a);}return this;},combine:function(c){for(var b=0,a=c.length;b<a;b++){this.include(c[b]);}return this;
},erase:function(b){for(var a=this.length;a--;){if(this[a]===b){this.splice(a,1);}}return this;},empty:function(){this.length=0;return this;},flatten:function(){var d=[];
for(var b=0,a=this.length;b<a;b++){var c=typeOf(this[b]);if(c=="null"){continue;}d=d.concat((c=="array"||c=="collection"||c=="arguments"||instanceOf(this[b],Array))?Array.flatten(this[b]):this[b]);
}return d;},pick:function(){for(var b=0,a=this.length;b<a;b++){if(this[b]!=null){return this[b];}}return null;},hexToRgb:function(b){if(this.length!=3){return null;
}var a=this.map(function(c){if(c.length==1){c+=c;}return c.toInt(16);});return(b)?a:"rgb("+a+")";},rgbToHex:function(d){if(this.length<3){return null;}if(this.length==4&&this[3]==0&&!d){return"transparent";
}var b=[];for(var a=0;a<3;a++){var c=(this[a]-0).toString(16);b.push((c.length==1)?"0"+c:c);}return(d)?b:"#"+b.join("");}});Function.extend({attempt:function(){for(var b=0,a=arguments.length;
b<a;b++){try{return arguments[b]();}catch(c){}}return null;}});Function.implement({attempt:function(a,c){try{return this.apply(c,Array.from(a));}catch(b){}return null;
},bind:function(c){var a=this,b=(arguments.length>1)?Array.slice(arguments,1):null;return function(){if(!b&&!arguments.length){return a.call(c);}if(b&&arguments.length){return a.apply(c,b.concat(Array.from(arguments)));
}return a.apply(c,b||arguments);};},pass:function(b,c){var a=this;if(b!=null){b=Array.from(b);}return function(){return a.apply(c,b||arguments);};},delay:function(b,c,a){return setTimeout(this.pass((a==null?[]:a),c),b);
},periodical:function(c,b,a){return setInterval(this.pass((a==null?[]:a),b),c);}});Number.implement({limit:function(b,a){return Math.min(a,Math.max(b,this));
},round:function(a){a=Math.pow(10,a||0).toFixed(a<0?-a:0);return Math.round(this*a)/a;},times:function(b,c){for(var a=0;a<this;a++){b.call(c,a,this);}},toFloat:function(){return parseFloat(this);
},toInt:function(a){return parseInt(this,a||10);}});Number.alias("each","times");(function(b){var a={};b.each(function(c){if(!Number[c]){a[c]=function(){return Math[c].apply(null,[this].concat(Array.from(arguments)));
};}});Number.implement(a);})(["abs","acos","asin","atan","atan2","ceil","cos","exp","floor","log","max","min","pow","sin","sqrt","tan"]);String.implement({test:function(a,b){return((typeOf(a)=="regexp")?a:new RegExp(""+a,b)).test(this);
},contains:function(a,b){return(b)?(b+this+b).indexOf(b+a+b)>-1:this.indexOf(a)>-1;},trim:function(){return this.replace(/^\s+|\s+$/g,"");},clean:function(){return this.replace(/\s+/g," ").trim();
},camelCase:function(){return this.replace(/-\D/g,function(a){return a.charAt(1).toUpperCase();});},hyphenate:function(){return this.replace(/[A-Z]/g,function(a){return("-"+a.charAt(0).toLowerCase());
});},capitalize:function(){return this.replace(/\b[a-z]/g,function(a){return a.toUpperCase();});},escapeRegExp:function(){return this.replace(/([-.*+?^${}()|[\]\/\\])/g,"\\$1");
},toInt:function(a){return parseInt(this,a||10);},toFloat:function(){return parseFloat(this);},hexToRgb:function(b){var a=this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
return(a)?a.slice(1).hexToRgb(b):null;},rgbToHex:function(b){var a=this.match(/\d{1,3}/g);return(a)?a.rgbToHex(b):null;},substitute:function(a,b){return this.replace(b||(/\\?\{([^{}]+)\}/g),function(d,c){if(d.charAt(0)=="\\"){return d.slice(1);
}return(a[c]!=null)?a[c]:"";});}});(function(){var k=this.document;var i=k.window=this;var b=1;this.$uid=(i.ActiveXObject)?function(e){return(e.uid||(e.uid=[b++]))[0];
}:function(e){return e.uid||(e.uid=b++);};$uid(i);$uid(k);var a=navigator.userAgent.toLowerCase(),c=navigator.platform.toLowerCase(),j=a.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/)||[null,"unknown",0],f=j[1]=="ie"&&k.documentMode;
var o=this.Browser={extend:Function.prototype.extend,name:(j[1]=="version")?j[3]:j[1],version:f||parseFloat((j[1]=="opera"&&j[4])?j[4]:j[2]),Platform:{name:a.match(/ip(?:ad|od|hone)/)?"ios":(a.match(/(?:webos|android)/)||c.match(/mac|win|linux/)||["other"])[0]},Features:{xpath:!!(k.evaluate),air:!!(i.runtime),query:!!(k.querySelector),json:!!(i.JSON)},Plugins:{}};
o[o.name]=true;o[o.name+parseInt(o.version,10)]=true;o.Platform[o.Platform.name]=true;o.Request=(function(){var q=function(){return new XMLHttpRequest();
};var p=function(){return new ActiveXObject("MSXML2.XMLHTTP");};var e=function(){return new ActiveXObject("Microsoft.XMLHTTP");};return Function.attempt(function(){q();
return q;},function(){p();return p;},function(){e();return e;});})();o.Features.xhr=!!(o.Request);var h=(Function.attempt(function(){return navigator.plugins["Shockwave Flash"].description;
},function(){return new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version");})||"0 r0").match(/\d+/g);o.Plugins.Flash={version:Number(h[0]||"0."+h[1])||0,build:Number(h[2])||0};
o.exec=function(p){if(!p){return p;}if(i.execScript){i.execScript(p);}else{var e=k.createElement("script");e.setAttribute("type","text/javascript");e.text=p;
k.head.appendChild(e);k.head.removeChild(e);}return p;};String.implement("stripScripts",function(p){var e="";var q=this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,function(r,s){e+=s+"\n";
return"";});if(p===true){o.exec(e);}else{if(typeOf(p)=="function"){p(e,q);}}return q;});o.extend({Document:this.Document,Window:this.Window,Element:this.Element,Event:this.Event});
this.Window=this.$constructor=new Type("Window",function(){});this.$family=Function.from("window").hide();Window.mirror(function(e,p){i[e]=p;});this.Document=k.$constructor=new Type("Document",function(){});
k.$family=Function.from("document").hide();Document.mirror(function(e,p){k[e]=p;});k.html=k.documentElement;if(!k.head){k.head=k.getElementsByTagName("head")[0];
}if(k.execCommand){try{k.execCommand("BackgroundImageCache",false,true);}catch(g){}}if(this.attachEvent&&!this.addEventListener){var d=function(){this.detachEvent("onunload",d);
k.head=k.html=k.window=null;};this.attachEvent("onunload",d);}var m=Array.from;try{m(k.html.childNodes);}catch(g){Array.from=function(p){if(typeof p!="string"&&Type.isEnumerable(p)&&typeOf(p)!="array"){var e=p.length,q=new Array(e);
while(e--){q[e]=p[e];}return q;}return m(p);};var l=Array.prototype,n=l.slice;["pop","push","reverse","shift","sort","splice","unshift","concat","join","slice"].each(function(e){var p=l[e];
Array[e]=function(q){return p.apply(Array.from(q),n.call(arguments,1));};});}})();(function(){var k,n,l,g,a={},c={},m=/\\/g;var e=function(q,p){if(q==null){return null;
}if(q.Slick===true){return q;}q=(""+q).replace(/^\s+|\s+$/g,"");g=!!p;var o=(g)?c:a;if(o[q]){return o[q];}k={Slick:true,expressions:[],raw:q,reverse:function(){return e(this.raw,true);
}};n=-1;while(q!=(q=q.replace(j,b))){}k.length=k.expressions.length;return o[k.raw]=(g)?h(k):k;};var i=function(o){if(o==="!"){return" ";}else{if(o===" "){return"!";
}else{if((/^!/).test(o)){return o.replace(/^!/,"");}else{return"!"+o;}}}};var h=function(u){var r=u.expressions;for(var p=0;p<r.length;p++){var t=r[p];
var q={parts:[],tag:"*",combinator:i(t[0].combinator)};for(var o=0;o<t.length;o++){var s=t[o];if(!s.reverseCombinator){s.reverseCombinator=" ";}s.combinator=s.reverseCombinator;
delete s.reverseCombinator;}t.reverse().push(q);}return u;};var f=function(o){return o.replace(/[-[\]{}()*+?.\\^$|,#\s]/g,function(p){return"\\"+p;});};
var j=new RegExp("^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|(:+)(<unicode>+)(?:\\((?:(?:([\"'])([^\\13]*)\\13)|((?:\\([^)]+\\)|[^()]*)+))\\))?)".replace(/<combinator>/,"["+f(">+~`!@$%^&={}\\;</")+"]").replace(/<unicode>/g,"(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])").replace(/<unicode1>/g,"(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])"));
function b(x,s,D,z,r,C,q,B,A,y,u,F,G,v,p,w){if(s||n===-1){k.expressions[++n]=[];l=-1;if(s){return"";}}if(D||z||l===-1){D=D||" ";var t=k.expressions[n];
if(g&&t[l]){t[l].reverseCombinator=i(D);}t[++l]={combinator:D,tag:"*"};}var o=k.expressions[n][l];if(r){o.tag=r.replace(m,"");}else{if(C){o.id=C.replace(m,"");
}else{if(q){q=q.replace(m,"");if(!o.classList){o.classList=[];}if(!o.classes){o.classes=[];}o.classList.push(q);o.classes.push({value:q,regexp:new RegExp("(^|\\s)"+f(q)+"(\\s|$)")});
}else{if(G){w=w||p;w=w?w.replace(m,""):null;if(!o.pseudos){o.pseudos=[];}o.pseudos.push({key:G.replace(m,""),value:w,type:F.length==1?"class":"element"});
}else{if(B){B=B.replace(m,"");u=(u||"").replace(m,"");var E,H;switch(A){case"^=":H=new RegExp("^"+f(u));break;case"$=":H=new RegExp(f(u)+"$");break;case"~=":H=new RegExp("(^|\\s)"+f(u)+"(\\s|$)");
break;case"|=":H=new RegExp("^"+f(u)+"(-|$)");break;case"=":E=function(I){return u==I;};break;case"*=":E=function(I){return I&&I.indexOf(u)>-1;};break;
case"!=":E=function(I){return u!=I;};break;default:E=function(I){return !!I;};}if(u==""&&(/^[*$^]=$/).test(A)){E=function(){return false;};}if(!E){E=function(I){return I&&H.test(I);
};}if(!o.attributes){o.attributes=[];}o.attributes.push({key:B,operator:A,value:u,test:E});}}}}}return"";}var d=(this.Slick||{});d.parse=function(o){return e(o);
};d.escapeRegExp=f;if(!this.Slick){this.Slick=d;}}).apply((typeof exports!="undefined")?exports:this);(function(){var j={},l={},b=Object.prototype.toString;
j.isNativeCode=function(c){return(/\{\s*\[native code\]\s*\}/).test(""+c);};j.isXML=function(c){return(!!c.xmlVersion)||(!!c.xml)||(b.call(c)=="[object XMLDocument]")||(c.nodeType==9&&c.documentElement.nodeName!="HTML");
};j.setDocument=function(w){var t=w.nodeType;if(t==9){}else{if(t){w=w.ownerDocument;}else{if(w.navigator){w=w.document;}else{return;}}}if(this.document===w){return;
}this.document=w;var y=w.documentElement,u=this.getUIDXML(y),o=l[u],A;if(o){for(A in o){this[A]=o[A];}return;}o=l[u]={};o.root=y;o.isXMLDocument=this.isXML(w);
o.brokenStarGEBTN=o.starSelectsClosedQSA=o.idGetsName=o.brokenMixedCaseQSA=o.brokenGEBCN=o.brokenCheckedQSA=o.brokenEmptyAttributeQSA=o.isHTMLDocument=o.nativeMatchesSelector=false;
var m,n,x,q,r;var s,c="slick_uniqueid";var z=w.createElement("div");var p=w.body||w.getElementsByTagName("body")[0]||y;p.appendChild(z);try{z.innerHTML='<a id="'+c+'"></a>';
o.isHTMLDocument=!!w.getElementById(c);}catch(v){}if(o.isHTMLDocument){z.style.display="none";z.appendChild(w.createComment(""));n=(z.getElementsByTagName("*").length>1);
try{z.innerHTML="foo</foo>";s=z.getElementsByTagName("*");m=(s&&!!s.length&&s[0].nodeName.charAt(0)=="/");}catch(v){}o.brokenStarGEBTN=n||m;try{z.innerHTML='<a name="'+c+'"></a><b id="'+c+'"></b>';
o.idGetsName=w.getElementById(c)===z.firstChild;}catch(v){}if(z.getElementsByClassName){try{z.innerHTML='<a class="f"></a><a class="b"></a>';z.getElementsByClassName("b").length;
z.firstChild.className="b";q=(z.getElementsByClassName("b").length!=2);}catch(v){}try{z.innerHTML='<a class="a"></a><a class="f b a"></a>';x=(z.getElementsByClassName("a").length!=2);
}catch(v){}o.brokenGEBCN=q||x;}if(z.querySelectorAll){try{z.innerHTML="foo</foo>";s=z.querySelectorAll("*");o.starSelectsClosedQSA=(s&&!!s.length&&s[0].nodeName.charAt(0)=="/");
}catch(v){}try{z.innerHTML='<a class="MiX"></a>';o.brokenMixedCaseQSA=!z.querySelectorAll(".MiX").length;}catch(v){}try{z.innerHTML='<select><option selected="selected">a</option></select>';
o.brokenCheckedQSA=(z.querySelectorAll(":checked").length==0);}catch(v){}try{z.innerHTML='<a class=""></a>';o.brokenEmptyAttributeQSA=(z.querySelectorAll('[class*=""]').length!=0);
}catch(v){}}try{z.innerHTML='<form action="s"><input id="action"/></form>';r=(z.firstChild.getAttribute("action")!="s");}catch(v){}o.nativeMatchesSelector=y.matchesSelector||y.mozMatchesSelector||y.webkitMatchesSelector;
if(o.nativeMatchesSelector){try{o.nativeMatchesSelector.call(y,":slick");o.nativeMatchesSelector=null;}catch(v){}}}try{y.slick_expando=1;delete y.slick_expando;
o.getUID=this.getUIDHTML;}catch(v){o.getUID=this.getUIDXML;}p.removeChild(z);z=s=p=null;o.getAttribute=(o.isHTMLDocument&&r)?function(D,B){var E=this.attributeGetters[B];
if(E){return E.call(D);}var C=D.getAttributeNode(B);return(C)?C.nodeValue:null;}:function(C,B){var D=this.attributeGetters[B];return(D)?D.call(C):C.getAttribute(B);
};o.hasAttribute=(y&&this.isNativeCode(y.hasAttribute))?function(C,B){return C.hasAttribute(B);}:function(C,B){C=C.getAttributeNode(B);return !!(C&&(C.specified||C.nodeValue));
};o.contains=(y&&this.isNativeCode(y.contains))?function(B,C){return B.contains(C);}:(y&&y.compareDocumentPosition)?function(B,C){return B===C||!!(B.compareDocumentPosition(C)&16);
}:function(B,C){if(C){do{if(C===B){return true;}}while((C=C.parentNode));}return false;};o.documentSorter=(y.compareDocumentPosition)?function(C,B){if(!C.compareDocumentPosition||!B.compareDocumentPosition){return 0;
}return C.compareDocumentPosition(B)&4?-1:C===B?0:1;}:("sourceIndex" in y)?function(C,B){if(!C.sourceIndex||!B.sourceIndex){return 0;}return C.sourceIndex-B.sourceIndex;
}:(w.createRange)?function(E,C){if(!E.ownerDocument||!C.ownerDocument){return 0;}var D=E.ownerDocument.createRange(),B=C.ownerDocument.createRange();D.setStart(E,0);
D.setEnd(E,0);B.setStart(C,0);B.setEnd(C,0);return D.compareBoundaryPoints(Range.START_TO_END,B);}:null;y=null;for(A in o){this[A]=o[A];}};var e=/^([#.]?)((?:[\w-]+|\*))$/,g=/\[.+[*$^]=(?:""|'')?\]/,f={};
j.search=function(U,z,H,s){var p=this.found=(s)?null:(H||[]);if(!U){return p;}else{if(U.navigator){U=U.document;}else{if(!U.nodeType){return p;}}}var F,O,V=this.uniques={},I=!!(H&&H.length),y=(U.nodeType==9);
if(this.document!==(y?U:U.ownerDocument)){this.setDocument(U);}if(I){for(O=p.length;O--;){V[this.getUID(p[O])]=true;}}if(typeof z=="string"){var r=z.match(e);
simpleSelectors:if(r){var u=r[1],v=r[2],A,E;if(!u){if(v=="*"&&this.brokenStarGEBTN){break simpleSelectors;}E=U.getElementsByTagName(v);if(s){return E[0]||null;
}for(O=0;A=E[O++];){if(!(I&&V[this.getUID(A)])){p.push(A);}}}else{if(u=="#"){if(!this.isHTMLDocument||!y){break simpleSelectors;}A=U.getElementById(v);
if(!A){return p;}if(this.idGetsName&&A.getAttributeNode("id").nodeValue!=v){break simpleSelectors;}if(s){return A||null;}if(!(I&&V[this.getUID(A)])){p.push(A);
}}else{if(u=="."){if(!this.isHTMLDocument||((!U.getElementsByClassName||this.brokenGEBCN)&&U.querySelectorAll)){break simpleSelectors;}if(U.getElementsByClassName&&!this.brokenGEBCN){E=U.getElementsByClassName(v);
if(s){return E[0]||null;}for(O=0;A=E[O++];){if(!(I&&V[this.getUID(A)])){p.push(A);}}}else{var T=new RegExp("(^|\\s)"+d.escapeRegExp(v)+"(\\s|$)");E=U.getElementsByTagName("*");
for(O=0;A=E[O++];){className=A.className;if(!(className&&T.test(className))){continue;}if(s){return A;}if(!(I&&V[this.getUID(A)])){p.push(A);}}}}}}if(I){this.sort(p);
}return(s)?null:p;}querySelector:if(U.querySelectorAll){if(!this.isHTMLDocument||f[z]||this.brokenMixedCaseQSA||(this.brokenCheckedQSA&&z.indexOf(":checked")>-1)||(this.brokenEmptyAttributeQSA&&g.test(z))||(!y&&z.indexOf(",")>-1)||d.disableQSA){break querySelector;
}var S=z,x=U;if(!y){var C=x.getAttribute("id"),t="slickid__";x.setAttribute("id",t);S="#"+t+" "+S;U=x.parentNode;}try{if(s){return U.querySelector(S)||null;
}else{E=U.querySelectorAll(S);}}catch(Q){f[z]=1;break querySelector;}finally{if(!y){if(C){x.setAttribute("id",C);}else{x.removeAttribute("id");}U=x;}}if(this.starSelectsClosedQSA){for(O=0;
A=E[O++];){if(A.nodeName>"@"&&!(I&&V[this.getUID(A)])){p.push(A);}}}else{for(O=0;A=E[O++];){if(!(I&&V[this.getUID(A)])){p.push(A);}}}if(I){this.sort(p);
}return p;}F=this.Slick.parse(z);if(!F.length){return p;}}else{if(z==null){return p;}else{if(z.Slick){F=z;}else{if(this.contains(U.documentElement||U,z)){(p)?p.push(z):p=z;
return p;}else{return p;}}}}this.posNTH={};this.posNTHLast={};this.posNTHType={};this.posNTHTypeLast={};this.push=(!I&&(s||(F.length==1&&F.expressions[0].length==1)))?this.pushArray:this.pushUID;
if(p==null){p=[];}var M,L,K;var B,J,D,c,q,G,W;var N,P,o,w,R=F.expressions;search:for(O=0;(P=R[O]);O++){for(M=0;(o=P[M]);M++){B="combinator:"+o.combinator;
if(!this[B]){continue search;}J=(this.isXMLDocument)?o.tag:o.tag.toUpperCase();D=o.id;c=o.classList;q=o.classes;G=o.attributes;W=o.pseudos;w=(M===(P.length-1));
this.bitUniques={};if(w){this.uniques=V;this.found=p;}else{this.uniques={};this.found=[];}if(M===0){this[B](U,J,D,q,G,W,c);if(s&&w&&p.length){break search;
}}else{if(s&&w){for(L=0,K=N.length;L<K;L++){this[B](N[L],J,D,q,G,W,c);if(p.length){break search;}}}else{for(L=0,K=N.length;L<K;L++){this[B](N[L],J,D,q,G,W,c);
}}}N=this.found;}}if(I||(F.expressions.length>1)){this.sort(p);}return(s)?(p[0]||null):p;};j.uidx=1;j.uidk="slick-uniqueid";j.getUIDXML=function(m){var c=m.getAttribute(this.uidk);
if(!c){c=this.uidx++;m.setAttribute(this.uidk,c);}return c;};j.getUIDHTML=function(c){return c.uniqueNumber||(c.uniqueNumber=this.uidx++);};j.sort=function(c){if(!this.documentSorter){return c;
}c.sort(this.documentSorter);return c;};j.cacheNTH={};j.matchNTH=/^([+-]?\d*)?([a-z]+)?([+-]\d+)?$/;j.parseNTHArgument=function(p){var n=p.match(this.matchNTH);
if(!n){return false;}var o=n[2]||false;var m=n[1]||1;if(m=="-"){m=-1;}var c=+n[3]||0;n=(o=="n")?{a:m,b:c}:(o=="odd")?{a:2,b:1}:(o=="even")?{a:2,b:0}:{a:0,b:m};
return(this.cacheNTH[p]=n);};j.createNTHPseudo=function(o,m,c,n){return function(r,p){var t=this.getUID(r);if(!this[c][t]){var z=r.parentNode;if(!z){return false;
}var q=z[o],s=1;if(n){var y=r.nodeName;do{if(q.nodeName!=y){continue;}this[c][this.getUID(q)]=s++;}while((q=q[m]));}else{do{if(q.nodeType!=1){continue;
}this[c][this.getUID(q)]=s++;}while((q=q[m]));}}p=p||"n";var u=this.cacheNTH[p]||this.parseNTHArgument(p);if(!u){return false;}var x=u.a,w=u.b,v=this[c][t];
if(x==0){return w==v;}if(x>0){if(v<w){return false;}}else{if(w<v){return false;}}return((v-w)%x)==0;};};j.pushArray=function(o,c,q,n,m,p){if(this.matchSelector(o,c,q,n,m,p)){this.found.push(o);
}};j.pushUID=function(p,c,r,o,m,q){var n=this.getUID(p);if(!this.uniques[n]&&this.matchSelector(p,c,r,o,m,q)){this.uniques[n]=true;this.found.push(p);}};
j.matchNode=function(m,n){if(this.isHTMLDocument&&this.nativeMatchesSelector){try{return this.nativeMatchesSelector.call(m,n.replace(/\[([^=]+)=\s*([^'"\]]+?)\s*\]/g,'[$1="$2"]'));
}catch(u){}}var t=this.Slick.parse(n);if(!t){return true;}var r=t.expressions,p,s=0,q;for(q=0;(currentExpression=r[q]);q++){if(currentExpression.length==1){var o=currentExpression[0];
if(this.matchSelector(m,(this.isXMLDocument)?o.tag:o.tag.toUpperCase(),o.id,o.classes,o.attributes,o.pseudos)){return true;}s++;}}if(s==t.length){return false;
}var c=this.search(this.document,t),v;for(q=0;v=c[q++];){if(v===m){return true;}}return false;};j.matchPseudo=function(p,c,o){var m="pseudo:"+c;if(this[m]){return this[m](p,o);
}var n=this.getAttribute(p,c);return(o)?o==n:!!n;};j.matchSelector=function(n,u,c,o,p,r){if(u){var s=(this.isXMLDocument)?n.nodeName:n.nodeName.toUpperCase();
if(u=="*"){if(s<"@"){return false;}}else{if(s!=u){return false;}}}if(c&&n.getAttribute("id")!=c){return false;}var q,m,t;if(o){for(q=o.length;q--;){t=n.getAttribute("class")||n.className;
if(!(t&&o[q].regexp.test(t))){return false;}}}if(p){for(q=p.length;q--;){m=p[q];if(m.operator?!m.test(this.getAttribute(n,m.key)):!this.hasAttribute(n,m.key)){return false;
}}}if(r){for(q=r.length;q--;){m=r[q];if(!this.matchPseudo(n,m.key,m.value)){return false;}}}return true;};var i={" ":function(p,v,m,q,r,t,o){var s,u,n;
if(this.isHTMLDocument){getById:if(m){u=this.document.getElementById(m);if((!u&&p.all)||(this.idGetsName&&u&&u.getAttributeNode("id").nodeValue!=m)){n=p.all[m];
if(!n){return;}if(!n[0]){n=[n];}for(s=0;u=n[s++];){var c=u.getAttributeNode("id");if(c&&c.nodeValue==m){this.push(u,v,null,q,r,t);break;}}return;}if(!u){if(this.contains(this.root,p)){return;
}else{break getById;}}else{if(this.document!==p&&!this.contains(p,u)){return;}}this.push(u,v,null,q,r,t);return;}getByClass:if(q&&p.getElementsByClassName&&!this.brokenGEBCN){n=p.getElementsByClassName(o.join(" "));
if(!(n&&n.length)){break getByClass;}for(s=0;u=n[s++];){this.push(u,v,m,null,r,t);}return;}}getByTag:{n=p.getElementsByTagName(v);if(!(n&&n.length)){break getByTag;
}if(!this.brokenStarGEBTN){v=null;}for(s=0;u=n[s++];){this.push(u,v,m,q,r,t);}}},">":function(o,c,q,n,m,p){if((o=o.firstChild)){do{if(o.nodeType==1){this.push(o,c,q,n,m,p);
}}while((o=o.nextSibling));}},"+":function(o,c,q,n,m,p){while((o=o.nextSibling)){if(o.nodeType==1){this.push(o,c,q,n,m,p);break;}}},"^":function(o,c,q,n,m,p){o=o.firstChild;
if(o){if(o.nodeType==1){this.push(o,c,q,n,m,p);}else{this["combinator:+"](o,c,q,n,m,p);}}},"~":function(p,c,r,o,m,q){while((p=p.nextSibling)){if(p.nodeType!=1){continue;
}var n=this.getUID(p);if(this.bitUniques[n]){break;}this.bitUniques[n]=true;this.push(p,c,r,o,m,q);}},"++":function(o,c,q,n,m,p){this["combinator:+"](o,c,q,n,m,p);
this["combinator:!+"](o,c,q,n,m,p);},"~~":function(o,c,q,n,m,p){this["combinator:~"](o,c,q,n,m,p);this["combinator:!~"](o,c,q,n,m,p);},"!":function(o,c,q,n,m,p){while((o=o.parentNode)){if(o!==this.document){this.push(o,c,q,n,m,p);
}}},"!>":function(o,c,q,n,m,p){o=o.parentNode;if(o!==this.document){this.push(o,c,q,n,m,p);}},"!+":function(o,c,q,n,m,p){while((o=o.previousSibling)){if(o.nodeType==1){this.push(o,c,q,n,m,p);
break;}}},"!^":function(o,c,q,n,m,p){o=o.lastChild;if(o){if(o.nodeType==1){this.push(o,c,q,n,m,p);}else{this["combinator:!+"](o,c,q,n,m,p);}}},"!~":function(p,c,r,o,m,q){while((p=p.previousSibling)){if(p.nodeType!=1){continue;
}var n=this.getUID(p);if(this.bitUniques[n]){break;}this.bitUniques[n]=true;this.push(p,c,r,o,m,q);}}};for(var h in i){j["combinator:"+h]=i[h];}var k={empty:function(c){var m=c.firstChild;
return !(m&&m.nodeType==1)&&!(c.innerText||c.textContent||"").length;},not:function(c,m){return !this.matchNode(c,m);},contains:function(c,m){return(c.innerText||c.textContent||"").indexOf(m)>-1;
},"first-child":function(c){while((c=c.previousSibling)){if(c.nodeType==1){return false;}}return true;},"last-child":function(c){while((c=c.nextSibling)){if(c.nodeType==1){return false;
}}return true;},"only-child":function(n){var m=n;while((m=m.previousSibling)){if(m.nodeType==1){return false;}}var c=n;while((c=c.nextSibling)){if(c.nodeType==1){return false;
}}return true;},"nth-child":j.createNTHPseudo("firstChild","nextSibling","posNTH"),"nth-last-child":j.createNTHPseudo("lastChild","previousSibling","posNTHLast"),"nth-of-type":j.createNTHPseudo("firstChild","nextSibling","posNTHType",true),"nth-last-of-type":j.createNTHPseudo("lastChild","previousSibling","posNTHTypeLast",true),index:function(m,c){return this["pseudo:nth-child"](m,""+c+1);
},even:function(c){return this["pseudo:nth-child"](c,"2n");},odd:function(c){return this["pseudo:nth-child"](c,"2n+1");},"first-of-type":function(c){var m=c.nodeName;
while((c=c.previousSibling)){if(c.nodeName==m){return false;}}return true;},"last-of-type":function(c){var m=c.nodeName;while((c=c.nextSibling)){if(c.nodeName==m){return false;
}}return true;},"only-of-type":function(n){var m=n,o=n.nodeName;while((m=m.previousSibling)){if(m.nodeName==o){return false;}}var c=n;while((c=c.nextSibling)){if(c.nodeName==o){return false;
}}return true;},enabled:function(c){return !c.disabled;},disabled:function(c){return c.disabled;},checked:function(c){return c.checked||c.selected;},focus:function(c){return this.isHTMLDocument&&this.document.activeElement===c&&(c.href||c.type||this.hasAttribute(c,"tabindex"));
},root:function(c){return(c===this.root);},selected:function(c){return c.selected;}};for(var a in k){j["pseudo:"+a]=k[a];}j.attributeGetters={"class":function(){return this.getAttribute("class")||this.className;
},"for":function(){return("htmlFor" in this)?this.htmlFor:this.getAttribute("for");},href:function(){return("href" in this)?this.getAttribute("href",2):this.getAttribute("href");
},style:function(){return(this.style)?this.style.cssText:this.getAttribute("style");},tabindex:function(){var c=this.getAttributeNode("tabindex");return(c&&c.specified)?c.nodeValue:null;
},type:function(){return this.getAttribute("type");}};var d=j.Slick=(this.Slick||{});d.version="1.1.5";d.search=function(m,n,c){return j.search(m,n,c);
};d.find=function(c,m){return j.search(c,m,null,true);};d.contains=function(c,m){j.setDocument(c);return j.contains(c,m);};d.getAttribute=function(m,c){return j.getAttribute(m,c);
};d.match=function(m,c){if(!(m&&c)){return false;}if(!c||c===m){return true;}j.setDocument(m);return j.matchNode(m,c);};d.defineAttributeGetter=function(c,m){j.attributeGetters[c]=m;
return this;};d.lookupAttributeGetter=function(c){return j.attributeGetters[c];};d.definePseudo=function(c,m){j["pseudo:"+c]=function(o,n){return m.call(o,n);
};return this;};d.lookupPseudo=function(c){var m=j["pseudo:"+c];if(m){return function(n){return m.call(this,n);};}return null;};d.override=function(m,c){j.override(m,c);
return this;};d.isXML=j.isXML;d.uidOf=function(c){return j.getUIDHTML(c);};if(!this.Slick){this.Slick=d;}}).apply((typeof exports!="undefined")?exports:this);
var Element=function(b,g){var h=Element.Constructors[b];if(h){return h(g);}if(typeof b!="string"){return document.id(b).set(g);}if(!g){g={};}if(!(/^[\w-]+$/).test(b)){var e=Slick.parse(b).expressions[0][0];
b=(e.tag=="*")?"div":e.tag;if(e.id&&g.id==null){g.id=e.id;}var d=e.attributes;if(d){for(var f=0,c=d.length;f<c;f++){var a=d[f];if(g[a.key]!=null){continue;
}if(a.value!=null&&a.operator=="="){g[a.key]=a.value;}else{if(!a.value&&!a.operator){g[a.key]=true;}}}}if(e.classList&&g["class"]==null){g["class"]=e.classList.join(" ");
}}return document.newElement(b,g);};if(Browser.Element){Element.prototype=Browser.Element.prototype;}new Type("Element",Element).mirror(function(a){if(Array.prototype[a]){return;
}var b={};b[a]=function(){var h=[],e=arguments,j=true;for(var g=0,d=this.length;g<d;g++){var f=this[g],c=h[g]=f[a].apply(f,e);j=(j&&typeOf(c)=="element");
}return(j)?new Elements(h):h;};Elements.implement(b);});if(!Browser.Element){Element.parent=Object;Element.Prototype={"$family":Function.from("element").hide()};
Element.mirror(function(a,b){Element.Prototype[a]=b;});}Element.Constructors={};var IFrame=new Type("IFrame",function(){var e=Array.link(arguments,{properties:Type.isObject,iframe:function(f){return(f!=null);
}});var c=e.properties||{},b;if(e.iframe){b=document.id(e.iframe);}var d=c.onload||function(){};delete c.onload;c.id=c.name=[c.id,c.name,b?(b.id||b.name):"IFrame_"+String.uniqueID()].pick();
b=new Element(b||"iframe",c);var a=function(){d.call(b.contentWindow);};if(window.frames[c.id]){a();}else{b.addListener("load",a);}return b;});var Elements=this.Elements=function(a){if(a&&a.length){var e={},d;
for(var c=0;d=a[c++];){var b=Slick.uidOf(d);if(!e[b]){e[b]=true;this.push(d);}}}};Elements.prototype={length:0};Elements.parent=Array;new Type("Elements",Elements).implement({filter:function(a,b){if(!a){return this;
}return new Elements(Array.filter(this,(typeOf(a)=="string")?function(c){return c.match(a);}:a,b));}.protect(),push:function(){var d=this.length;for(var b=0,a=arguments.length;
b<a;b++){var c=document.id(arguments[b]);if(c){this[d++]=c;}}return(this.length=d);}.protect(),unshift:function(){var b=[];for(var c=0,a=arguments.length;
c<a;c++){var d=document.id(arguments[c]);if(d){b.push(d);}}return Array.prototype.unshift.apply(this,b);}.protect(),concat:function(){var b=new Elements(this);
for(var c=0,a=arguments.length;c<a;c++){var d=arguments[c];if(Type.isEnumerable(d)){b.append(d);}else{b.push(d);}}return b;}.protect(),append:function(c){for(var b=0,a=c.length;
b<a;b++){this.push(c[b]);}return this;}.protect(),empty:function(){while(this.length){delete this[--this.length];}return this;}.protect()});(function(){var g=Array.prototype.splice,b={"0":0,"1":1,length:2};
g.call(b,1,1);if(b[1]==1){Elements.implement("splice",function(){var e=this.length;g.apply(this,arguments);while(e>=this.length){delete this[e--];}return this;
}.protect());}Elements.implement(Array.prototype);Array.mirror(Elements);var f;try{var a=document.createElement("<input name=x>");f=(a.name=="x");}catch(c){}var d=function(e){return(""+e).replace(/&/g,"&amp;").replace(/"/g,"&quot;");
};Document.implement({newElement:function(e,h){if(h&&h.checked!=null){h.defaultChecked=h.checked;}if(f&&h){e="<"+e;if(h.name){e+=' name="'+d(h.name)+'"';
}if(h.type){e+=' type="'+d(h.type)+'"';}e+=">";delete h.name;delete h.type;}return this.id(this.createElement(e)).set(h);}});})();Document.implement({newTextNode:function(a){return this.createTextNode(a);
},getDocument:function(){return this;},getWindow:function(){return this.window;},id:(function(){var a={string:function(d,c,b){d=Slick.find(b,"#"+d.replace(/(\W)/g,"\\$1"));
return(d)?a.element(d,c):null;},element:function(b,c){$uid(b);if(!c&&!b.$family&&!(/^(?:object|embed)$/i).test(b.tagName)){Object.append(b,Element.Prototype);
}return b;},object:function(c,d,b){if(c.toElement){return a.element(c.toElement(b),d);}return null;}};a.textnode=a.whitespace=a.window=a.document=function(b){return b;
};return function(c,e,d){if(c&&c.$family&&c.uid){return c;}var b=typeOf(c);return(a[b])?a[b](c,e,d||document):null;};})()});if(window.$==null){Window.implement("$",function(a,b){return document.id(a,b,this.document);
});}Window.implement({getDocument:function(){return this.document;},getWindow:function(){return this;}});[Document,Element].invoke("implement",{getElements:function(a){return Slick.search(this,a,new Elements);
},getElement:function(a){return document.id(Slick.find(this,a));}});if(window.$$==null){Window.implement("$$",function(a){if(arguments.length==1){if(typeof a=="string"){return Slick.search(this.document,a,new Elements);
}else{if(Type.isEnumerable(a)){return new Elements(a);}}}return new Elements(arguments);});}(function(){var k={},i={};var n={input:"checked",option:"selected",textarea:"value"};
var e=function(p){return(i[p]||(i[p]={}));};var j=function(q){var p=q.uid;if(q.removeEvents){q.removeEvents();}if(q.clearAttributes){q.clearAttributes();
}if(p!=null){delete k[p];delete i[p];}return q;};var o=["defaultValue","accessKey","cellPadding","cellSpacing","colSpan","frameBorder","maxLength","readOnly","rowSpan","tabIndex","useMap"];
var d=["compact","nowrap","ismap","declare","noshade","checked","disabled","readOnly","multiple","selected","noresize","defer","defaultChecked"];var g={html:"innerHTML","class":"className","for":"htmlFor",text:(function(){var p=document.createElement("div");
return(p.textContent==null)?"innerText":"textContent";})()};var m=["type"];var h=["value","defaultValue"];var l=/^(?:href|src|usemap)$/i;d=d.associate(d);
o=o.associate(o.map(String.toLowerCase));m=m.associate(m);Object.append(g,h.associate(h));var c={before:function(q,p){var r=p.parentNode;if(r){r.insertBefore(q,p);
}},after:function(q,p){var r=p.parentNode;if(r){r.insertBefore(q,p.nextSibling);}},bottom:function(q,p){p.appendChild(q);},top:function(q,p){p.insertBefore(q,p.firstChild);
}};c.inside=c.bottom;var b=function(s,r){if(!s){return r;}s=Object.clone(Slick.parse(s));var q=s.expressions;for(var p=q.length;p--;){q[p][0].combinator=r;
}return s;};Element.implement({set:function(r,q){var p=Element.Properties[r];(p&&p.set)?p.set.call(this,q):this.setProperty(r,q);}.overloadSetter(),get:function(q){var p=Element.Properties[q];
return(p&&p.get)?p.get.apply(this):this.getProperty(q);}.overloadGetter(),erase:function(q){var p=Element.Properties[q];(p&&p.erase)?p.erase.apply(this):this.removeProperty(q);
return this;},setProperty:function(q,r){q=o[q]||q;if(r==null){return this.removeProperty(q);}var p=g[q];(p)?this[p]=r:(d[q])?this[q]=!!r:this.setAttribute(q,""+r);
return this;},setProperties:function(p){for(var q in p){this.setProperty(q,p[q]);}return this;},getProperty:function(q){q=o[q]||q;var p=g[q]||m[q];return(p)?this[p]:(d[q])?!!this[q]:(l.test(q)?this.getAttribute(q,2):(p=this.getAttributeNode(q))?p.nodeValue:null)||null;
},getProperties:function(){var p=Array.from(arguments);return p.map(this.getProperty,this).associate(p);},removeProperty:function(q){q=o[q]||q;var p=g[q];
(p)?this[p]="":(d[q])?this[q]=false:this.removeAttribute(q);return this;},removeProperties:function(){Array.each(arguments,this.removeProperty,this);return this;
},hasClass:function(p){return this.className.clean().contains(p," ");},addClass:function(p){if(!this.hasClass(p)){this.className=(this.className+" "+p).clean();
}return this;},removeClass:function(p){this.className=this.className.replace(new RegExp("(^|\\s)"+p+"(?:\\s|$)"),"$1");return this;},toggleClass:function(p,q){if(q==null){q=!this.hasClass(p);
}return(q)?this.addClass(p):this.removeClass(p);},adopt:function(){var s=this,p,u=Array.flatten(arguments),t=u.length;if(t>1){s=p=document.createDocumentFragment();
}for(var r=0;r<t;r++){var q=document.id(u[r],true);if(q){s.appendChild(q);}}if(p){this.appendChild(p);}return this;},appendText:function(q,p){return this.grab(this.getDocument().newTextNode(q),p);
},grab:function(q,p){c[p||"bottom"](document.id(q,true),this);return this;},inject:function(q,p){c[p||"bottom"](this,document.id(q,true));return this;},replaces:function(p){p=document.id(p,true);
p.parentNode.replaceChild(this,p);return this;},wraps:function(q,p){q=document.id(q,true);return this.replaces(q).grab(q,p);},getPrevious:function(p){return document.id(Slick.find(this,b(p,"!~")));
},getAllPrevious:function(p){return Slick.search(this,b(p,"!~"),new Elements);},getNext:function(p){return document.id(Slick.find(this,b(p,"~")));},getAllNext:function(p){return Slick.search(this,b(p,"~"),new Elements);
},getFirst:function(p){return document.id(Slick.search(this,b(p,">"))[0]);},getLast:function(p){return document.id(Slick.search(this,b(p,">")).getLast());
},getParent:function(p){return document.id(Slick.find(this,b(p,"!")));},getParents:function(p){return Slick.search(this,b(p,"!"),new Elements);},getSiblings:function(p){return Slick.search(this,b(p,"~~"),new Elements);
},getChildren:function(p){return Slick.search(this,b(p,">"),new Elements);},getWindow:function(){return this.ownerDocument.window;},getDocument:function(){return this.ownerDocument;
},getElementById:function(p){return document.id(Slick.find(this,"#"+(""+p).replace(/(\W)/g,"\\$1")));},getSelected:function(){this.selectedIndex;return new Elements(Array.from(this.options).filter(function(p){return p.selected;
}));},toQueryString:function(){var p=[];this.getElements("input, select, textarea").each(function(r){var q=r.type;if(!r.name||r.disabled||q=="submit"||q=="reset"||q=="file"||q=="image"){return;
}var s=(r.get("tag")=="select")?r.getSelected().map(function(t){return document.id(t).get("value");}):((q=="radio"||q=="checkbox")&&!r.checked)?null:r.get("value");
Array.from(s).each(function(t){if(typeof t!="undefined"){p.push(encodeURIComponent(r.name)+"="+encodeURIComponent(t));}});});return p.join("&");},destroy:function(){var p=j(this).getElementsByTagName("*");
Array.each(p,j);Element.dispose(this);return null;},empty:function(){Array.from(this.childNodes).each(Element.dispose);return this;},dispose:function(){return(this.parentNode)?this.parentNode.removeChild(this):this;
},match:function(p){return !p||Slick.match(this,p);}});var a=function(t,s,q){if(!q){t.setAttributeNode(document.createAttribute("id"));}if(t.clearAttributes){t.clearAttributes();
t.mergeAttributes(s);t.removeAttribute("uid");if(t.options){var u=t.options,p=s.options;for(var r=u.length;r--;){u[r].selected=p[r].selected;}}}var v=n[s.tagName.toLowerCase()];
if(v&&s[v]){t[v]=s[v];}};Element.implement("clone",function(r,p){r=r!==false;var w=this.cloneNode(r),q;if(r){var s=w.getElementsByTagName("*"),u=this.getElementsByTagName("*");
for(q=s.length;q--;){a(s[q],u[q],p);}}a(w,this,p);if(Browser.ie){var t=w.getElementsByTagName("object"),v=this.getElementsByTagName("object");for(q=t.length;
q--;){t[q].outerHTML=v[q].outerHTML;}}return document.id(w);});var f={contains:function(p){return Slick.contains(this,p);}};if(!document.contains){Document.implement(f);
}if(!document.createElement("div").contains){Element.implement(f);}[Element,Window,Document].invoke("implement",{addListener:function(s,r){if(s=="unload"){var p=r,q=this;
r=function(){q.removeListener("unload",r);p();};}else{k[$uid(this)]=this;}if(this.addEventListener){this.addEventListener(s,r,!!arguments[2]);}else{this.attachEvent("on"+s,r);
}return this;},removeListener:function(q,p){if(this.removeEventListener){this.removeEventListener(q,p,!!arguments[2]);}else{this.detachEvent("on"+q,p);
}return this;},retrieve:function(q,p){var s=e($uid(this)),r=s[q];if(p!=null&&r==null){r=s[q]=p;}return r!=null?r:null;},store:function(q,p){var r=e($uid(this));
r[q]=p;return this;},eliminate:function(p){var q=e($uid(this));delete q[p];return this;}});if(window.attachEvent&&!window.addEventListener){window.addListener("unload",function(){Object.each(k,j);
if(window.CollectGarbage){CollectGarbage();}});}})();Element.Properties={};Element.Properties.style={set:function(a){this.style.cssText=a;},get:function(){return this.style.cssText;
},erase:function(){this.style.cssText="";}};Element.Properties.tag={get:function(){return this.tagName.toLowerCase();}};(function(a){if(a!=null){Element.Properties.maxlength=Element.Properties.maxLength={get:function(){var b=this.getAttribute("maxLength");
return b==a?null:b;}};}})(document.createElement("input").getAttribute("maxLength"));Element.Properties.html=(function(){var c=Function.attempt(function(){var e=document.createElement("table");
e.innerHTML="<tr><td></td></tr>";});var d=document.createElement("div");var a={table:[1,"<table>","</table>"],select:[1,"<select>","</select>"],tbody:[2,"<table><tbody>","</tbody></table>"],tr:[3,"<table><tbody><tr>","</tr></tbody></table>"]};
a.thead=a.tfoot=a.tbody;var b={set:function(){var f=Array.flatten(arguments).join("");var g=(!c&&a[this.get("tag")]);if(g){var h=d;h.innerHTML=g[1]+f+g[2];
for(var e=g[0];e--;){h=h.firstChild;}this.empty().adopt(h.childNodes);}else{this.innerHTML=f;}}};b.erase=b.set;return b;})();(function(){var c=document.html;
Element.Properties.styles={set:function(f){this.setStyles(f);}};var e=(c.style.opacity!=null);var d=/alpha\(opacity=([\d.]+)\)/i;var b=function(g,f){if(!g.currentStyle||!g.currentStyle.hasLayout){g.style.zoom=1;
}if(e){g.style.opacity=f;}else{f=(f*100).limit(0,100).round();f=(f==100)?"":"alpha(opacity="+f+")";var h=g.style.filter||g.getComputedStyle("filter")||"";
g.style.filter=d.test(h)?h.replace(d,f):h+f;}};Element.Properties.opacity={set:function(g){var f=this.style.visibility;if(g==0&&f!="hidden"){this.style.visibility="hidden";
}else{if(g!=0&&f!="visible"){this.style.visibility="visible";}}b(this,g);},get:(e)?function(){var f=this.style.opacity||this.getComputedStyle("opacity");
return(f=="")?1:f;}:function(){var f,g=(this.style.filter||this.getComputedStyle("filter"));if(g){f=g.match(d);}return(f==null||g==null)?1:(f[1]/100);}};
var a=(c.style.cssFloat==null)?"styleFloat":"cssFloat";Element.implement({getComputedStyle:function(h){if(this.currentStyle){return this.currentStyle[h.camelCase()];
}var g=Element.getDocument(this).defaultView,f=g?g.getComputedStyle(this,null):null;return(f)?f.getPropertyValue((h==a)?"float":h.hyphenate()):null;},setOpacity:function(f){b(this,f);
return this;},getOpacity:function(){return this.get("opacity");},setStyle:function(g,f){switch(g){case"opacity":return this.set("opacity",parseFloat(f));
case"float":g=a;}g=g.camelCase();if(typeOf(f)!="string"){var h=(Element.Styles[g]||"@").split(" ");f=Array.from(f).map(function(k,j){if(!h[j]){return"";
}return(typeOf(k)=="number")?h[j].replace("@",Math.round(k)):k;}).join(" ");}else{if(f==String(Number(f))){f=Math.round(f);}}this.style[g]=f;return this;
},getStyle:function(l){switch(l){case"opacity":return this.get("opacity");case"float":l=a;}l=l.camelCase();var f=this.style[l];if(!f||l=="zIndex"){f=[];
for(var k in Element.ShortStyles){if(l!=k){continue;}for(var j in Element.ShortStyles[k]){f.push(this.getStyle(j));}return f.join(" ");}f=this.getComputedStyle(l);
}if(f){f=String(f);var h=f.match(/rgba?\([\d\s,]+\)/);if(h){f=f.replace(h[0],h[0].rgbToHex());}}if(Browser.opera||(Browser.ie&&isNaN(parseFloat(f)))){if((/^(height|width)$/).test(l)){var g=(l=="width")?["left","right"]:["top","bottom"],i=0;
g.each(function(m){i+=this.getStyle("border-"+m+"-width").toInt()+this.getStyle("padding-"+m).toInt();},this);return this["offset"+l.capitalize()]-i+"px";
}if(Browser.opera&&String(f).indexOf("px")!=-1){return f;}if((/^border(.+)Width|margin|padding/).test(l)){return"0px";}}return f;},setStyles:function(g){for(var f in g){this.setStyle(f,g[f]);
}return this;},getStyles:function(){var f={};Array.flatten(arguments).each(function(g){f[g]=this.getStyle(g);},this);return f;}});Element.Styles={left:"@px",top:"@px",bottom:"@px",right:"@px",width:"@px",height:"@px",maxWidth:"@px",maxHeight:"@px",minWidth:"@px",minHeight:"@px",backgroundColor:"rgb(@, @, @)",backgroundPosition:"@px @px",color:"rgb(@, @, @)",fontSize:"@px",letterSpacing:"@px",lineHeight:"@px",clip:"rect(@px @px @px @px)",margin:"@px @px @px @px",padding:"@px @px @px @px",border:"@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)",borderWidth:"@px @px @px @px",borderStyle:"@ @ @ @",borderColor:"rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)",zIndex:"@",zoom:"@",fontWeight:"@",textIndent:"@px",opacity:"@"};
Element.ShortStyles={margin:{},padding:{},border:{},borderWidth:{},borderStyle:{},borderColor:{}};["Top","Right","Bottom","Left"].each(function(l){var k=Element.ShortStyles;
var g=Element.Styles;["margin","padding"].each(function(m){var n=m+l;k[m][n]=g[n]="@px";});var j="border"+l;k.border[j]=g[j]="@px @ rgb(@, @, @)";var i=j+"Width",f=j+"Style",h=j+"Color";
k[j]={};k.borderWidth[i]=k[j][i]=g[i]="@px";k.borderStyle[f]=k[j][f]=g[f]="@";k.borderColor[h]=k[j][h]=g[h]="rgb(@, @, @)";});})();(function(){var h=document.createElement("div"),e=document.createElement("div");
h.style.height="0";h.appendChild(e);var d=(e.offsetParent===h);h=e=null;var l=function(m){return k(m,"position")!="static"||a(m);};var i=function(m){return l(m)||(/^(?:table|td|th)$/i).test(m.tagName);
};Element.implement({scrollTo:function(m,n){if(a(this)){this.getWindow().scrollTo(m,n);}else{this.scrollLeft=m;this.scrollTop=n;}return this;},getSize:function(){if(a(this)){return this.getWindow().getSize();
}return{x:this.offsetWidth,y:this.offsetHeight};},getScrollSize:function(){if(a(this)){return this.getWindow().getScrollSize();}return{x:this.scrollWidth,y:this.scrollHeight};
},getScroll:function(){if(a(this)){return this.getWindow().getScroll();}return{x:this.scrollLeft,y:this.scrollTop};},getScrolls:function(){var n=this.parentNode,m={x:0,y:0};
while(n&&!a(n)){m.x+=n.scrollLeft;m.y+=n.scrollTop;n=n.parentNode;}return m;},getOffsetParent:d?function(){var m=this;if(a(m)||k(m,"position")=="fixed"){return null;
}var n=(k(m,"position")=="static")?i:l;while((m=m.parentNode)){if(n(m)){return m;}}return null;}:function(){var m=this;if(a(m)||k(m,"position")=="fixed"){return null;
}try{return m.offsetParent;}catch(n){}return null;},getOffsets:function(){if(this.getBoundingClientRect&&!Browser.Platform.ios){var r=this.getBoundingClientRect(),o=document.id(this.getDocument().documentElement),q=o.getScroll(),t=this.getScrolls(),s=(k(this,"position")=="fixed");
return{x:r.left.toInt()+t.x+((s)?0:q.x)-o.clientLeft,y:r.top.toInt()+t.y+((s)?0:q.y)-o.clientTop};}var n=this,m={x:0,y:0};if(a(this)){return m;}while(n&&!a(n)){m.x+=n.offsetLeft;
m.y+=n.offsetTop;if(Browser.firefox){if(!c(n)){m.x+=b(n);m.y+=g(n);}var p=n.parentNode;if(p&&k(p,"overflow")!="visible"){m.x+=b(p);m.y+=g(p);}}else{if(n!=this&&Browser.safari){m.x+=b(n);
m.y+=g(n);}}n=n.offsetParent;}if(Browser.firefox&&!c(this)){m.x-=b(this);m.y-=g(this);}return m;},getPosition:function(p){if(a(this)){return{x:0,y:0};}var q=this.getOffsets(),n=this.getScrolls();
var m={x:q.x-n.x,y:q.y-n.y};if(p&&(p=document.id(p))){var o=p.getPosition();return{x:m.x-o.x-b(p),y:m.y-o.y-g(p)};}return m;},getCoordinates:function(o){if(a(this)){return this.getWindow().getCoordinates();
}var m=this.getPosition(o),n=this.getSize();var p={left:m.x,top:m.y,width:n.x,height:n.y};p.right=p.left+p.width;p.bottom=p.top+p.height;return p;},computePosition:function(m){return{left:m.x-j(this,"margin-left"),top:m.y-j(this,"margin-top")};
},setPosition:function(m){return this.setStyles(this.computePosition(m));}});[Document,Window].invoke("implement",{getSize:function(){var m=f(this);return{x:m.clientWidth,y:m.clientHeight};
},getScroll:function(){var n=this.getWindow(),m=f(this);return{x:n.pageXOffset||m.scrollLeft,y:n.pageYOffset||m.scrollTop};},getScrollSize:function(){var o=f(this),n=this.getSize(),m=this.getDocument().body;
return{x:Math.max(o.scrollWidth,m.scrollWidth,n.x),y:Math.max(o.scrollHeight,m.scrollHeight,n.y)};},getPosition:function(){return{x:0,y:0};},getCoordinates:function(){var m=this.getSize();
return{top:0,left:0,bottom:m.y,right:m.x,height:m.y,width:m.x};}});var k=Element.getComputedStyle;function j(m,n){return k(m,n).toInt()||0;}function c(m){return k(m,"-moz-box-sizing")=="border-box";
}function g(m){return j(m,"border-top-width");}function b(m){return j(m,"border-left-width");}function a(m){return(/^(?:body|html)$/i).test(m.tagName);
}function f(m){var n=m.getDocument();return(!n.compatMode||n.compatMode=="CSS1Compat")?n.html:n.body;}})();Element.alias({position:"setPosition"});[Window,Document,Element].invoke("implement",{getHeight:function(){return this.getSize().y;
},getWidth:function(){return this.getSize().x;},getScrollTop:function(){return this.getScroll().y;},getScrollLeft:function(){return this.getScroll().x;
},getScrollHeight:function(){return this.getScrollSize().y;},getScrollWidth:function(){return this.getScrollSize().x;},getTop:function(){return this.getPosition().y;
},getLeft:function(){return this.getPosition().x;}});(function(){var a=this.Class=new Type("Class",function(h){if(instanceOf(h,Function)){h={initialize:h};
}var g=function(){e(this);if(g.$prototyping){return this;}this.$caller=null;var i=(this.initialize)?this.initialize.apply(this,arguments):this;this.$caller=this.caller=null;
return i;}.extend(this).implement(h);g.$constructor=a;g.prototype.$constructor=g;g.prototype.parent=c;return g;});var c=function(){if(!this.$caller){throw new Error('The method "parent" cannot be called.');
}var g=this.$caller.$name,h=this.$caller.$owner.parent,i=(h)?h.prototype[g]:null;if(!i){throw new Error('The method "'+g+'" has no parent.');}return i.apply(this,arguments);
};var e=function(g){for(var h in g){var j=g[h];switch(typeOf(j)){case"object":var i=function(){};i.prototype=j;g[h]=e(new i);break;case"array":g[h]=j.clone();
break;}}return g;};var b=function(g,h,j){if(j.$origin){j=j.$origin;}var i=function(){if(j.$protected&&this.$caller==null){throw new Error('The method "'+h+'" cannot be called.');
}var l=this.caller,m=this.$caller;this.caller=m;this.$caller=i;var k=j.apply(this,arguments);this.$caller=m;this.caller=l;return k;}.extend({$owner:g,$origin:j,$name:h});
return i;};var f=function(h,i,g){if(a.Mutators.hasOwnProperty(h)){i=a.Mutators[h].call(this,i);if(i==null){return this;}}if(typeOf(i)=="function"){if(i.$hidden){return this;
}this.prototype[h]=(g)?i:b(this,h,i);}else{Object.merge(this.prototype,h,i);}return this;};var d=function(g){g.$prototyping=true;var h=new g;delete g.$prototyping;
return h;};a.implement("implement",f.overloadSetter());a.Mutators={Extends:function(g){this.parent=g;this.prototype=d(g);},Implements:function(g){Array.from(g).each(function(j){var h=new j;
for(var i in h){f.call(this,i,h[i],true);}},this);}};})();(function(){this.Chain=new Class({$chain:[],chain:function(){this.$chain.append(Array.flatten(arguments));
return this;},callChain:function(){return(this.$chain.length)?this.$chain.shift().apply(this,arguments):false;},clearChain:function(){this.$chain.empty();
return this;}});var a=function(b){return b.replace(/^on([A-Z])/,function(c,d){return d.toLowerCase();});};this.Events=new Class({$events:{},addEvent:function(d,c,b){d=a(d);
this.$events[d]=(this.$events[d]||[]).include(c);if(b){c.internal=true;}return this;},addEvents:function(b){for(var c in b){this.addEvent(c,b[c]);}return this;
},fireEvent:function(e,c,b){e=a(e);var d=this.$events[e];if(!d){return this;}c=Array.from(c);d.each(function(f){if(b){f.delay(b,this,c);}else{f.apply(this,c);
}},this);return this;},removeEvent:function(e,d){e=a(e);var c=this.$events[e];if(c&&!d.internal){var b=c.indexOf(d);if(b!=-1){delete c[b];}}return this;
},removeEvents:function(d){var e;if(typeOf(d)=="object"){for(e in d){this.removeEvent(e,d[e]);}return this;}if(d){d=a(d);}for(e in this.$events){if(d&&d!=e){continue;
}var c=this.$events[e];for(var b=c.length;b--;){if(b in c){this.removeEvent(e,c[b]);}}}return this;}});this.Options=new Class({setOptions:function(){var b=this.options=Object.merge.apply(null,[{},this.options].append(arguments));
if(this.addEvent){for(var c in b){if(typeOf(b[c])!="function"||!(/^on[A-Z]/).test(c)){continue;}this.addEvent(c,b[c]);delete b[c];}}return this;}});})();
(function(){var f=this.Fx=new Class({Implements:[Chain,Events,Options],options:{fps:60,unit:false,duration:500,frames:null,frameSkip:true,link:"ignore"},initialize:function(g){this.subject=this.subject||this;
this.setOptions(g);},getTransition:function(){return function(g){return -(Math.cos(Math.PI*g)-1)/2;};},step:function(g){if(this.options.frameSkip){var h=(this.time!=null)?(g-this.time):0,i=h/this.frameInterval;
this.time=g;this.frame+=i;}else{this.frame++;}if(this.frame<this.frames){var j=this.transition(this.frame/this.frames);this.set(this.compute(this.from,this.to,j));
}else{this.frame=this.frames;this.set(this.compute(this.from,this.to,1));this.stop();}},set:function(g){return g;},compute:function(i,h,g){return f.compute(i,h,g);
},check:function(){if(!this.isRunning()){return true;}switch(this.options.link){case"cancel":this.cancel();return true;case"chain":this.chain(this.caller.pass(arguments,this));
return false;}return false;},start:function(k,j){if(!this.check(k,j)){return this;}this.from=k;this.to=j;this.frame=(this.options.frameSkip)?0:-1;this.time=null;
this.transition=this.getTransition();var i=this.options.frames,h=this.options.fps,g=this.options.duration;this.duration=f.Durations[g]||g.toInt();this.frameInterval=1000/h;
this.frames=i||Math.round(this.duration/this.frameInterval);this.fireEvent("start",this.subject);b.call(this,h);return this;},stop:function(){if(this.isRunning()){this.time=null;
d.call(this,this.options.fps);if(this.frames==this.frame){this.fireEvent("complete",this.subject);if(!this.callChain()){this.fireEvent("chainComplete",this.subject);
}}else{this.fireEvent("stop",this.subject);}}return this;},cancel:function(){if(this.isRunning()){this.time=null;d.call(this,this.options.fps);this.frame=this.frames;
this.fireEvent("cancel",this.subject).clearChain();}return this;},pause:function(){if(this.isRunning()){this.time=null;d.call(this,this.options.fps);}return this;
},resume:function(){if((this.frame<this.frames)&&!this.isRunning()){b.call(this,this.options.fps);}return this;},isRunning:function(){var g=e[this.options.fps];
return g&&g.contains(this);}});f.compute=function(i,h,g){return(h-i)*g+i;};f.Durations={"short":250,normal:500,"long":1000};var e={},c={};var a=function(){var h=Date.now();
for(var j=this.length;j--;){var g=this[j];if(g){g.step(h);}}};var b=function(h){var g=e[h]||(e[h]=[]);g.push(this);if(!c[h]){c[h]=a.periodical(Math.round(1000/h),g);
}};var d=function(h){var g=e[h];if(g){g.erase(this);if(!g.length&&c[h]){delete e[h];c[h]=clearInterval(c[h]);}}};})();Fx.CSS=new Class({Extends:Fx,prepare:function(c,d,b){b=Array.from(b);
if(b[1]==null){b[1]=b[0];b[0]=c.getStyle(d);}var a=b.map(this.parse);return{from:a[0],to:a[1]};},parse:function(a){a=Function.from(a)();a=(typeof a=="string")?a.split(" "):Array.from(a);
return a.map(function(c){c=String(c);var b=false;Object.each(Fx.CSS.Parsers,function(f,e){if(b){return;}var d=f.parse(c);if(d||d===0){b={value:d,parser:f};
}});b=b||{value:c,parser:Fx.CSS.Parsers.String};return b;});},compute:function(d,c,b){var a=[];(Math.min(d.length,c.length)).times(function(e){a.push({value:d[e].parser.compute(d[e].value,c[e].value,b),parser:d[e].parser});
});a.$family=Function.from("fx:css:value");return a;},serve:function(c,b){if(typeOf(c)!="fx:css:value"){c=this.parse(c);}var a=[];c.each(function(d){a=a.concat(d.parser.serve(d.value,b));
});return a;},render:function(a,d,c,b){a.setStyle(d,this.serve(c,b));},search:function(a){if(Fx.CSS.Cache[a]){return Fx.CSS.Cache[a];}var c={},b=new RegExp("^"+a.escapeRegExp()+"$");
Array.each(document.styleSheets,function(f,e){var d=f.href;if(d&&d.contains("://")&&!d.contains(document.domain)){return;}var g=f.rules||f.cssRules;Array.each(g,function(k,h){if(!k.style){return;
}var j=(k.selectorText)?k.selectorText.replace(/^\w+/,function(i){return i.toLowerCase();}):null;if(!j||!b.test(j)){return;}Object.each(Element.Styles,function(l,i){if(!k.style[i]||Element.ShortStyles[i]){return;
}l=String(k.style[i]);c[i]=((/^rgb/).test(l))?l.rgbToHex():l;});});});return Fx.CSS.Cache[a]=c;}});Fx.CSS.Cache={};Fx.CSS.Parsers={Color:{parse:function(a){if(a.match(/^#[0-9a-f]{3,6}$/i)){return a.hexToRgb(true);
}return((a=a.match(/(\d+),\s*(\d+),\s*(\d+)/)))?[a[1],a[2],a[3]]:false;},compute:function(c,b,a){return c.map(function(e,d){return Math.round(Fx.compute(c[d],b[d],a));
});},serve:function(a){return a.map(Number);}},Number:{parse:parseFloat,compute:Fx.compute,serve:function(b,a){return(a)?b+a:b;}},String:{parse:Function.from(false),compute:function(b,a){return a;
},serve:function(a){return a;}}};Fx.Morph=new Class({Extends:Fx.CSS,initialize:function(b,a){this.element=this.subject=document.id(b);this.parent(a);},set:function(a){if(typeof a=="string"){a=this.search(a);
}for(var b in a){this.render(this.element,b,a[b],this.options.unit);}return this;},compute:function(e,d,c){var a={};for(var b in e){a[b]=this.parent(e[b],d[b],c);
}return a;},start:function(b){if(!this.check(b)){return this;}if(typeof b=="string"){b=this.search(b);}var e={},d={};for(var c in b){var a=this.prepare(this.element,c,b[c]);
e[c]=a.from;d[c]=a.to;}return this.parent(e,d);}});Element.Properties.morph={set:function(a){this.get("morph").cancel().setOptions(a);return this;},get:function(){var a=this.retrieve("morph");
if(!a){a=new Fx.Morph(this,{link:"cancel"});this.store("morph",a);}return a;}};Element.implement({morph:function(a){this.get("morph").start(a);return this;
}});(function(){var a=Object.prototype.hasOwnProperty;Object.extend({subset:function(d,g){var f={};for(var e=0,b=g.length;e<b;e++){var c=g[e];if(c in d){f[c]=d[c];
}}return f;},map:function(b,e,f){var d={};for(var c in b){if(a.call(b,c)){d[c]=e.call(f,b[c],c,b);}}return d;},filter:function(b,e,g){var d={};for(var c in b){var f=b[c];
if(a.call(b,c)&&e.call(g,f,c,b)){d[c]=f;}}return d;},every:function(b,d,e){for(var c in b){if(a.call(b,c)&&!d.call(e,b[c],c)){return false;}}return true;
},some:function(b,d,e){for(var c in b){if(a.call(b,c)&&d.call(e,b[c],c)){return true;}}return false;},keys:function(b){var d=[];for(var c in b){if(a.call(b,c)){d.push(c);
}}return d;},values:function(c){var b=[];for(var d in c){if(a.call(c,d)){b.push(c[d]);}}return b;},getLength:function(b){return Object.keys(b).length;},keyOf:function(b,d){for(var c in b){if(a.call(b,c)&&b[c]===d){return c;
}}return null;},contains:function(b,c){return Object.keyOf(b,c)!=null;},toQueryString:function(b,c){var d=[];Object.each(b,function(h,g){if(c){g=c+"["+g+"]";
}var f;switch(typeOf(h)){case"object":f=Object.toQueryString(h,g);break;case"array":var e={};h.each(function(k,j){e[j]=k;});f=Object.toQueryString(e,g);
break;default:f=g+"="+encodeURIComponent(h);}if(h!=null){d.push(f);}});return d.join("&");}});})();(function(){var d=function(){},a=("onprogress" in new Browser.Request);
var c=this.Request=new Class({Implements:[Chain,Events,Options],options:{url:"",data:"",headers:{"X-Requested-With":"XMLHttpRequest",Accept:"text/javascript, text/html, application/xml, text/xml, */*"},async:true,format:false,method:"post",link:"ignore",isSuccess:null,emulation:true,urlEncoded:true,encoding:"utf-8",evalScripts:false,evalResponse:false,timeout:0,noCache:false},initialize:function(e){this.xhr=new Browser.Request();
this.setOptions(e);this.headers=this.options.headers;},onStateChange:function(){var e=this.xhr;if(e.readyState!=4||!this.running){return;}this.running=false;
this.status=0;Function.attempt(function(){var f=e.status;this.status=(f==1223)?204:f;}.bind(this));e.onreadystatechange=d;if(a){e.onprogress=e.onloadstart=d;
}clearTimeout(this.timer);this.response={text:this.xhr.responseText||"",xml:this.xhr.responseXML};if(this.options.isSuccess.call(this,this.status)){this.success(this.response.text,this.response.xml);
}else{this.failure();}},isSuccess:function(){var e=this.status;return(e>=200&&e<300);},isRunning:function(){return !!this.running;},processScripts:function(e){if(this.options.evalResponse||(/(ecma|java)script/).test(this.getHeader("Content-type"))){return Browser.exec(e);
}return e.stripScripts(this.options.evalScripts);},success:function(f,e){this.onSuccess(this.processScripts(f),e);},onSuccess:function(){this.fireEvent("complete",arguments).fireEvent("success",arguments).callChain();
},failure:function(){this.onFailure();},onFailure:function(){this.fireEvent("complete").fireEvent("failure",this.xhr);},loadstart:function(e){this.fireEvent("loadstart",[e,this.xhr]);
},progress:function(e){this.fireEvent("progress",[e,this.xhr]);},timeout:function(){this.fireEvent("timeout",this.xhr);},setHeader:function(e,f){this.headers[e]=f;
return this;},getHeader:function(e){return Function.attempt(function(){return this.xhr.getResponseHeader(e);}.bind(this));},check:function(){if(!this.running){return true;
}switch(this.options.link){case"cancel":this.cancel();return true;case"chain":this.chain(this.caller.pass(arguments,this));return false;}return false;},send:function(o){if(!this.check(o)){return this;
}this.options.isSuccess=this.options.isSuccess||this.isSuccess;this.running=true;var l=typeOf(o);if(l=="string"||l=="element"){o={data:o};}var h=this.options;
o=Object.append({data:h.data,url:h.url,method:h.method},o);var j=o.data,f=String(o.url),e=o.method.toLowerCase();switch(typeOf(j)){case"element":j=document.id(j).toQueryString();
break;case"object":case"hash":j=Object.toQueryString(j);}if(this.options.format){var m="format="+this.options.format;j=(j)?m+"&"+j:m;}if(this.options.emulation&&!["get","post"].contains(e)){var k="_method="+e;
j=(j)?k+"&"+j:k;e="post";}if(this.options.urlEncoded&&["post","put"].contains(e)){var g=(this.options.encoding)?"; charset="+this.options.encoding:"";this.headers["Content-type"]="application/x-www-form-urlencoded"+g;
}if(!f){f=document.location.pathname;}var i=f.lastIndexOf("/");if(i>-1&&(i=f.indexOf("#"))>-1){f=f.substr(0,i);}if(this.options.noCache){f+=(f.contains("?")?"&":"?")+String.uniqueID();
}if(j&&e=="get"){f+=(f.contains("?")?"&":"?")+j;j=null;}var n=this.xhr;if(a){n.onloadstart=this.loadstart.bind(this);n.onprogress=this.progress.bind(this);
}n.open(e.toUpperCase(),f,this.options.async,this.options.user,this.options.password);if(this.options.user&&"withCredentials" in n){n.withCredentials=true;
}n.onreadystatechange=this.onStateChange.bind(this);Object.each(this.headers,function(q,p){try{n.setRequestHeader(p,q);}catch(r){this.fireEvent("exception",[p,q]);
}},this);this.fireEvent("request");n.send(j);if(!this.options.async){this.onStateChange();}if(this.options.timeout){this.timer=this.timeout.delay(this.options.timeout,this);
}return this;},cancel:function(){if(!this.running){return this;}this.running=false;var e=this.xhr;e.abort();clearTimeout(this.timer);e.onreadystatechange=d;
if(a){e.onprogress=e.onloadstart=d;}this.xhr=new Browser.Request();this.fireEvent("cancel");return this;}});var b={};["get","post","put","delete","GET","POST","PUT","DELETE"].each(function(e){b[e]=function(g){var f={method:e};
if(g!=null){f.data=g;}return this.send(f);};});c.implement(b);Element.Properties.send={set:function(e){var f=this.get("send").cancel();f.setOptions(e);
return this;},get:function(){var e=this.retrieve("send");if(!e){e=new c({data:this,link:"cancel",method:this.get("method")||"post",url:this.get("action")});
this.store("send",e);}return e;}};Element.implement({send:function(e){var f=this.get("send");f.send({data:this,url:e||f.options.url});return this;}});})();
Request.HTML=new Class({Extends:Request,options:{update:false,append:false,evalScripts:true,filter:false,headers:{Accept:"text/html, application/xml, text/xml, */*"}},success:function(e){var d=this.options,b=this.response;
b.html=e.stripScripts(function(f){b.javascript=f;});var c=b.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);if(c){b.html=c[1];}var a=new Element("div").set("html",b.html);
b.tree=a.childNodes;b.elements=a.getElements("*");if(d.filter){b.tree=b.elements.filter(d.filter);}if(d.update){document.id(d.update).empty().set("html",b.html);
}else{if(d.append){document.id(d.append).adopt(a.getChildren());}}if(d.evalScripts){Browser.exec(b.javascript);}this.onSuccess(b.tree,b.elements,b.html,b.javascript);
}});Element.Properties.load={set:function(a){var b=this.get("load").cancel();b.setOptions(a);return this;},get:function(){var a=this.retrieve("load");if(!a){a=new Request.HTML({data:this,link:"cancel",update:this,method:"get"});
this.store("load",a);}return a;}};Element.implement({load:function(){this.get("load").send(Array.link(arguments,{data:Type.isObject,url:Type.isString}));
return this;}});if(typeof JSON=="undefined"){this.JSON={};}(function(){var special={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};
var escape=function(chr){return special[chr]||"\\u"+("0000"+chr.charCodeAt(0).toString(16)).slice(-4);};JSON.validate=function(string){string=string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"");
return(/^[\],:{}\s]*$/).test(string);};JSON.encode=JSON.stringify?function(obj){return JSON.stringify(obj);}:function(obj){if(obj&&obj.toJSON){obj=obj.toJSON();
}switch(typeOf(obj)){case"string":return'"'+obj.replace(/[\x00-\x1f\\"]/g,escape)+'"';case"array":return"["+obj.map(JSON.encode).clean()+"]";case"object":case"hash":var string=[];
Object.each(obj,function(value,key){var json=JSON.encode(value);if(json){string.push(JSON.encode(key)+":"+json);}});return"{"+string+"}";case"number":case"boolean":return""+obj;
case"null":return"null";}return null;};JSON.decode=function(string,secure){if(!string||typeOf(string)!="string"){return null;}if(secure||JSON.secure){if(JSON.parse){return JSON.parse(string);
}if(!JSON.validate(string)){throw new Error("JSON could not decode the input; security is enabled and the value is not secure.");}}return eval("("+string+")");
};})();Request.JSON=new Class({Extends:Request,options:{secure:true},initialize:function(a){this.parent(a);Object.append(this.headers,{Accept:"application/json","X-Request":"JSON"});
},success:function(c){var b;try{b=this.response.json=JSON.decode(c,this.options.secure);}catch(a){this.fireEvent("error",[c,a]);return;}if(b==null){this.onFailure();
}else{this.onSuccess(b,c);}}});var Event=new Type("Event",function(a,i){if(!i){i=window;}var o=i.document;a=a||i.event;if(a.$extended){return a;}this.$extended=true;
var n=a.type,k=a.target||a.srcElement,m={},c={},q=null,h,l,b,p;while(k&&k.nodeType==3){k=k.parentNode;}if(n.indexOf("key")!=-1){b=a.which||a.keyCode;p=Object.keyOf(Event.Keys,b);
if(n=="keydown"){var d=b-111;if(d>0&&d<13){p="f"+d;}}if(!p){p=String.fromCharCode(b).toLowerCase();}}else{if((/click|mouse|menu/i).test(n)){o=(!o.compatMode||o.compatMode=="CSS1Compat")?o.html:o.body;
m={x:(a.pageX!=null)?a.pageX:a.clientX+o.scrollLeft,y:(a.pageY!=null)?a.pageY:a.clientY+o.scrollTop};c={x:(a.pageX!=null)?a.pageX-i.pageXOffset:a.clientX,y:(a.pageY!=null)?a.pageY-i.pageYOffset:a.clientY};
if((/DOMMouseScroll|mousewheel/).test(n)){l=(a.wheelDelta)?a.wheelDelta/120:-(a.detail||0)/3;}h=(a.which==3)||(a.button==2);if((/over|out/).test(n)){q=a.relatedTarget||a[(n=="mouseover"?"from":"to")+"Element"];
var j=function(){while(q&&q.nodeType==3){q=q.parentNode;}return true;};var g=(Browser.firefox2)?j.attempt():j();q=(g)?q:null;}}else{if((/gesture|touch/i).test(n)){this.rotation=a.rotation;
this.scale=a.scale;this.targetTouches=a.targetTouches;this.changedTouches=a.changedTouches;var f=this.touches=a.touches;if(f&&f[0]){var e=f[0];m={x:e.pageX,y:e.pageY};
c={x:e.clientX,y:e.clientY};}}}}return Object.append(this,{event:a,type:n,page:m,client:c,rightClick:h,wheel:l,relatedTarget:document.id(q),target:document.id(k),code:b,key:p,shift:a.shiftKey,control:a.ctrlKey,alt:a.altKey,meta:a.metaKey});
});Event.Keys={enter:13,up:38,down:40,left:37,right:39,esc:27,space:32,backspace:8,tab:9,"delete":46};Event.implement({stop:function(){return this.stopPropagation().preventDefault();
},stopPropagation:function(){if(this.event.stopPropagation){this.event.stopPropagation();}else{this.event.cancelBubble=true;}return this;},preventDefault:function(){if(this.event.preventDefault){this.event.preventDefault();
}else{this.event.returnValue=false;}return this;}});(function(){Element.Properties.events={set:function(b){this.addEvents(b);}};[Element,Window,Document].invoke("implement",{addEvent:function(f,h){var i=this.retrieve("events",{});
if(!i[f]){i[f]={keys:[],values:[]};}if(i[f].keys.contains(h)){return this;}i[f].keys.push(h);var g=f,b=Element.Events[f],d=h,j=this;if(b){if(b.onAdd){b.onAdd.call(this,h);
}if(b.condition){d=function(k){if(b.condition.call(this,k)){return h.call(this,k);}return true;};}g=b.base||g;}var e=function(){return h.call(j);};var c=Element.NativeEvents[g];
if(c){if(c==2){e=function(k){k=new Event(k,j.getWindow());if(d.call(j,k)===false){k.stop();}};}this.addListener(g,e,arguments[2]);}i[f].values.push(e);
return this;},removeEvent:function(e,d){var c=this.retrieve("events");if(!c||!c[e]){return this;}var h=c[e];var b=h.keys.indexOf(d);if(b==-1){return this;
}var g=h.values[b];delete h.keys[b];delete h.values[b];var f=Element.Events[e];if(f){if(f.onRemove){f.onRemove.call(this,d);}e=f.base||e;}return(Element.NativeEvents[e])?this.removeListener(e,g,arguments[2]):this;
},addEvents:function(b){for(var c in b){this.addEvent(c,b[c]);}return this;},removeEvents:function(b){var d;if(typeOf(b)=="object"){for(d in b){this.removeEvent(d,b[d]);
}return this;}var c=this.retrieve("events");if(!c){return this;}if(!b){for(d in c){this.removeEvents(d);}this.eliminate("events");}else{if(c[b]){c[b].keys.each(function(e){this.removeEvent(b,e);
},this);delete c[b];}}return this;},fireEvent:function(e,c,b){var d=this.retrieve("events");if(!d||!d[e]){return this;}c=Array.from(c);d[e].keys.each(function(f){if(b){f.delay(b,this,c);
}else{f.apply(this,c);}},this);return this;},cloneEvents:function(e,d){e=document.id(e);var c=e.retrieve("events");if(!c){return this;}if(!d){for(var b in c){this.cloneEvents(e,b);
}}else{if(c[d]){c[d].keys.each(function(f){this.addEvent(d,f);},this);}}return this;}});Element.NativeEvents={click:2,dblclick:2,mouseup:2,mousedown:2,contextmenu:2,mousewheel:2,DOMMouseScroll:2,mouseover:2,mouseout:2,mousemove:2,selectstart:2,selectend:2,keydown:2,keypress:2,keyup:2,orientationchange:2,touchstart:2,touchmove:2,touchend:2,touchcancel:2,gesturestart:2,gesturechange:2,gestureend:2,focus:2,blur:2,change:2,reset:2,select:2,submit:2,load:2,unload:1,beforeunload:2,resize:1,move:1,DOMContentLoaded:1,readystatechange:1,error:1,abort:1,scroll:1};
var a=function(b){var c=b.relatedTarget;if(c==null){return true;}if(!c){return false;}return(c!=this&&c.prefix!="xul"&&typeOf(this)!="document"&&!this.contains(c));
};Element.Events={mouseenter:{base:"mouseover",condition:a},mouseleave:{base:"mouseout",condition:a},mousewheel:{base:(Browser.firefox)?"DOMMouseScroll":"mousewheel"}};
})();(function(i,k){var l,f,e=[],c,b,d=k.createElement("div");var g=function(){clearTimeout(b);if(l){return;}Browser.loaded=l=true;k.removeListener("DOMContentLoaded",g).removeListener("readystatechange",a);
k.fireEvent("domready");i.fireEvent("domready");};var a=function(){for(var m=e.length;m--;){if(e[m]()){g();return true;}}return false;};var j=function(){clearTimeout(b);
if(!a()){b=setTimeout(j,10);}};k.addListener("DOMContentLoaded",g);var h=function(){try{d.doScroll();return true;}catch(m){}return false;};if(d.doScroll&&!h()){e.push(h);
c=true;}if(k.readyState){e.push(function(){var m=k.readyState;return(m=="loaded"||m=="complete");});}if("onreadystatechange" in k){k.addListener("readystatechange",a);
}else{c=true;}if(c){j();}Element.Events.domready={onAdd:function(m){if(l){m.call(this);}}};Element.Events.load={base:"load",onAdd:function(m){if(f&&this==i){m.call(this);
}},condition:function(){if(this==i){g();delete Element.Events.load;}return true;}};i.addEvent("load",function(){f=true;});})(window,document);
// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/23ca8d64a19dbba69317d20567126680 
// Or build this file again with packager using: packager build More/Element.Delegation More/Element.Measure More/Drag
/*
---
copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
MooTools.More={version:"1.3.2.1",build:"e586bcd2496e9b22acfde32e12f84d49ce09e59d"};Events.Pseudos=function(g,c,e){var b="monitorEvents:";var a=function(h){return{store:h.store?function(i,j){h.store(b+i,j);
}:function(i,j){(h.$monitorEvents||(h.$monitorEvents={}))[i]=j;},retrieve:h.retrieve?function(i,j){return h.retrieve(b+i,j);}:function(i,j){if(!h.$monitorEvents){return j;
}return h.$monitorEvents[i]||j;}};};var f=function(j){if(j.indexOf(":")==-1||!g){return null;}var i=Slick.parse(j).expressions[0][0],m=i.pseudos,h=m.length,k=[];
while(h--){if(g[m[h].key]){k.push({event:i.tag,value:m[h].value,pseudo:m[h].key,original:j});}}return k.length?k:null;};var d=function(h){return Object.merge.apply(this,h.map(function(i){return g[i.pseudo].options||{};
}));};return{addEvent:function(m,p,j){var n=f(m);if(!n){return c.call(this,m,p,j);}var k=a(this),s=k.retrieve(m,[]),h=n[0].event,t=d(n),o=p,i=t[h]||{},l=Array.slice(arguments,2),r=this,q;
if(i.args){l.append(Array.from(i.args));}if(i.base){h=i.base;}if(i.onAdd){i.onAdd(this);}n.each(function(u){var v=o;o=function(){(i.listener||g[u.pseudo].listener).call(r,u,v,arguments,q,t);
};});q=o.bind(this);s.include({event:p,monitor:q});k.store(m,s);c.apply(this,[m,p].concat(l));return c.apply(this,[h,q].concat(l));},removeEvent:function(l,n){var m=f(l);
if(!m){return e.call(this,l,n);}var j=a(this),o=j.retrieve(l);if(!o){return this;}var h=m[0].event,p=d(m),i=p[h]||{},k=Array.slice(arguments,2);if(i.args){k.append(Array.from(i.args));
}if(i.base){h=i.base;}if(i.onRemove){i.onRemove(this);}e.apply(this,[l,n].concat(k));o.each(function(q,r){if(!n||q.event==n){e.apply(this,[h,q.monitor].concat(k));
}delete o[r];},this);j.store(l,o);return this;}};};(function(){var b={once:{listener:function(e,f,d,c){f.apply(this,d);this.removeEvent(e.event,c).removeEvent(e.original,f);
}},throttle:{listener:function(d,e,c){if(!e._throttled){e.apply(this,c);e._throttled=setTimeout(function(){e._throttled=false;},d.value||250);}}},pause:{listener:function(d,e,c){clearTimeout(e._pause);
e._pause=e.delay(d.value||250,this,c);}}};Events.definePseudo=function(c,d){b[c]=Type.isFunction(d)?{listener:d}:d;return this;};Events.lookupPseudo=function(c){return b[c];
};var a=Events.prototype;Events.implement(Events.Pseudos(b,a.addEvent,a.removeEvent));["Request","Fx"].each(function(c){if(this[c]){this[c].implement(Events.prototype);
}});})();(function(){var d={},c=["once","throttle","pause"],b=c.length;while(b--){d[c[b]]=Events.lookupPseudo(c[b]);}Event.definePseudo=function(e,f){d[e]=Type.isFunction(f)?{listener:f}:f;
return this;};var a=Element.prototype;[Element,Window,Document].invoke("implement",Events.Pseudos(d,a.addEvent,a.removeEvent));})();(function(){var b=!(window.attachEvent&&!window.addEventListener),f=Element.NativeEvents;
f.focusin=2;f.focusout=2;var c=function(h,k,i){var j=Element.Events[h.event],l;if(j){l=j.condition;}return Slick.match(k,h.value)&&(!l||l.call(k,i));};
var e=function(h,j,i){for(var k=j.target;k&&k!=this;k=document.id(k.parentNode)){if(k&&c(h,k,j)){return i.call(k,j,k);}}};var g=function(h){var i="$delegation:";
return{base:"focusin",onRemove:function(j){j.retrieve(i+"forms",[]).each(function(k){k.retrieve(i+"listeners",[]).each(function(l){k.removeEvent(h,l);});
k.eliminate(i+h+"listeners").eliminate(i+h+"originalFn");});},listener:function(r,s,q,t,v){var k=q[0],j=this.retrieve(i+"forms",[]),p=k.target,m=(p.get("tag")=="form")?p:k.target.getParent("form");
if(!m){return;}var o=m.retrieve(i+"originalFn",[]),l=m.retrieve(i+"listeners",[]),u=this;j.include(m);this.store(i+"forms",j);if(!o.contains(s)){var n=function(w){e.call(u,r,w,s);
};m.addEvent(h,n);o.push(s);l.push(n);m.store(i+h+"originalFn",o).store(i+h+"listeners",l);}}};};var a=function(h){return{base:"focusin",listener:function(l,m,j){var k={blur:function(){this.removeEvents(k);
}},i=this;k[h]=function(n){e.call(i,l,n,m);};j[0].target.addEvents(k);}};};var d={mouseenter:{base:"mouseover"},mouseleave:{base:"mouseout"},focus:{base:"focus"+(b?"":"in"),args:[true]},blur:{base:b?"blur":"focusout",args:[true]}};
if(!b){Object.append(d,{submit:g("submit"),reset:g("reset"),change:a("change"),select:a("select")});}Event.definePseudo("relay",{listener:function(i,j,h){e.call(this,i,h[0],j);
},options:d});})();(function(){var b=function(e,d){var f=[];Object.each(d,function(g){Object.each(g,function(h){e.each(function(i){f.push(i+"-"+h+(i=="border"?"-width":""));
});});});return f;};var c=function(f,e){var d=0;Object.each(e,function(h,g){if(g.test(f)){d=d+h.toInt();}});return d;};var a=function(d){return !!(!d||d.offsetHeight||d.offsetWidth);
};Element.implement({measure:function(h){if(a(this)){return h.call(this);}var g=this.getParent(),e=[];while(!a(g)&&g!=document.body){e.push(g.expose());
g=g.getParent();}var f=this.expose(),d=h.call(this);f();e.each(function(i){i();});return d;},expose:function(){if(this.getStyle("display")!="none"){return function(){};
}var d=this.style.cssText;this.setStyles({display:"block",position:"absolute",visibility:"hidden"});return function(){this.style.cssText=d;}.bind(this);
},getDimensions:function(d){d=Object.merge({computeSize:false},d);var i={x:0,y:0};var h=function(j,e){return(e.computeSize)?j.getComputedSize(e):j.getSize();
};var f=this.getParent("body");if(f&&this.getStyle("display")=="none"){i=this.measure(function(){return h(this,d);});}else{if(f){try{i=h(this,d);}catch(g){}}}return Object.append(i,(i.x||i.x===0)?{width:i.x,height:i.y}:{x:i.width,y:i.height});
},getComputedSize:function(d){d=Object.merge({styles:["padding","border"],planes:{height:["top","bottom"],width:["left","right"]},mode:"both"},d);var g={},e={width:0,height:0},f;
if(d.mode=="vertical"){delete e.width;delete d.planes.width;}else{if(d.mode=="horizontal"){delete e.height;delete d.planes.height;}}b(d.styles,d.planes).each(function(h){g[h]=this.getStyle(h).toInt();
},this);Object.each(d.planes,function(i,h){var k=h.capitalize(),j=this.getStyle(h);if(j=="auto"&&!f){f=this.getDimensions();}j=g[h]=(j=="auto")?f[h]:j.toInt();
e["total"+k]=j;i.each(function(m){var l=c(m,g);e["computed"+m.capitalize()]=l;e["total"+k]+=l;});},this);return Object.append(e,g);}});})();var Drag=new Class({Implements:[Events,Options],options:{snap:6,unit:"px",grid:false,style:true,limit:false,handle:false,invert:false,preventDefault:false,stopPropagation:false,modifiers:{x:"left",y:"top"}},initialize:function(){var b=Array.link(arguments,{options:Type.isObject,element:function(c){return c!=null;
}});this.element=document.id(b.element);this.document=this.element.getDocument();this.setOptions(b.options||{});var a=typeOf(this.options.handle);this.handles=((a=="array"||a=="collection")?$$(this.options.handle):document.id(this.options.handle))||this.element;
this.mouse={now:{},pos:{}};this.value={start:{},now:{}};this.selection=(Browser.ie)?"selectstart":"mousedown";if(Browser.ie&&!Drag.ondragstartFixed){document.ondragstart=Function.from(false);
Drag.ondragstartFixed=true;}this.bound={start:this.start.bind(this),check:this.check.bind(this),drag:this.drag.bind(this),stop:this.stop.bind(this),cancel:this.cancel.bind(this),eventStop:Function.from(false)};
this.attach();},attach:function(){this.handles.addEvent("mousedown",this.bound.start);return this;},detach:function(){this.handles.removeEvent("mousedown",this.bound.start);
return this;},start:function(a){var j=this.options;if(a.rightClick){return;}if(j.preventDefault){a.preventDefault();}if(j.stopPropagation){a.stopPropagation();
}this.mouse.start=a.page;this.fireEvent("beforeStart",this.element);var c=j.limit;this.limit={x:[],y:[]};var e,g;for(e in j.modifiers){if(!j.modifiers[e]){continue;
}var b=this.element.getStyle(j.modifiers[e]);if(b&&!b.match(/px$/)){if(!g){g=this.element.getCoordinates(this.element.getOffsetParent());}b=g[j.modifiers[e]];
}if(j.style){this.value.now[e]=(b||0).toInt();}else{this.value.now[e]=this.element[j.modifiers[e]];}if(j.invert){this.value.now[e]*=-1;}this.mouse.pos[e]=a.page[e]-this.value.now[e];
if(c&&c[e]){var d=2;while(d--){var f=c[e][d];if(f||f===0){this.limit[e][d]=(typeof f=="function")?f():f;}}}}if(typeOf(this.options.grid)=="number"){this.options.grid={x:this.options.grid,y:this.options.grid};
}var h={mousemove:this.bound.check,mouseup:this.bound.cancel};h[this.selection]=this.bound.eventStop;this.document.addEvents(h);},check:function(a){if(this.options.preventDefault){a.preventDefault();
}var b=Math.round(Math.sqrt(Math.pow(a.page.x-this.mouse.start.x,2)+Math.pow(a.page.y-this.mouse.start.y,2)));if(b>this.options.snap){this.cancel();this.document.addEvents({mousemove:this.bound.drag,mouseup:this.bound.stop});
this.fireEvent("start",[this.element,a]).fireEvent("snap",this.element);}},drag:function(b){var a=this.options;if(a.preventDefault){b.preventDefault();
}this.mouse.now=b.page;for(var c in a.modifiers){if(!a.modifiers[c]){continue;}this.value.now[c]=this.mouse.now[c]-this.mouse.pos[c];if(a.invert){this.value.now[c]*=-1;
}if(a.limit&&this.limit[c]){if((this.limit[c][1]||this.limit[c][1]===0)&&(this.value.now[c]>this.limit[c][1])){this.value.now[c]=this.limit[c][1];}else{if((this.limit[c][0]||this.limit[c][0]===0)&&(this.value.now[c]<this.limit[c][0])){this.value.now[c]=this.limit[c][0];
}}}if(a.grid[c]){this.value.now[c]-=((this.value.now[c]-(this.limit[c][0]||0))%a.grid[c]);}if(a.style){this.element.setStyle(a.modifiers[c],this.value.now[c]+a.unit);
}else{this.element[a.modifiers[c]]=this.value.now[c];}}this.fireEvent("drag",[this.element,b]);},cancel:function(a){this.document.removeEvents({mousemove:this.bound.check,mouseup:this.bound.cancel});
if(a){this.document.removeEvent(this.selection,this.bound.eventStop);this.fireEvent("cancel",this.element);}},stop:function(b){var a={mousemove:this.bound.drag,mouseup:this.bound.stop};
a[this.selection]=this.bound.eventStop;this.document.removeEvents(a);if(b){this.fireEvent("complete",[this.element,b]);}}});Element.implement({makeResizable:function(a){var b=new Drag(this,Object.merge({modifiers:{x:"width",y:"height"}},a));
this.store("resizer",b);return b.addEvent("drag",function(){this.fireEvent("resize",b);}.bind(this));}});
var RIA = {};
var Log = {
	info: function(msg) {
		if(window.console && console.log && msg) console.log(msg);
	},
	error: function(errorObject) {
		/* 
		* 	errorObject : {
		* 		method[String]: "MyClass : myFunction()" (example) string to help you identify which js file and function caused the error
		* 		error:[Object]: the error object
		* 	}
		*/
		if (errorObject.error instanceof TypeError) {
			this.info("JS ERROR : "+(errorObject.method||'Unknown method')+" : TypeError; the type of a variable is not as expected : "+(errorObject.error.message||errorObject.error));
		} else if (errorObject.error instanceof RangeError) {
			this.info("JS ERROR : "+(errorObject.method||'Unknown method')+" : RangeError; numeric variable has exceeded its allowed range : "+(errorObject.error.message||errorObject.error));
		} else if (errorObject.error instanceof SyntaxError) {
			this.info("JS ERROR : "+(errorObject.method||'Unknown method')+" : SyntaxError; syntax error occurred while parsing : "+(errorObject.error.message||errorObject.error));
		} else if (errorObject.error instanceof ReferenceError) {
			this.info("JS ERROR : "+(errorObject.method||'Unknown method')+" : ReferenceError; invalid reference used : "+(errorObject.error.message||errorObject.error));
		} else {
			this.info("JS ERROR : "+(errorObject.method||'Unknown method')+" : Unidentified Error Type : "+(errorObject.error.message||errorObject.error));
		}
	}
};
RIA.Utils = new Class({
	sortHighLow: function(a, b) {
		return b - a;
	},
	sortLowHigh: function(a, b) {
		return a - b;
	}
});
RIA.GoogleAnalyticsHelper = new Class({
	trackEvent: function(category, action, label, value) {
		_gaq.push(['_trackEvent', category, action, label, value]);
	}
})
RIA.Gradient = new Class({
   generateGradient: function(from, to, steps) {
		var fromStr = from.toString(16), toStr = to.toString(16),fromRGB = {},toRGB = {},stepRGB = {},gradientColours = new Array();
		
	    fromRGB["r"] = parseInt(fromStr.substring(0, 2), 16);
	    fromRGB["g"] = parseInt(fromStr.substring(2, 4), 16);
	    fromRGB["b"] = parseInt(fromStr.substring(4, 6), 16);

		toRGB["r"] = parseInt(toStr.substring(0,2), 16);
	    toRGB["g"] = parseInt(toStr.substring(2,4), 16);
		toRGB["b"] = parseInt(toStr.substring(4,6), 16);
        
	    stepRGB["r"] = (fromRGB["r"] - toRGB["r"]) / (steps - 1);
	    stepRGB["g"] = (fromRGB["g"] - toRGB["g"]) / (steps - 1);
	    stepRGB["b"] = (fromRGB["b"] - toRGB["b"]) / (steps - 1);
        
		for (var i = 0; i < steps; i++) {
	        var RGB = {}; 
			
			var rgbR = Math.floor(fromRGB["r"] - (stepRGB["r"] * i)); 
			var rgbG = Math.floor(fromRGB["g"] - (stepRGB["g"] * i));
			var rgbB = Math.floor(fromRGB["b"] - (stepRGB["b"] * i));

	        RGB["r"] = rgbR.toString(16);
	        
			if(rgbG < 0) {
				RGB["g"] = "00";
			} else {
				RGB["g"] = rgbG.toString(16);
			}                 
			
	        RGB["b"] = rgbB.toString(16);                    
			
			if (RGB["r"].length === 1) RGB["r"] = "0" + RGB["r"];
	        if (RGB["g"].length === 1) RGB["g"] = "0" + RGB["g"];
	        if (RGB["b"].length === 1) RGB["b"] = "0" + RGB["b"];

			gradientColours.push(RGB["r"]+RGB["g"]+RGB["b"]);
	    }              

	    return gradientColours;
	} 
});
RIA.GooglePlaces = new Class({
	Implements:[Options],
	options:{
		places:{
			searchRadius:500,
			serviceURL:"/places",
			types:{
				accounting:"Accounting",
				/*airport
				amusement_park
				aquarium*/
				art_gallery:"Art gallery",
				atm:"ATM",
				bakery:"Bakery",
				bank:"Bank",
				bar:"Bar",
				/*beauty_salon
				bicycle_store*/
				book_store:"Book store",
				/*bowling_alley*/
				bus_station:"Bus station",
				cafe:"Caf&eacute;",
				/*campground
				car_dealer*/
				car_rental:"Car rental",
				/*car_repair
				car_wash
				casino
				cemetery
				church
				city_hall*/
				clothing_store:"Clothing store",
				/*convenience_store
				courthouse
				dentist*/
				department_store:"Department store",
				/*doctor
				electrician
				electronics_store*/
				embassy:"Embassy",
				/*establishment
				finance
				fire_station
				florist*/
				food:"Restaurant",
				/*funeral_home
				furniture_store
				gas_station
				general_contractor
				geocode*/
				grocery_or_supermarket:"Grocery or Supermarket",
				/*gym
				hair_care
				hardware_store
				health
				hindu_temple
				home_goods_store*/
				hospital:"Hospital",
				/*insurance_agency
				jewelry_store
				laundry
				lawyer
				library
				liquor_store
				local_government_office
				locksmith
				lodging*/
				meal_delivery:"Meal delivery",
				meal_takeaway:"Meal takeaway",
				/*mosque
				movie_rental
				movie_theater
				moving_company*/
				museum:"Museum",
				/*night_club
				painter
				park
				parking
				pet_store
				pharmacy
				physiotherapist
				place_of_worship
				plumber
				police
				post_office
				real_estate_agency*/
				restaurant:"Restaurant",
				/*roofing_contractor
				rv_park
				school*/
				shoe_store:"Shoe store",
				/*shopping_mall
				spa
				stadium
				storage
				store*/
				subway_station:"Subway station",
				/*synagogue*/
				taxi_stand:"Taxi rank",
				train_station:"Train station"
				/*travel_agency
				university
				veterinary_care
				zoo
				administrative_area_level_1
				administrative_area_level_2
				administrative_area_level_3
				colloquial_area
				country
				floor
				intersection
				locality
				natural_feature
				neighborhood
				political
				point_of_interest
				post_box
				postal_code
				postal_code_prefix
				postal_town
				premise
				room
				route
				street_address
				street_number
				sublocality
				sublocality_level_4
				sublocality_level_5
				sublocality_level_3
				sublocality_level_2
				sublocality_level_1
				subpremise
				transit_station*/
			}
		}		
	},
	requestPlaces: function(locationLatLng, radiusInMeters, types, name) { 
		if(!this.hotelCollection[this.hotelIndex].places || !this.hotelCollection[this.hotelIndex].places[types]) {  
			Log.info("requestPlaces");
			this.requestPlacesSearch = new Request.JSON({
				method:"POST",
				url:this.options.places.serviceURL,
				onRequest: this.jsonRequestStart.bind(this),
				onSuccess: function(responseJSON, responseText) {
					this.jsonRequestSuccess(responseJSON, responseText, types)
				}.bind(this),
				onError: this.jsonRequestFailure.bind(this)
			}).send("locationid="+this.hotelCollection[this.hotelIndex].get("data-locationid")+"&hotelname="+this.hotelCollection[this.hotelIndex].get("data-name")+"&location="+locationLatLng.lat()+","+locationLatLng.lng()+"&radius="+radiusInMeters+"&types="+types);
			Log.info(this.requestPlacesSearch);
        } else {
	        this.setPlacesMarkers(types);
		}
	},
	jsonRequestStart: function() {
		//Log.info("JSON request underway");
	},
	jsonRequestSuccess: function(responseJSON, responseText, types) {
		//Log.info("JSON request success");
		if(typeof(this.hotelCollection[this.hotelIndex].places) == "undefined") {
			this.hotelCollection[this.hotelIndex].places = new Object();
		}
		
		if(responseJSON.status == "OK" && responseJSON.results.length > 0) {
			this.hotelCollection[this.hotelIndex].places[types] = responseJSON;
			this.setPlacesMarkers(types); 
			
		} else {
			Log.error({method:"RIA.GooglePlaces : jsonRequestSuccess", error:{message:"bad status or no results"}});
			this.updateLabelCount(types);
		}
	}, 
	updateLabelCount: function(types) {                                                  
		var element = document.getElement("input[data-value="+types+"]"), label, count = this.hotelCollection[this.hotelIndex].places[types] ? this.hotelCollection[this.hotelIndex].places[types].results.length : 0;
		if(element) {
			label = element.getNext("label");                                  
			label.set("text", label.get("data-text")+" ("+count+")");
		}
	},
	setPlacesMarkers: function(type) {
		Object.each(this.hotelCollection[this.hotelIndex].places[type].results, function(place) {
			this.addPlacesMarker(place, type);
		},this);
		                                      
		this.setHtmlAttributions(type);
		
		this.updateLabelCount(type);
	},
	jsonRequestFailure: function(text, error) {
		Log.info("JSON request failure");
		Log.info(text);
		Log.info(error);
	},
	addPlacesMarker: function(place, type) {
		/*
		*	@description:
		*		Sets a Marker for a Place. Not solicited by the User
		*	@arguments:
		*		place[Object](returned from a Places API request)
		*		latLng[Object(LatLng)]
		*/ 
   	 	var mapIcon, panoIcon, latLng; 

		if(place.types.length > 0 && RIA.MarkerIconsImages[place.types[0]]) {
			mapIcon = RIA.MarkerIconsImages[place.types[0]];
		} else {
			mapIcon = RIA.MarkerIconsImages.star;
		}
       
		panoIcon = new google.maps.MarkerImage(place.icon);
		latLng = new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng);
	                                                  
		place.placesMarker = new google.maps.Marker({
            map:RIA.map,
			icon:mapIcon,
			position: latLng,
			draggable:false,
			title:place.name,
			animation:google.maps.Animation.DROP,
			cursor:'pointer',
			clickable:true,
			zIndex:1
        }); 
       
		place.placesMarkerSV = new google.maps.Marker({
            map:RIA.panorama,
			icon:panoIcon,
			position: latLng,
			draggable:false,
			title:place.name,
			animation:google.maps.Animation.DROP,
			clickable:true,
			zIndex:1
        });
       
		place.clickEvent = google.maps.event.addListener(place.placesMarker, 'click', function(event) {
			this.setCurrentLocation(event.latLng);
			this.setPanoramaPosition(event.latLng);
		}.bind(this));
	
		this.createPlacesInfoWindow(place, place.placesMarker);
		this.createPlacesInfoWindow(place, place.placesMarkerSV);

	},
	removeAllPlacesMarkers: function() {
		if(this.hotelCollection) {
			this.hotelCollection.each(function(hotel) {
				Object.each(hotel.places, function(type) {
					Object.each(type.results, function(place) {
						this.removePlacesMarker(place);
					},this);			
				},this);
			},this);
		}
	},
	removePlacesMarkers: function(type) {

		if(type && this.hotelCollection[this.hotelIndex].places && this.hotelCollection[this.hotelIndex].places[type]) {
			Object.each(this.hotelCollection[this.hotelIndex].places[type].results, function(place) {
				this.removePlacesMarker(place);
			},this);
		}
		
	}, 
	removePlacesMarker: function(place) {
		if(place && place.placesMarker && place.placesMarkerSV) { 
			place.placesMarker.setMap(null);
			place.placesMarkerSV.setMap(null);
		}
	},
	createPlacesInfoWindow: function(place, marker) {
		marker.infowindow = new google.maps.InfoWindow({        
			content: place.name+"<br/>"+place.vicinity+"<br/>("+(this.options.places.types[place.types[0]]||place.types[0])+")",
			maxWidth:50
		});
       
		// Add mouse event listeners for the Marker
		marker.mouseoutEvent = null;
		marker.mouseoverEvent = google.maps.event.addListener(marker, 'mouseover', function(event) {
		    this.openInfoWindow(marker, marker.infowindow);  
			marker.mouseoutEvent = google.maps.event.addListener(marker, 'mouseout', function(event) {
			    marker.infowindow.close(); 
				google.maps.event.removeListener(marker.mouseoutEvent); 
			}.bind(this));
		}.bind(this)); 
		marker.clickEvent = google.maps.event.addListener(marker, 'click', function(event) {
			this.setCurrentLocation(event.latLng);
			google.maps.event.removeListener(marker.mouseoutEvent);
			this.setPanoramaPosition(event.latLng);
			this.openInfoWindow(marker, marker.infowindow);
		}.bind(this));
	},
	resetPlacesMarkers: function(reset) {
		this.removeAllPlacesMarkers();
		
		
		if(reset) {
			this.hotelCollection[this.hotelIndex].places = new Object();
		}
		document.getElements("#places input[type=checkbox]").each(function(input) {
			if(input.checked && input.get("value") != "") {
				this.requestPlaces(RIA.currentLocation, this.options.places.searchRadius, input.get("value"), null);
			}				
		},this);
		
	},
	storePlacesSearch: function(hotel, types, placesJsonText) {
		/*
		* 	@description:
		*		Manually dispatch Places data of a hotel and type to the datastore
		*	@notes:
		*		This is not used, as the Places data is stored via the webapp after the places response is received
		*/
		
		this.requestPlacesPost = new Request({
			method:"POST",
			url:this.options.places.serviceURL,
			data:'locationid='+hotel.get("data-locationid")+'&types='+types+'&places='+placesJsonText,
			onRequest: function(e) {
				Log.info("storePlacesSearch : onRequest");
			},
			onSuccess: function(a, b) {
				Log.info("storePlacesSearch : onSuccess");
				//Log.info(a);
				//Log.info(b)
			},
			onFailure: function(e) {
				Log.info("storePlacesSearch : onFailure");
				Log.info(e)
			}
		}).send();
		
	},
	setHtmlAttributions: function(type) {
		// Remove any existing HTML Attributions from Google Places results
		this.places.getElement(".attributions").empty();
        
		this.places.getElements("input").each(function(place, index) {
			if(place.checked) { 
				if(this.hotelCollection[this.hotelIndex].places && this.hotelCollection[this.hotelIndex].places[place.get("value")]) {
					Array.each(this.hotelCollection[this.hotelIndex].places[place.get("value")].html_attributions, function(attribution, index){
						this.places.getElement(".attributions").adopt(
							new Element("p", {"html":place.getNext("label").get("data-text")+" "+attribution})
						);  
						Log.info("Adding html attributions for "+place.get("value"));
					},this);
				}
			}
		},this);
	}   
});
function TripAdvisorOverlay(latLng, data, map) {
	// Now initialize all properties.
	this.latLng_ = latLng;
	this.data_ = data;
	this.map_ = map;

	// Create the DIV and set some basic attributes.
	var div = document.createElement('DIV');
	div.style.border = "none";
	div.style.borderWidth = "0px";
	div.style.position = "absolute";
	div.style.visibility = "hidden";
	
  	// Set the overlay's div_ property to this DIV
  	this.div_ = div;
	// Explicitly call setMap() on this overlay
	this.setMap(map);

}

RIA.MapStreetView = new Class({
	Implements:[RIA.Gradient, RIA.GoogleAnalyticsHelper],
	options:{
		geocodeURL:"/geocodeworker",
		bookmarks:null,
		maptype:"panorama",
		spectrum:["00FF00", "FFFF00", "FF0000"],
		panoramaServiceRadius:50,
		userLocationOptions:{
			enableHighAcurracy:true, 
			timeout:5000,
			maximumAge:300000
		},
		streetViewDefaultOptions:null
	},
	mapInitialize: function() {
		TripAdvisorOverlay.prototype = new google.maps.OverlayView();
		this.requestCounter = 500;
		
		RIA.bookmarks = new Object();
		RIA.hotelMarkers = new Object();
		
		RIA.MarkerIcons = { 
			blank:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=star|FFFF00',
			star:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=star|FFFF00',
			bankDollar:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bank-dollar|FF0000',
			hotel:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=@LETTER@|@COLOR@|000000',
			bookmark:'http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin_star|@LETTER@|000000|FFFFFF|FFFF00', 
			poc:'http://chart.apis.google.com/chart?chst=d_map_spin&chld=1|0|EC008C|10|b|@LETTER@',
			shadowHotel:'http://chart.apis.google.com/chart?chst=d_map_pin_shadow',
			shadowBookmark:'http://chart.apis.google.com/chart?chst=d_map_xpin_shadow&chld=pin_star',
			food:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=restaurant|FFFFFF',
			cafe:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe|FFFFFF',
			bar:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bar|FFFFFF',
			restaurant:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=restaurant|FFFFFF',
			establishment:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF',
			grocery_or_supermarket:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingcart|FFFFFF',
			store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingcart|FFFFFF',
			meal_delivery:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=snack|FFFFFF',
			meal_takeaway:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=snack|FFFFFF',
			bakery:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=restaurant|FFFFFF',
			museum:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF',
			park:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF',
			shopping:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			shoe_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			book_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			clothing_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			department_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			bank:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bank-dollar|FFFFFF',
			atm:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bank-dollar|FFFFFF',
			bus:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bus|FFFFFF',
			car:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=car|FFFFFF',
			taxi:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=taxi|FFFFFF',
			hospital:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=medical|FFFFFF',
			embassy:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=legal|FFFFFF',
			art_gallery:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF'
		}
		         
		var star = new google.maps.MarkerImage(RIA.MarkerIcons.star),
		shoe_store = new google.maps.MarkerImage(RIA.MarkerIcons.shoe_store),
		food = new google.maps.MarkerImage(RIA.MarkerIcons.food),
		cafe = new google.maps.MarkerImage(RIA.MarkerIcons.cafe),
		bar = new google.maps.MarkerImage(RIA.MarkerIcons.bar),
		restaurant = new google.maps.MarkerImage(RIA.MarkerIcons.restaurant),
		establishment = new google.maps.MarkerImage(RIA.MarkerIcons.establishment),
		grocery_or_supermarket = new google.maps.MarkerImage(RIA.MarkerIcons.grocery_or_supermarket),
		store = new google.maps.MarkerImage(RIA.MarkerIcons.store),
		meal_delivery = new google.maps.MarkerImage(RIA.MarkerIcons.meal_delivery),
		meal_takeaway = new google.maps.MarkerImage(RIA.MarkerIcons.meal_takeaway),
		bakery = new google.maps.MarkerImage(RIA.MarkerIcons.bakery),
		museum = new google.maps.MarkerImage(RIA.MarkerIcons.museum),
		park = new google.maps.MarkerImage(RIA.MarkerIcons.park),
		shopping = new google.maps.MarkerImage(RIA.MarkerIcons.shopping),
		shoe_store = new google.maps.MarkerImage(RIA.MarkerIcons.shoe_store),
		book_store = new google.maps.MarkerImage(RIA.MarkerIcons.book_store),
		clothing_store = new google.maps.MarkerImage(RIA.MarkerIcons.clothing_store),
		department_store = new google.maps.MarkerImage(RIA.MarkerIcons.department_store),
		bank = new google.maps.MarkerImage(RIA.MarkerIcons.bank),
		atm = new google.maps.MarkerImage(RIA.MarkerIcons.atm),
		bus_station = new google.maps.MarkerImage(RIA.MarkerIcons.bus),
		car_rental = new google.maps.MarkerImage(RIA.MarkerIcons.car),
		taxi_stand = new google.maps.MarkerImage(RIA.MarkerIcons.taxi),
		hospital = new google.maps.MarkerImage(RIA.MarkerIcons.hospital),
		embassy = new google.maps.MarkerImage(RIA.MarkerIcons.embassy),
		art_gallery = new google.maps.MarkerImage(RIA.MarkerIcons.art_gallery);
		
		RIA.MarkerIconsImages = {
			star:star,
			shoe_store:shoe_store,
			food:food,
			cafe:cafe,
			bar:bar,
			restaurant:restaurant,
			establishment:establishment,
			grocery_or_supermarket:grocery_or_supermarket,
			store:store,
			meal_delivery:meal_delivery,
			meal_takeaway:meal_takeaway,
			bakery:bakery,
			museum:museum,
			park:park,
			shopping:shopping,
			shoe_store:shoe_store,
			book_store:book_store,
			clothing_store:book_store,
			department_store:department_store,
			bank:bank,
			atm:atm,
			bus_station:bus_station,
			car_rental:car_rental,
			taxi_stand:taxi_stand,
			hospital:hospital,
			embassy:embassy,
			art_gallery:art_gallery
		}

		RIA.geocoder = new google.maps.Geocoder();
		RIA.sv = new google.maps.StreetViewService();         
		
		if(this.options.streetViewDefaultOptions && this.options.streetViewDefaultOptions.lat != "" && this.options.streetViewDefaultOptions.lng != "") {
			this.setCurrentLocation(new google.maps.LatLng(this.options.streetViewDefaultOptions.lat, this.options.streetViewDefaultOptions.lng));
		} else {
			this.setCurrentLocation(new google.maps.LatLng(0, 0));
		}
		
		
		this.mapOptions = {
			scrollwheel: false,
			keyboardShortcuts:false,
			zoom: 15,
			center: RIA.currentLocation, 
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scaleControl: true,
		    scaleControlOptions: {
		        position: google.maps.ControlPosition.BOTTOM_LEFT
		    }
		}
		
		this.panoramaOptions = {
			scrollwheel: false,
			position: RIA.currentLocation,
			pov: {
				heading: (this.options.streetViewDefaultOptions.heading || 120),
		        pitch: (this.options.streetViewDefaultOptions.pitch || 20),
		        zoom: (this.options.streetViewDefaultOptions.zoom || 0)
			}
		};

		RIA.map = new google.maps.Map(document.getElementById("map_canvas"), this.mapOptions);
        RIA.map.setCenter(RIA.currentLocation);
                                                                                              		
		RIA.panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), this.panoramaOptions);
		RIA.panorama._events = {};
		RIA.map.setStreetView(RIA.panorama);
		
		RIA.panoramioLayer = new google.maps.panoramio.PanoramioLayer();
		//RIA.panoramioLayer.setTag("times square");
		
		/*
		*	From page load, if we have a Destination submit the form
		*/
		if(RIA.currentDestination != null && RIA.currentDestination != "") {
			RIA.InitAjaxSubmit._submit();
		}
		
		
        this.toggleMapFullScreen(null);
		
		RIA.map._events = {};
		this.setMapEventListeners();
		
		
		
		if(this.options.ios) {
			this.watchUserPosition();
		}
		
		
		TripAdvisorOverlay.prototype.onAdd = function() {
			if(this.div_) {
			// Note: an overlay's receipt of onAdd() indicates that
			// the map's panes are now available for attaching
			// the overlay to the map via the DOM.

			
			this.div_.innerHTML = this.data_;
			
		  	// We add an overlay to a map via one of the map's panes.
		  	// We'll add this overlay to the overlayImage pane.
		  	var panes = this.getPanes();
		  	panes.overlayLayer.appendChild(this.div_);
		}
		}

		TripAdvisorOverlay.prototype.draw = function() {
			if(this.div_) {
				// Size and position the overlay. We use a southwest and northeast
				// position of the overlay to peg it to the correct position and size.
				// We need to retrieve the projection from this overlay to do this.
				var overlayProjection = this.getProjection();

				// Retrieve the southwest and northeast coordinates of this overlay
				// in latlngs and convert them to pixels coordinates.
				// We'll use these coordinates to resize the DIV.
				var coords = overlayProjection.fromLatLngToDivPixel(this.latLng_);
				var y = coords.y;
				var x = coords.x;
				var yThreshold = (y-this.div_.getStyle("height").toInt());
			
				if(y >= (RIA.InitExperience.viewport.y - this.div_.getStyle("height").toInt())) {
					y = (RIA.InitExperience.viewport.y - this.div_.getStyle("height").toInt() - 80);
				}
				// Resize the image's DIV to fit the indicated dimensions.
				this.div_.style.left = (x + 20) + 'px';
				/*
				[ST]TODO: Fix the custom overlay Y position, for small screens
				*/
				this.div_.style.top = (y+50)+'px';
			}
		}

		TripAdvisorOverlay.prototype.hide = function() {
			if (this.div_) {
				this.div_.style.visibility = "hidden";
			}
		}

		TripAdvisorOverlay.prototype.show = function() {
			if (this.div_) {
				this.div_.style.visibility = "visible";
			}
		}

		TripAdvisorOverlay.prototype.toggle = function() {
		  if (this.div_) {
		    if (this.div_.style.visibility == "hidden") {
		      this.show();
		    } else {
		      this.hide();
		    }
		  }
		}
		TripAdvisorOverlay.prototype.onRemove = function() {
		  if(this.div_) {
			this.div_.parentNode.removeChild(this.div_);
		  	this.div_ = null;
		}
		}
		TripAdvisorOverlay.prototype.toggleDOM = function() {
		  if (this.getMap()) {
		    this.setMap(null);
		  } else {
		    this.setMap(this.map_);
		  }
		}
		
		TripAdvisorOverlay.prototype.removeFromDOM = function() {
			
			this.div_.parentNode.removeChild(this.div_);
			  this.div_ = null;
		}
			
	},
	setMapEventListeners: function() {
		RIA.map._events.bounds_changed = google.maps.event.addListener(RIA.map, 'bounds_changed', function() {
		    //Log.info("RIA.map Event : bounds_changed");
		}.bind(this));
		
		RIA.map._events.center_changed = google.maps.event.addListener(RIA.map, 'center_changed', function() {
		    //Log.info("RIA.map Event : center_changed");
		}.bind(this));
		
		RIA.map._events.heading_changed = google.maps.event.addListener(RIA.map, 'heading_changed', function() {
		    //Log.info("RIA.map Event : heading_changed");
		}.bind(this));
		
		RIA.map._events.zoom_changed = google.maps.event.addListener(RIA.map, 'zoom_changed', function() {
		    //Log.info("RIA.map Event : zoom_changed : "+RIA.map.getZoom());
		}.bind(this));
		
		RIA.map._events.click = google.maps.event.addListener(RIA.map, 'click', function(e) {
		    //Log.info("RIA.map Event : click");
			//Log.info(e);
		}.bind(this));
		
		RIA.map._events.dblclick = google.maps.event.addListener(RIA.map, 'dblclick', function(e) {
		    //Log.info("RIA.map Event : dblclick");
			//Log.info(e);
		}.bind(this));
		
		RIA.map._events.rightclick = google.maps.event.addListener(RIA.map, 'rightclick', function(e) {
		    //Log.info("RIA.map Event : rightclick");
			//Log.info(e);
		}.bind(this));
		
		RIA.map._events.idle = google.maps.event.addListener(RIA.map, 'idle', function() {
		    //Log.info("RIA.map Event : idle");
			this.animateCurrentMarker(); 
		}.bind(this));
		
		RIA.map._events.tilesloaded = google.maps.event.addListener(RIA.map, 'tilesloaded', function() {
		    //Log.info("RIA.map Event : tilesloaded");
		}.bind(this));
		
		RIA.map._events.dragstart = google.maps.event.addListener(RIA.map, 'dragstart', function() {
		    //Log.info("RIA.map Event : dragstart");
		}.bind(this));
		
		RIA.map._events.drag = google.maps.event.addListener(RIA.map, 'drag', function() {
		    //Log.info("RIA.map Event : drag");
		}.bind(this));
		
		RIA.map._events.dragend = google.maps.event.addListener(RIA.map, 'dragend', function() {
		    //Log.info("RIA.map Event : dragend");
		}.bind(this));
		
		/*
		*	StreetView Panorama Events
		*/
		RIA.panorama._events.drag = google.maps.event.addListener(RIA.panorama, 'drag', function() {
		    //Log.info("RIA.panorama Event : drag");
		}.bind(this));
		
		google.maps.event.addListener(RIA.panorama, 'pov_changed', function() {
			//Log.info("RIA.panorama Event : pov_changed");
			//Log.info(RIA.panorama.getPov());
		});
		
		google.maps.event.addListener(RIA.panorama, 'position_changed', function() {
		    //Log.info("RIA.panorama Event : position_changed");
			//Log.info(RIA.panorama.getPosition());
		});
	},
	toggleMapFullScreen: function(e){
		/*
		*	@description:
		*		Toggle the Map (ROADMAP) view from full screen to minimized
		*	@arguments:
		*		Event[Object] (optional)
		*/ 
		
		// If we have an Event object argument, prevent any default action   
		if(e && e.preventDefault) {
			e.preventDefault();
		}                                                                 

		// If WE DO NOT HAVE AN EVENT and full screen Map view is required  
		if(!e) {
			if(this.mapCanvas.retrieve("view:state") == "map") {
				this.mapCanvas.setStyles({"zIndex":1, "width":this.mapCanvas.retrieve("styles:maximized").width, "height":this.mapCanvas.retrieve("styles:maximized").height});
				//this.mapStreetview.setStyles({"zIndex":3,"width":"310px", "height":"300px"});  
				this.mapStreetview.setStyles({"zIndex":3,"width":"210px", "height":"200px"});  
			} else if(this.mapCanvas.retrieve("view:state") == "panorama") {
				this.mapCanvas.setStyles({"zIndex":3, "width":this.mapCanvas.retrieve("styles:orig").width, "height":this.mapCanvas.retrieve("styles:orig").height});
				this.mapStreetview.setStyles({"zIndex":0,"width":this.mapStreetview.retrieve("styles:maximized").width, "height":this.mapStreetview.retrieve("styles:maximized").height}); 
			}
		}
		
		// IF WE DO HAVE AN EVENT and full screen Map view is required   
		
		if(e) {
			
			
			if(this.mapCanvas.retrieve("view:state") == "map" && (e.target.get("id") == "toggle-streetview" && !e.target.hasClass("active"))) {
				this.mapStreetview.setStyles({"zIndex":0,"width":this.mapStreetview.retrieve("styles:maximized").width, "height":this.mapStreetview.retrieve("styles:maximized").height}); 
				google.maps.event.trigger(RIA.panorama, "resize"); 
				this.options.maptype = "panorama";
				this.mapCanvas.store("view:state", this.options.maptype);
				this.mapCanvas.setStyles({"zIndex":3, "width":this.mapCanvas.retrieve("styles:orig").width, "height":this.mapCanvas.retrieve("styles:orig").height});
			   	
				this.mapCanvas.removeClass("maximized");
				this.mapCanvas.addClass("minimized");
				this.mapStreetview.removeClass("minimized");
				this.mapStreetview.addClass("maximized");
			 	document.id("toggle-streetview").addClass("active");
				document.id("toggle-map").removeClass("active");
				
			}
			else if(e.target.get("id") == "toggle-map" && !e.target.hasClass("active")){
				//this.mapStreetview.setStyles({"zIndex":3,"width":"310px", "height":"300px"});
				this.mapStreetview.setStyles({"zIndex":3,"width":"210px", "height":"180px"});
				google.maps.event.trigger(RIA.panorama, "resize"); 
				
				this.options.maptype = "map";
				this.mapCanvas.store("view:state", this.options.maptype);
				this.mapCanvas.setStyles({"zIndex":1, "width":this.mapCanvas.retrieve("styles:maximized").width, "height":this.mapStreetview.retrieve("styles:maximized").height});
				
				this.mapCanvas.removeClass("minimized");
				this.mapCanvas.addClass("maximized");
				this.mapStreetview.removeClass("maximized");
				this.mapStreetview.addClass("minimized");
				
				document.id("toggle-streetview").removeClass("active");
				document.id("toggle-map").addClass("active");
				
			}
			
		}
		
		// Trigger the resize event on the Map so that it requests any required tiles
		google.maps.event.trigger(RIA.map, "resize");                                

		// Center the Map on the current location
		this.setMapPositionCenter(RIA.currentLocation);

	},
	setStreetview: function(hotel) { 
		/*
		* 	@description:
		*		Update the existing Streetview Panorama to center on the current location
		*	@arguments:
		*		Hotel[Element]
		*/ 
		// Get the Hotel address     
		var address = hotel.get("data-address"), latLng, savedLatLng = true;
		if(!address || address == "None") {
			address = "No address found";			
			return this.notGotGeolocation(hotel);
		}                       
		                                                
		// If we haven't stored locally the hotel LatLng, then attempt to store it...
		if(!hotel.retrieve("geolocation")) {
			savedLatLng = this.saveLatLngToHotel(hotel);
		}        
		
		// If we have successfully stored the LatLng against the hotel
		if(savedLatLng) {
			this.gotGeolocation(hotel, hotel.retrieve("geolocation"));
			
			//Log.info("setStreetview() : savedLatLng")
			this.hotelCollection[this.hotelIndex].TripAdvisor.show();
			
		} 
		// Else request the LatLng data from Google, using the Hotel's address
		else { 
			this.getGeocodeByAddress(hotel, this.gotGeolocation.bind(this));
		}   	
	},
	gotGeolocation: function(hotel, latLng) {
		/*
		* 	@description:
		*		Called from a successful google.geocode(address) lookup, or using stored LatLng geocoords
		*	@arguments:
		*		Hotel[Element]
		*		LatLng[Object(LatLng)]
		*/         
		
		// Set the global namespace current location
       	this.setCurrentLocation(latLng);
                                       
		// Switch the Map on, in case it was hidden due to no results previously
		this.mapStreetview.setStyle("display", "");          		            
		
		// Set the Map position and Pan to this position
		this.setMapPositionPan(RIA.currentLocation);    
		
		// Set the Streetview Panorama position
		this.setPanoramaPosition(RIA.currentLocation);
		
		this.resetPlacesMarkers();
	},
	notGotGeolocation: function(hotel) {
		/*
		* 	@description:
		*		Called from an UNsuccessful google.geocode(address) lookup
		*	@arguments:
		*		Hotel[Element]
		*/
        var counter = this.requestCounter + 500;
		this.requestCounter += 500
		if(hotel.retrieve("geolocation:error") != google.maps.GeocoderStatus.ZERO_RESULTS) {
			this.getGeocodeByAddress.delay(this.requestCounter, this, [hotel, this.addHotelMarker.bind(this)]);
        } else {
			//RIA.panorama.setVisible(false);
		}						
	},
	animateCurrentMarker: function(delayStart) {
   		if(!this.hotelCollection || !this.hotelCollection[this.hotelIndex]) return;

		/*
		*	Clear all existing animations
		*/
		this.hotelCollection.each(function(hotel) {
			if(hotel.bookmark) this.animateMarker(hotel.bookmark, null);
						
			if(hotel.bookmarkSV) this.animateMarker(hotel.bookmarkSV, null);

			if(hotel.hotelMarker) this.animateMarker(hotel.hotelMarker, null);

			if(hotel.hotelMarkerSV) this.animateMarker(hotel.hotelMarkerSV, null);
		},this);

		if(this.hotelCollection[this.hotelIndex].bookmark) {
			this.animateMarker(this.hotelCollection[this.hotelIndex].bookmark, google.maps.Animation.BOUNCE);
			this.hotelCollection[this.hotelIndex].bookmark.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].bookmark, null]);			
		}	

		if(this.hotelCollection[this.hotelIndex].bookmarkSV) {
			this.animateMarker(this.hotelCollection[this.hotelIndex].bookmarkSV, google.maps.Animation.BOUNCE);
			this.hotelCollection[this.hotelIndex].bookmarkSV.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].bookmarkSV, null]);			
		}
		
		if(this.hotelCollection[this.hotelIndex].hotelMarker) {
			this.animateMarker(this.hotelCollection[this.hotelIndex].hotelMarker, google.maps.Animation.BOUNCE);
			this.hotelCollection[this.hotelIndex].hotelMarker.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].hotelMarker, null]);			
		}	

		if(this.hotelCollection[this.hotelIndex].hotelMarkerSV) {
			this.animateMarker(this.hotelCollection[this.hotelIndex].hotelMarkerSV, google.maps.Animation.BOUNCE);
			this.hotelCollection[this.hotelIndex].hotelMarkerSV.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].hotelMarkerSV, null]);			
		}
	},                      
	setMapPositionPan: function(latLng) {
		/*
		* 	@description:
		*		Set the Map to a position and Pan to it using the Google Maps built-in effect
		*	@arguments:
		*		latLng[Object(LatLng)]
		*/
		RIA.map.panTo(latLng);
	},
	setMapPositionCenter: function(latLng) {
		/*
		* 	@description:
		*		Set the Map to a position and center the Map to this position
		*	@arguments:
		*		latLng[Object(LatLng)]
		*/ 
		RIA.map.setCenter(latLng); 
	},
	setMapZoom: function(zoomLevel) {
		if(RIA.map) {
			//Log.info("Setting map zoom to level "+zoomLevel);
			RIA.map.setZoom(zoomLevel);
			//Log.info("Map zoom set to "+RIA.map.getZoom());
		}		
	},
	setPanoramaPosition: function(latLng) {
		/*
		* 	@description:             
		*		Set the position of the Streetview Panorama
		*	@arguments:
		*		latLng[Object(LatLng)]
		*/ 
		// Check whether Streetview Panorama data exists for this LatLng, within a predefined metre radius (argument #2 below) 
		var heading;
		var hotelHeading = this.hotelCollection[this.hotelIndex].get("data-heading");
		
		RIA.sv.getPanoramaByLocation(latLng, this.options.panoramaServiceRadius, function(svData, svStatus) {  
            // If Streetview Panorama data exists...
			if (svStatus == google.maps.StreetViewStatus.OK) {
				if(!RIA.panorama.getVisible()) RIA.panorama.setVisible(true);
				// Set the Streetview Panorama to the position, using the returned data (rather than RIA.currentLocation, as this may be innaccurate)
				RIA.panorama.setPosition(svData.location.latLng);                                                                              
				// Set the Point Of View of the Panorama to match the 'current heading' data returned. Set pitch and zoom to zero, so that we are horizontal and zoomed out
				
				// Now calculate the heading using the Panorama LatLng to the Hotel's LatLng (visually, the Marker)
				if(hotelHeading != "" && hotelHeading != null) {
					heading = parseFloat(hotelHeading);
				} else {
					heading = this.getHeading(svData.location.latLng, latLng);
				}
				
				
				// Set the Panorama heading, pitch and zoom 
				RIA.panorama.setPov({
					heading: heading,
					pitch:20,
					zoom:0
				});
			}
			// Else if no data exists...
			else if(svStatus == google.maps.StreetViewStatus.ZERO_RESULTS) {				
				// [ST]TODO: No Streetview data was found for this LatLng, what do we do here?
				Log.info("No Panorama results found");
				RIA.panorama.setVisible(false);
			} 
			// Else there was an error...
			else {
				// [ST]TODO: Handle OVER_QUOTA or other errors
				Log.info("Panorama error status: "+svStatus);
				RIA.panorama.setVisible(false);
			}
		}.bind(this));
	},
	dropBookmarkPin: function(hotel) {
		/*
		* 	@description:
		*		Call from a Bookmark request against a Hotel
		*	@arguments:
		*		Hotel[Element]
		*/ 
		// If the argument is an event, then use the current hotel index
		if(hotel.event) var hotel = this.hotelCollection[this.hotelIndex];
		
		var title = hotel.get("data-name"), price = hotel.get("data-price"), counter = hotel.get("data-counter"), marker, infowindow, LMLocationId = hotel.get("data-locationid"), icon;
		
		if(hotel.bookmark == null && RIA.bookmarks[LMLocationId] == undefined) {
			
			// If we have a Hotel Marker...
			if(RIA.hotelMarkers[LMLocationId] != undefined) {
				// If the Hotel Marker instance has a hotelMarker MapMarker Object, then remove it
				if(RIA.hotelMarkers[LMLocationId].hotelMarker != null) {    
					this.removeMarker(RIA.hotelMarkers[LMLocationId].hotelMarker);
				} 
				if(RIA.hotelMarkers[LMLocationId].hotelMarkerSV != null) {    
					this.removeMarker(RIA.hotelMarkers[LMLocationId].hotelMarkerSV); 
				}
			}  
				    
			icon = RIA.MarkerIcons.bookmark.replace("@LETTER@",hotel.get("data-counter"));
			
			// Create a new Marker
			hotel.bookmark = new google.maps.Marker({
	            map: RIA.map, 
	            icon:new google.maps.MarkerImage(icon),
				position: hotel.retrieve("geolocation"),
				draggable:false,
				title:title,
				animation:google.maps.Animation.BOUNCE,
				cursor:'pointer',
				clickable:true,
				zIndex:20,
				shadow:new google.maps.MarkerImage(RIA.MarkerIcons.shadowBookmark, new google.maps.Size(37, 42), new google.maps.Point(0,0), new google.maps.Point(12,42))
	        });

			hotel.bookmarkSV = new google.maps.Marker({
	            map: RIA.panorama, 
	            icon:new google.maps.MarkerImage(icon),
				position: hotel.retrieve("geolocation"),
				draggable:false,
				title:title,
				animation:google.maps.Animation.BOUNCE,
				clickable:false,
				zIndex:20
	        });
        
        
			// Add this hotel to the global namespaced Array of Bookmarks
			RIA.bookmarks[LMLocationId] = hotel;
		   
			this.createInfoWindow(hotel, hotel.bookmark);
		
			// Add a timeout to stop animating the Marker by removing {animation:google.maps.Animation.BOUNCE}
			hotel.bookmark.timeout = this.animateMarker.delay(2100, this, [hotel.bookmark, null]);  
			hotel.bookmarkSV.timeout = this.animateMarker.delay(2100, this, [hotel.bookmarkSV, null]);
			
			// Track the bookmarking
			this.trackEvent('Hotel', 'Bookmark', hotel.get("data-locationid")+" : "+hotel.get("data-name"), 1);
		}
	},
	createInfoWindow: function(hotel, marker) {
		
		var infowindow = new google.maps.InfoWindow({
		    content: hotel.getElement(".info-window").get("html"),
			maxWidth:50,
			disableAutoPan:true
		});
        
		infowindow.closeEvent = google.maps.event.addListener(infowindow, 'closeclick', function(event) {
		    infowindow.opened = false;
		}.bind(this));

		// Add mouse event listeners for the Marker
		hotel.mouseoutEvent = null;
		hotel.mouseoverEvent = google.maps.event.addListener(marker, 'mouseover', function(event) {
		    this.openInfoWindow(marker, infowindow);  
			hotel.mouseoutEvent = google.maps.event.addListener(marker, 'mouseout', function(event) {
			    if(!infowindow.opened) infowindow.close(); 
				google.maps.event.removeListener(hotel.mouseoutEvent); 
			}.bind(this));
		}.bind(this)); 
		hotel.clickEvent = google.maps.event.addListener(marker, 'click', function(event) {
			infowindow.opened = true;
			this.setCurrentLocation(event.latLng);
			google.maps.event.removeListener(hotel.mouseoutEvent);
			this.setPanoramaPosition(event.latLng);
			this.jumpToHotel(hotel);  
			this.openInfoWindow(marker, infowindow);   
			this.resetPlacesMarkers();
            
			this.trackEvent('Hotel', 'NavigateByMap', hotel.get("data-locationid")+" : "+hotel.get("data-name"), 1);
		}.bind(this));
	},
	createInfoWindowPanorama: function(hotel, marker) {
		
		hotel.infowindowSV = new google.maps.InfoWindow({
		    content: hotel.getElement(".info-window").get("html")+'<div id="TA_excellent746" class="TA_excellent"><ul id="BQ2hYOj3Wtck" class="TA_links o4wXV4224E9g"><li id="9DlPxQiCeG" class="E0awXdUUFgW"><a target="_blank" href=http://www.tripadvisor.com/Hotel_Review-g60763-d1379306-Reviews-Hilton_Club_New_York-New_York_City_New_York.html>Hilton Club New York</a> rated "excellent" by travelers</li></ul></div>',
			maxWidth:50,
			disableAutoPan:true
		});
        
		hotel.infowindowSV.closeEvent = google.maps.event.addListener(hotel.infowindowSV, 'closeclick', function(event) {
		    hotel.infowindowSV.opened = false;
		}.bind(this));

		// Add mouse event listeners for the Marker
		hotel.mouseoutEventSV = null;
		hotel.mouseoverEventSV = google.maps.event.addListener(marker, 'mouseover', function(event) {
			//Log.info("mouseover panorama");
		    this.openInfoWindowSV(marker, hotel.infowindowSV);  
			hotel.mouseoutEventSV = google.maps.event.addListener(marker, 'mouseout', function(event) {
			    if(!hotel.infowindowSV.opened) hotel.infowindowSV.close(); 
				//google.maps.event.removeListener(hotel.mouseoutEventSV); 
			}.bind(this));
		}.bind(this)); 
		hotel.clickEventSV = google.maps.event.addListener(marker, 'click', function(event) {
			hotel.infowindowSV.opened = true;
			this.setCurrentLocation(event.latLng);
			google.maps.event.removeListener(hotel.mouseoutEvent);
			this.setPanoramaPosition(event.latLng);
			this.jumpToHotel(hotel);  
			this.openInfoWindowSV(marker, hotel.infowindowSV);   
			this.resetPlacesMarkers();
            
			this.trackEvent('Hotel', 'NavigateByStreetview', hotel.get("data-locationid")+" : "+hotel.get("data-name"), 1);
		}.bind(this));

	},
	setHotelMarkers: function(hotels) { 
		/*
		* 	@description:
		*		Add a Marker for each hotel
		*		WARNING: This exceeds the .geocode() method QUOTA
		*	@arguments:
		*		Hotels[ElementCollection]
		*/ 
		//Log.info("setHotelMarkers");
		
		this.createHotelMarkerColors();
		var counter = 500, delay, geo, latLng, dataLatLng, savedLatLng;
		hotels.each(function(hotel, index) {
			                                    
			// If we haven't stored locally the hotel LatLng, then attempt to store it...
			if(!hotel.retrieve("geolocation")) {
				savedLatLng = this.saveLatLngToHotel(hotel);
			}
			
			geo = hotel.retrieve("geolocation");
			error = hotel.retrieve("geolocation:error");

			// Only attempt to get a gelocation if we haven't already tried and failed
			if((geo == null || geo == "None") && error != google.maps.GeocoderStatus.ZERO_RESULTS) {
				delay = counter+=500;              
				this.getGeocodeByAddress.delay(delay, this, [hotel, this.addHotelMarker.bind(this)]);
			} else {
				//Log.info("setHotelMarkers() : retrieved gelocation for Hotel : "+hotel.get("data-name")+" : "+geo);
				// If the hotel does not have a bookmark in place
				if(hotel.bookmark == null) {
					this.addHotelMarker(hotel, geo);
				}
				
				//Log.info("setHotelMarkers");
				/*
				*	[ST]: Add a custom overlay for Trip Advisor badges
				*/
				//if(RIA.currentDestination == "newyork") {
					this.createTripAdvisorOverlay(hotel);
				//}
				
				
				
			}
			
		},this);
		    
		//this.setMapBounds();
		//this.setMapZoom(10);
	},
	addHotelMarker: function(hotel, latLng) {
		/*
		*	@description:
		*		Sets a Marker for a Hotel. Not solicited by the User
		*	@arguments:
		*		hotel[Element]
		*		latLng[Object(LatLng)]
		*/       
		var icon, LMLocationId = hotel.get("data-locationid");
		
		
		// If the Hotel does not already have a bookmarker Marker or a hotel marker
		if(hotel.bookmark == null && hotel.hotelMarker == null && RIA.hotelMarkers[LMLocationId] == undefined) {
			//Log.info("Setting hotelMarker for Hotel "+hotel.get("data-name"));
			
			RIA.hotelMarkers[LMLocationId] = hotel;
			
			icon = RIA.MarkerIcons.hotel.replace("@LETTER@",hotel.get("data-counter"));
			icon = icon.replace("@COLOR@", hotel.hotelMarkerColor);
			
			hotel.hotelMarker = new google.maps.Marker({
	            map:RIA.map,
				icon:new google.maps.MarkerImage(icon),
				position: latLng,
				draggable:false,
				title:hotel.get("data-name"),
				animation:google.maps.Animation.DROP,
				cursor:'pointer',
				clickable:true,
				zIndex:1,
				shadow:new google.maps.MarkerImage(RIA.MarkerIcons.shadowHotel, new google.maps.Size(37, 37), new google.maps.Point(0,0), new google.maps.Point(12,37))
			}); 
	
			hotel.hotelMarkerSV = new google.maps.Marker({
	            map:RIA.panorama,
				icon:new google.maps.MarkerImage(icon),
				position: latLng,
				draggable:false,
				title:hotel.get("data-name"),
				animation:google.maps.Animation.DROP,
				clickable:false,
				zIndex:1
	        });
            
			

			this.createInfoWindow(hotel, hotel.hotelMarker);
			this.createInfoWindowPanorama(hotel, hotel.hotelMarkerSV);
		} else {
			Log.info("Do we already have a hotelMarker or a bookmark for "+hotel.get("data-name")+" ?");
		}	
	},
	removeAllMarkers: function() {
		Object.each(RIA.hotelMarkers, function(value, key) {
			// Remove the Map marker
			this.removeMarker(value.hotelMarker);
			// Remove the Streetview Panorama marker
			this.removeMarker(value.hotelMarkerSV);
		},this);
		
		Object.each(RIA.bookmarks, function(value, key) {
			// Remove any bookmarks
			this.removeMarker(value.bookmark); 			
			this.removeMarker(value.bookmarkSV); 
		},this);
	},
	removeMarker: function(marker) {
		if(marker) {
			marker.setMap(null);
		}
	}, 
	setBookmarkMarkers: function(hotels) {
		var counter = 500, delay, geo;
		hotels.each(function(hotel, index) {   
			if(this.options.bookmarks.contains(hotel.get("data-locationid"))) { 
				geo = hotel.retrieve("geolocation");
				if(geo == null) {  
					delay = counter+=500;              
					this.getGeocodeByAddress.delay(delay, this, [hotel, this.addBookmarkMarker.bind(this)]);
				} else { 
					Log.info("setBookmarkMarkers() : retrieved gelocation for Hotel");
					this.dropBookmarkPin(hotel);
				}
				
				if(RIA.hotelMarkers[hotel.get("data-locationid")] != undefined) {
					// If the Hotel Marker instance has a hotelMarker MapMarker Object, then remove it
					if(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarker != null) {    
						this.removeMarker(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarker);						
					}
					// If the Hotel Marker instance has a hotelMarkerSV MapMarker Object, then remove it                                                                                     
					if(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarkerSV != null) {
						this.removeMarker(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarkerSV);
					}						
				}   	
			}
		},this);
	},  
	removeBookmarkMarkers: function() {
		Object.each(RIA.bookmarks, function(value, key) {
			this.removeMarker(value.bookmark);
		},this);
	},
	addBookmarkMarker: function(hotel, latLng) {
		// Create a new Marker     
		this.dropBookmarkPin(hotel);
	},
	getGeocodeByAddress: function(hotel, callback) {
		/*
		* 	@description:
		*		Make a Geocode Request sending an address.
		*		Return the response
		*	@arguments:
		*		Address[String]
		*/  
		
        var address = hotel.get("data-address");

		RIA.geocoder.geocode({ 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {             
				var latLng = results[0].geometry.location; 
				                        
				//this.storeGeocodeByHotel(hotel, results[0]);
				Log.info("Geocode store service disabled");
				
				// Store the LatLng against the Hotel Element
				hotel.store("geolocation", latLng);
				if(callback) {
					callback(hotel, latLng);
				}					
			} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
		        //Log.info("No Geocode results found for "+address); 
				hotel.store("geolocation:error", status);
				this.notGotGeolocation(hotel);
			} else {
				//Log.info("Geocode was not successful for "+address+", for the following reason: status: " + status); 
				hotel.store("geolocation:error", status);
				this.notGotGeolocation(hotel);
			}                      
		}.bind(this));
		
	},
	animateMarker: function(marker, animation) {
		/*
		* 	@description:
		*		Animate a Map Marker instance		
		*/
		if(marker) {
			marker.setAnimation(animation);
		}
	},
	openInfoWindow: function(marker,infowindow) {
		/*
		* 	@description:
		*		Open an InfoWindow instance
		*/  
		// Only show the InfoWindow if we are maximized state
		if(this.mapCanvas.retrieve("view:state") == "map") {
			infowindow.open(RIA.map,marker);
		}
	},
	openInfoWindowSV: function(marker,infowindow) {
		/*
		* 	@description:
		*		Open an InfoWindow instance
		*/  
		infowindow.open(RIA.panorama,marker);
	},
	setCurrentLocation: function(latLng) {
		RIA.currentLocation = latLng;
	},
	getHeading: function(latLng1, latLng2) {
		var path = [latLng1, latLng2], heading = google.maps.geometry.spherical.computeHeading(path[0], path[1]);
	    return heading;
	},
	createHotelMarkerColors: function() { 
		this.hotelsByPriceRange = new Array();
		this.hotelCollection.each(function(hotel, index) {
			hotel.priceData = parseFloat(hotel.get("data-price").substring(1)); 
			this.hotelsByPriceRange.include(hotel);
		},this);


		this.hotelsByPriceRange = this.hotelsByPriceRange.sort(this.sortByPrice.bind(this));
		
		this.gradientArray = new Array();
		                                                                                                                                 
		var hotelCount = Math.ceil(this.hotelCollection.length/2);
		for (var i = 0,l=this.options.spectrum.length-1; i < l; i++) {
			this.gradientArray = this.gradientArray.concat(this.generateGradient(this.options.spectrum[i], this.options.spectrum[i + 1], hotelCount));			
		}

		this.hotelsByPriceRange.each(function(hotel, index) {			
			hotel.hotelMarkerColor = this.gradientArray[index].toUpperCase();
		},this);
	},
	sortByPrice: function(a,b) {        
		return a.priceData - b.priceData; 
	}, 
	addPanoramioPhotos: function(e) {
		if(e && e.target) {
			if(e.target.checked) {
				RIA.panoramioLayer.setMap(RIA.map);
			} else {
				RIA.panoramioLayer.setMap(null);
			}
		}		
	},
	storeGeocodeByHotel: function(hotel, geocodeResults) {
		var latLng = geocodeResults.geometry.location, hotelLocationid = hotel.get("data-locationid"), countrycode = "", countryname = "";
		
		// Extract Country code and country name
		Array.each(geocodeResults.address_components, function(addressComponent) {
			if(addressComponent.types && addressComponent.types.length > 0 && addressComponent.types.contains("country")) {
				countrycode = addressComponent.short_name||"";
				countryname = addressComponent.long_name||"";
			}
		},this);
		
		this.requestGeocodePost = new Request({
			method:"POST",
			url:this.options.geocodeURL,
			data:'locationid='+hotelLocationid+'&destination='+RIA.currentDestination+'&lat='+latLng.lat()+'&lng='+latLng.lng()+"&countrycode="+countrycode+"&countryname="+countryname,
			onRequest: function(e) {
				//Log.info("storeGeocodeByHotel : onRequest");
			},
			onSuccess: function(a, b) {
				//Log.info("storeGeocodeByHotel : onSuccess");
			},
			onFailure: function(e) {
				Log.info("storeGeocodeByHotel : onFailure");
			}
		}).send();
	},
	saveLatLngToHotel: function(hotel) {
		if(hotel.get("data-latlng") && hotel.get("data-latlng") != "None") {
			dataLatLng = hotel.get("data-latlng").split(",");
			latLng = new google.maps.LatLng(dataLatLng[0], dataLatLng[1]);
			hotel.store("geolocation", latLng);
			//Log.info("Successfully saved LatLng against hotel");
			return true;
		} else {
			return false;
		}		
	},
	getCurrentUserPosition: function() {
		var latLng;
		if(navigator.geolocation) {
			latLng = navigator.geolocation.getCurrentPosition(this.setCurrentPosition.bind(this), this.currentPositionFailure.bind(this), this.options.userLocationOptions);
			return latLng;
		}		
	},
	setCurrentUserPosition: function(position) {
		var userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        this.setMapPositionPan(userPosition);
		this.setPanoramaPosition(userPosition);
	},
    currentUserPositionFailure: function(PositionError) {

		this.cancelUserWatchPosition();

		switch(PositionError.code) // Returns 0-3
		{
			case 0:
				// Unknown error
				Log.error({method:"RIA.Class.GeoLocation : currentPositionFailure()", e:PositionError});
				break;
			case 1:
				// Permission denied
				Log.error({method:"RIA.Class.GeoLocation : currentPositionFailure()", e:PositionError});
				break;				
			case 2:
				// Position unavailable
				Log.error({method:"RIA.Class.GeoLocation : currentPositionFailure()", e:PositionError});
				break;
			case 3:
				// Timeout
				Log.error({method:"RIA.Class.GeoLocation : currentPositionFailure()", e:PositionError});
				break;
		}
	},
	watchUserPosition: function() {              
		if(navigator.geolocation) {
			this.watchUserPos = navigator.geolocation.watchPosition(this.setCurrentUserPosition.bind(this), this.currentUserPositionFailure.bind(this), this.options.userLocationOptions);
		}		
	},
	cancelUserWatchPosition: function() {
		if(navigator.geolocation) {
			navigator.geolocation.clearWatch(this.watchPos);
		}
	},
	setMapBounds: function() {
		var hotelLatLngList = new Array(), bounds;
		
		if(this.hotelCollection) {
			this.hotelCollection.each(function(hotel) {
				if(hotel.get("data-latlng")) {
					var latlng = hotel.get("data-latlng").split(",");
					hotelLatLngList.push(new google.maps.LatLng(latlng[0], latlng[1]));					
				}
			},this);

			//  Create a new viewpoint bound
			bounds = new google.maps.LatLngBounds();
			//  Go through each...
			for (var i = 0, LtLgLen = hotelLatLngList.length; i < LtLgLen; i++) {
			  	//  And increase the bounds to take this point
				bounds.extend(hotelLatLngList[i]);
			}
			//  Fit these bounds to the map
			RIA.map.fitBounds(bounds);
			
			this.setMapPositionCenter(bounds.getCenter());
			
		}

	},
	createTripAdvisorOverlay: function(hotel) {
		var data = '<div class="trip-advisor">';
		data += hotel.getElement(".info-window").innerHTML;
		data += '<div id="TA_excellent746" class="TA_excellent"><div id="CDSWIDEXC" class="widEXC"> <a target="_blank" href="http://www.tripadvisor.com/Hotel_Review-g60763-d1379306-Reviews-Hilton_Club_New_York-New_York_City_New_York.html"><img class="widEXCIMG" id="CDSWIDEXCIMG" src="http://www.tripadvisor.com/img/cdsi/img2/badges/excellent_en-11863-1.gif" alt="Hilton Club New York, New York City, New York"></a><br> <div id="CDSWIDEXCLINK" class="widEXCLINK"> <a target="_blank" href="http://www.tripadvisor.com/Hotel_Review-g60763-d1379306-Reviews-Hilton_Club_New_York-New_York_City_New_York.html">'+hotel.get("data-name")+'</a> rated "excellent" by 243 travelers<br> </div> <div> <img class="widEXCIMG" id="CDSWIDEXCLOGO" src="http://c1.tacdn.com/img2/widget/tripadvisor_logo_100x25.gif"> </div> </div></div>'
		hotel.TripAdvisor = new TripAdvisorOverlay(hotel.retrieve("geolocation"), data, RIA.panorama);
	},
	removeAllTripAdvisorOverlays: function() {
		
		if(this.hotelCollection) {
			this.hotelCollection.each(function(hotel) {
				//Log.info("removing from dom")
				//Log.info(hotel.TripAdvisor)
				if(hotel.TripAdvisor) hotel.TripAdvisor.removeFromDOM();
			},this);
		}
	}
});
RIA.Experience = new Class({
	Implements:[Options, RIA.Utils, RIA.MapStreetView, RIA.GooglePlaces],
	options:{
		contenttype:"maximized",
		ios:false,
		tweetBox: false
	},
	initialize: function(options) {
		this.setOptions(options);
        
		RIA.places = new Object();
		                 
		this._form = document.id("search");
		
		this.header = document.id("main");

		this.toggleContent = document.id("toggle-content"); 
		this.togglePlaces = document.id("toggle-places");
		this.toggleGuardian = document.id("toggle-guardian");
		
		this.content = document.id("content");
		this.destination = document.id("destination");
		this.numberOfNights = document.id("nights");
		this.arrivalDate = document.id("arrival_date");
		
		this.weather = document.id("weather");
		this.guardian = document.id("guardian");
		this.guardian.store("viewstate", "closed");
		
		this.twitterNews = document.id("twitter-news");
		
		this.save = document.id("save");
		this.share = document.id("share");
		this.shareDialog = document.id("share-dialog");
		this.shareDialog.store("viewstate", "closed");
		this.toggleShareDialog = document.id("toggle-share-dialog");
		this.toggleTripAdvisor = document.id("toggle-trip-advisor");
		/*
		*	Create default dialog
		*/
		if(twttr != "undefined") {
			twttr.anywhere(function (T) {
		    	this.tweetBox = T("#share-dialog-content").tweetBox({
					label:"Share saved Hotels with friends",
		      		height: 100,
		      		width: 400,
		      		defaultContent: "My hotels @RazorfishHotels"
		    	});
		  	}.bind(this));
		}
		
	
		this.places = document.id("places");
		this.places.store("viewstate", "closed");
		   
		this.placesDistanceRange = document.id("places-distance-range");
		this.placesDistanceOutput = document.id("places-distance-output");
		
		this.filters = document.id("filters");
		
		this.hotels = document.id("hotels"); 
		this.hotelsNav = document.id("hotel-list");
		this.priceGuide = document.id("price-guide");
				           
		if(this.hotels) {
	        this.hotels.getElement(".results").set("morph", {
				duration:400,
				link:"ignore"
			});
		}
		
		this.mapCanvas = document.id("map_canvas");
		this.mapCanvas.store("styles:orig", this.mapCanvas.getCoordinates());
		this.mapCanvas.store("styles:maximized", {width:"100%", height:"100%"});
		this.mapCanvas.store("view:state", this.options.maptype);
		
		this.mapStreetview = document.id("pano");                
		this.mapStreetview.store("styles:orig", this.mapStreetview.getCoordinates());
		this.mapStreetview.store("styles:maximized", {width:"100%", height:"100%"});
		
		this.onWindowResize();
		this.addEventListeners();  
		
		this.toggleInformation(null);
	},                          
	addEventListeners: function() {
		
		/*
		if(this.header) {
			this.header.addEvents({
				"mouseenter": function(e) {
					this.header.setStyles({
						height:'162px'
					});
					this._form.setStyle('display','block');
					var social = document.getElementById("social");
					if(social) {
						social.setStyle("display", "block");
					}
				}.bind(this),
				"mouseleave": function(e) {
					this.header.setStyles({
						height:'73px'
					});
					this._form.setStyle('display','none');
					var social = document.getElementById("social");
					if(social) {
						social.setStyle("display", "none");
					}
				}.bind(this)
			});
		}
		*/
		if(document.id("ratingSort")) {
			document.id("ratingSort").addEvents({
				"change":this.sortEvent.bind(this)
			});
		}
		
		if(document.id("priceSort")) {
			document.id("priceSort").addEvents({
				"change":this.sortEvent.bind(this)
			});
		}
		
		window.addEvents({
			"resize": this.onWindowResize.bind(this)
		});

		if(document.id("map-controls")) {
			document.id("map-controls").addEvents({
				"click":this.toggleMapFullScreen.bind(this)
			});			
		}
                                            
		if(this.toggleContent) {
			this.toggleContent.addEvents({
				"click":this.toggleInformation.bind(this) 
			});			
		}
		 
		if(this.togglePlaces) {
			this.togglePlaces.addEvents({
				"click":this.showPlaces.bind(this) 
			});
		}    
		
		if(this.toggleGuardian) {
			this.toggleGuardian.addEvents({
				"click":this.showGuardian.bind(this) 
			});
		}
		
		if(this.toggleShareDialog) {
			this.toggleShareDialog.addEvents({
				"click":this.showShareDialog.bind(this) 
			});
		}

		if(this.toggleTripAdvisor) {
			this.toggleTripAdvisor.addEvents({
				"click":this.toggleTripAdvisorOverlay.bind(this) 
			});
		}
		
		if(document.id("news")) {
			document.id("news").addEvents({
				"click":this.showGuardian.bind(this) 
			});
		}
		
		if(document.id("nearby")) {
			document.id("nearby").addEvents({
				"click":this.showPlaces.bind(this)
			});
		}
		if(this.share) {
			
			this.share.addEvents({
				"click":this.shareMyBookmarks.bind(this)
			});

		
		}    
		
		if(this.guardian) {
			this.guardianDrag = new Drag(this.guardian, {
				handle:this.guardian.getElement("h2"),
			    snap: 0,
			    onSnap: function(el){
			        el.addClass('dragging');
			    },
			    onComplete: function(el){
			        el.removeClass('dragging');
			    }
			});
		}
		
		if(this.shareDialog) {
			this.shareDialogDrag = new Drag(this.shareDialog, {
				handle:this.shareDialog,
			    snap: 0,
			    onSnap: function(el){
			        el.addClass('dragging');
			    },
			    onComplete: function(el){
			        el.removeClass('dragging');
			    }
			});
		}
		
		if(this.places) {
			this.places.addEvents({
				"click": function(e) {
					var target = e.target, places = target.get("value");
                    if(places && places != "") {
						if(target.checked) {
	                		this.requestPlaces(RIA.currentLocation, this.options.places.searchRadius, places, null);
						}
						else {            
							this.removePlacesMarkers(places);
							if(target.getNext("label")) {
								target.getNext("label").set("text", target.getNext("label").get("data-text"));
							}	
						}
					}  
					
					else if(target.id == "photos") {
						this.addPanoramioPhotos(e);
					}
					
				}.bind(this)
			}); 
			
			this.placesDrag = new Drag(this.places, {
				handle:this.places.getElement("h2"),
			    snap: 0,
			    onSnap: function(el){
			        el.addClass('dragging');
			    },
			    onComplete: function(el){
			        el.removeClass('dragging');
			    }
			});
			
		} 
		
		if(this.placesDistanceRange) {
			this.placesDistanceRange.addEvents({
				"change": function(e) {
					var newDistance = e.target.get("value");
					this.placesDistanceOutput.set("text", (this.options.places.searchRadius == 1000 ? "1K" : newDistance)+"m");
				}.bind(this),
				"mouseup": function(e) {
					var newDistance = e.target.get("value");
					if(this.options.places.searchRadius !== newDistance) {
						this.options.places.searchRadius = e.target.get("value");
						this.placesDistanceOutput.set("text", (this.options.places.searchRadius == 1000 ? "1K" : this.options.places.searchRadius)+"m");
						this.resetPlacesMarkers(true);
					}					
				}.bind(this)
			});
		}
	},
	addHotelNavEventListeners: function() {
		//Log.info("addHotelNavEventListeners")
		this.hotelNavigationBind = this.hotelNavigation.bind(this)
		
		this.dropBookmarkPinBind = this.dropBookmarkPin.bind(this);

		this.save.addEvents({
			"click":this.dropBookmarkPinBind
		});
		
		document.getElements(".previous, .next").each(function(link) {
			link.addEvents({
				"click":this.hotelNavigationBind 
			});
		},this);

		
		document.body.addEvents({
			"keyup":this.hotelNavigationBind 
		});
		

	},
	removeHotelNavEventListeners: function() {
		//Log.info("removeHotelNavEventListeners")

		document.getElements(".previous, .next").each(function(link) {
			link.removeEvents({
				"click":this.hotelNavigationBind 
			});
		},this);

		this.save.removeEvents({
			"click":this.dropBookmarkPinBind
		});
		
	},      
	fbDialogSend: function() {
		FB.ui({
			app_id:RIA.fbAppId,
			access_token:RIA.fbAccessToken,
			method: 'send',
			display:'iframe',
          	name: 'Your saved Hotels',
			link: RIA.shareURL
		});
	},
	hotelNavigation: function(e) { 

		if((e.type == "keyup" && (e.key == "left" || e.key == "right")) || e.type == "click") {
			e.preventDefault();                                       
			var hotelWidth, resultMarginLeft, ready = true;
		
			resultMarginLeft = this.hotels.getElement(".results").getStyle("marginLeft");
			
			if(e.key == "left" || (e.type == "click" && e.target.hasClass("previous"))) {
				if(resultMarginLeft.toInt() >= 0) {
					resultMarginLeft = 0;
					ready = false;						
				} else {
					
					this.hotelCollection[this.hotelIndex].TripAdvisor.hide();
					
					this.hotelIndex--;
					resultMarginLeft = resultMarginLeft.toInt()+this.hotelWidth;
				} 
				
			} 
			else if (e.key == "right" || (e.type == "click" && e.target.hasClass("next"))) {
				var totalMarginLeft = -1*(this.totalLength-this.hotelWidth);
				if(resultMarginLeft.toInt() <= totalMarginLeft) {
					resultMarginLeft = totalMarginLeft;
					ready = false;
				} else {
					this.hotelCollection[this.hotelIndex].TripAdvisor.hide();
					
					this.hotelIndex++;
					resultMarginLeft = resultMarginLeft.toInt()-hotelWidth;                                                           						
				}
				              
			}
			
			if(ready) {
				document.getElements(".hotel-name").set("text", this.hotelCollection[this.hotelIndex].get("data-name"));
				
				this.jumpToHotel(this.hotelCollection[this.hotelIndex]);      
				this.setStreetview(this.hotelCollection[this.hotelIndex]);
				
				// Track the Hotel View Event
				this.trackEvent('Hotel', 'NavigateByArrow', this.hotelCollection[this.hotelIndex].get("data-locationid")+" : "+this.hotelCollection[this.hotelIndex].get("data-name"), 1);
			}


		}
	},
	setCurrentHotel: function(hotel) {
		var hotelCounter = hotel.get("data-counter"),
		hotelIndex = hotelCounter-1, 
		resultMarginLeft = -1*(hotelCounter*this.hotelWidth)+this.hotelWidth;
		
		if(this.hotelsNav) {
			this.hotelsNav.getElements("a").removeClass("active");
			this.hotelsNav.getElements("a")[hotelIndex].addClass("active");
		}
		this.hotelIndex = hotelIndex; 
		return {index:this.hotelIndex, marginLeft:resultMarginLeft};
	},
	animateToHotel: function(hotel) {
		var hotelResults = this.setCurrentHotel(hotel);
		this.hotels.getElement(".results").morph({"marginLeft":hotelResults.marginLeft+"px"});		
	},
	jumpToHotel: function(hotel) {
		var hotelResults = this.setCurrentHotel(hotel);
		this.hotels.getElement(".results").setStyles({"marginLeft":hotelResults.marginLeft+"px"});
	},
	getHotels: function() {
		this.removeAllTripAdvisorOverlays();
		if(this.hotelsNav) {
			this.hotelsNav.getElement(".results").empty();
		}
		if(document.id("price-guide")) document.id("price-guide").addClass("hide");
		this.removeAllMarkers(); 
		this.removeAllPlacesMarkers();
		this.removeHotelNavEventListeners();
		this.hotels.getElement(".results").empty();
		this.hotels.getElement(".results").setStyles({"width":"100%", "margin-left":"0px"});
	},
	gotHotels: function(destination) {    
		/*
		* 	Callback from AjaxSubmit successful get of hotel data
		*/
		
		// reset the hotel index, so we are in first hotel position
		this.hotelIndex = 0;
		this.hotelCollection = this.hotels.getElements(".hotel");
		
		this.hotels.removeClass("waiting");
		
		RIA.bookmarks = new Object();                                         
		
		RIA.hotelMarkers = new Object();
		
		if(this.hotelCollection.length > 0) {
			
			document.getElements(".hotel-name").set("text", this.hotelCollection[this.hotelIndex].get("data-name"));
			
			RIA.currentDestination = this.hotelCollection[this.hotelIndex].get("data-destination");
			//Log.info("RIA.currentDestination is now "+RIA.currentDestination);
					
			
			if(!this.hotels.hasClass("grid")) {
				this.hotelWidth = this.hotels.getElements(".hotel")[0].getCoordinates().width;
				this.totalLength = (this.hotelCollection.length*this.hotelWidth);
				this.hotels.getElement(".results").setStyles({"width":this.totalLength+"px"});
			}
			
			
			
			if(this.options.bookmarks != null && this.options.bookmarks.length) {
				this.setBookmarkMarkers(this.hotelCollection);
			}
            
			this.setHotelMarkers(this.hotelCollection);   
			
			this.setStreetview(this.hotelCollection[this.hotelIndex]);
			
			if(this.hotelsNav) this.createHotelNav();                                                                               
			
			this.addHotelNavEventListeners();
			
			// Track the initial hotel view
			this.trackEvent('Hotel', 'NavigateByArrow', this.hotelCollection[this.hotelIndex].get("data-locationid")+" : "+this.hotelCollection[this.hotelIndex].get("data-name"), 1);

		} else {
			Log.error({method:"gotHotels()", error:{message:"No Hotels returned"}});
		}   
		
	}, 
	createHotelNav: function() {
		this.hotelCollection.each(function(hotel, index) {
			this.hotelsNav.getElement(".results").adopt(new Element("a", {
				"href":"#",
				"text":(index+1),
				"class":(index == 0 ? "active" : ""),
				"title":hotel.get("data-name")+" : "+hotel.get("data-price"),
				/*"styles":{
					"backgroundColor":"#"+hotel.hotelMarkerColor
				},*/
				"events":{
					"click": function(e) {
						e.preventDefault();
						this.hotelCollection[this.hotelIndex].TripAdvisor.hide();
						this.jumpToHotel(hotel);
						this.setStreetview(this.hotelCollection[this.hotelIndex]);
						this.trackEvent('Hotel', 'NavigateByNumberList', this.hotelCollection[this.hotelIndex].get("data-locationid")+" : "+this.hotelCollection[this.hotelIndex].get("data-name"), 1);
					}.bind(this)
				}
			}))
		},this);
		
		if(this.priceGuide) {
			/*
			this.priceGuide.getElement(".high").setStyles({
				"position":"absolute",
				"bottom":"0px",
				"left":((this.hotelCollection.length-1)*23)+"px"
			});
			
			this.priceGuide.getElement(".medium").setStyles({
				"position":"absolute",
				"bottom":"0px",
				"left":(((this.hotelCollection.length/2)-1)*23)+"px"
			});
			
			this.priceGuide.getElement(".low").setStyles({
				"position":"absolute",
				"bottom":"0px",
				"left":"0px"
			});
			*/
			this.priceGuide.removeClass("hide");
		}
	},
	onWindowResize: function(e) {
		this.viewport = window.getSize(); 
		if(RIA.map) google.maps.event.trigger(RIA.map, "resize");
	},
	toggleInformation: function(e) {
		
		if(e) e.preventDefault();

		if(!e) {
			if(this.options.contenttype == "maximized") {
				if(this.toggleContent) this.toggleContent.set("text", "-");
				this.hotels.removeClass("minimized");
			}
			else {   
				if(this.toggleContent) this.toggleContent.set("text", "+");
				this.hotels.addClass("minimized");				
			}
		} else {
			if(this.hotels.hasClass("minimized")) {
				this.options.contenttype = "maximized";
				if(this.toggleContent) this.toggleContent.set("text", "-");
				this.hotels.removeClass("minimized");
			}
			else {
				this.options.contenttype = "minimized";   
				if(this.toggleContent) this.toggleContent.set("text", "+");
				this.hotels.addClass("minimized");				
			}    
		}
	},
	shareMyBookmarks: function(e) {   
		if(e && e.preventDefault) e.preventDefault();
		
		RIA.currentPriceMax = RIA.InitAjaxSubmit.price.get("value");
		                                                                       
		//priceMax="+RIA.currentPriceMax+"&
		RIA.shareURL = window.location.protocol+"//"+window.location.host+window.location.pathname+"?destination="+(RIA.currentDestination||"")+"&startDate="+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value")+"&brand="+RIA.hotelBrand+"&bookmarks=", keys = [];
		Object.each(RIA.bookmarks, function(value, key) {                
			keys.push(key);
		});    
		
		RIA.shareURL += keys.join(",");
		
		//RIA.shareURL+="&maptype="+this.options.maptype+"&contenttype="+this.options.contenttype+"&viewType="+this.options.viewType+"&fb_ref=message";
		
		//this.fbDialogSend();
		
		if(twttr) {
			this.tweetBox = null;
			document.id("share-dialog-content").empty();
			
			twttr.anywhere(function (T) {
		    	this.tweetBox = T("#share-dialog-content").tweetBox({
					label:"Share saved Hotels with friends",
		      		height: 100,
		      		width: 400,
		      		defaultContent: "My hotels @RazorfishHotels "+RIA.shareURL,
					onTweet: function(plainTextTweet, HTMLTweet) {
						Log.info("TweetBox Tweet sent");
						Log.info(plainTextTweet);
						Log.info(HTMLTweet);
					}
		    	});

		  	}.bind(this));
			this.shareDialog.setStyles({"display":"block"});
			this.shareDialog.store("viewstate", "open"); 
			
			
		}
	},
	toggleTripAdvisorOverlay: function(e) {
		if(this.hotelCollection && this.hotelCollection[this.hotelIndex] && this.hotelCollection[this.hotelIndex].TripAdvisor) {
			this.hotelCollection[this.hotelIndex].TripAdvisor.toggle();
		}
	},
	showPlaces: function(e) {
		e.preventDefault();
		if(this.places.retrieve("viewstate") == "closed") {
    		this.places.store("viewstate", "open"); 
			this.places.setStyles({"display":"block"});
		} else {   
    		this.places.store("viewstate", "closed");
			this.places.setStyles({"display":"none"}); 
		}
		
	},
	showGuardian: function(e) {
		e.preventDefault();
		if(this.guardian.retrieve("viewstate") == "closed") {
    		this.guardian.store("viewstate", "open"); 
			this.guardian.setStyles({"display":"block"});
		} else {   
    		this.guardian.store("viewstate", "closed");
			this.guardian.setStyles({"display":"none"}); 
		}
		
	},
	showShareDialog: function(e) {
		e.preventDefault();
		if(this.shareDialog.retrieve("viewstate") == "closed") {
    		this.shareDialog.store("viewstate", "open"); 
			this.shareDialog.setStyles({"display":"block"});
			this.options.tweetBox = true;
		} else {   
    		this.shareDialog.store("viewstate", "closed");
			this.shareDialog.setStyles({"display":"none"}); 
			this.options.tweetBox = false;
		}
	},
	sortEvent: function(e) {
		try { 
			Log.info("sortEvent");

			if(e) e.preventDefault();
		    
			RIA.InitAjaxSubmit._submit();
		} catch(e) {
			Log.error({method:"sortEvent()", error:e});
		}
		
	},
	sortByRatingHighLow: function(a, b){
		return b.get("data-rating") - a.get("data-rating");
	},
	sortByRatingLowHigh: function(a, b){
		return a.get("data-rating") - b.get("data-rating");
	},
	findHotelsNearMe: function() {
		
		
				   
					
	}
});
RIA.AjaxSubmit = new Class({
	Implements:[Options, RIA.GoogleAnalyticsHelper],
	options:{
        servicePath:null,
		hotelBrand:null
	},
	initialize: function(options) {
		this.setOptions(options);
		this.content = document.id("content");
		this.ajaxForm = document.id("search");
		this.destination = document.id("destination");
		this.price = document.id("priceMax");
		this.arrivalDate = document.id("arrival_date");
		this.numberOfNights = document.id("nights");
		RIA.currentPriceMax = this.price.get("value");
		
		this.priceSort = document.id("priceSort");
		this.ratingSort = document.id("ratingSort");
		
		//Log.info("RIA.AjaxSubmit : RIA.currentPriceMax: "+RIA.currentPriceMax);
		
		this.flights = document.id("flights");
		this.hotels = document.id("hotels");
		this.cityBreak = document.id("city-break");
        this.information = document.id("info");
		this.weather = document.id("weather");
		this.guardian = document.id("guardian");
		this.requests = [];
		 
		this.loading = document.id("loading");
		this.addEventListeners(); 
		 
		
	},
	_submit: function() {
		this.ajaxForm.fireEvent("submit");
	},
	addEventListeners: function() {
		this.ajaxForm.addEvents({
			"submit": this.validateSearch.bind(this)
		});
		
		/*
		this.destination.addEvents({
			"focus":function(e) {
				if(this.get("value") == this.get("data-default")) {
					this.set("value", "");
				}
			},
			"blur": function(e) {
				if(this.get("value") == "") {
					this.set("value", this.get("data-default"));
				}
			}
		});
		
		this.arrivalDate.addEvents({
			"focus":function(e) {
				if(this.get("value") == this.get("data-default")) {
					this.set("value", "");
				}
			},
			"blur": function(e) {
				if(this.get("value") == "") {
					this.set("value", this.get("data-default"));
				}
			}
		});
		*/
	},
	validateSearch: function(e) {
		if(e) e.preventDefault();
		
		this.ajaxForm.getElements("input").each(function(element) {
			element.removeClass("error");
		},this);
		
		var validSearch = true, isValidArrivalDate = false, dateParsed;
		
		this.ajaxForm.getElements("input").each(function(element) {
			if(element.get("data-required") == "true" && element.get("value") == "") {
				element.addClass("error");
				validSearch = false;
			}
		},this);
		
		if(validSearch) {
			this.requestData();
			this.updateDestinationName(this.destination.get("value"));			
		} else {
			Log.info("Search Form user input data validation error");			
		}
		
	},
	requestData: function() {
		/*
		* 	@description:
		*		Request INDIVIDUAL updates to content buckets
		*/ 
		var destination = this.destination.get("value");                           
		
		if(typeof(twitterSearch) != "undefined") {
			twitterSearch.stop();         
			twitterSearch.search = destination+" hotels OR restaurants since:2011-07-16 :)";
			twitterSearch.subject = destination;
			twitterSearch.render().start();
		}
		
		/*
		* 	Cancel any running requests
		*/  
		Array.each(this.requests, function(request) {
			if(request.isRunning()) { 
				Log.info(request);
				request.cancel();
			}
		}, this);
		this.requests.length = 0;
		
		if(this.weather) {
			this.requestInfo = new Request.HTML({
				method:"POST",
				url:"/ajax",
				update:this.weather.getElement(".results"),
				data:'destination='+destination+'&info_type=weather',
				onRequest: this.requestStart.pass([this.weather],this),
				onSuccess: this.requestSuccessInfo.pass([this.weather],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestInfo);     
		}
		
		
		if(this.guardian) {
		   	this.requestGuardian = new Request.HTML({
				method:"POST",
				url:"/ajax",
				update:this.guardian.getElement(".results"),
				data:'destination='+destination+'&info_type=guardian',
				onRequest: function() {
					this.guardian.getElement(".results").empty();
				}.bind(this),
				onSuccess: this.requestSuccessInfo.bind(this),
				onFailure: this.requestFailure.bind(this)
			});   
			this.requests.include(this.requestGuardian);  
		}
		
		
		if(RIA.InitExperience.options.brand != "" && RIA.InitExperience.options.brand == "lastminute") {
			/*
			this.requestHotels = new Request.HTML({
				method:"POST",
				url:this.options.servicePath,
				evalScripts:false,
				update:this.hotels.getElement(".results"),
				data:'destination='+destination+'&priceMax='+this.price.get("value")+'&info_type=hotels&startDate='+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value"),
				onRequest: this.requestStart.pass([this.hotels],this),
				onSuccess: this.requestSuccess.pass([this.hotels, destination],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestHotels); 			
			*/
			
			this.requestHotels = new Request.HTML({
				method:"POST",
				url:this.options.servicePath,
				evalScripts:false,
				update:this.hotels.getElement(".results"),
				data:'city='+destination+'&arrivalDate='+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value")+"&priceMax="+this.price.get("value")+"&priceSort="+this.priceSort.get("value")+"&ratingSort="+this.ratingSort.get("value")+(this.options.hotelBrand != null ? "&brand="+this.options.hotelBrand : ""),
				onRequest: this.requestStart.pass([this.hotels],this),
				onSuccess: this.requestSuccess.pass([this.hotels, destination],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestHotels);
		}
		else if(RIA.InitExperience.options.brand != "" && RIA.InitExperience.options.brand == "expedia") {
			this.requestHotels = new Request.HTML({
				method:"POST",
				url:this.options.servicePath,
				evalScripts:false,
				update:this.hotels.getElement(".results"),
				data:'city='+destination+'&arrivalDate='+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value"),
				onRequest: this.requestStart.pass([this.hotels],this),
				onSuccess: this.requestSuccess.pass([this.hotels, destination],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestHotels);
		}
		else if(RIA.InitExperience.options.brand != "" && RIA.InitExperience.options.brand == "razorfish") {
			this.requestHotels = new Request.HTML({
				method:"POST",
				url:this.options.servicePath,
				evalScripts:false,
				update:this.hotels.getElement(".results"),
				data:'city='+destination+'&arrivalDate='+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value")+"&priceMax="+this.price.get("value")+"&priceSort="+this.priceSort.get("value")+"&ratingSort="+this.ratingSort.get("value")+(this.options.hotelBrand != null ? "&brand="+this.options.hotelBrand : ""),
				onRequest: this.requestStart.pass([this.hotels],this),
				onSuccess: this.requestSuccess.pass([this.hotels, destination],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestHotels);
		}
		

		this.trackEvent('Hotel', 'Search', destination+", "+this.arrivalDate.get("value")+", "+this.numberOfNights.get("value"), 1);	
		
		/*
		this.requestFlights = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.flights.getElement(".results"),
			data:'destination='+destination+'&info_type=flights',
			onRequest: this.requestStart.pass([this.flights],this),
			onSuccess: this.requestSuccess.pass([this.flights],this),
			onFailure: this.requestFailure.bind(this)
		});        
		this.requests.include(this.requestFlights); 
		*/ 
		/*
		this.requestCityBreak = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.cityBreak.getElement(".results"),
			data:'destination='+destination+'&info_type=city-break',
			onRequest: this.requestStart.pass([this.cityBreak],this),
			onSuccess: this.requestSuccess.pass([this.cityBreak],this),
			onFailure: this.requestFailure.bind(this)
		});		 
		this.requests.include(this.requestCityBreak);
		*/
		
	    this.requests.each(function(request) {
			request.send();
		});
	},
	requestStart: function(element) {
		if(element) {
			this.loading.setStyle("display", "block");
			if(element.get("id") == "hotels") {
				RIA.InitExperience.getHotels();
			}
			element.addClass("waiting");
			//element.getElement(".results").morph({"opacity":0});			
			element.getElement(".results").set("morph", {"opacity":0});			
		}
	},
	requestSuccess: function(element, destination) {
		if(element) {
			/*
			* 	Set up the hotels Element Collection
			*/
			this.loading.setStyle("display", "none");
			if(element.get("id") == "hotels") { 
				if(element.hasClass("hide")) element.removeClass("hide");
				RIA.InitExperience.gotHotels(destination);				     
			}
		}
	},
	requestSuccessInfo: function(responseHTML, responseText) {
		try{
			//Log.info("Received Guardian news data");
	    } catch(e) {
			Log.error({method:"requestSuccessInfo", error:e});
		}
	},
	requestFailure: function(e) {
		Log.error({method:"requestFailure", error:e});
	},
	updateDestinationName: function(name) {
		document.getElements(".destination-name").set("text", name);
	}
});
