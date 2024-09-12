/*****************************************************************************
 *    きせかえシステム"siori" Ver.2.30
 *    Copyright (C)2003.5.8 by みなみせい (sei@ig.sakura.ne.jp)
 ****************************************************************************/
var celList      = new Array();
var celGroupList = new Array();
var celNameList  = new Array();
var mvcels;
var mvcelsOrgX = new Array();
var mvcelsOrgY = new Array();
var orgX;
var orgY;

var restoreFlag;
var clickct = new Array();

var snapPixel = 16;
var snapX = new Array();
var snapY = new Array();

var IDhead = "cel_";
var celsuu = 0;
var posMode;
var posNo;


/*
 *  その他の関数
 */
function getTargetCels(no)
{
	return (!celNameList[no]) ? [no] : celGroupList[celNameList[no]];
}


function parseParam(arg)
{
		var		i, wk;
		var		argList = new Array();

	wk = arg.replace(/\s/g, "").split(";");

	for (i = 0; i < wk.length; i++) {
		argList[i] = wk[i].replace(/:/, ",").split(",");
	}

	return argList;
}


/*
 *  セルのクリックとスナップの処理
 *  グループ化されたセルは、背面側の設定のみを参照
 */
function clickProc()
{
	if (0 >= clickct[mvcels[0]]) {
		restoreFlag = false;
		return;
	}

	clickct[mvcels[0]]--;

	if (15 > clickct[mvcels[0]]) {
		restoreFlag = true;
	}
	else {
		mvcels = null;
	}
}


function snapProc()
{
		var		i, x, y;

	if (isNaN(snapX[mvcels[0]]) || isNaN(snapY[mvcels[0]])) {
		return;
	}

	x = snapX[mvcels[0]] - parseInt(celList[mvcels[0]].style.left);
	y = snapY[mvcels[0]] - parseInt(celList[mvcels[0]].style.top);

	if ((snapPixel > Math.abs(x)) && (snapPixel > Math.abs(y))) {
		for (i = 0; i < mvcels.length; i++) {
			celList[mvcels[i]].style.left = parseInt(celList[mvcels[i]].style.left) + x;
			celList[mvcels[i]].style.top  = parseInt(celList[mvcels[i]].style.top)  + y;
		}
	}
}


/*
 *  マウスイベント処理（メイン部分）
 */
function mouseDown(e)
{
		var		i, no;

	mvcels = getTargetCels(no = this.id.substr(IDhead.length));

	if (document.all) {
		orgX = event.clientX + document.body.scrollLeft;
		orgY = event.clientY + document.body.scrollTop;
	}
	else {
		orgX = e.pageX;
		orgY = e.pageY;
	}

	for (i = 0; i < mvcels.length; i++) {
		mvcelsOrgX[i] = parseInt(celList[mvcels[i]].style.left);
		mvcelsOrgY[i] = parseInt(celList[mvcels[i]].style.top);
	}

	clickProc();

	return false;
}


function mouseMove(e)
{
		var		i, x, y;

	if (!mvcels) {
		return true;
	}

	if (document.all) {
		x = event.clientX + document.body.scrollLeft - orgX;
		y = event.clientY + document.body.scrollTop  - orgY;
	}
	else {
		x = e.pageX - orgX;
		y = e.pageY - orgY;
	}

	if (restoreFlag) {
		if ((2 < Math.abs(x)) || (2 < Math.abs(y))) {
			x = y = 0;
		}
	}

	for (i = 0; i < mvcels.length; i++) {
		celList[mvcels[i]].style.left = mvcelsOrgX[i] + x;
		celList[mvcels[i]].style.top  = mvcelsOrgY[i] + y;
	}

	return false;
}


function mouseUp(e)
{
		var		i;

	if (!mvcels) {
		return;
	}

	if (restoreFlag) {
		for (i = 0; i < mvcels.length; i++) {
			celList[mvcels[i]].style.left = mvcelsOrgX[i];
			celList[mvcels[i]].style.top  = mvcelsOrgY[i];
		}
	}
	else {
		snapProc();
	}

	mvcels = null;
}


/*
 *  きせかえシステム"siori" メイン
 */
function sioriInit()
{
		var		i;

	for (i = 0; i < celsuu; i++) {
		celList[i] = (document.all) ? document.all[IDhead + i] : document.getElementById(IDhead + i);
		celList[i].onmousedown = mouseDown;
	}

	document.onmousemove = mouseMove;
	document.onmouseup   = mouseUp;
}


/*
 *  セット切り替え処理
 */
function startpos(mode)
{
		var		i;

	if ("cel" == mode) {
		for (i = 0; i < celList.length; i++) {
			celList[i].style.visibility = "hidden";
		}
	}
	else if ("snap" == mode) {
		for (i = 0; i < celList.length; i++) {
			snapX[i] = snapY[i] = null;
		}
	}

	posMode = mode;
	posNo = 0;
}


function setpos(arg)
{
		var		i, x, y, argList;

	argList = parseParam(arg);

	for (i = 0; i < argList.length; i++) {
		if (celList.length <= posNo) {
			break;
		}

		x = parseInt(argList[i][0]);
		y = parseInt(argList[i][1]);

		if (!isNaN(x) && !isNaN(y)) {
			if ("cel" == posMode) {
				celList[posNo].style.left = x;
				celList[posNo].style.top  = y;

				if ("*" != argList[i][2]) {
					celList[posNo].style.visibility = "visible";
				}
			}
			else if ("snap" == posMode) {
				if ("*" != argList[i][2]) {
					snapX[posNo] = x;
					snapY[posNo] = y;
				}
			}
		}

		posNo++;
	}
}


/*
 *  セルの読み込み処理
 */
function cel()
{
		var		i, j, wk, wklist;
		var		arg = new Array();

	if (!(document.all || document.getElementById)) {
		return;
	}

	wklist = parseParam(arguments[0]);

	for (i = 0; i < wklist.length; i++) {
		for (j = 1; j < wklist[i].length; j++) {
			arg[wklist[i][0] + j] = wklist[i][j];
		}
	}

	clickct[celsuu] = (!isNaN(wk = parseInt(arg.click1))) ? wk : 0;

	if (wk = arg.name1) {
		if (!celGroupList[wk]) {
			celGroupList[wk] = new Array();
		}
		celGroupList[wk][celGroupList[wk].length] = celsuu;
		celNameList[celsuu] = wk;
	}

	document.write(
	'<SPAN ID="' + IDhead + celsuu +
	'" STYLE="position:absolute; visibility:hidden; left:0; top:0"><IMG SRC="' + arg.src1 +
	'" ALT="CelNo.' + celsuu +
	'" TITLE="' + ((wk = arg.title1) ? wk : "") +
	'"></SPAN>\n');

	celsuu++;
}


