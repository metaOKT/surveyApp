
/*
 * GET home page.
 */
/* DB設定 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//発表者
var myentrySchema = new Schema({
	'year'      : String,
	'month'     : String,
	'presenter' : String,
	'shainNo'   : String,
	'thema'     : String
});
var MyEntryData = mongoose.model('myentry', myentrySchema);
//回答集計
var mysummarySchema = new Schema({
	'year'      : String,
	'month'     : String,
	'presenter' : String,
	'shainNo'   : String,
	'thema'     : String,
	'q_1_1_y'   : Number,
	'q_1_1_n'   : Number,
	'q_1_1_e'   : Number,
	'q_1_2_y'   : Number,
	'q_1_2_n'   : Number,
	'q_1_2_e'   : Number,
	'q_1_3_y'   : Number,
	'q_1_3_n'   : Number,
	'q_1_3_e'   : Number,
	'q_2_1_y'   : Number,
	'q_2_1_n'   : Number,
	'q_2_1_e'   : Number,
	'q_2_2_y'   : Number,
	'q_2_2_n'   : Number,
	'q_2_2_e'   : Number,
	'q_2_3_y'   : Number,
	'q_2_3_n'   : Number,
	'q_2_3_e'   : Number,
	'q_3_1_y'   : Number,
	'q_3_1_n'   : Number,
	'q_3_1_e'   : Number,
	'q_3_2_y'   : Number,
	'q_3_2_n'   : Number,
	'q_3_2_e'   : Number,
	'q_4_1_y'   : Number,
	'q_4_1_n'   : Number,
	'q_4_1_e'   : Number,
	'q_4_2_y'   : Number,
	'q_4_2_n'   : Number,
	'q_4_2_e'   : Number,
	'kanso'     : String
});
var MySummaryData = mongoose.model('mysummary', mysummarySchema);
var kansoMaxLen	=1024*20;	//20KB(1人200字×100人めど)

//provide a sensible default for local development
var db_name = 'metasurvey';
var mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + db_name;
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
}
var db = mongoose.connect(mongodb_connection_string);
//var db = mongoose.connect('mongodb://localhost/mydb');

/*File*/
var fs = require('fs');

/*[1]INDEX*/
exports.index = function(req, res){
  res.render('index', { title: 'アンケートAPL' });
};

/*[2]対象者*/
exports.plist = function(req, res) {
  var mode = req.params.mode;
/*Debug*/console.log('exports.plist mode='+mode);
  var title = '発表予定表';
  var msg = 'アンケート回答いただける発表者を選択してください。';
  if (mode==1){
	  title = '発表結果表';
	  msg = 'アンケート結果を表示する発表者を選択してください。';
  }
  MyEntryData.where().sort({year:1, month:1, shainNo:1}).exec(function(err, docs) {
    if (err){
      console.log(err);
    }
    res.render('plist', {
      title : title,
      msg : msg,
      datas : docs,
      mode : mode
    });
  });
};

/*[3]アンケートシート*/
exports.qsheet = function(req, res) {
	var q1 = '2';
	var q2 = '2';
	var year = req.params.year;
	var month = req.params.month;
	var shainNo= req.params.shainNo;
  MyEntryData.findOne({'year':year, 'month':month, 'shainNo':shainNo} ,function(err, doc) {
	if (err){
	  console.log(err);
	}
	res.render('qsheet', {
	    title : 'アンケートシート',
	    msg : 'アンケートにご協力ください',
	    year : year,
	    month : month,
	    shainNo : shainNo,
	    data : doc
	});
  });
};

