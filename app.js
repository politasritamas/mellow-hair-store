// 1) วาง URL ของ Google Apps Script Web App ที่ deploy แล้วในบรรทัดด้านล่าง
const API_URL = "ใส่_URL_WEB_APP_ของคุณที่นี่";

let products = [];
const productList = document.getElementById("product-list");
const skuSelect = document.getElementById("sku-select");
const quantityInput = document.querySelector('[name="quantity"]');
const orderForm = document.getElementById("order-form");

const fallbackProducts = [
  {sku:"MH001", name:"Mellow Daily Shampoo", description:"แชมพูสูตรอ่อนโยน สำหรับใช้ทุกวัน ขนาด 300 ml", price:159, stock:50, image:"assets/daily-shampoo.svg"},
  {sku:"MH002", name:"Mellow Smooth Shampoo", description:"แชมพูเพื่อผมนุ่มลื่น ขนาด 300 ml", price:179, stock:40, image:"assets/smooth-shampoo.svg"}
];
function apiReady(){return API_URL.startsWith("https://script.google.com/") && !API_URL.includes("ใส่_URL");}
function money(n){return Number(n).toLocaleString("th-TH")+" บาท";}
function renderProducts(){
  productList.innerHTML = products.map(p=>`<article class="product-card">
    <div class="product-image"><img src="${escapeAttr(p.image || "assets/daily-shampoo.svg")}" alt="${escapeAttr(p.name)}"></div>
    <h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || "")}</p>
    <div class="price-row"><span class="price">${money(p.price)}</span><span class="stock">คงเหลือ ${Number(p.stock)||0} ชิ้น</span></div>
  </article>`).join("");
  skuSelect.innerHTML = products.map(p=>`<option value="${escapeAttr(p.sku)}">${escapeHtml(p.name)} — ${money(p.price)}</option>`).join("");
  updateTotal();
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return escapeHtml(s);}
function selectedProduct(){return products.find(p=>p.sku===skuSelect.value)||products[0];}
function updateTotal(){const p=selectedProduct();document.getElementById("order-total").textContent=p?`ยอดรวม: ${money(p.price * Math.max(1,Number(quantityInput.value)||1))}`:"ยอดรวม: —";}
async function loadProducts(){
  if(apiReady()){try{const r=await fetch(API_URL);const d=await r.json();if(Array.isArray(d.products)&&d.products.length)products=d.products;}catch(e){console.warn("ใช้ข้อมูลตัวอย่างแทน:",e);}}
  if(!products.length)products=fallbackProducts;
  renderProducts();
}
orderForm.addEventListener("submit",async e=>{
  e.preventDefault();const p=selectedProduct();const qty=Math.max(1,Number(quantityInput.value)||1);
  if(!p){return;}
  if(qty>Number(p.stock)){document.getElementById("form-message").textContent="จำนวนสินค้ามากกว่าสต็อกที่มี กรุณาลดจำนวน";return;}
  const data=Object.fromEntries(new FormData(orderForm).entries());
  const order={...data,sku:p.sku,productName:p.name,unitPrice:Number(p.price),quantity:qty,total:Number(p.price)*qty};
  const msg=document.getElementById("form-message");msg.textContent="กำลังบันทึกคำสั่งซื้อ…";
  if(!apiReady()){msg.textContent="เว็บไซต์ตัวอย่างพร้อมแล้ว แต่ยังไม่ได้เชื่อม Google Sheets กรุณาตั้งค่า API_URL ก่อนรับออเดอร์จริง";return;}
  try{const r=await fetch(API_URL,{method:"POST",body:JSON.stringify(order)});const result=await r.json();if(!result.success)throw new Error(result.message||"บันทึกไม่สำเร็จ");msg.textContent=`รับคำสั่งซื้อแล้ว เลขที่ ${result.orderId} ขอบคุณค่ะ`;orderForm.reset();updateTotal();loadProducts();loadOrders();}
  catch(err){msg.textContent="บันทึกไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า Google Apps Script แล้วลองอีกครั้ง";}
});
async function loadOrders(){
  const body=document.getElementById("orders-body");
  if(!apiReady()){body.innerHTML='<tr><td colspan="7">ยังไม่ได้เชื่อมต่อ Google Sheets (ตั้งค่า API_URL ใน app.js)</td></tr>';return;}
  try{const r=await fetch(API_URL+"?action=orders");const d=await r.json();const orders=d.orders||[];
    body.innerHTML=orders.length?orders.map(o=>`<tr><td>${escapeHtml(o.orderId)}</td><td>${escapeHtml(o.customerName)}<br>${escapeHtml(o.phone)}</td><td>${escapeHtml(o.productName)}</td><td>${escapeHtml(o.quantity)}</td><td>${escapeHtml(o.address)}</td><td>${escapeHtml(o.status||"รอจัดเตรียม")}</td><td><button class="small-btn" onclick='printLabel(${JSON.stringify(o).replace(/'/g,"&#39;")})'>พิมพ์</button></td></tr>`).join(""):'<tr><td colspan="7">ยังไม่มีคำสั่งซื้อ</td></tr>';
  }catch(e){body.innerHTML='<tr><td colspan="7">โหลดรายการไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ</td></tr>';}
}
function printLabel(o){
  const w=window.open("","_blank","width=650,height=700");if(!w)return;
  w.document.write(`<html><head><title>Shipping label ${escapeHtml(o.orderId)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#222}.label{border:2px solid #222;padding:24px;max-width:520px;margin:auto}h2{margin-top:0}.line{border-top:1px dashed #777;margin:18px 0}.big{font-size:22px;font-weight:bold}.muted{color:#666;font-size:12px}</style></head><body><div class="label"><h2>MELLOW HAIR — ใบปะหน้าพัสดุ</h2><p class="muted">เลขที่คำสั่งซื้อ: ${escapeHtml(o.orderId)}</p><div class="line"></div><p class="muted">ผู้รับ</p><p class="big">${escapeHtml(o.customerName)}</p><p>${escapeHtml(o.phone)}</p><p>${escapeHtml(o.address)}</p><div class="line"></div><p>สินค้า: ${escapeHtml(o.productName)} (${escapeHtml(o.sku)})</p><p>จำนวน: ${escapeHtml(o.quantity)} ชิ้น</p><p>ยอดรวม: ${money(o.total)}</p><div class="line"></div><p class="muted">ตรวจสอบชื่อ เบอร์โทร และที่อยู่ก่อนจัดส่ง</p></div><script>window.print()<\/script></body></html>`);w.document.close();
}
skuSelect.addEventListener("change",updateTotal);quantityInput.addEventListener("input",updateTotal);document.getElementById("refresh-orders").addEventListener("click",loadOrders);
loadProducts();loadOrders();
