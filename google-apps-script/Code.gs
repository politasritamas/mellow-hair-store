// Mellow Hair Store — Google Apps Script backend
// เปลี่ยน SPREADSHEET_ID เป็น ID ของ Google Sheets ของคุณ
const SPREADSHEET_ID = "1-Hezrbt8KzFkBWnD1jzBh_oLJHffpqdXUJLJFJXDZl8";

function getBook_(){ return SpreadsheetApp.openById(SPREADSHEET_ID); }
function getProductSheet_(){
  const ss=getBook_();
  return ss.getSheetByName("Products") || ss.getSheetByName("roducts") || ss.getSheets()[0];
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function doGet(e){
  const action=e && e.parameter ? e.parameter.action : "";
  if(action==="orders") return json_({orders:getOrders_()});
  const sh=getProductSheet_();const values=sh.getDataRange().getValues();
  if(values.length<2) return json_({products:[]});
  const headers=values.shift().map(h=>String(h).trim().toLowerCase());
  const col=(name)=>headers.indexOf(name.toLowerCase());
  const products=values.filter(r=>r[col("SKU")]!=="" && r[col("SKU")]!=null).map(r=>({
    sku:String(r[col("SKU")]),name:String(r[col("Product Name")]),description:String(r[col("Description")]),
    price:Number(r[col("Price (THB)")])||0,stock:Number(r[col("Stock")])||0,image:String(r[col("Image")]||"")
  }));
  return json_({products:products});
}
function doPost(e){
  try{
    const data=JSON.parse(e.postData.contents);
    const ss=getBook_();let sh=ss.getSheetByName("Orders");
    if(!sh){sh=ss.insertSheet("Orders");sh.appendRow(["Order ID","Date","Customer Name","Phone","Address","SKU","Product Name","Unit Price","Quantity","Total","Status"]);}
    const id="MH"+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyMMddHHmmss");
    sh.appendRow([id,new Date(),data.customerName,data.phone,data.address,data.sku,data.productName,Number(data.unitPrice),Number(data.quantity),Number(data.total),"รอจัดเตรียม"]);
    // ลดสต็อกในชีตสินค้าหลังรับออเดอร์
    const ps=getProductSheet_();const vals=ps.getDataRange().getValues();const h=vals[0].map(x=>String(x).trim());
    const skuCol=h.indexOf("SKU"),stockCol=h.indexOf("Stock");
    for(let i=1;i<vals.length;i++){if(String(vals[i][skuCol])===String(data.sku)){const current=Number(vals[i][stockCol])||0;const qty=Number(data.quantity)||0;if(qty>current)throw new Error("สินค้าในสต็อกไม่เพียงพอ");ps.getRange(i+1,stockCol+1).setValue(current-qty);break;}}
    return json_({success:true,orderId:id});
  }catch(err){return json_({success:false,message:String(err)});}
}
function getOrders_(){
  const sh=getBook_().getSheetByName("Orders");if(!sh||sh.getLastRow()<2)return [];
  const rows=sh.getDataRange().getValues();rows.shift();
  return rows.reverse().map(r=>({orderId:String(r[0]),date:r[1],customerName:String(r[2]),phone:String(r[3]),address:String(r[4]),sku:String(r[5]),productName:String(r[6]),unitPrice:Number(r[7]),quantity:Number(r[8]),total:Number(r[9]),status:String(r[10])}));
}