/*[4]登録*/
exports.go = function(req, res) {
	var year    = req.body.year;
	var month   = req.body.month;
	var shainNo = req.body.shainNo;
	var q1_1_val = req.body.q_1_1;
	var q1_2_val = req.body.q_1_2;
	var q1_3_val = req.body.q_1_3;
	var q2_1_val = req.body.q_2_1;
	var q2_2_val = req.body.q_2_2;
	var q2_3_val = req.body.q_2_3;
	var q3_1_val = req.body.q_3_1;
	var q3_2_val = req.body.q_3_2;
	var q4_1_val = req.body.q_4_1;
	var q4_2_val = req.body.q_4_2;
	var kanso    = req.body.kanso; 

	MySummaryData.findOne(
		{
	    	'year'      : year, 
	    	'month'     : month, 
	    	'shainNo'   : shainNo
		},
		function(err, doc) {
			if (err) {
				console.log(err);
			}
			if(q1_1_val==1)			doc.q_1_1_y = doc.q_1_1_y+1;
			else if(q1_1_val==3)	doc.q_1_1_n = doc.q_1_1_n+1;
			else 					doc.q_1_1_e = doc.q_1_1_e+1;
			if(q1_2_val==1)			doc.q_1_2_y = doc.q_1_2_y+1;
			else if(q1_2_val==3)	doc.q_1_2_n = doc.q_1_2_n+1;
			else					doc.q_1_2_e = doc.q_1_2_e+1;
			if(q1_3_val==1)			doc.q_1_3_y = doc.q_1_3_y+1;
			else if(q1_3_val==3)	doc.q_1_3_n = doc.q_1_3_n+1;
			else					doc.q_1_3_e = doc.q_1_3_e+1;
			if(q2_1_val==1)			doc.q_2_1_y = doc.q_2_1_y+1;
			else if(q2_1_val==3)	doc.q_2_1_n = doc.q_2_1_n+1;
			else					doc.q_2_1_e = doc.q_2_1_e+1;
			if(q2_2_val==1)			doc.q_2_2_y = doc.q_2_2_y+1;
			else if(q2_2_val==3)	doc.q_2_2_n = doc.q_2_2_n+1;
			else					doc.q_2_2_e = doc.q_2_2_e+1;
			if(q2_3_val==1)			doc.q_2_3_y = doc.q_2_3_y+1;
			else if(q2_3_val==3)	doc.q_2_3_n = doc.q_2_3_n+1;
			else					doc.q_2_3_e = doc.q_2_3_e+1;
			if(q3_1_val==1)			doc.q_3_1_y = doc.q_3_1_y+1;
			else if(q3_1_val==3)	doc.q_3_1_n = doc.q_3_1_n+1;
			else					doc.q_3_1_e = doc.q_3_1_e+1;
			if(q3_2_val==1)			doc.q_3_2_y = doc.q_3_2_y+1;
			else if(q3_2_val==3)	doc.q_3_2_n = doc.q_3_2_n+1;
			else					doc.q_3_2_e = doc.q_3_2_e+1;
			if(q4_1_val==1)			doc.q_4_1_y = doc.q_4_1_y+1;
			else if(q4_1_val==3)	doc.q_4_1_n = doc.q_4_1_n+1;
			else					doc.q_4_1_e = doc.q_4_1_e+1;
			if(q4_2_val==1)			doc.q_4_2_y = doc.q_4_2_y+1;
			else if(q4_2_val==3)	doc.q_4_2_n = doc.q_4_2_n+1;
			else					doc.q_4_2_e = doc.q_4_2_e+1;
			if(kanso.length>0){
				doc.kanso = kanso + "\n" + doc.kanso;
				if(doc.kanso.length > kansoMaxLen){//Max超えたら超えた分切り捨て
					doc.kanso = doc.kanso.substr(0, kansoMaxLen)+"\n(以下略)";
				}
			}
			doc.save(function(err) {
		        if (err) {
		                console.log(err);
		        }
		        res.render('thankyou', {
		        title : 'thankyou',
		        msg : 'ありがとうございました',
		        mode : 1
	        	});
			});

	});
};

/*[6]【admin】結果表示*/
exports.summary = function(req, res) {
	var year = req.params.year;
	var month = req.params.month;
	var shainNo= req.params.shainNo;
	var cond =[{'year':year,'month':month,'shainNo':shainNo}];	//検索条件

	MySummaryData.findOne({'year':year, 'month':month, 'shainNo':shainNo} ,function(err, doc) {
		if (err){
			console.log(err);
		}
		var sumYes    = [doc.q_1_1_y, doc.q_1_2_y, doc.q_1_3_y, doc.q_2_1_y, doc.q_2_2_y, doc.q_2_3_y, doc.q_3_1_y, doc.q_3_2_y, doc.q_4_1_y, doc.q_4_2_y];
		var sumNeither= [doc.q_1_1_e, doc.q_1_2_e, doc.q_1_3_e, doc.q_2_1_e, doc.q_2_2_e, doc.q_2_3_e, doc.q_3_1_e, doc.q_3_2_e, doc.q_4_1_e, doc.q_4_2_e];
		var sumNo     = [doc.q_1_1_n, doc.q_1_2_n, doc.q_1_3_n, doc.q_2_1_n, doc.q_2_2_n, doc.q_2_3_n, doc.q_3_1_n, doc.q_3_2_n, doc.q_4_1_n, doc.q_4_2_n];
		res.render('summary', {
	    title : 'アンケート結果',
	    msg : 'アンケート結果は以下の通りです。',
		year : year,
		month : month,
		shainNo : shainNo,
		itemsY : sumYes,
		itemsE : sumNeither,
		itemsN : sumNo,
		data : doc
	});
  });
};

