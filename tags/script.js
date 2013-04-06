function rawbeenpdf_trim(str) {
	return str.replace (/^\s+/, '').replace (/\s+$/, '');
}

function rawbeenpdf_hasClassName(classNameStr, className) {
	var classNames = classNameStr.split(" ");
	for(var i=0; i<classNames.length; i++) {
		if(classNames[i] == className) {
			return true;
		}
	}
	return false;
}

function rawbeenpdf_find(parent, tagName, className) {
	var res = new Array();
	var nodes = parent.getElementsByTagName(tagName);
	for(var i=0; i<nodes.length; i++) {
		if(rawbeenpdf_hasClassName(nodes[i].className, className)) {
			res.push(nodes[i]);
		}
	}
	return res;
}

function rawbeenpdf_getBlogPosts() {
	var posts = rawbeenpdf_find(document.body, "div", "post");
	return posts;
}

function rawbeenpdf_getPostData(post) {
	var res;
	var obj = new Object();
	
	//title + link
	obj.link = obj.title = '';
	var h3s = post.getElementsByTagName("h3");
	if(h3s && h3s.length > 0) {
		var h3 = h3s[0];
		var as = h3.getElementsByTagName("a");
		if(as && as.length > 0) {
			var a = as[0];
			obj.link = a.href;
			obj.title = a.innerHTML;
		}
	}
	
	//body
	obj.body = "";
	res = rawbeenpdf_find(post, "div", "post-body");
	if(res.length > 0) {
		obj.body = res[0].innerHTML;
	}
		
	//by
	obj.by = "";
	res = rawbeenpdf_find(post, "span", "fn");
	if(res.length > 0) {
		obj.by = res[0].innerHTML;
	}
	return obj;
}

function rawbeenpdf_getBlogParams() {	
	var doc = document;
	var obj = new Object();
	
	//url
	obj.url = doc.location.href;
	
	//charset
	obj.charset = document.charset;
	if(!obj.charset) {
		obj.charset = document.defaultCharset;
	}
	if(!obj.charset) {
		obj.charset = "UTF-8";
	}
	
	//name
	obj.name = "";
	var h1s = rawbeenpdf_find(doc, "h1", "title");
	if(h1s.length > 0) {
		var h1 = h1s[0];
		var as = h1.getElementsByTagName("a");
		if(as && as.length > 0) {
			obj.name = rawbeenpdf_trim(as[0].innerHTML);
		} else {
			obj.name = rawbeenpdf_trim(h1.innerHTML);
		}
	}
	return obj;
}

function rawbeenpdf_htmlspecialchars(str) {
	var from=new Array(/&/g,/</g,/>/g,/"/g,/'/g);
	var to=new Array("&amp;","&lt;","&gt;","&#039;","&quot;");
	for(var i in from) str=str.replace(from[i],to[i]);
	return str;
}

function rawbeenpdf_appendHiddenField(parent, name, value) {
	var field = document.createElement("input");
	field.type = "hidden";
	field.name = name;
	field.value = value;
	parent.appendChild(field);
}

function rawbeenpdf_createFields() {
	var posts = rawbeenpdf_getBlogPosts();
	if(posts.length == 0) {
		return false;
	}
	var container = document.createElement("div");
	container.id = "rawbeenpdfContainer";
	
	rawbeenpdf_appendHiddenField(container, "blogPosts", posts.length);
	for(var i=0; i<posts.length; i++) {
		var postData = rawbeenpdf_getPostData(posts[i]);
		rawbeenpdf_appendHiddenField(container, "postTitle_" + i, postData.title);
		rawbeenpdf_appendHiddenField(container, "postLink_" + i, postData.link);
		rawbeenpdf_appendHiddenField(container, "postAuthor_" + i, "");
		rawbeenpdf_appendHiddenField(container, "postDateTime_" + i, "");
		rawbeenpdf_appendHiddenField(container, "postContent_" + i, (postData.body));
	}
	
	var blogParams = rawbeenpdf_getBlogParams();
	rawbeenpdf_appendHiddenField(container, "blogCharset", blogParams.charset);
	rawbeenpdf_appendHiddenField(container, "blogUrl", blogParams.url);
	rawbeenpdf_appendHiddenField(container, "blogName", blogParams.name);
	rawbeenpdf_appendHiddenField(container, "blogValueEncoding", "htmlSpecialChars");
	
	return container;
}
function rawbeenpdf_removeOldContainer() {
	var container = document.getElementById("rawbeenpdfContainer");
	if(container) {
		container.parentNode.removeChild(container);
	}
}
function rawbeenpdf_removeOldForm() {
	var form = document.getElementById("rawbeenpdfNewForm");
	if(form) {
		form.parentNode.removeChild(form);
	}
}
function rawbeenpdf_newForm() {
	var form = document.createElement("form");
	form.name = "rawbeenpdfForm";
	form.method = "post";
	form.target = "rawbeenpdfPopWin";
	form.action = "http://doc2pdf.pdf24.org/blogger.php";
	form.id = "rawbeenpdfNewForm";
	form.style.display = 'none';
	return form;
};
function rawbeenpdf_onSubmit(form) {
	if(form) {
		rawbeenpdf_removeOldContainer();
		var formFields = rawbeenpdf_createFields();
		if(!formFields) {
			alert("Couldn't find any articles!");
		}
		form.appendChild(formFields);
		if(document.getElementById("rawbeenpdfContainer")) {
			var popup = window.open('about:blank', 'rawbeenpdfPopWin', 'resizable=yes,scrollbars=yes,width=400,height=200,top=0,left=0');
			popup.focus();
			if(form.id) {
				form.submit();
			}
			return true;
		}
	} else {
		rawbeenpdf_removeOldForm();
		var form = rawbeenpdf_newForm();
		document.body.appendChild(form);
		var res = rawbeenpdf_onSubmit(form);
		document.body.removeChild(form);
		return res;
	}
	return false;
}