/****************************************************************
 * L'Arts Day 2569 — ตัวรับข้อมูลแบบทดสอบ A/B → Google Sheet
 * งานสื่อสารองค์กรและประชาสัมพันธ์ คณะศิลปศาสตร์ มธ.
 *
 * วิธีใช้:
 *  1) เปิด Google Sheet ที่ต้องการเก็บข้อมูล
 *  2) เมนู Extensions → Apps Script  แล้ววางโค้ดนี้แทนของเดิมทั้งหมด
 *  3) กด Deploy → New deployment → ประเภท "Web app"
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  4) คัดลอก Web app URL ที่ได้ ไปวางในไฟล์ index.html (CONFIG.ENDPOINT)
 *
 * โครงสร้างชีต: แถวแรกเป็นหัวตาราง (ชื่อตัวแปร) — ใช้ import เข้า SPSS ได้ทันที
 ****************************************************************/

// ชื่อชีตที่จะเก็บข้อมูล (สร้างให้อัตโนมัติถ้ายังไม่มี)
var SHEET_NAME = 'responses';

// ลำดับคอลัมน์คงที่ (ตรงกับตัวแปรใน index.html → buildRecord)
// อย่าสลับลำดับหลังเริ่มเก็บข้อมูลจริง เพื่อให้ข้อมูลตรงคอลัมน์เสมอ
var FIELDS = [
  'respondent_id','group','group_code','consent',
  'start_time','submit_time','total_duration_sec',
  // ส่วนที่ 1
  'sex','age','user_type','freq',
  'ch_fb','ch_ig','ch_web','ch_phys','ch_fwd','ch_other','ch_other_text',
  // สื่อ
  'media_view_sec',
  // ส่วนที่ 2 (แบบทดสอบ)
  'q1_ans','q1_code','q1_correct','q1_time_sec',
  'q2_ans','q2_code','q2_correct','q2_time_sec',
  'q3_ans','q3_code','q3_correct','q3_time_sec',
  'q4_ans','q4_code','q4_correct','q4_time_sec',
  'q5_ans','q5_code','q5_correct','q5_time_sec',
  'quiz_score','quiz_total_time_sec',
  // ส่วนที่ 3 (ความพึงพอใจ) — 6 ด้าน รวม 19 ข้อ ตรงกับแบบสอบถามฉบับปัจจุบัน
  // ด้านที่ 1 ความสวยงามและความน่าสนใจของสื่อ (s1-s4)
  's1','s2','s3','s4',
  // ด้านที่ 2 ความชัดเจนและความรวดเร็วในการรับรู้ข้อมูล (s5-s9)
  's5','s6','s7','s8','s9',
  // ด้านที่ 3 ความสามารถในการจดจำข้อมูล (s10-s11)
  's10','s11',
  // ด้านที่ 4 ความเหมาะสมของเนื้อหา (s12-s14)
  's12','s13','s14',
  // ด้านที่ 5 การนำไปใช้ประโยชน์ (s15-s18)
  's15','s16','s17','s18',
  // ด้านที่ 6 ความพึงพอใจโดยรวม (s19)
  's19',
  'sat_dim1_mean','sat_dim2_mean','sat_dim3_mean',
  'sat_dim4_mean','sat_dim5_mean','sat_dim6_mean','sat_overall_mean',
  // meta
  'platform','user_agent','screen','lang'
];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(FIELDS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // กันการเขียนชนกันเมื่อมีผู้ตอบพร้อมกันหลายคน
    var data = JSON.parse(e.postData.contents);
    var sh = getSheet_();
    var row = FIELDS.map(function (k) {
      var v = data[k];
      return (v === undefined || v === null) ? '' : v;
    });
    sh.appendRow(row);
    return json_({ status: 'ok', id: data.respondent_id || '' });
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

// เปิดด้วย GET ได้เพื่อตรวจว่า Web App ทำงาน
function doGet() {
  return json_({ status: 'ok', message: "L'Arts Day endpoint is running", fields: FIELDS.length });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