/*[8-1]【admin】発表者一覧表示*/
exports.entry = function(req, res) {
  var title = '発表予定表';
  var msg = '発表者の登録・予定の表示をします';
  var mode = req.params.mode;

  //発表者一覧
  MyEntryData.where().sort({year:1, month:1, shainNo:1}).exec(function(err, docs) {
    if (err){
      console.log(err);
    }
    res.render('entry', {
      title : title,
      msg : msg,
      datas : docs,
      mode : mode
    });
  });
};

/*[8_2]【admin】発表者登録*/
exports.entry_add = function(req, res) {
  var title = '発表予定表';
  var msg = '発表者の登録・予定の表示をします';
  var mode = 1;
  var year = req.body.year;
  var month = req.body.month;
  var shainNo= req.body.shain_no;
  var name = req.body.shain_name;
  var thema = req.body.thema;

  //集計用レコード準備
  var summaryRec = new MySummaryData({
	'year'      : year,
	'month'     : month,
	'presenter' : name,
	'shainNo'   : shainNo,
	'thema'     : thema,
	'q_1_1_y'   : 0,
	'q_1_1_n'   : 0,
	'q_1_1_e'   : 0,
	'q_1_2_y'   : 0,
	'q_1_2_n'   : 0,
	'q_1_2_e'   : 0,
	'q_1_3_y'   : 0,
	'q_1_3_n'   : 0,
	'q_1_3_e'   : 0,
	'q_2_1_y'   : 0,
	'q_2_1_n'   : 0,
	'q_2_1_e'   : 0,
	'q_2_2_y'   : 0,
	'q_2_2_n'   : 0,
	'q_2_2_e'   : 0,
	'q_2_3_y'   : 0,
	'q_2_3_n'   : 0,
	'q_2_3_e'   : 0,
	'q_3_1_y'   : 0,
	'q_3_1_n'   : 0,
	'q_3_1_e'   : 0,
	'q_3_2_y'   : 0,
	'q_3_2_n'   : 0,
	'q_3_2_e'   : 0,
	'q_4_1_y'   : 0,
	'q_4_1_n'   : 0,
	'q_4_1_e'   : 0,
	'q_4_2_y'   : 0,
	'q_4_2_n'   : 0,
	'q_4_2_e'   : 0,
	'kanso'     : ''
  });
  //発表者登録
  var presenterRec = new MyEntryData({
	'year'      : year,
	'month'     : month,
	'presenter' : name,
	'shainNo'   : shainNo,
	'thema'     : thema
  });
  presenterRec.save(function(err){
  	if(err){
  		console.log(err)
  	}
    summaryRec.save(function(err){
		if(err){
			console.log(err)
		}
		res.redirect('/entry/1');
	  });
  });
};
exports.entry_del = function(req, res) {
  var year = req.params.year;
  var month = req.params.month;
  var shainNo= req.params.shainNo;

  MyEntryData.findOne(
    { year: year, month: month, shainNo: shainNo 
	},function(err, doc){
    	if(err){
  		  console.log(err)
  	    }
    	doc.remove(function(err){
		  if(err){
			console.log(err)
		  }
		  MySummaryData.findOne(
			{ year: year, month: month, shainNo: shainNo 
			},function(err, doc){
		    	if(err){
		    		  console.log(err)
		    	}
		      	doc.remove(function(err){
		  		  if(err){
		  			console.log(err)
		  		  }
				  res.redirect('/entry/1');
		      	});
	        });
	    });
	})
};
